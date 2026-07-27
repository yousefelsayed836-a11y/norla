import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    whatsappNumber: z.string().optional(),
    email: z.string().optional(),
    address: z.string().min(1),
    governorate: z.string().min(1),
    city: z.string().min(1),
  }),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  const parsed = orderSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }
  const { customer, items } = parsed.data;

  const zone = await prisma.shippingZone.findUnique({
    where: { governorate: customer.governorate },
  });
  if (!zone || !zone.active) {
    return NextResponse.json(
      { error: "We don't currently ship to this governorate" },
      { status: 400 }
    );
  }

  const resolvedItems = [];
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) continue;
    let price = Number(product.price);
    let title = product.title;
    if (item.variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
      if (variant) {
        if (variant.price) price = Number(variant.price);
        title = `${product.title} (${variant.label})`;
      }
    }
    resolvedItems.push({
      productId: item.productId,
      variantId: item.variantId,
      title,
      price,
      quantity: item.quantity,
    });
  }

  if (resolvedItems.length === 0) {
    return NextResponse.json({ error: "No valid items" }, { status: 400 });
  }

  const settings = await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const subtotal = resolvedItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const qualifiesFreeShipping =
    settings.freeShippingEnabled &&
    Number(settings.freeShippingThreshold) > 0 &&
    subtotal >= Number(settings.freeShippingThreshold);
  const shippingFee = qualifiesFreeShipping ? 0 : Number(zone.fee);
  const total = subtotal + shippingFee;
  const depositAmount = (total * settings.depositPercent) / 100;

  const order = await prisma.order.create({
    data: {
      subtotal,
      shippingFee,
      total,
      depositAmount,
      customer: {
        create: {
          name: customer.name,
          phone: customer.phone,
          whatsappNumber: customer.whatsappNumber || null,
          email: customer.email || null,
          address: customer.address,
          governorate: customer.governorate,
          city: customer.city,
        },
      },
      items: { create: resolvedItems },
    },
    include: { items: true, customer: true },
  });

  return NextResponse.json({ order });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    include: { items: true, customer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

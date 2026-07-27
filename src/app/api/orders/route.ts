import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().optional(),
    address: z.string().min(1),
    city: z.string().optional(),
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

  const total = resolvedItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      total,
      customer: {
        create: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
          address: customer.address,
          city: customer.city || null,
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { adjustStock } from "@/lib/inventory";
import { revalidateStorefront } from "@/lib/revalidate";
import { sendAdminOrderNotification, sendCustomerOrderConfirmation } from "@/lib/email";
import { sendPushToAdmins } from "@/lib/push";
import { formatEGP } from "@/lib/format";
import { rateLimit } from "@/lib/rate-limit";
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
  paymentMethod: z.enum(["instapay", "vodafone_cash"]).optional(),
});

export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(req, "orders", 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many orders. Please try again later." }, { status: 429 });
  }

  const parsed = orderSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }
  const { customer, items, paymentMethod } = parsed.data;

  const zone = await prisma.shippingZone.findUnique({
    where: { governorate: customer.governorate },
    include: { cities: true },
  });
  if (!zone || !zone.active) {
    return NextResponse.json(
      { error: "We don't currently ship to this governorate" },
      { status: 400 }
    );
  }

  const resolvedItems: {
    productId: string;
    variantId: string | undefined;
    title: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[] = [];
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    });
    if (!product) continue;
    let price = Number(product.price);
    let title = product.title;
    let imageUrl = product.images[0]?.url;
    if (item.variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
      if (variant) {
        if (variant.price) price = Number(variant.price);
        title = `${product.title} (${variant.label})`;
        if (variant.imageUrl) imageUrl = variant.imageUrl;
      }
    }
    resolvedItems.push({
      productId: item.productId,
      variantId: item.variantId,
      title,
      price,
      quantity: item.quantity,
      imageUrl,
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

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        subtotal,
        shippingFee,
        total,
        depositAmount,
        paymentMethod: paymentMethod || null,
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
        items: {
          create: resolvedItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true, customer: true },
    });
    await adjustStock(tx, resolvedItems, -1);
    return created;
  });

  revalidateStorefront();

  sendAdminOrderNotification({
    to: "orders@norla-designs.com",
    orderNo: order.orderNo,
    customerName: order.customer!.name,
    phone: order.customer!.phone,
    whatsappNumber: order.customer!.whatsappNumber,
    items: resolvedItems.map((i) => ({
      title: i.title,
      quantity: i.quantity,
      imageUrl: i.imageUrl,
    })),
    total,
    depositAmount,
    paymentMethod: order.paymentMethod,
  });
  sendPushToAdmins({
    title: `New order #${order.orderNo}`,
    body: `${order.customer!.name} — ${formatEGP(total)}`,
    url: `/admin/orders/${order.id}`,
  }).catch((err) => console.error("Failed to send push notification", err));
  const orderCustomer = order.customer;
  if (orderCustomer?.email) {
    sendCustomerOrderConfirmation({
      to: orderCustomer.email,
      orderNo: order.orderNo,
      customerName: orderCustomer.name,
      items: resolvedItems.map((i) => ({
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        imageUrl: i.imageUrl,
      })),
      subtotal,
      shippingFee,
      total,
      depositPercent: settings.depositPercent,
      depositAmount,
      paymentMethod: order.paymentMethod,
      address: orderCustomer.address ?? "",
      city: zone.cities.find((c) => c.name === orderCustomer.city)?.nameAr || orderCustomer.city || "",
      governorate: zone.governorateAr || orderCustomer.governorate || "",
    });
  }

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

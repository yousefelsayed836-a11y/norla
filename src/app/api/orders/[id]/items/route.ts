import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

// Add item to order
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { productId, variantId, quantity } = body;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let price = Number(product.price);
  let title = product.title;
  let variant = null;
  if (variantId) {
    variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (variant) {
      if (variant.price) price = Number(variant.price);
      title = `${product.title} (${variant.label})`;
    }
  }

  const item = await prisma.orderItem.create({
    data: {
      orderId: id,
      productId,
      variantId: variantId || null,
      title,
      price,
      quantity: quantity || 1,
    },
  });

  // Recalculate order totals
  const allItems = await prisma.orderItem.findMany({ where: { orderId: id } });
  const subtotal = allItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const total = subtotal + Number(order.shippingFee) + Number(order.serviceFee);
  const settings = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
  const depositPercent = settings?.depositPercent ?? 50;
  const depositAmount = (total * depositPercent) / 100;

  const updated = await prisma.order.update({
    where: { id },
    data: { subtotal, total, depositAmount },
    include: { items: true },
  });

  revalidateStorefront();
  return NextResponse.json({ item, order: updated });
}

// Update item quantity or delete
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { itemId, quantity, remove } = body;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (remove) {
    await prisma.orderItem.delete({ where: { id: itemId } });
  } else {
    await prisma.orderItem.update({ where: { id: itemId }, data: { quantity } });
  }

  const allItems = await prisma.orderItem.findMany({ where: { orderId: id } });
  const subtotal = allItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const total = subtotal + Number(order.shippingFee) + Number(order.serviceFee);
  const settings = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
  const depositPercent = settings?.depositPercent ?? 50;
  const depositAmount = (total * depositPercent) / 100;

  const updated = await prisma.order.update({
    where: { id },
    data: { subtotal, total, depositAmount },
    include: { items: true },
  });

  revalidateStorefront();
  return NextResponse.json({ order: updated });
}

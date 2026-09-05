import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { adjustStock } from "@/lib/inventory";
import { revalidateStorefront } from "@/lib/revalidate";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { productId, variantId, quantity } = body;
  const qty: number = quantity || 1;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let price = Number(product.price);
  let title = product.title;
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (variant) {
      if (variant.price) price = Number(variant.price);
      title = `${product.title} (${variant.label})`;
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const item = await tx.orderItem.create({
      data: { orderId: id, productId, variantId: variantId || null, title, price, quantity: qty },
    });

    await adjustStock(tx, [{ productId, variantId, quantity: qty }], -1);

    const allItems = await tx.orderItem.findMany({ where: { orderId: id } });
    const subtotal = allItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const settings = await tx.siteSetting.findUnique({ where: { id: "singleton" } });
    const depositPercent = settings?.depositPercent ?? 50;
    const total = subtotal + Number(order.shippingFee) + Number(order.serviceFee);
    const depositAmount = (total * depositPercent) / 100;

    const updatedOrder = await tx.order.update({
      where: { id },
      data: { subtotal, total, depositAmount },
      include: { items: true },
    });
    return { item, order: updatedOrder };
  });

  revalidateStorefront();
  return NextResponse.json(updated);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { itemId, quantity, remove } = body;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    const existingItem = await tx.orderItem.findUnique({ where: { id: itemId } });
    if (!existingItem) throw new Error("Item not found");

    if (remove) {
      await tx.orderItem.delete({ where: { id: itemId } });
      // Restock when removing
      await adjustStock(
        tx,
        [{ productId: existingItem.productId, variantId: existingItem.variantId, quantity: existingItem.quantity }],
        1
      );
    } else {
      const diff = quantity - existingItem.quantity;
      await tx.orderItem.update({ where: { id: itemId }, data: { quantity } });
      if (diff !== 0) {
        await adjustStock(
          tx,
          [{ productId: existingItem.productId, variantId: existingItem.variantId, quantity: Math.abs(diff) }],
          diff > 0 ? -1 : 1
        );
      }
    }

    const allItems = await tx.orderItem.findMany({ where: { orderId: id } });
    const subtotal = allItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const settings = await tx.siteSetting.findUnique({ where: { id: "singleton" } });
    const depositPercent = settings?.depositPercent ?? 50;
    const total = subtotal + Number(order.shippingFee) + Number(order.serviceFee);
    const depositAmount = (total * depositPercent) / 100;

    return tx.order.update({
      where: { id },
      data: { subtotal, total, depositAmount },
      include: { items: true },
    });
  });

  revalidateStorefront();
  return NextResponse.json({ order: updated });
}

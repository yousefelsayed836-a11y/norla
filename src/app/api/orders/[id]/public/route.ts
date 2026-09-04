import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNo: true,
      status: true,
      subtotal: true,
      shippingFee: true,
      serviceFee: true,
      total: true,
      depositAmount: true,
      paymentMethod: true,
      createdAt: true,
      items: {
        select: { id: true, title: true, price: true, quantity: true },
      },
      customer: {
        select: { name: true, phone: true, governorate: true, city: true, address: true },
      },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

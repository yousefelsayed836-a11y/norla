import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendOrderToTurbo, TURBO_GOVERNMENT_MAP, SENDER_PHONE } from "@/lib/turbo";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!order || !order.customer) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const government: string =
    body.government ||
    TURBO_GOVERNMENT_MAP[order.customer.governorate ?? ""] ||
    order.customer.governorate ||
    "";
  const area = body.area || order.customer.city || "";
  const weight = Number(body.weight) || 1;
  const isFragile = !!body.isFragile;
  const amountToBeCollected =
    body.amountToBeCollected != null
      ? Number(body.amountToBeCollected)
      : Number(order.total) - Number(order.depositAmount);
  const isReturn = !!body.isReturn;
  const returnAmount = isReturn ? Number(body.returnAmount) || 0 : 0;
  const returnSummary = isReturn ? body.returnSummary || "" : "";

  const defaultOrderSummary = order.items.map((i) => `${i.title} x${i.quantity}`).join(", ");
  const orderSummary = body.orderSummary || defaultOrderSummary;

  const result = await sendOrderToTurbo({
    government,
    area,
    address: order.customer.address ?? "",
    receiver: order.customer.name,
    phone1: order.customer.phone ?? "",
    phone2: order.customer.whatsappNumber ?? undefined,
    apiFollowupPhone: SENDER_PHONE,
    amountToBeCollected,
    orderSummary,
    weight,
    notes: order.notes ?? "",
    isFragile,
    remoteOrderId: order.orderNo,
    returnAmount,
    returnSummary,
  });

  await prisma.order.update({
    where: { id },
    data: {
      turboOrderId: result.success ? String(result.turboOrderId ?? "") : order.turboOrderId,
      turboStatus: result.success ? "sent" : "failed",
      turboRaw: JSON.stringify(result.raw ?? { error: !result.success ? result.error : undefined }),
      turboAmountToCollect: result.success ? amountToBeCollected : order.turboAmountToCollect,
      turboReturnAmount: result.success ? (isReturn ? returnAmount : null) : order.turboReturnAmount,
      turboReturnSummary: result.success ? (isReturn ? returnSummary : null) : order.turboReturnSummary,
    },
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }
  return NextResponse.json({ ok: true, turboOrderId: result.turboOrderId });
}

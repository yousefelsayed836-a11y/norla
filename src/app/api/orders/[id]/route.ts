import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { adjustStock } from "@/lib/inventory";
import { revalidateStorefront } from "@/lib/revalidate";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true, variant: true } }, customer: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const order = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    const updated = await tx.order.update({ where: { id }, data: { status: body.status } });

    const wasCancelled = existing.status === "CANCELLED";
    const isCancelled = body.status === "CANCELLED";
    if (!wasCancelled && isCancelled) {
      await adjustStock(tx, existing.items, 1);
    } else if (wasCancelled && !isCancelled) {
      await adjustStock(tx, existing.items, -1);
    }

    return updated;
  });

  revalidateStorefront();
  return NextResponse.json({ order });
}

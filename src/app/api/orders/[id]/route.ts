import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { adjustStock } from "@/lib/inventory";
import { revalidateStorefront } from "@/lib/revalidate";
import { z } from "zod";

const orderStatusSchema = z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "EXPRESS", "PROBLEM"]);

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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid order update" }, { status: 400 });
  }
  const data = body as Record<string, unknown>;
  const parsedStatus = data.status === undefined ? undefined : orderStatusSchema.safeParse(data.status);
  if (parsedStatus && !parsedStatus.success) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }
  if (data.customer !== undefined && (!data.customer || typeof data.customer !== "object" || Array.isArray(data.customer))) {
    return NextResponse.json({ error: "Invalid customer details" }, { status: 400 });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!existing) return null;
      const customer = data.customer as Record<string, unknown> | undefined;
      const nextStatus = parsedStatus?.success ? parsedStatus.data : undefined;
      const updated = await tx.order.update({
        where: { id },
        data: {
          ...(nextStatus ? { status: nextStatus } : {}),
          ...(customer ? {
            customer: {
              update: {
                name: String(customer.name ?? ""),
                phone: String(customer.phone ?? ""),
                whatsappNumber: String(customer.whatsappNumber ?? ""),
                address: String(customer.address ?? ""),
                city: String(customer.city ?? ""),
                governorate: String(customer.governorate ?? ""),
              },
            },
          } : {}),
        },
      });

      const wasCancelled = existing.status === "CANCELLED";
      const isCancelled = nextStatus === "CANCELLED";
      if (!wasCancelled && isCancelled) await adjustStock(tx, existing.items, 1);
      else if (wasCancelled && nextStatus && !isCancelled) await adjustStock(tx, existing.items, -1);
      return updated;
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    revalidateStorefront();
    return NextResponse.json({ order });
  } catch (error) {
    const errorId = crypto.randomUUID();
    console.error(`[order-update:${errorId}] Failed to update order ${id}`, error);
    return NextResponse.json({ error: "Could not update order. Please refresh and try again.", errorId }, { status: 500 });
  }
}


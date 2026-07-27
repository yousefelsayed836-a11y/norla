import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [productCount, orderCount, customerCount, orders, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.customer.count(),
    prisma.order.findMany({ select: { total: true, status: true, createdAt: true } }),
    prisma.product.count({ where: { stockStatus: { in: ["outofstock", "onbackorder"] } } }),
  ]);

  const revenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((s, o) => s + Number(o.total), 0);

  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  return NextResponse.json({
    productCount,
    orderCount,
    customerCount,
    revenue,
    pendingOrders,
    lowStock,
  });
}

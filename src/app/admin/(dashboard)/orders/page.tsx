import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatEGP } from "@/lib/format";
import OrderStatusSelect from "@/components/OrderStatusSelect";
import OrderStatusBadge, { STATUS_CONFIG } from "@/components/OrderStatusBadge";

const ALL_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "EXPRESS", "PROBLEM"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;

  const [allOrders, filteredOrders] = await Promise.all([
    prisma.order.findMany({ select: { status: true, total: true } }),
    prisma.order.findMany({
      where: filterStatus ? { status: filterStatus } : undefined,
      include: { customer: true, items: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Count per status
  const counts: Record<string, number> = {};
  let totalRevenue = 0;
  for (const o of allOrders) {
    counts[o.status] = (counts[o.status] ?? 0) + 1;
    if (o.status !== "CANCELLED") totalRevenue += Number(o.total);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Orders</h1>
        <p className="text-sm text-foreground/50">{allOrders.length} total</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-foreground/50 mb-1">Total Revenue</p>
          <p className="font-display text-xl text-brand-dark">{formatEGP(totalRevenue)}</p>
          <p className="text-xs text-foreground/40 mt-0.5">excl. cancelled</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-amber-700 mb-1">Pending</p>
          <p className="font-display text-xl text-amber-800">{counts["PENDING"] ?? 0}</p>
        </div>
        <div className="bg-violet-50 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-violet-700 mb-1">Shipped</p>
          <p className="font-display text-xl text-violet-800">{counts["SHIPPED"] ?? 0}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-red-700 mb-1">Cancelled</p>
          <p className="font-display text-xl text-red-800">{counts["CANCELLED"] ?? 0}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/admin/orders"
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !filterStatus
              ? "bg-brand-dark text-white border-brand-dark"
              : "bg-white text-foreground/60 border-brand-light hover:border-brand-dark"
          }`}
        >
          All ({allOrders.length})
        </Link>
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          const isActive = filterStatus === s;
          return (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              style={isActive ? { backgroundColor: cfg.selectBg } : undefined}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? `${cfg.text} border-current`
                  : "bg-white text-foreground/60 border-brand-light hover:border-brand-dark"
              }`}
            >
              {cfg.label} ({counts[s] ?? 0})
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Desktop table */}
        <table className="w-full text-sm hidden md:table">
          <thead>
            <tr className="text-left text-foreground/40 border-b border-brand-light/60">
              <th className="p-4 font-medium">Order</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Items</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Deposit</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o.id} className="border-b border-brand-light/40 last:border-0">
                <td className="p-4">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-brand-dark">
                    #{o.orderNo}
                  </Link>
                </td>
                <td className="p-4">
                  <p>{o.customer?.name ?? "—"}</p>
                  <p className="text-xs text-foreground/40">{o.customer?.phone}</p>
                </td>
                <td className="p-4">{o.items.length}</td>
                <td className="p-4">{formatEGP(Number(o.total))}</td>
                <td className="p-4 text-brand-dark font-medium">
                  {formatEGP(Number(o.depositAmount))}
                </td>
                <td className="p-4">
                  <OrderStatusSelect orderId={o.id} status={o.status} />
                </td>
                <td className="p-4 text-foreground/50">
                  {new Date(o.createdAt).toLocaleDateString("ar-EG")}
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-foreground/40">
                  No orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile list */}
        <div className="md:hidden divide-y divide-brand-light/40">
          {filteredOrders.map((o) => (
            <div key={o.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-brand-dark">
                    #{o.orderNo}
                  </Link>
                  <p className="text-sm text-foreground/70 mt-0.5">{o.customer?.name ?? "—"}</p>
                  <p className="text-xs text-foreground/40">{o.customer?.phone}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <OrderStatusBadge status={o.status} />
                  <span className="text-xs text-foreground/40">
                    {new Date(o.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 mt-3">
                <div className="text-sm space-y-0.5">
                  <p className="font-medium">{formatEGP(Number(o.total))}</p>
                  <p className="text-xs text-brand-dark">{formatEGP(Number(o.depositAmount))} عربون</p>
                </div>
                <OrderStatusSelect orderId={o.id} status={o.status} />
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <p className="p-8 text-center text-foreground/40 text-sm">No orders.</p>
          )}
        </div>
      </div>
    </div>
  );
}

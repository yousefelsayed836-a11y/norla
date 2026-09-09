import { prisma } from "@/lib/prisma";
import { formatEGP } from "@/lib/format";
import Link from "next/link";
import { STATUS_CONFIG } from "@/components/OrderStatusBadge";

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const chartH = 120;
  const barW = Math.max(6, Math.floor(560 / (data.length * 1.4)));
  const gap = Math.max(2, Math.floor(barW * 0.3));
  const totalW = data.length * (barW + gap);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalW} ${chartH + 24}`}
        style={{ minWidth: totalW, width: "100%", height: chartH + 24 }}
        aria-hidden="true"
      >
        {data.map((d, i) => {
          const h = Math.max(2, (d.value / max) * chartH);
          const x = i * (barW + gap);
          const y = chartH - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} rx={barW < 8 ? 1 : 3} fill="#b89c8e" opacity="0.85" />
              {data.length <= 14 && (
                <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fontSize="8" fill="#a07070" fontFamily="sans-serif">
                  {d.label}
                </text>
              )}
              {data.length <= 7 && d.value > 0 && (
                <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize="8" fill="#6b3030" fontFamily="sans-serif">
                  {formatEGP(d.value).replace("EGP", "").trim()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex-1 bg-brand-light/40 rounded-full h-1.5 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default async function AnalyticsPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [allOrders, recentOrders, topItemsRaw, customerCount, productCount] = await Promise.all([
    prisma.order.findMany({
      select: { total: true, status: true, createdAt: true, customer: { select: { governorate: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { total: true, status: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.orderItem.groupBy({
      by: ["title"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    prisma.customer.count(),
    prisma.product.count(),
  ]);

  // ─── Overall stats ───────────────────────────────────────────────────────
  const totalRevenue = allOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((s, o) => s + Number(o.total), 0);

  const thisMonthRevenue = allOrders
    .filter((o) => o.status !== "CANCELLED" && o.createdAt >= startOfMonth)
    .reduce((s, o) => s + Number(o.total), 0);

  const lastMonthRevenue = allOrders
    .filter((o) => o.status !== "CANCELLED" && o.createdAt >= startOfLastMonth && o.createdAt <= endOfLastMonth)
    .reduce((s, o) => s + Number(o.total), 0);

  const last7Revenue = allOrders
    .filter((o) => o.status !== "CANCELLED" && o.createdAt >= sevenDaysAgo)
    .reduce((s, o) => s + Number(o.total), 0);

  const totalOrders = allOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / Math.max(1, allOrders.filter((o) => o.status !== "CANCELLED").length) : 0;

  // ─── Status breakdown ────────────────────────────────────────────────────
  const statusCounts: Record<string, number> = {};
  for (const o of allOrders) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  const maxStatusCount = Math.max(...Object.values(statusCounts), 1);

  // ─── Daily revenue chart (last 30 days) ──────────────────────────────────
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const o of recentOrders) {
    if (o.status === "CANCELLED") continue;
    const key = o.createdAt.toISOString().slice(0, 10);
    if (key in dailyMap) dailyMap[key] = (dailyMap[key] ?? 0) + Number(o.total);
  }
  const dailyData = Object.entries(dailyMap).map(([date, value]) => ({
    label: new Date(date).getDate().toString(),
    value,
  }));

  // ─── Governorate breakdown ───────────────────────────────────────────────
  const govMap: Record<string, number> = {};
  for (const o of allOrders) {
    const gov = o.customer?.governorate || "Unknown";
    govMap[gov] = (govMap[gov] ?? 0) + 1;
  }
  const topGov = Object.entries(govMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxGov = topGov[0]?.[1] ?? 1;

  // ─── Revenue by month (last 6 months) ────────────────────────────────────
  const monthlyMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`] = 0;
  }
  for (const o of allOrders) {
    if (o.status === "CANCELLED") continue;
    const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthlyMap) monthlyMap[key] = (monthlyMap[key] ?? 0) + Number(o.total);
  }
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = Object.entries(monthlyMap).map(([key, value]) => ({
    label: monthNames[parseInt(key.split("-")[1]) - 1],
    value,
  }));

  // ─── Completion rate ─────────────────────────────────────────────────────
  const deliveredCount = statusCounts["DELIVERED"] ?? 0;
  const cancelledCount = statusCounts["CANCELLED"] ?? 0;
  const completionRate = totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;
  const cancellationRate = totalOrders > 0 ? Math.round((cancelledCount / totalOrders) * 100) : 0;

  const dotColors: Record<string, string> = {
    PENDING: "#f59e0b", PROCESSING: "#3b82f6", SHIPPED: "#7c3aed",
    DELIVERED: "#16a34a", CANCELLED: "#dc2626", EXPRESS: "#06b6d4", PROBLEM: "#e11d48",
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Analytics</h1>
        <Link href="/admin/orders" className="text-sm text-brand-dark font-medium hover:opacity-80">
          ← Orders
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatEGP(totalRevenue), sub: "excl. cancelled" },
          { label: "This Month", value: formatEGP(thisMonthRevenue), sub: lastMonthRevenue > 0 ? `Last month: ${formatEGP(lastMonthRevenue)}` : undefined },
          { label: "Last 7 Days", value: formatEGP(last7Revenue), sub: `${totalOrders} total orders` },
          { label: "Avg Order Value", value: formatEGP(Math.round(avgOrderValue)), sub: `${customerCount} customers` },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-foreground/50">{c.label}</p>
            <p className="font-display text-2xl mt-1 text-brand-dark">{c.value}</p>
            {c.sub && <p className="text-xs text-foreground/40 mt-1">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-medium text-sm text-foreground/50 uppercase tracking-wide mb-4">
            Daily Revenue — Last 30 Days
          </h2>
          <BarChart data={dailyData} />
        </div>

        {/* Monthly revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-medium text-sm text-foreground/50 uppercase tracking-wide mb-4">
            Monthly Revenue — Last 6 Months
          </h2>
          <BarChart data={monthlyData} />
        </div>
      </div>

      {/* Status breakdown + completion */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-medium text-sm text-foreground/50 uppercase tracking-wide mb-4">
            Orders by Status
          </h2>
          <div className="space-y-3">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = statusCounts[key] ?? 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                  <span className="text-sm w-24 shrink-0">{cfg.label}</span>
                  <MiniBar value={count} max={maxStatusCount} color={dotColors[key] ?? "#aaa"} />
                  <span className="text-sm font-semibold w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-brand-light/60 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-foreground/50 text-xs">Completion Rate</p>
              <p className="font-semibold text-green-700">{completionRate}%</p>
            </div>
            <div>
              <p className="text-foreground/50 text-xs">Cancellation Rate</p>
              <p className="font-semibold text-red-700">{cancellationRate}%</p>
            </div>
          </div>
        </div>

        {/* Top governorates */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-medium text-sm text-foreground/50 uppercase tracking-wide mb-4">
            Top Governorates
          </h2>
          <div className="space-y-3">
            {topGov.map(([gov, count]) => (
              <div key={gov} className="flex items-center gap-3">
                <span className="text-sm truncate w-28 shrink-0">{gov}</span>
                <MiniBar value={count} max={maxGov} color="#b89c8e" />
                <span className="text-sm font-semibold w-8 text-right">{count}</span>
              </div>
            ))}
            {topGov.length === 0 && (
              <p className="text-sm text-foreground/40">No data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-medium text-sm text-foreground/50 uppercase tracking-wide mb-4">
          Top Products by Units Ordered
        </h2>
        <div className="space-y-2">
          {topItemsRaw.map((item, i) => {
            const qty = item._sum.quantity ?? 0;
            const maxQty = topItemsRaw[0]?._sum.quantity ?? 1;
            return (
              <div key={item.title} className="flex items-center gap-3">
                <span className="text-xs text-foreground/30 w-5 text-right shrink-0">{i + 1}</span>
                <span className="text-sm truncate flex-1">{item.title}</span>
                <MiniBar value={qty} max={Number(maxQty)} color="#b89c8e" />
                <span className="text-sm font-semibold w-10 text-right shrink-0">{qty}</span>
              </div>
            );
          })}
          {topItemsRaw.length === 0 && (
            <p className="text-sm text-foreground/40">No orders yet.</p>
          )}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: productCount },
          { label: "Total Customers", value: customerCount },
          { label: "Delivered Orders", value: deliveredCount },
          { label: "Cancelled Orders", value: cancelledCount },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-xs text-foreground/50">{c.label}</p>
            <p className="font-display text-3xl mt-1 text-brand-dark">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

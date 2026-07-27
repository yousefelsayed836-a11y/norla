import { prisma } from "@/lib/prisma";
import { formatEGP } from "@/lib/format";
import Link from "next/link";

async function getStats() {
  const [productCount, orderCount, customerCount, orders, recentOrders, lowStock] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.order.findMany({ select: { total: true, status: true } }),
      prisma.order.findMany({
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.product.findMany({
        where: { stockStatus: { in: ["outofstock", "onbackorder"] } },
        take: 5,
      }),
    ]);

  const revenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((s, o) => s + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  return { productCount, orderCount, customerCount, revenue, pendingOrders, recentOrders, lowStock };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total Revenue", value: formatEGP(stats.revenue) },
    { label: "Orders", value: stats.orderCount, sub: `${stats.pendingOrders} pending` },
    { label: "Products", value: stats.productCount },
    { label: "Customers", value: stats.customerCount },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-foreground/50">{c.label}</p>
            <p className="font-display text-3xl mt-1 text-brand-dark">{c.value}</p>
            {c.sub && <p className="text-xs text-foreground/40 mt-1">{c.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-brand-dark font-medium">
              View all →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-foreground/40 border-b border-brand-light/60">
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-brand-light/40 last:border-0">
                  <td className="py-3">
                    <Link href={`/admin/orders/${o.id}`} className="hover:text-brand-dark">
                      #{o.orderNo}
                    </Link>
                  </td>
                  <td className="py-3">{o.customer?.name ?? "—"}</td>
                  <td className="py-3">{formatEGP(Number(o.total))}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${STATUS_STYLES[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-foreground/40">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-xl mb-4">Low Stock</h2>
          <ul className="space-y-3">
            {stats.lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <Link href={`/admin/products/${p.id}`} className="hover:text-brand-dark">
                  {p.title}
                </Link>
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                  {p.stockStatus}
                </span>
              </li>
            ))}
            {stats.lowStock.length === 0 && (
              <p className="text-sm text-foreground/40">All products well stocked.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

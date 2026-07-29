import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatEGP } from "@/lib/format";
import OrderStatusSelect from "@/components/OrderStatusSelect";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Orders</h1>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
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
            {orders.map((o) => (
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
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-foreground/40">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

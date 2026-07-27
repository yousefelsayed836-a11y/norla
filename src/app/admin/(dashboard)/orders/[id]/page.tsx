import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatEGP } from "@/lib/format";
import OrderStatusSelect from "@/components/OrderStatusSelect";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Order #{order.orderNo}</h1>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-medium mb-3 text-foreground/50 text-sm uppercase tracking-wide">
            Customer
          </h2>
          <p className="font-medium">{order.customer?.name}</p>
          <p className="text-sm text-foreground/70">{order.customer?.phone}</p>
          {order.customer?.email && (
            <p className="text-sm text-foreground/70">{order.customer.email}</p>
          )}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-medium mb-3 text-foreground/50 text-sm uppercase tracking-wide">
            Delivery Address
          </h2>
          <p className="text-sm text-foreground/70">{order.customer?.address}</p>
          <p className="text-sm text-foreground/70">{order.customer?.city}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-medium mb-4 text-foreground/50 text-sm uppercase tracking-wide">
          Items
        </h2>
        <table className="w-full text-sm">
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-brand-light/40 last:border-0">
                <td className="py-3">{item.title}</td>
                <td className="py-3 text-center">× {item.quantity}</td>
                <td className="py-3 text-right">{formatEGP(Number(item.price) * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between pt-4 mt-2 border-t border-brand-light font-semibold">
          <span>Total</span>
          <span className="text-brand-dark">{formatEGP(Number(order.total))}</span>
        </div>
      </div>
    </div>
  );
}

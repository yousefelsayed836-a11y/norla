import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatEGP } from "@/lib/format";
import OrderStatusSelect from "@/components/OrderStatusSelect";
import SendToTurboButton from "@/components/SendToTurboButton";
import { TURBO_GOVERNMENT_MAP, TURBO_GOVERNMENT_ID } from "@/lib/turbo";

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

  const depositReminderText = order.customer
    ? `Hi ${order.customer.name}, thanks for your order from Norla Designs! Order #${order.orderNo} — please transfer the deposit (${Number(
        order.depositAmount
      ).toLocaleString("en-US", { maximumFractionDigits: 0 })} LE) to 01027096110 (Nourhan) and send the receipt screenshot here to confirm.\n\nمرحباً ${
        order.customer.name
      }، شكراً لطلبك من Norla Designs! طلب رقم #${order.orderNo} — برجاء تحويل العربون (${Number(
        order.depositAmount
      ).toLocaleString("en-US", { maximumFractionDigits: 0 })} جنيه) على 01027096110 (نورهان) وإرسال صورة الإيصال هنا للتأكيد.`
    : "";

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/50 hover:text-brand-dark mb-4 transition-colors"
      >
        ← Back to Orders
      </Link>
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
          <p className="text-sm text-foreground/70">Phone: {order.customer?.phone}</p>
          {order.customer?.whatsappNumber && (
            <>
              <p className="text-sm text-foreground/70">
                WhatsApp:{" "}
                <a
                  href={`https://wa.me/${order.customer.whatsappNumber.replace(/\D/g, "").replace(/^0/, "20")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-dark underline hover:no-underline"
                >
                  {order.customer.whatsappNumber}
                </a>
              </p>
              <a
                href={`https://wa.me/${order.customer.whatsappNumber.replace(/\D/g, "").replace(/^0/, "20")}?text=${encodeURIComponent(depositReminderText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#25D366] rounded-full px-3 py-1.5 hover:opacity-90 transition-opacity"
              >
                Send deposit reminder
              </a>
            </>
          )}
          {order.customer?.email && (
            <p className="text-sm text-foreground/70">{order.customer.email}</p>
          )}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-medium mb-3 text-foreground/50 text-sm uppercase tracking-wide">
            Delivery Address
          </h2>
          <p className="text-sm text-foreground/70">{order.customer?.address}</p>
          <p className="text-sm text-foreground/70">
            {order.customer?.city}
            {order.customer?.governorate ? `, ${order.customer.governorate}` : ""}
          </p>
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
        <div className="pt-4 mt-2 border-t border-brand-light space-y-1.5 text-sm">
          <div className="flex justify-between text-foreground/60">
            <span>Subtotal</span>
            <span>{formatEGP(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-foreground/60">
            <span>Shipping</span>
            <span>{formatEGP(Number(order.shippingFee))}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-1.5 border-t border-brand-light/60">
            <span>Total</span>
            <span className="text-brand-dark">{formatEGP(Number(order.total))}</span>
          </div>
          <div className="flex justify-between font-semibold text-brand-dark bg-brand-light/40 rounded-lg px-3 py-2 mt-2">
            <span>
              Deposit Due
              {order.paymentMethod && (
                <span className="font-normal text-xs">
                  {" "}
                  (via {order.paymentMethod === "instapay" ? "InstaPay" : "Vodafone Cash"})
                </span>
              )}
            </span>
            <span>{formatEGP(Number(order.depositAmount))}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <SendToTurboButton
          orderId={order.id}
          defaultGovernment={
            TURBO_GOVERNMENT_MAP[order.customer?.governorate ?? ""] ??
            order.customer?.governorate ??
            ""
          }
          defaultGovernmentId={TURBO_GOVERNMENT_ID[order.customer?.governorate ?? ""] ?? null}
          defaultArea={order.customer?.city ?? ""}
          defaultAmount={Number(order.total) - Number(order.depositAmount)}
          defaultOrderSummary={order.items.map((i) => `${i.title} x${i.quantity}`).join(", ")}
          turboOrderId={order.turboOrderId}
          turboStatus={order.turboStatus}
          turboAmountToCollect={
            order.turboAmountToCollect != null ? Number(order.turboAmountToCollect) : null
          }
          turboReturnAmount={order.turboReturnAmount != null ? Number(order.turboReturnAmount) : null}
          turboReturnSummary={order.turboReturnSummary}
        />
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TURBO_GOVERNMENT_MAP } from "@/lib/turbo";
import WaybillPrint from "@/components/WaybillPrint";

export default async function WaybillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });
  if (!order || !order.customer) notFound();

  const government =
    TURBO_GOVERNMENT_MAP[order.customer.governorate ?? ""] ?? order.customer.governorate ?? "";
  const shippingDate = order.updatedAt.toISOString().slice(0, 10);
  const orderSummary = order.items.map((i) => `${i.title} x${i.quantity}`).join(", ");

  return (
    <WaybillPrint
      orderNo={order.orderNo}
      trackingCode={order.turboOrderId ?? ""}
      receiverName={order.customer.name}
      phone1={order.customer.phone ?? ""}
      address={order.customer.address ?? ""}
      government={government}
      area={order.customer.city ?? ""}
      shippingDate={shippingDate}
      orderSummary={orderSummary}
      amountToCollect={
        order.turboAmountToCollect != null
          ? Number(order.turboAmountToCollect)
          : Number(order.total) - Number(order.depositAmount)
      }
      returnAmount={order.turboReturnAmount != null ? Number(order.turboReturnAmount) : null}
    />
  );
}

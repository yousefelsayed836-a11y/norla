"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatEGP } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

type OrderItem = { id: string; title: string; price: number; quantity: number };
type OrderDetails = {
  id: string;
  orderNo: number;
  subtotal: number;
  shippingFee: number;
  serviceFee: number;
  total: number;
  depositAmount: number;
  paymentMethod: string | null;
  items: OrderItem[];
  customer: {
    name: string;
    phone: string;
    whatsappNumber: string | null;
    email: string | null;
    governorate: string | null;
    city: string | null;
    address: string | null;
  } | null;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-foreground/50 shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const { t } = useLanguage();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [deliveryNote, setDeliveryNote] = useState("مدة تنفيذ الاوردر من 4 ل 7 ايام");
  const [transferPhone, setTransferPhone] = useState("01027096110");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}/public`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order))
      .catch(() => {});
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings.checkoutDeliveryNote) setDeliveryNote(d.settings.checkoutDeliveryNote);
        if (d.settings.checkoutTransferPhone) setTransferPhone(d.settings.checkoutTransferPhone);
        if (d.settings.checkoutAccountName) setAccountName(d.settings.checkoutAccountName);
      })
      .catch(() => {});
  }, [orderId]);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-32 md:pt-40 pb-24">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-4xl mb-3">{t("order.thankYou")}</h1>
        <p className="text-foreground/70">{t("order.confirmedMessage")}</p>
      </div>

      {order ? (
        <div className="space-y-4">

          {/* Order number */}
          <div className="bg-brand-light/40 rounded-2xl px-6 py-4 text-center">
            <p className="text-xs text-foreground/50 uppercase tracking-widest mb-1">{t("order.number")}</p>
            <p className="font-display text-3xl text-brand-dark">#{order.orderNo}</p>
          </div>

          {/* Customer info */}
          {order.customer && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
              <h2 className="font-medium text-sm text-foreground/50 uppercase tracking-wide mb-4">
                {t("order.yourInfo") || "بياناتك"}
              </h2>
              <Row label={t("checkout.fullName") || "الاسم"} value={order.customer.name} />
              <Row label={t("checkout.phone") || "رقم الهاتف"} value={order.customer.phone} />
              {order.customer.whatsappNumber && (
                <Row label={t("checkout.whatsapp") || "واتساب"} value={order.customer.whatsappNumber} />
              )}
              {order.customer.email && (
                <Row label={t("checkout.email") || "الإيميل"} value={order.customer.email} />
              )}
              <div className="border-t border-brand-light/60 pt-3 mt-1 space-y-2">
                {order.customer.address && (
                  <Row label={t("checkout.address") || "العنوان"} value={order.customer.address} />
                )}
                {(order.customer.city || order.customer.governorate) && (
                  <Row
                    label={t("order.city") || "المدينة / المحافظة"}
                    value={[order.customer.city, order.customer.governorate].filter(Boolean).join("، ")}
                  />
                )}
              </div>
            </div>
          )}

          {/* Order items + price breakdown */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-medium text-sm text-foreground/50 uppercase tracking-wide mb-3">
              {t("order.items")}
            </h2>
            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-foreground/80">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="font-medium">{formatEGP(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-brand-light pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-foreground/60">
                <span>{t("order.subtotal")}</span>
                <span>{formatEGP(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-foreground/60">
                <span>{t("order.shipping")}</span>
                <span>
                  {Number(order.shippingFee) === 0 ? (t("checkout.free") || "مجانى") : formatEGP(Number(order.shippingFee))}
                </span>
              </div>
              {Number(order.serviceFee) > 0 && (
                <div className="flex justify-between text-foreground/60">
                  <span>{t("order.vodafoneFee")}</span>
                  <span>{formatEGP(Number(order.serviceFee))}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-brand-light">
                <span>{t("order.total")}</span>
                <span className="text-brand-dark">{formatEGP(Number(order.total))}</span>
              </div>
              <div className="flex justify-between font-semibold text-brand-dark bg-brand-light/40 rounded-lg px-3 py-2 mt-1">
                <span>{t("order.deposit")}</span>
                <span>{formatEGP(Number(order.depositAmount))}</span>
              </div>
            </div>

            {deliveryNote && (
              <p className="text-xs text-foreground/60 text-center pt-3 mt-2 border-t border-brand-light/40" dir="rtl">
                {deliveryNote}
              </p>
            )}
          </div>

          {/* Payment instructions */}
          {order.paymentMethod && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
              <h2 className="font-medium text-sm text-foreground/50 uppercase tracking-wide mb-1">
                {t("order.paymentInstructions") || "تعليمات الدفع"}
              </h2>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">{t("order.payVia")}</span>
                <span className="font-medium">
                  {order.paymentMethod === "instapay" ? t("order.instapay") : t("order.vodafoneCash")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">{t("order.transferTo")}</span>
                <a
                  href={`https://wa.me/${transferPhone.replace(/\D/g, "").replace(/^0/, "20")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-black underline hover:no-underline"
                >
                  {transferPhone}
                </a>
              </div>
              {accountName && (
                <p className="text-xs text-foreground/50">{accountName}</p>
              )}
              <div className="bg-brand-light/30 rounded-xl px-4 py-3 text-sm font-semibold text-brand-dark flex justify-between">
                <span>{t("order.depositDue") || "العربون المطلوب"}</span>
                <span>{formatEGP(Number(order.depositAmount))}</span>
              </div>
            </div>
          )}

        </div>
      ) : (
        orderId && (
          <div className="h-32 flex items-center justify-center text-foreground/40 text-sm">
            ...
          </div>
        )
      )}

      <div className="text-center mt-8">
        <Link
          href="/products"
          className="inline-block bg-brand-dark text-white px-8 py-3 rounded-full font-medium"
        >
          {t("cart.continueShopping")}
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense>
      <OrderConfirmedContent />
    </Suspense>
  );
}

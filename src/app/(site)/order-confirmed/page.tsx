"use client";

import { useEffect, useState } from "react";
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
  customer: { name: string; phone: string; governorate: string | null; city: string | null; address: string | null } | null;
};

export default function OrderConfirmedPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const { t } = useLanguage();
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}/public`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order))
      .catch(() => {});
  }, [orderId]);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-32 md:pt-40 pb-24">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl mb-3">{t("order.thankYou")}</h1>
        <p className="text-foreground/70">{t("order.confirmedMessage")}</p>
      </div>

      {order ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-foreground/50 mb-4 uppercase tracking-wide font-medium">
              {t("order.number")}{order.orderNo}
            </p>

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
                <span>{formatEGP(Number(order.shippingFee))}</span>
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

            {order.paymentMethod && (
              <div className="mt-4 pt-4 border-t border-brand-light text-sm space-y-1">
                <div className="flex justify-between text-foreground/60">
                  <span>{t("order.payVia")}</span>
                  <span className="font-medium">
                    {order.paymentMethod === "instapay" ? t("order.instapay") : t("order.vodafoneCash")}
                  </span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>{t("order.transferTo")}</span>
                  <a
                    href="https://wa.me/201027096110"
                    className="font-semibold text-black underline hover:no-underline"
                  >
                    01027096110
                  </a>
                </div>
              </div>
            )}

            {order.customer && (
              <div className="mt-4 pt-4 border-t border-brand-light text-sm space-y-1 text-foreground/60">
                <div className="flex justify-between">
                  <span>{t("order.deliveryTo")}</span>
                  <span className="text-right font-medium text-foreground">
                    {[order.customer.address, order.customer.city, order.customer.governorate]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              </div>
            )}
          </div>
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

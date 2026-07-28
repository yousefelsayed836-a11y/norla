"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatEGP } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { t } = useLanguage();

  return (
    <div
      className={`fixed inset-0 z-[70] flex justify-end transition-opacity duration-500 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/50 transition-[backdrop-filter] duration-500 ${
          open ? "backdrop-blur-[2px]" : ""
        }`}
        onClick={onClose}
      />
      <aside
        className={`relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-light">
          <h2 className="font-display text-xl">{t("cart.title")}</h2>
          <button
            onClick={onClose}
            aria-label={t("cart.closeCart")}
            className="text-2xl leading-none text-foreground/60 transition-transform hover:rotate-90 duration-300"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 p-6 text-center">
            <p className="text-foreground/60">{t("cart.empty")}</p>
            <button
              onClick={onClose}
              className="bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium"
            >
              {t("cart.continueShopping")}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 items-center">
                  <div className="relative w-16 h-20 overflow-hidden bg-brand-light shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    {item.variantLabel && (
                      <p className="text-xs text-foreground/60">{item.variantLabel}</p>
                    )}
                    <p className="text-brand-dark font-semibold text-sm mt-1">
                      {formatEGP(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center border border-brand-light rounded-full">
                        <button
                          className="w-6 h-6 text-xs rounded-full transition-colors hover:bg-brand-light"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs">{item.quantity}</span>
                        <button
                          className="w-6 h-6 text-xs rounded-full transition-colors hover:bg-brand-light"
                          onClick={() =>
                            updateQuantity(item.productId, item.variantId, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-xs text-foreground/40 hover:text-brand-dark"
                      >
                        {t("cart.remove")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-brand-light">
              <div className="flex justify-between font-semibold mb-3">
                <span>{t("cart.total")}</span>
                <span className="text-brand-dark">{formatEGP(total)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block text-center bg-brand-dark text-white py-3.5 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                {t("cart.checkout")}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

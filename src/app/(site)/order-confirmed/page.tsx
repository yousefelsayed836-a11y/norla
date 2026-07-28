import Link from "next/link";
import T from "@/components/T";

export default function OrderConfirmedPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-40 pb-24 text-center">
      <h1 className="font-display text-4xl mb-4">
        <T k="order.thankYou" />
      </h1>
      <p className="text-foreground/70 mb-8">
        <T k="order.confirmedMessage" />
      </p>
      <Link
        href="/products"
        className="inline-block bg-brand-dark text-white px-8 py-3 rounded-full font-medium"
      >
        <T k="cart.continueShopping" />
      </Link>
    </div>
  );
}

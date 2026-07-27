import Link from "next/link";

export default function OrderConfirmedPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-40 pb-24 text-center">
      <h1 className="font-display text-4xl mb-4">Thank you! 🎉</h1>
      <p className="text-foreground/70 mb-8">
        Your order has been placed successfully. Our team will contact you shortly to confirm
        delivery details.
      </p>
      <Link
        href="/products"
        className="inline-block bg-brand-dark text-white px-8 py-3 rounded-full font-medium"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

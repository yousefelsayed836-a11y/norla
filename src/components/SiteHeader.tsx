"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";

type CategoryLink = { name: string; slug: string };

export default function SiteHeader({ categories }: { categories: CategoryLink[] }) {
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing header style to route change (external navigation state)
      setScrolled(true);
      return;
    }
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed top-9 left-0 right-0 z-50 transition-all duration-300 ${
        solid ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <div
        className={`mx-auto max-w-6xl px-5 flex items-center justify-between h-20 ${
          solid ? "text-foreground" : "text-white"
        }`}
      >
        <div className="flex items-center flex-1">
          <button className="p-1" onClick={() => setOpen(!open)} aria-label="Menu">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <Link href="/" className="shrink-0">
          <Image
            src={solid ? "/brand/logo-dark.webp" : "/brand/logo-light.webp"}
            alt="Norla Designs"
            width={120}
            height={20}
            priority
            className="transition-opacity duration-300"
          />
        </Link>

        <div className="flex items-center justify-end flex-1">
          <Link href="/cart" className="relative p-1.5" aria-label="Cart">
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-dark text-white text-[10px] rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 px-5 pb-4 bg-white text-foreground font-medium text-sm border-t border-brand-light/60">
          <Link
            href="/products"
            className="py-2.5 border-b border-brand-light/60"
            onClick={() => setOpen(false)}
          >
            All Products
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="py-2.5 border-b border-brand-light/60"
              onClick={() => setOpen(false)}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

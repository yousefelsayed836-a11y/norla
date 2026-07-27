"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import CartDrawer from "@/components/CartDrawer";

type NavLinkItem = { label: string; href: string };

export default function SiteHeader({ navLinks }: { navLinks: NavLinkItem[] }) {
  const { count } = useCart();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

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

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the nav drawer whenever navigation happens
  useEffect(() => setNavOpen(false), [pathname]);

  const solid = scrolled || navOpen;

  return (
    <>
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
            <button
              className="p-1 transition-transform active:scale-90"
              onClick={() => setNavOpen(true)}
              aria-label="Menu"
            >
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
              width={155}
              height={26}
              priority
              className="transition-opacity duration-300"
            />
          </Link>

          <div className="flex items-center justify-end flex-1">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-1.5 transition-transform active:scale-90"
              aria-label="Cart"
            >
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
                <span className="absolute -top-0.5 -right-0.5 bg-brand-dark text-white text-[10px] rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center transition-transform scale-100">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[70] flex transition-opacity duration-300 ${
          navOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!navOpen}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setNavOpen(false)} />
        <aside
          className={`relative w-full max-w-xs bg-white h-full flex flex-col shadow-xl transition-transform duration-300 ease-out ${
            navOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-5 border-b border-brand-light">
            <Image src="/brand/logo-dark.webp" alt="Norla Designs" width={110} height={19} />
            <button
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
              className="text-2xl leading-none text-foreground/60 transition-transform hover:rotate-90 duration-300"
            >
              ✕
            </button>
          </div>
          <nav className="flex-1 flex flex-col px-5 py-4 font-medium text-sm overflow-y-auto uppercase tracking-wide">
            {navLinks.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="py-3 border-b border-brand-light/60 transition-colors hover:text-brand-dark"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

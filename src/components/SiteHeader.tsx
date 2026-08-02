"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import CartDrawer from "@/components/CartDrawer";
import { useLanguage } from "@/lib/i18n";

type CategoryItem = { name: string; nameAr?: string | null; slug: string };

export default function SiteHeader({ categories }: { categories: CategoryItem[] }) {
  const { count } = useCart();
  const { lang, setLang, t, pick } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close the nav/search drawers whenever navigation happens
    setNavOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

  const solid = scrolled || navOpen || searchOpen;

  return (
    <>
      <header
        className={`fixed top-9 md:top-12 left-0 right-0 z-50 transition-all duration-300 ${
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
              aria-label={t("nav.menu")}
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

          <div className="flex items-center justify-end flex-1 gap-1">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="p-1.5 transition-transform active:scale-90"
              aria-label={t("nav.search")}
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-1.5 transition-transform active:scale-90"
              aria-label={t("nav.cart")}
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

        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto max-w-6xl px-5 pb-4 flex items-center gap-3 border-t border-black/10"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mt-4 text-foreground/50"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("nav.searchPlaceholder")}
              className="flex-1 mt-4 bg-transparent outline-none text-sm py-1 border-b border-transparent focus:border-brand-dark transition-colors"
            />
          </form>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[70] flex transition-opacity duration-500 ${
          navOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!navOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-[backdrop-filter] duration-500 ${
            navOpen ? "backdrop-blur-[2px]" : ""
          }`}
          onClick={() => setNavOpen(false)}
        />
        <aside
          className={`relative w-full max-w-xs bg-white h-full flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            navOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-end px-5 py-5 border-b border-brand-light">
            <button
              onClick={() => setNavOpen(false)}
              aria-label={t("nav.closeMenu")}
              className="text-2xl leading-none text-foreground/60 transition-transform hover:rotate-90 duration-300"
            >
              ✕
            </button>
          </div>
          <nav className="flex-1 flex flex-col px-5 py-4 font-medium text-sm overflow-y-auto uppercase tracking-wide">
            <Link
              href="/"
              onClick={() => setNavOpen(false)}
              className="py-3 border-b border-brand-light/60 transition-colors hover:text-brand-dark"
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/products"
              onClick={() => setNavOpen(false)}
              className="py-3 border-b border-brand-light/60 transition-colors hover:text-brand-dark"
            >
              {t("nav.store")}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/products?category=${c.slug}`}
                onClick={() => setNavOpen(false)}
                className="py-3 border-b border-brand-light/60 transition-colors hover:text-brand-dark"
              >
                {pick(c.name, c.nameAr)}
              </Link>
            ))}
            <Link
              href="/contact-us"
              onClick={() => setNavOpen(false)}
              className="py-3 border-b border-brand-light/60 transition-colors hover:text-brand-dark"
            >
              {t("nav.contactUs")}
            </Link>
            <Link
              href="/exchange-policy"
              onClick={() => setNavOpen(false)}
              className="py-3 border-b border-brand-light/60 transition-colors hover:text-brand-dark"
            >
              {t("nav.exchangePolicy")}
            </Link>
          </nav>
          <div className="px-5 py-4 border-t border-brand-light">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="flex items-center gap-2.5 text-sm font-medium uppercase tracking-wide text-brand-dark"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="9" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <path d="M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" />
              </svg>
              {t("nav.language")}
            </button>
          </div>
        </aside>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

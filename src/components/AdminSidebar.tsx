"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: "▦" },
  { label: "Products", href: "/admin/products", icon: "🛍" },
  { label: "Categories", href: "/admin/categories", icon: "▧" },
  { label: "Sections", href: "/admin/sections", icon: "▤" },
  { label: "Hero", href: "/admin/hero", icon: "🖼" },
  { label: "Gallery", href: "/admin/gallery", icon: "🖇" },
  { label: "Menu", href: "/admin/navigation", icon: "☰" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "★" },
  { label: "Reviews", href: "/admin/reviews", icon: "💬" },
  { label: "Shipping", href: "/admin/shipping", icon: "🚚" },
  { label: "Orders", href: "/admin/orders", icon: "📦" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
];

export default function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the mobile drawer whenever navigation happens
  useEffect(() => setOpen(false), [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const navList = (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {NAV.map((n) => {
        const active = pathname === n.href || (n.href !== "/admin" && pathname?.startsWith(n.href));
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active ? "bg-brand text-[#241a1f]" : "hover:bg-white/10"
            }`}
          >
            <span>{n.icon}</span>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-[#241a1f] text-white px-4 py-3">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <p className="font-display text-xl text-brand">Norla</p>
        <div className="w-6" />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-72 max-w-[85%] bg-[#241a1f] text-white/90 min-h-screen flex flex-col">
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
              <div>
                <p className="font-display text-2xl text-brand">Norla</p>
                <p className="text-xs text-white/50 -mt-1">Admin Dashboard</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-white/70 text-2xl leading-none">
                ✕
              </button>
            </div>
            {navList}
            <div className="px-4 py-4 border-t border-white/10">
              <p className="text-xs text-white/50 px-2 mb-2">{name}</p>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/10"
              >
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 bg-[#241a1f] text-white/90 min-h-screen flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="font-display text-2xl text-brand">Norla</p>
          <p className="text-xs text-white/50 -mt-1">Admin Dashboard</p>
        </div>
        {navList}
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-xs text-white/50 px-2 mb-2">{name}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

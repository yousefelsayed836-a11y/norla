"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: "▦" },
  { label: "Products", href: "/admin/products", icon: "🛍" },
  { label: "Categories", href: "/admin/categories", icon: "▧" },
  { label: "Sections", href: "/admin/sections", icon: "▤" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "★" },
  { label: "Orders", href: "/admin/orders", icon: "📦" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
];

export default function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 bg-[#241a1f] text-white/90 min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <p className="font-display text-2xl text-brand">Norla</p>
        <p className="text-xs text-white/50 -mt-1">Admin Dashboard</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
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
  );
}

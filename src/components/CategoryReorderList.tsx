"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Category = { id: string; name: string; imageUrl: string | null; position: number; _count: { products: number } };

export default function CategoryReorderList({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const reindexed = next.map((item, i) => ({ ...item, position: i }));
    setItems(reindexed);
    setSaving(true);
    await fetch("/api/admin/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource: "category", items: reindexed.map((x) => ({ id: x.id, position: x.position })) }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-sm hidden md:table">
        <thead>
          <tr className="text-left text-foreground/40 border-b border-brand-light/60">
            <th className="p-4 font-medium w-24">Order</th>
            <th className="p-4 font-medium">Tile</th>
            <th className="p-4 font-medium">Name</th>
            <th className="p-4 font-medium">Products</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((c, i) => (
            <tr key={c.id} className="border-b border-brand-light/40 last:border-0">
              <td className="p-4">
                <div className="flex items-center gap-1">
                  <button
                    disabled={saving || i === 0}
                    onClick={() => move(i, -1)}
                    className="w-7 h-7 rounded border border-brand-light flex items-center justify-center hover:bg-brand-light/50 disabled:opacity-30 text-xs"
                  >
                    ▲
                  </button>
                  <button
                    disabled={saving || i === items.length - 1}
                    onClick={() => move(i, 1)}
                    className="w-7 h-7 rounded border border-brand-light flex items-center justify-center hover:bg-brand-light/50 disabled:opacity-30 text-xs"
                  >
                    ▼
                  </button>
                </div>
              </td>
              <td className="p-4">
                <div className="relative w-12 h-14 overflow-hidden bg-brand-light">
                  {c.imageUrl && <Image src={c.imageUrl} alt="" fill className="object-cover" sizes="48px" />}
                </div>
              </td>
              <td className="p-4">{c.name}</td>
              <td className="p-4">{c._count.products}</td>
              <td className="p-4 text-right">
                <Link href={`/admin/categories/${c.id}`} className="text-brand-dark font-medium">Edit</Link>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={5} className="p-8 text-center text-foreground/40">No categories yet.</td></tr>
          )}
        </tbody>
      </table>

      <div className="md:hidden divide-y divide-brand-light/40">
        {items.map((c, i) => (
          <div key={c.id} className="p-4 flex items-center gap-3">
            <div className="flex flex-col gap-1 shrink-0">
              <button disabled={saving || i === 0} onClick={() => move(i, -1)} className="w-7 h-7 rounded border border-brand-light flex items-center justify-center disabled:opacity-30 text-xs">▲</button>
              <button disabled={saving || i === items.length - 1} onClick={() => move(i, 1)} className="w-7 h-7 rounded border border-brand-light flex items-center justify-center disabled:opacity-30 text-xs">▼</button>
            </div>
            <div className="relative w-12 h-14 overflow-hidden bg-brand-light shrink-0">
              {c.imageUrl && <Image src={c.imageUrl} alt="" fill className="object-cover" sizes="48px" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{c.name}</p>
              <p className="text-xs text-foreground/50">{c._count.products} products</p>
            </div>
            <Link href={`/admin/categories/${c.id}`} className="text-brand-dark font-medium text-sm shrink-0">Edit</Link>
          </div>
        ))}
        {items.length === 0 && <p className="p-8 text-center text-foreground/40 text-sm">No categories yet.</p>}
      </div>
    </div>
  );
}

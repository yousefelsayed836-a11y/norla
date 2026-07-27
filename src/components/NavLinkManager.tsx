"use client";

import { useState } from "react";

type NavLinkItem = { id: string; label: string; href: string; position: number };

export default function NavLinkManager({ initialLinks }: { initialLinks: NavLinkItem[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [saving, setSaving] = useState(false);

  async function addLink() {
    if (!label || !href) return;
    setSaving(true);
    const res = await fetch("/api/nav-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, href }),
    });
    const data = await res.json();
    setLinks([...links, data.link]);
    setLabel("");
    setHref("");
    setSaving(false);
  }

  async function removeLink(id: string) {
    await fetch(`/api/nav-links/${id}`, { method: "DELETE" });
    setLinks(links.filter((l) => l.id !== id));
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= links.length) return;
    const copy = [...links];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setLinks(copy);
    await Promise.all(
      copy.map((l, i) =>
        fetch(`/api/nav-links/${l.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: l.label, href: l.href, position: i }),
        })
      )
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl">
      <ul className="space-y-2 mb-6">
        {links.map((l, i) => (
          <li
            key={l.id}
            className="flex items-center justify-between border border-brand-light rounded-xl px-4 py-2.5 text-sm"
          >
            <div>
              <p className="font-medium">{l.label}</p>
              <p className="text-xs text-foreground/40">{l.href}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-foreground/40 hover:text-brand-dark disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === links.length - 1}
                className="text-foreground/40 hover:text-brand-dark disabled:opacity-30"
              >
                ↓
              </button>
              <button onClick={() => removeLink(l.id)} className="text-red-500 hover:text-red-700">
                Remove
              </button>
            </div>
          </li>
        ))}
        {links.length === 0 && <p className="text-sm text-foreground/40">No menu items yet.</p>}
      </ul>

      <div className="border-t border-brand-light pt-5 space-y-3">
        <p className="text-sm font-medium">Add menu item</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Label (e.g. Dresses)"
            className="border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <input
            placeholder="Link (e.g. /products?category=dresses)"
            className="border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={href}
            onChange={(e) => setHref(e.target.value)}
          />
        </div>
        <button
          onClick={addLink}
          disabled={saving}
          className="bg-brand-dark text-white px-5 py-2 rounded-full text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}

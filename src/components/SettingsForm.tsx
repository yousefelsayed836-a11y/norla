"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({
  initialText,
  initialInstagram,
  initialTiktok,
  initialWhatsapp,
  initialReturnPolicy,
}: {
  initialText: string;
  initialInstagram: string;
  initialTiktok: string;
  initialWhatsapp: string;
  initialReturnPolicy: string;
}) {
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [instagram, setInstagram] = useState(initialInstagram);
  const [tiktok, setTiktok] = useState(initialTiktok);
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp);
  const [returnPolicy, setReturnPolicy] = useState(initialReturnPolicy);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        announcementText: text,
        instagramUrl: instagram,
        tiktokUrl: tiktok,
        whatsappUrl: whatsapp,
        returnPolicyText: returnPolicy,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl bg-white rounded-2xl p-8 shadow-sm space-y-5">
      <div>
        <label className="text-sm font-medium block mb-1">Announcement Bar Text</label>
        <p className="text-xs text-foreground/50 mb-2">
          This text scrolls across the bar at the top of every page on the site.
        </p>
        <input
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Instagram URL</label>
        <input
          placeholder="https://instagram.com/norladesigns"
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">TikTok URL</label>
        <input
          placeholder="https://tiktok.com/@norladesigns"
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={tiktok}
          onChange={(e) => setTiktok(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">WhatsApp URL</label>
        <input
          placeholder="https://wa.me/201234567890"
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Returns &amp; Exchange Policy</label>
        <p className="text-xs text-foreground/50 mb-2">
          Shown as a &quot;Returns &amp; Exchange&quot; section on every product page.
        </p>
        <textarea
          rows={6}
          className="w-full border border-brand-light rounded-xl px-4 py-2.5 text-sm"
          value={returnPolicy}
          onChange={(e) => setReturnPolicy(e.target.value)}
        />
      </div>

      <button
        disabled={saving}
        className="bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
      </button>
    </form>
  );
}

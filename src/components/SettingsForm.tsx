"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsForm({
  initialText,
  initialTextAr,
  initialInstagram,
  initialTiktok,
  initialWhatsapp,
  initialFacebook,
  initialContactPhone,
  initialContactEmail,
  initialContactAddress,
  initialContactAddressAr,
  initialContactHours,
  initialContactHoursAr,
  initialCareInstructions,
  initialCareInstructionsAr,
  initialShippingFee,
  initialDepositPercent,
  initialFreeShippingEnabled,
  initialFreeShippingThreshold,
  initialCheckoutPaymentNote,
  initialCheckoutPaymentNoteAr,
}: {
  initialText: string;
  initialTextAr: string;
  initialInstagram: string;
  initialTiktok: string;
  initialWhatsapp: string;
  initialFacebook: string;
  initialContactPhone: string;
  initialContactEmail: string;
  initialContactAddress: string;
  initialContactAddressAr: string;
  initialContactHours: string;
  initialContactHoursAr: string;
  initialCareInstructions: string;
  initialCareInstructionsAr: string;
  initialShippingFee: string;
  initialDepositPercent: number;
  initialFreeShippingEnabled: boolean;
  initialFreeShippingThreshold: string;
  initialCheckoutPaymentNote: string;
  initialCheckoutPaymentNoteAr: string;
}) {
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [textAr, setTextAr] = useState(initialTextAr);
  const [instagram, setInstagram] = useState(initialInstagram);
  const [tiktok, setTiktok] = useState(initialTiktok);
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp);
  const [facebook, setFacebook] = useState(initialFacebook);
  const [contactPhone, setContactPhone] = useState(initialContactPhone);
  const [contactEmail, setContactEmail] = useState(initialContactEmail);
  const [contactAddress, setContactAddress] = useState(initialContactAddress);
  const [contactAddressAr, setContactAddressAr] = useState(initialContactAddressAr);
  const [contactHours, setContactHours] = useState(initialContactHours);
  const [contactHoursAr, setContactHoursAr] = useState(initialContactHoursAr);
  const [careInstructions, setCareInstructions] = useState(initialCareInstructions);
  const [careInstructionsAr, setCareInstructionsAr] = useState(initialCareInstructionsAr);
  const [depositPercent, setDepositPercent] = useState(String(initialDepositPercent));
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(initialFreeShippingEnabled);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(initialFreeShippingThreshold);
  const [checkoutPaymentNote, setCheckoutPaymentNote] = useState(initialCheckoutPaymentNote);
  const [checkoutPaymentNoteAr, setCheckoutPaymentNoteAr] = useState(initialCheckoutPaymentNoteAr);
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
        announcementTextAr: textAr,
        instagramUrl: instagram,
        tiktokUrl: tiktok,
        whatsappUrl: whatsapp,
        facebookUrl: facebook,
        contactPhone,
        contactEmail,
        contactAddress,
        contactAddressAr,
        contactHours,
        contactHoursAr,
        careInstructionsText: careInstructions,
        careInstructionsTextAr: careInstructionsAr,
        shippingFee: parseFloat(initialShippingFee) || 0,
        depositPercent: parseInt(depositPercent) || 0,
        freeShippingEnabled,
        freeShippingThreshold: parseFloat(freeShippingThreshold) || 0,
        checkoutPaymentNote,
        checkoutPaymentNoteAr,
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
        <label className="text-sm font-medium block mb-1">Announcement Bar Text (Arabic)</label>
        <input
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          dir="rtl"
          placeholder="اختياري — يظهر للزوار اللي مختارين اللغة العربية"
          value={textAr}
          onChange={(e) => setTextAr(e.target.value)}
        />
      </div>

      <div className="border border-brand-light rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium">Free Shipping</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={freeShippingEnabled}
            onChange={(e) => setFreeShippingEnabled(e.target.checked)}
            className="accent-brand-dark w-4 h-4"
          />
          <span className="text-sm">Enable free shipping above a certain order value</span>
        </label>
        {freeShippingEnabled && (
          <div>
            <label className="text-xs text-foreground/50 block mb-1">
              Order value threshold (LE)
            </label>
            <input
              type="number"
              className="w-full border border-brand-light rounded-xl px-4 py-2.5"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Deposit Required (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={depositPercent}
          onChange={(e) => setDepositPercent(e.target.value)}
        />
      </div>

      <p className="text-xs text-foreground/50 -mt-2">
        Per-governorate shipping fees are managed on the{" "}
        <Link href="/admin/shipping" className="text-brand-dark underline">
          Shipping
        </Link>{" "}
        page.
      </p>

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
        <label className="text-sm font-medium block mb-1">Facebook URL</label>
        <input
          placeholder="https://facebook.com/norladesigns"
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
        />
      </div>

      <div className="border border-brand-light rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium">Contact Us Page</p>
        <p className="text-xs text-foreground/50 -mt-2">
          Shown on the public &quot;Contact Us&quot; page.
        </p>
        <div>
          <label className="text-xs text-foreground/50 block mb-1">Phone Number</label>
          <input
            placeholder="01023881876"
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-foreground/50 block mb-1">Email</label>
          <input
            placeholder="hello@norla-designs.com"
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-foreground/50 block mb-1">Address</label>
          <input
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            value={contactAddress}
            onChange={(e) => setContactAddress(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-foreground/50 block mb-1">Address (Arabic)</label>
          <input
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            dir="rtl"
            placeholder="اختياري"
            value={contactAddressAr}
            onChange={(e) => setContactAddressAr(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-foreground/50 block mb-1">Working Hours</label>
          <input
            placeholder="Saturday - Thursday, 10am - 10pm"
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            value={contactHours}
            onChange={(e) => setContactHours(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-foreground/50 block mb-1">Working Hours (Arabic)</label>
          <input
            className="w-full border border-brand-light rounded-xl px-4 py-2.5"
            dir="rtl"
            placeholder="اختياري"
            value={contactHoursAr}
            onChange={(e) => setContactHoursAr(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Washing Instructions</label>
        <p className="text-xs text-foreground/50 mb-2">
          Shown as a &quot;Washing Instructions&quot; section on every product page — the same
          text everywhere, including new products.
        </p>
        <textarea
          rows={6}
          className="w-full border border-brand-light rounded-xl px-4 py-2.5 text-sm"
          value={careInstructions}
          onChange={(e) => setCareInstructions(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Washing Instructions (Arabic)</label>
        <textarea
          rows={6}
          dir="rtl"
          placeholder="اختياري — يظهر للزوار اللي مختارين اللغة العربية"
          className="w-full border border-brand-light rounded-xl px-4 py-2.5 text-sm"
          value={careInstructionsAr}
          onChange={(e) => setCareInstructionsAr(e.target.value)}
        />
      </div>

      <div className="border border-brand-light rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium">Checkout Payment Note</p>
        <p className="text-xs text-foreground/50 -mt-2">
          Shown inside the payment section on the checkout page. Describe how to pay and confirm.
        </p>
        <div>
          <label className="text-xs text-foreground/50 block mb-1">English</label>
          <textarea
            rows={4}
            placeholder="e.g. Make the transfer to InstaPay account (name: Nourhan): 01027096110. Send a screenshot to WhatsApp to confirm."
            className="w-full border border-brand-light rounded-xl px-4 py-2.5 text-sm"
            value={checkoutPaymentNote}
            onChange={(e) => setCheckoutPaymentNote(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-foreground/50 block mb-1">Arabic</label>
          <textarea
            rows={4}
            dir="rtl"
            placeholder="اختياري — يظهر للزوار اللي مختارين اللغة العربية"
            className="w-full border border-brand-light rounded-xl px-4 py-2.5 text-sm"
            value={checkoutPaymentNoteAr}
            onChange={(e) => setCheckoutPaymentNoteAr(e.target.value)}
          />
        </div>
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

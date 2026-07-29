"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

function PhoneIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.9.6 2.7a2 2 0 0 1-.4 2.1L8.1 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.9 2.2Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 2h-3v13.5a3 3 0 1 1-2.2-2.9V9.4a6.1 6.1 0 1 0 5.2 6.03V8.2a7.4 7.4 0 0 0 4.5 1.5V6.6a4.4 4.4 0 0 1-4.5-4.6Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.3-.04-1.3-.13-2.4-.13-2.4 0-4 1.46-4 4.16V9.9H7.6V13h2.7v8Z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.2 14.3c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.7-1.2-4.5-3.9-4.6-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .5.4.2.5.7 1.7.7 1.9.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.3-.5.5-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.6.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.7.8.2.1.4.2.4.3.1.2.1.6-.1 1.2Z" />
    </svg>
  );
}

export default function ContactUsContent({
  phone,
  email,
  address,
  hours,
  instagramUrl,
  tiktokUrl,
  facebookUrl,
  whatsappUrl,
}: {
  phone: string;
  email: string;
  address: string;
  hours: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  whatsappUrl: string;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !senderEmail.trim() || !message.trim()) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: senderEmail, message }),
      });
      if (!res.ok) throw new Error("failed");
      setSent(true);
      setName("");
      setSenderEmail("");
      setMessage("");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    phone && { icon: <PhoneIcon />, label: t("contact.phone"), value: phone, href: `tel:${phone}` },
    email && { icon: <MailIcon />, label: t("contact.email"), value: email, href: `mailto:${email}` },
    address && { icon: <PinIcon />, label: t("contact.address"), value: address, href: undefined },
    hours && { icon: <ClockIcon />, label: t("contact.hours"), value: hours, href: undefined },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; href?: string }[];

  const socials = [
    instagramUrl && { icon: <InstagramIcon />, href: instagramUrl, label: "Instagram" },
    tiktokUrl && { icon: <TiktokIcon />, href: tiktokUrl, label: "TikTok" },
    facebookUrl && { icon: <FacebookIcon />, href: facebookUrl, label: "Facebook" },
  ].filter(Boolean) as { icon: React.ReactNode; href: string; label: string }[];

  return (
    <div className="relative overflow-hidden pt-[7.5rem] pb-24 min-h-[70vh]">
      <div className="pointer-events-none absolute -top-10 -left-16 w-72 h-72 rounded-full bg-brand-light/60 blur-3xl animate-float-blob" />
      <div
        className="pointer-events-none absolute top-40 -right-20 w-80 h-80 rounded-full bg-brand-light/50 blur-3xl animate-float-blob"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center font-jost">
        <h1 className="animate-rise-in text-4xl md:text-5xl font-medium text-black mb-3">
          {t("contact.heading")}
        </h1>
        <p
          className="animate-rise-in text-foreground/60 mb-14"
          style={{ animationDelay: "0.1s" }}
        >
          {t("contact.subheading")}
        </p>

        {cards.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-5 mb-14 text-left">
            {cards.map((c, i) => {
              const Wrapper = c.href ? "a" : "div";
              return (
                <Wrapper
                  key={c.label}
                  {...(c.href ? { href: c.href } : {})}
                  className="animate-rise-in group flex items-start gap-4 bg-white border border-brand-light rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand"
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  <span className="shrink-0 w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand-dark transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    {c.icon}
                  </span>
                  <span>
                    <span className="block text-xs font-medium uppercase tracking-[0.15em] text-foreground/40 mb-1">
                      {c.label}
                    </span>
                    <span className="block text-base text-black break-words">{c.value}</span>
                  </span>
                </Wrapper>
              );
            })}
          </div>
        )}

        {socials.length > 0 && (
          <div
            className="animate-rise-in mb-10"
            style={{ animationDelay: `${0.2 + cards.length * 0.1}s` }}
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/40 mb-4">
              {t("contact.followUs")}
            </p>
            <div className="flex items-center justify-center gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-11 h-11 rounded-full border border-brand-light flex items-center justify-center text-foreground/60 transition-all duration-300 hover:text-white hover:bg-brand-dark hover:border-brand-dark hover:-translate-y-1"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        )}

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="animate-rise-in animate-pulse-glow inline-flex items-center gap-2 bg-brand-dark text-white px-8 py-4 rounded-full font-medium hover:opacity-90 transition-opacity mb-14"
            style={{ animationDelay: `${0.3 + cards.length * 0.1}s` }}
          >
            <WhatsappIcon />
            {t("contact.chatWhatsapp")}
          </a>
        )}

        <div
          className="animate-rise-in max-w-md mx-auto"
          style={{ animationDelay: `${0.4 + cards.length * 0.1}s` }}
        >
          <h2 className="text-xl font-medium text-black mb-5">{t("contact.sendMessage")}</h2>
          {sent ? (
            <p className="text-sm text-brand-dark text-center bg-brand-light/40 rounded-xl py-4 px-4">
              {t("contact.sent")}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              <input
                required
                placeholder={t("contact.yourName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-brand-light rounded-xl px-4 py-2.5 text-sm"
              />
              <input
                required
                type="email"
                placeholder={t("contact.yourEmail")}
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full border border-brand-light rounded-xl px-4 py-2.5 text-sm"
              />
              <textarea
                required
                rows={4}
                placeholder={t("contact.yourMessage")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-brand-light rounded-xl px-4 py-2.5 text-sm"
              />
              {error && <p className="text-red-600 text-xs text-center">{t("contact.formError")}</p>}
              <button
                disabled={loading}
                className="w-full bg-brand-dark text-white py-3 rounded-full font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? t("contact.sending") : t("contact.send")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

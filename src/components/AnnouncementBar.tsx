"use client";

import { useLanguage } from "@/lib/i18n";

export default function AnnouncementBar({ text, textAr }: { text: string; textAr?: string | null }) {
  const { pick } = useLanguage();
  const displayText = pick(text, textAr);
  if (!displayText) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-white flex items-center justify-center px-3">
      <div className="w-full h-full border border-brand-light rounded-md flex items-center overflow-hidden">
        <div className="whitespace-nowrap animate-marquee-single">
          <span className="text-black text-sm font-medium tracking-wide px-3">{displayText}</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useLanguage } from "@/lib/i18n";

export default function AnnouncementBar({ text, textAr }: { text: string; textAr?: string | null }) {
  const { pick } = useLanguage();
  const displayText = pick(text, textAr);
  if (!displayText) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-white flex items-center justify-center px-3">
      <div className="relative w-full h-full overflow-hidden">
        <div className="flex w-max absolute top-1/2 left-0 -translate-y-1/2 animate-marquee-continuous">
          <span className="whitespace-nowrap text-black text-sm font-medium tracking-wide px-3 mr-12">
            {displayText}
          </span>
          <span
            className="whitespace-nowrap text-black text-sm font-medium tracking-wide px-3 mr-12"
            aria-hidden="true"
          >
            {displayText}
          </span>
        </div>
      </div>
    </div>
  );
}

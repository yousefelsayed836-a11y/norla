"use client";

import { useLanguage } from "@/lib/i18n";

// Repeated densely enough that one full set is wider than any real screen, so the belt
// never shows an empty gap even on ultra-wide desktop monitors.
const REPEATS = 10;

export default function AnnouncementBar({ text, textAr }: { text: string; textAr?: string | null }) {
  const { pick } = useLanguage();
  const displayText = pick(text, textAr);
  if (!displayText) return null;

  const set = Array.from({ length: REPEATS });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-white flex items-center justify-center">
      <div className="relative w-full h-full overflow-hidden">
        <div className="flex w-max absolute top-1/2 left-0 -translate-y-1/2 animate-marquee-continuous">
          {[0, 1].map((setIndex) => (
            <div key={setIndex} className="flex shrink-0" aria-hidden={setIndex === 1}>
              {set.map((_, i) => (
                <span
                  key={i}
                  className="whitespace-nowrap text-black text-sm font-medium tracking-wide px-3 mr-12"
                >
                  {displayText}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

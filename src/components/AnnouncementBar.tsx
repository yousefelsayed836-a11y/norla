"use client";

import { useLanguage } from "@/lib/i18n";

export default function AnnouncementBar({ text, textAr }: { text: string; textAr?: string | null }) {
  const { pick } = useLanguage();
  const displayText = pick(text, textAr);
  if (!displayText) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-white flex items-center justify-center">
      <div className="relative w-full h-full overflow-hidden">
        <div className="flex w-max absolute top-1/2 left-0 -translate-y-1/2 animate-marquee-continuous">
          {/* The gap is slightly less than a full viewport-width, so the second copy's
              leading edge reaches the right edge just as the first copy's leading edge
              starts exiting the left edge (not waiting for it to fully leave) -
              regardless of screen width. */}
          <span
            className="whitespace-nowrap text-black text-sm font-medium tracking-wide px-3"
            style={{ marginRight: "92vw" }}
          >
            {displayText}
          </span>
          <span className="whitespace-nowrap text-black text-sm font-medium tracking-wide px-3" aria-hidden="true">
            {displayText}
          </span>
        </div>
      </div>
    </div>
  );
}

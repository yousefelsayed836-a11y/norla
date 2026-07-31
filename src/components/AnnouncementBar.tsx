"use client";

import { useLanguage } from "@/lib/i18n";

export default function AnnouncementBar({ text, textAr }: { text: string; textAr?: string | null }) {
  const { pick } = useLanguage();
  const displayText = pick(text, textAr);
  if (!displayText) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-white flex items-center">
      <div className="flex-1 overflow-hidden">
        {/* Each span is its own full-viewport-wide slot (flex-basis 50% of a 200%-wide
            track) with the text centered inside it, so the two slots sit edge-to-edge
            with no gap and no overlap - the second message is centered on screen the
            instant the first finishes sliding off. */}
        <div className="flex w-[200%] animate-marquee-continuous">
          <span className="flex-[0_0_50%] text-center whitespace-nowrap text-black text-sm font-medium tracking-wide">
            {displayText}
          </span>
          <span
            className="flex-[0_0_50%] text-center whitespace-nowrap text-black text-sm font-medium tracking-wide"
            aria-hidden="true"
          >
            {displayText}
          </span>
        </div>
      </div>
    </div>
  );
}

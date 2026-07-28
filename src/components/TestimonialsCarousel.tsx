"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

type Testimonial = { id: string; customerName: string; quote: string; rating: number };

export default function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const { t } = useLanguage();

  if (testimonials.length === 0) return null;

  const current = testimonials[index];

  function go(i: number) {
    setIndex((i + testimonials.length) % testimonials.length);
  }

  return (
    <section className="text-center py-14 px-5 bg-white border-t border-brand-light font-jost">
      <h2 className="text-[31px] font-medium text-black mb-6">{t("testimonials.heading")}</h2>

      <div className="bg-[#f2f2f2] max-w-[480px] mx-auto rounded-xl px-7 py-6">
        <p className="text-[17px] text-[#333] leading-relaxed mb-4">&quot;{current.quote}&quot;</p>
        <div className="text-sm text-[#777] font-semibold mb-2.5">— {current.customerName}</div>
        <div className="text-brand text-xl">{"★".repeat(current.rating)}</div>
      </div>

      {testimonials.length > 1 && (
        <>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => go(index - 1)}
              aria-label={t("testimonials.previous")}
              className="w-10 h-10 rounded-full bg-brand text-white text-lg hover:opacity-90"
            >
              ❮
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label={t("testimonials.next")}
              className="w-10 h-10 rounded-full bg-brand text-white text-lg hover:opacity-90"
            >
              ❯
            </button>
          </div>
          <div className="mt-3 flex justify-center gap-1.5 flex-wrap">
            {testimonials.map((item, i) => (
              <button
                key={item.id}
                onClick={() => go(i)}
                aria-label={`${t("testimonials.goTo")} ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? "bg-brand" : "bg-brand-light"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";

export default function MadeByUsSection({ images }: { images: { id: string; url: string }[] }) {
  const { t } = useLanguage();
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const [active, setActive] = useState(() => (images.length > 1 ? 1 : 0));
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    const container = mobileRef.current;
    const slide = container?.children[active] as HTMLElement | undefined;
    if (container && slide) {
      container.scrollTo({
        left: slide.offsetLeft - (container.clientWidth - slide.clientWidth) / 2,
        behavior: "auto",
      });
    }
  }, [active]);

  if (images.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-6 pb-8 text-center font-jost">
      <h2 className="-mx-4 text-[28px] tracking-tight md:mx-0 md:text-[31px] md:tracking-normal font-medium text-black mb-8">
        {t("home.madeByUs")}
      </h2>

      {/* Mobile: peek carousel */}
      <div className="md:hidden -mx-4">
        <div
          ref={mobileRef}
          className={`flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory ${
            images.length > 1 ? "px-[7%]" : "px-4"
          }`}
        >
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setOpenUrl(img.url)}
              aria-label={t("gallery.viewFullImage")}
              className={`relative shrink-0 aspect-[2/3] snap-center overflow-hidden bg-brand-light ${
                images.length > 1 ? "w-[86%]" : "w-full"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="86vw" />
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: centered row */}
      <div className="hidden md:flex flex-wrap justify-center gap-4">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setOpenUrl(img.url)}
            aria-label={t("gallery.viewFullImage")}
            className="group relative w-64 shrink-0 aspect-[2/3] overflow-hidden bg-brand-light shadow-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.06] hover:shadow-2xl hover:-translate-y-1"
          >
            <Image
              src={img.url}
              alt=""
              fill
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
              sizes="256px"
            />
          </button>
        ))}
      </div>

      {openUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center md:bg-black/90 md:p-6 animate-fade-in"
          onClick={() => setOpenUrl(null)}
        >
          <button
            onClick={() => setOpenUrl(null)}
            aria-label={t("gallery.close")}
            className="absolute top-5 right-5 text-white text-3xl leading-none transition-transform hover:rotate-90 duration-300"
          >
            ✕
          </button>
          <div className="relative w-full h-full md:h-auto md:max-w-2xl md:aspect-[2/3]">
            <Image src={openUrl} alt="" fill className="object-cover md:object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function MadeByUsSection({ images }: { images: { id: string; url: string }[] }) {
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const [active, setActive] = useState(() => (images.length > 1 ? 1 : 0));
  const mobileRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

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
        behavior: mounted.current ? "smooth" : "instant",
      });
    }
    mounted.current = true;
  }, [active]);

  if (images.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-8 text-center font-jost">
      <h2 className="text-[26px] tracking-tight md:text-[31px] md:tracking-normal font-medium text-black mb-8">
        Made By Us, Styled By You
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
              aria-label="View full image"
              className={`relative shrink-0 aspect-[2/3] snap-center overflow-hidden bg-brand-light ${
                images.length > 1 ? "w-[86%]" : "w-full"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="86vw" />
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden md:grid grid-cols-4 gap-3">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setOpenUrl(img.url)}
            aria-label="View full image"
            className="relative aspect-[2/3] overflow-hidden bg-brand-light transition-transform duration-300 hover:scale-[1.02]"
          >
            <Image
              src={img.url}
              alt=""
              fill
              className="object-cover"
              sizes="25vw"
            />
          </button>
        ))}
      </div>

      {openUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setOpenUrl(null)}
        >
          <button
            onClick={() => setOpenUrl(null)}
            aria-label="Close"
            className="absolute top-5 right-5 text-white text-3xl leading-none transition-transform hover:rotate-90 duration-300"
          >
            ✕
          </button>
          <div className="relative w-full max-w-2xl aspect-[2/3]">
            <Image src={openUrl} alt="" fill className="object-contain" />
          </div>
        </div>
      )}
    </section>
  );
}

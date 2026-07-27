"use client";

import Image from "next/image";
import { useRef, useState } from "react";

function ZoomIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function ProductGallery({
  images,
  title,
}: {
  images: { url: string }[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const list = images.length ? images : [{ url: "/brand/logo.webp" }];
  const stripRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  function scrollStrip(dir: -1 | 1) {
    stripRef.current?.scrollBy({ top: dir * 100, left: dir * 100, behavior: "smooth" });
  }

  function goToMobileSlide(i: number) {
    setActive(i);
    const container = mobileRef.current;
    const slide = container?.children[i] as HTMLElement | undefined;
    if (container && slide) {
      container.scrollTo({
        left: slide.offsetLeft - (container.clientWidth - slide.clientWidth) / 2,
        behavior: "smooth",
      });
    }
  }

  function handleMobileScroll() {
    const container = mobileRef.current;
    if (!container) return;
    const center = container.scrollLeft + container.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    Array.from(container.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const elCenter = el.offsetLeft + el.clientWidth / 2;
      const dist = Math.abs(elCenter - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActive(closest);
  }

  return (
    <>
      {/* Mobile: peek carousel */}
      <div className="md:hidden -mx-4">
        <div className="relative">
          <div
            ref={mobileRef}
            onScroll={handleMobileScroll}
            className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-[7%]"
          >
            {list.map((img, i) => (
              <div
                key={img.url + i}
                className="relative shrink-0 w-[86%] aspect-[3/4] snap-center overflow-hidden bg-white"
              >
                <Image src={img.url} alt={title} fill className="object-cover" priority={i === 0} />
              </div>
            ))}
          </div>
          <button
            onClick={() => setLightbox(true)}
            aria-label="Zoom image"
            className="absolute bottom-4 right-[9%] w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-foreground/70"
          >
            <ZoomIcon />
          </button>
        </div>

        {list.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-4 flex-wrap px-4">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => goToMobileSlide(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`rounded-full transition-all ${
                  i === active ? "w-2.5 h-2.5 bg-brand-dark" : "w-1.5 h-1.5 bg-brand-light"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: thumbnail column + main image */}
      <div className="hidden md:flex gap-3">
        {list.length > 1 && (
          <div className="flex flex-col items-center gap-2 w-20 shrink-0">
            <button
              onClick={() => scrollStrip(-1)}
              className="text-foreground/40 hover:text-brand-dark py-1"
              aria-label="Scroll up"
            >
              ▲
            </button>
            <div
              ref={stripRef}
              className="flex flex-col justify-center items-center gap-2 overflow-y-auto no-scrollbar max-h-[520px] min-h-[300px]"
            >
              {list.map((img, i) => (
                <button
                  key={img.url + i}
                  onClick={() => setActive(i)}
                  className={`relative w-full shrink-0 overflow-hidden border-2 transition-all ${
                    i === active
                      ? "h-28 border-brand-dark"
                      : "h-24 border-transparent hover:border-brand-light"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
            <button
              onClick={() => scrollStrip(1)}
              className="text-foreground/40 hover:text-brand-dark py-1"
              aria-label="Scroll down"
            >
              ▼
            </button>
          </div>
        )}

        <div className="relative flex-1 aspect-[3/4] bg-white overflow-hidden">
          <Image src={list[active].url} alt={title} fill className="object-cover" priority />
          <button
            onClick={() => setLightbox(true)}
            aria-label="Zoom image"
            className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-foreground/70 hover:text-brand-dark"
          >
            <ZoomIcon />
          </button>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            aria-label="Close"
            className="absolute top-5 right-5 text-white text-3xl leading-none"
          >
            ✕
          </button>
          <div className="relative w-full max-w-2xl aspect-[3/4]">
            <Image src={list[active].url} alt={title} fill className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}

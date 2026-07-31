"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";

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
  focusUrl,
}: {
  images: { url: string }[];
  title: string;
  focusUrl?: string | null;
}) {
  const { t } = useLanguage();
  const baseList = images.length ? images : [{ url: "/brand/logo.webp" }];
  // Insert after the first photo (not at the very front) so the linked image always has a
  // real neighbor to peek on both sides instead of landing with nothing before it.
  const list =
    focusUrl && !baseList.some((i) => i.url === focusUrl)
      ? [baseList[0], { url: focusUrl }, ...baseList.slice(1)]
      : baseList;

  const [active, setActive] = useState(() => (list.length > 1 ? 1 : 0));
  const [lightbox, setLightbox] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusUrl || list.length <= 1) return;
    const container = mobileRef.current;
    const slide = container?.children[1] as HTMLElement | undefined;
    if (container && slide) {
      container.scrollTo({
        left: slide.offsetLeft - (container.clientWidth - slide.clientWidth) / 2,
        behavior: "auto",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only position the peek carousel once on mount, no animation
  }, []);

  useEffect(() => {
    if (!focusUrl) return;
    const idx = list.findIndex((i) => i.url === focusUrl);
    if (idx === -1) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing gallery to an external color selection
    setActive(idx);
    const container = mobileRef.current;
    const slide = container?.children[idx] as HTMLElement | undefined;
    if (container && slide) {
      container.scrollTo({
        left: slide.offsetLeft - (container.clientWidth - slide.clientWidth) / 2,
        behavior: "auto",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- list is derived from focusUrl+images each render, only re-run when the focus target itself changes
  }, [focusUrl]);

  function goToMobileSlide(i: number) {
    setActive(i);
    const container = mobileRef.current;
    const slide = container?.children[i] as HTMLElement | undefined;
    if (container && slide) {
      container.scrollTo({
        left: slide.offsetLeft - (container.clientWidth - slide.clientWidth) / 2,
        behavior: "auto",
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

  const peekPadding = list.length > 1 ? "px-[7%] md:px-[18%]" : "px-4 md:px-[18%]";

  return (
    <>
      {/* Centered main image with side peeks of neighboring photos (3+ images) */}
      <div className="-mx-4 md:mx-0">
        <div className="relative">
          <div
            ref={mobileRef}
            onScroll={handleMobileScroll}
            className={`flex gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory ${peekPadding}`}
          >
            {list.map((img, i) => (
              <div
                key={img.url + i}
                className="relative shrink-0 w-[86%] md:w-full aspect-[3/4] snap-center overflow-hidden bg-white transition-opacity duration-300"
              >
                <Image
                  src={img.url}
                  alt={title}
                  fill
                  className="object-cover"
                  priority={i === 0 || i === 1}
                  sizes="(max-width: 768px) 86vw, 32vw"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setLightbox(true)}
            aria-label={t("gallery.zoomImage")}
            className="absolute bottom-4 right-[9%] md:right-[20%] w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-foreground/70 transition-transform active:scale-90"
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
                aria-label={`${t("gallery.goToImage")} ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === active ? "w-2.5 h-2.5 bg-brand-dark" : "w-1.5 h-1.5 bg-brand-light"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            aria-label={t("gallery.close")}
            className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-black/60 text-white text-xl leading-none flex items-center justify-center transition-transform hover:rotate-90 duration-300"
          >
            ✕
          </button>
          <div className="relative w-full h-full md:h-auto md:max-w-2xl md:aspect-[3/4]">
            <Image
              src={list[active].url}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}

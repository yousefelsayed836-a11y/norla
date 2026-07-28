"use client";

import Image from "next/image";
import { useState } from "react";

export default function MadeByUsSection({ images }: { images: { id: string; url: string }[] }) {
  const [openUrl, setOpenUrl] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-8 text-center font-jost">
      <h2 className="text-[31px] font-medium text-black mb-8">Made By Us, Styled By You</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
              sizes="(max-width: 768px) 50vw, 25vw"
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

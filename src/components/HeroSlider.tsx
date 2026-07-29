"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

export default function HeroSlider({ images }: { images: { id: string; url: string }[] }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const list = images.length ? images : [{ id: "fallback", url: "/brand/hero.webp" }];

  useEffect(() => {
    if (list.length <= 1) return;
    const timer = setInterval(() => {
      setActive((i) => {
        let next = Math.floor(Math.random() * list.length);
        while (next === i) next = Math.floor(Math.random() * list.length);
        return next;
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [list.length]);

  return (
    <section className="relative h-[80vh] md:h-screen w-full overflow-hidden">
      <Image
        key={list[active].id}
        src={list[active].url}
        alt="Norla Designs"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top md:object-[center_28%] animate-fade-in"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/10" />
      <div className="absolute inset-x-0 bottom-10 flex justify-center">
        <Link
          href="/products"
          className="border border-white/80 text-white bg-white/10 backdrop-blur-sm px-10 py-3.5 rounded-full font-medium tracking-wide hover:bg-white/25 transition-all hover:scale-105 active:scale-95"
        >
          {t("hero.shopNow")}
        </Link>
      </div>
      {list.length > 1 && (
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5">
          {list.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              aria-label={`${t("gallery.goToImage")} ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

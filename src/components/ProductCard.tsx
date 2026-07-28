"use client";

import Image from "next/image";
import Link from "next/link";
import { formatEGP } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export type ProductCardData = {
  slug: string;
  title: string;
  price: number;
  regularPrice?: number | null;
  images: { url: string }[];
  category?: { name: string } | null;
  stockStatus?: string;
  variants?: { stockStatus: string }[];
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { t } = useLanguage();
  const primary = product.images[0]?.url || "/brand/logo.webp";
  const secondary = product.images[1]?.url;
  const onSale = product.regularPrice && product.regularPrice > product.price;
  const outOfStock = product.variants?.length
    ? product.variants.every((v) => v.stockStatus === "outofstock")
    : product.stockStatus === "outofstock";

  return (
    <Link href={`/products/${product.slug}`} className="group block font-jost">
      <div className="relative aspect-[2/3] overflow-hidden bg-brand-light">
        <Image
          src={primary}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 md:group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {secondary && (
          <Image
            src={secondary}
            alt=""
            fill
            className="object-cover opacity-0 transition-opacity duration-300 md:group-hover:opacity-100 group-active:opacity-100"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
        {onSale && !outOfStock && (
          <span className="absolute top-3 left-3 bg-brand-dark text-white text-xs px-2 py-1 rounded-full z-10">
            {t("product.sale")}
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-3 left-3 bg-black/80 text-white text-[10px] uppercase tracking-[0.1em] px-2 py-1 rounded-full z-10">
            {t("product.outOfStock")}
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 bg-brand text-white text-xs uppercase tracking-[0.15em] text-center py-3 translate-y-full transition-transform duration-300 md:group-hover:translate-y-0 group-active:translate-y-0">
          {t("product.quickView")}
        </span>
      </div>
      <div className="mt-3 text-center">
        <h3 className="text-[16px] font-medium uppercase tracking-[0.2em] text-black">
          {product.title}
        </h3>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-[15px] font-medium text-brand-dark">
            {formatEGP(product.price)}
          </span>
          {onSale && (
            <span className="text-sm text-foreground/40 line-through">
              {formatEGP(product.regularPrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

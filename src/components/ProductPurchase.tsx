"use client";

import { useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import Accordion from "@/components/Accordion";
import ExchangePolicyContent from "@/components/ExchangePolicyContent";
import { useLanguage } from "@/lib/i18n";

type Variant = {
  id: string;
  color: string | null;
  colorHex: string | null;
  size: string | null;
  imageUrl: string | null;
  price: number | null;
  stockStatus: string;
};

export default function ProductPurchase({
  productId,
  title,
  titleAr,
  categoryName,
  categoryNameAr,
  basePrice,
  images,
  variants,
  shortDescription,
  shortDescriptionAr,
  description,
  descriptionAr,
  careInstructions,
  careInstructionsAr,
}: {
  productId: string;
  title: string;
  titleAr?: string | null;
  categoryName?: string | null;
  categoryNameAr?: string | null;
  basePrice: number;
  images: { url: string }[];
  variants: Variant[];
  shortDescription: string;
  shortDescriptionAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  careInstructions: string;
  careInstructionsAr?: string | null;
}) {
  const [focusUrl, setFocusUrl] = useState<string | null>(null);
  const { t, pick } = useLanguage();
  const displayTitle = pick(title, titleAr);
  const displayShortDescription = pick(shortDescription, shortDescriptionAr);
  const displayDescription = pick(description, descriptionAr);
  const displayCareInstructions = pick(careInstructions, careInstructionsAr);

  return (
    <div className="grid md:grid-cols-2 gap-6 animate-rise-in">
      <ProductGallery images={images} title={displayTitle} focusUrl={focusUrl} />

      <div>
        {categoryName && (
          <p className="text-xs uppercase tracking-wide text-foreground/50 mb-2 text-center">
            {pick(categoryName, categoryNameAr)}
          </p>
        )}
        <h1 className="font-jost text-3xl md:text-4xl mb-4 text-black text-center">{displayTitle}</h1>

        <AddToCartPanel
          productId={productId}
          title={displayTitle}
          basePrice={basePrice}
          image={images[0]?.url}
          variants={variants}
          onColorImage={setFocusUrl}
        />

        {(displayShortDescription || displayDescription) && (
          <div className="mt-8 pt-8 border-t border-brand-light text-foreground/80 whitespace-pre-line text-sm">
            {displayShortDescription}
            {displayDescription && displayDescription !== displayShortDescription && (
              <p className="mt-3">{displayDescription}</p>
            )}
          </div>
        )}

        <div className="mt-2">
          {displayCareInstructions && (
            <Accordion title={t("product.washingInstructions")}>{displayCareInstructions}</Accordion>
          )}
          <Accordion title={t("product.exchangePolicy")}>
            <ExchangePolicyContent />
          </Accordion>
        </div>
      </div>
    </div>
  );
}

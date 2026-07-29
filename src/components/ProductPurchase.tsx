"use client";

import { useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import StarRating from "@/components/StarRating";
import Accordion from "@/components/Accordion";
import ReviewsSection from "@/components/ReviewsSection";
import { useLanguage } from "@/lib/i18n";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

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
  rating,
  reviewCount,
  basePrice,
  images,
  variants,
  shortDescription,
  description,
  careInstructions,
  returnPolicyText,
  reviews,
}: {
  productId: string;
  title: string;
  titleAr?: string | null;
  categoryName?: string | null;
  rating: number;
  reviewCount: number;
  basePrice: number;
  images: { url: string }[];
  variants: Variant[];
  shortDescription: string;
  description: string;
  careInstructions: string;
  returnPolicyText: string;
  reviews: Review[];
}) {
  const [focusUrl, setFocusUrl] = useState<string | null>(null);
  const { t, pick } = useLanguage();
  const displayTitle = pick(title, titleAr);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <ProductGallery images={images} title={displayTitle} focusUrl={focusUrl} />

      <div>
        {categoryName && (
          <p className="text-xs uppercase tracking-wide text-foreground/50 mb-2 text-center">
            {categoryName}
          </p>
        )}
        <h1 className="font-jost text-3xl md:text-4xl mb-2 text-black text-center">{displayTitle}</h1>
        <div className="mb-4 flex justify-center">
          <StarRating rating={rating} reviewCount={reviewCount} />
        </div>

        <AddToCartPanel
          productId={productId}
          title={displayTitle}
          basePrice={basePrice}
          image={images[0]?.url}
          variants={variants}
          onColorImage={setFocusUrl}
        />

        {(shortDescription || description) && (
          <div className="mt-8 pt-8 border-t border-brand-light text-foreground/80 whitespace-pre-line text-sm">
            {shortDescription}
            {description && description !== shortDescription && <p className="mt-3">{description}</p>}
          </div>
        )}

        <div className="mt-2">
          {careInstructions && (
            <Accordion title={t("product.washingInstructions")}>{careInstructions}</Accordion>
          )}
          {returnPolicyText && (
            <Accordion title={t("product.exchangePolicy")}>{returnPolicyText}</Accordion>
          )}
        </div>

        <ReviewsSection productId={productId} reviews={reviews} />
      </div>
    </div>
  );
}

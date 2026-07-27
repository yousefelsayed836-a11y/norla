"use client";

import { useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import StarRating from "@/components/StarRating";
import Accordion from "@/components/Accordion";

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
}: {
  productId: string;
  title: string;
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
}) {
  const [focusUrl, setFocusUrl] = useState<string | null>(null);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <ProductGallery images={images} title={title} focusUrl={focusUrl} />

      <div>
        {categoryName && (
          <p className="text-xs uppercase tracking-wide text-foreground/50 mb-2 text-center">
            {categoryName}
          </p>
        )}
        <h1 className="font-jost text-3xl md:text-4xl mb-2 text-black text-center">{title}</h1>
        <div className="mb-4 flex justify-center">
          <StarRating rating={rating} reviewCount={reviewCount} />
        </div>

        <AddToCartPanel
          productId={productId}
          title={title}
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
          {careInstructions && <Accordion title="Care Instructions">{careInstructions}</Accordion>}
          {returnPolicyText && (
            <Accordion title="Returns & Exchange">{returnPolicyText}</Accordion>
          )}
        </div>
      </div>
    </div>
  );
}

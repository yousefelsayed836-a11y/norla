import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import StarRating from "@/components/StarRating";
import Accordion from "@/components/Accordion";
import ProductCard from "@/components/ProductCard";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
    getProducts(),
  ]);
  if (!product) notFound();

  const related = allProducts
    .filter((p) => p.id !== product.id)
    .filter((p) => !product.category || p.category?.name === product.category.name)
    .slice(0, 4);
  const fallbackRelated =
    related.length > 0 ? related : allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-[7.5rem] pb-16">
      <div className="grid md:grid-cols-2 gap-6">
        <ProductGallery images={product.images} title={product.title} />

        <div>
          {product.category && (
            <p className="text-xs uppercase tracking-wide text-foreground/50 mb-2 text-center">
              {product.category.name}
            </p>
          )}
          <h1 className="font-jost text-3xl md:text-4xl mb-2 text-black text-center">
            {product.title}
          </h1>
          <div className="mb-4">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>

          <AddToCartPanel
            productId={product.id}
            title={product.title}
            basePrice={product.price}
            image={product.images[0]?.url}
            variants={product.variants.map((v) => ({
              id: v.id,
              label: v.label,
              color: v.color,
              colorHex: v.colorHex,
              price: v.price,
              stockStatus: v.stockStatus,
            }))}
          />

          {(product.shortDescription || product.description) && (
            <div className="mt-8 pt-8 border-t border-brand-light text-foreground/80 whitespace-pre-line text-sm">
              {product.shortDescription}
              {product.description && product.description !== product.shortDescription && (
                <p className="mt-3">{product.description}</p>
              )}
            </div>
          )}

          <div className="mt-2">
            {product.careInstructions && (
              <Accordion title="Care Instructions">{product.careInstructions}</Accordion>
            )}
            {settings.returnPolicyText && (
              <Accordion title="Returns & Exchange">{settings.returnPolicyText}</Accordion>
            )}
          </div>
        </div>
      </div>

      {fallbackRelated.length > 0 && (
        <section className="mt-20 pt-12 border-t border-brand-light text-center font-jost">
          <h2 className="text-[31px] font-medium text-black mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8 text-left">
            {fallbackRelated.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

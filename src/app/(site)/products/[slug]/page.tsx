import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";
import ProductPurchase from "@/components/ProductPurchase";
import ProductCard from "@/components/ProductCard";
import T from "@/components/T";

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
      <ProductPurchase
        productId={product.id}
        title={product.title}
        titleAr={product.titleAr}
        categoryName={product.category?.name}
        categoryNameAr={product.category?.nameAr}
        basePrice={product.price}
        images={product.images}
        variants={product.variants.map((v) => ({
          id: v.id,
          color: v.color,
          colorHex: v.colorHex,
          size: v.size,
          imageUrl: v.imageUrl,
          price: v.price,
          stockStatus: v.stockStatus,
        }))}
        shortDescription={product.shortDescription}
        shortDescriptionAr={product.shortDescriptionAr}
        description={product.description}
        descriptionAr={product.descriptionAr}
        careInstructions={settings.careInstructionsText}
        careInstructionsAr={settings.careInstructionsTextAr}
      />

      {fallbackRelated.length > 0 && (
        <section className="mt-20 pt-12 border-t border-brand-light text-center font-jost">
          <h2 className="text-[31px] font-medium text-black mb-8">
            <T k="home.youMayAlsoLike" />
          </h2>
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

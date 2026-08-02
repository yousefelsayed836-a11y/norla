import { getCategories, getProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import T from "@/components/T";
import Pick from "@/components/Pick";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ categorySlug: category, search }),
    category ? getCategories() : Promise.resolve([]),
  ]);
  const heading = categories.find((c) => c.slug === category);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-[7.5rem] md:pt-[8.25rem] pb-10">
      <h1 className="font-jost text-4xl mb-8 text-center">
        {heading ? <Pick en={heading.name} ar={heading.nameAr} /> : <T k="products.title" />}
      </h1>

      {products.length === 0 ? (
        <p className="text-foreground/60">
          <T k="products.none" />
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

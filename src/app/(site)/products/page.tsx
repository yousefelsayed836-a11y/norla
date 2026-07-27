import { getProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const products = await getProducts({ categorySlug: category, search });

  return (
    <div className="mx-auto max-w-6xl px-4 pt-[7.5rem] pb-10">
      <h1 className="font-jost text-4xl mb-8 text-center">Products</h1>

      {products.length === 0 ? (
        <p className="text-foreground/60">No products found in this category yet.</p>
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

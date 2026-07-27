import Link from "next/link";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";

export default function HomeSectionRow({
  title,
  slug,
  products,
}: {
  title: string;
  slug: string;
  products: ProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="pt-6 text-center font-jost">
      <h2 className="text-[31px] font-medium text-black">{title}</h2>
      <Link
        href={`/collections/${slug}`}
        className="inline-block mt-3 border border-brand text-black text-xs uppercase tracking-[0.2em] px-3.5 py-2 rounded-full hover:bg-brand-light/50 transition-colors"
      >
        View all
      </Link>

      <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory mt-10 -mx-4 px-4 text-left">
        {products.map((p) => (
          <div key={p.slug} className="shrink-0 w-[46%] sm:w-[30%] md:w-[23%] snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

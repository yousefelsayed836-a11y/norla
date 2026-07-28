import { notFound } from "next/navigation";
import { getHomeSectionBySlug } from "@/lib/home-sections";
import ProductCard from "@/components/ProductCard";
import T from "@/components/T";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = await getHomeSectionBySlug(slug);
  if (!section) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 pt-[7.5rem] pb-16">
      <h1 className="font-display text-4xl mb-8 text-center">{section.title}</h1>

      {section.products.length === 0 ? (
        <p className="text-foreground/60 text-center">
          <T k="collections.none" />
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8">
          {section.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { getCategories, getProducts } from "@/lib/products";
import { getHomeSections } from "@/lib/home-sections";
import HomeSectionRow from "@/components/HomeSectionRow";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [categories, products, sections, testimonials] = await Promise.all([
    getCategories(),
    getProducts(),
    getHomeSections(),
    prisma.testimonial.findMany({ orderBy: { position: "asc" } }),
  ]);

  return (
    <div>
      <section className="relative h-[80vh] md:h-screen w-full overflow-hidden">
        <Image
          src="/brand/hero.webp"
          alt="Norla Designs"
          fill
          priority
          className="object-cover object-top md:object-[center_15%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/10" />
        <div className="absolute inset-x-0 bottom-10 flex justify-center">
          <Link
            href="/products"
            className="border border-white/80 text-white bg-white/10 backdrop-blur-sm px-10 py-3.5 rounded-full font-medium tracking-wide hover:bg-white/25 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {sections.map((s) => (
          <HomeSectionRow key={s.id} title={s.title} slug={s.slug} products={s.products} />
        ))}
      </div>

      <section className="mx-auto max-w-6xl px-4 pt-16 pb-24 font-jost">
        <h2 className="text-[31px] font-medium text-black text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map((c) => {
            const rep = products.find((p) => p.category?.name === c.name);
            const image = c.imageUrl || rep?.images?.[0]?.url;
            return (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="group relative aspect-square overflow-hidden bg-brand-light"
              >
                {image && (
                  <Image
                    src={image}
                    alt={c.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                  <span className="text-white text-sm font-medium uppercase tracking-[0.2em]">
                    {c.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <TestimonialsCarousel testimonials={testimonials} />
    </div>
  );
}

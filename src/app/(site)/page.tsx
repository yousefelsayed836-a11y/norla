import Link from "next/link";
import Image from "next/image";
import { getCategories, getProducts } from "@/lib/products";
import { getHomeSections } from "@/lib/home-sections";
import HomeSectionRow from "@/components/HomeSectionRow";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import HeroSlider from "@/components/HeroSlider";
import MadeByUsSection from "@/components/MadeByUsSection";
import WriteReviewForm from "@/components/WriteReviewForm";
import T from "@/components/T";
import Pick from "@/components/Pick";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [categories, products, sections, testimonials, heroImages, galleryImages, reviews] =
    await Promise.all([
      getCategories(),
      getProducts(),
      getHomeSections(),
      prisma.testimonial.findMany({ orderBy: { position: "asc" } }),
      prisma.heroImage.findMany({ orderBy: { position: "asc" } }),
      prisma.galleryImage.findMany({ orderBy: { position: "asc" } }),
      prisma.review.findMany({
        where: { approved: true },
        include: { product: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
    ]);

  return (
    <div>
      <HeroSlider images={heroImages} />

      <div className="mx-auto max-w-6xl px-4">
        {sections.map((s) => (
          <HomeSectionRow
            key={s.id}
            title={s.title}
            titleAr={s.titleAr}
            slug={s.slug}
            products={s.products}
          />
        ))}
      </div>

      <section className="mx-auto max-w-6xl px-4 pt-16 pb-8 font-jost">
        <h2 className="text-[31px] font-medium text-black text-center mb-8">
          <T k="home.shopByCategory" />
        </h2>
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
                    className="object-cover transition-transform duration-500 md:group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                  <span className="text-white text-sm font-medium uppercase tracking-[0.2em]">
                    <Pick en={c.name} ar={c.nameAr} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <MadeByUsSection images={galleryImages} />

      <TestimonialsCarousel
        testimonials={[
          ...testimonials.map((t) => ({
            id: t.id,
            customerName: t.customerName,
            quote: t.quote,
            quoteAr: t.quoteAr,
            rating: t.rating,
          })),
          ...reviews.map((r) => ({
            id: r.id,
            customerName: r.authorName,
            quote: r.comment,
            rating: r.rating,
          })),
        ]}
      />

      <WriteReviewForm products={products.map((p) => ({ id: p.id, title: p.title }))} />
    </div>
  );
}

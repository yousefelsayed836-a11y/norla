import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SectionForm from "@/components/SectionForm";

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [products, section] = await Promise.all([
    prisma.product.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    prisma.homeSection.findUnique({
      where: { id },
      include: { products: { orderBy: { position: "asc" } } },
    }),
  ]);
  if (!section) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Edit Section</h1>
      <SectionForm
        allProducts={products}
        initial={{
          id: section.id,
          title: section.title,
          titleAr: section.titleAr ?? "",
          slug: section.slug,
          position: section.position,
          productIds: section.products.map((p) => p.productId),
        }}
      />
    </div>
  );
}

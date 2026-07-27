import { prisma } from "@/lib/prisma";
import SectionForm from "@/components/SectionForm";

export default async function NewSectionPage() {
  const products = await prisma.product.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Add Homepage Section</h1>
      <SectionForm allProducts={products} />
    </div>
  );
}

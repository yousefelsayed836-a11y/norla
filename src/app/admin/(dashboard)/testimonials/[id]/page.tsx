import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TestimonialForm from "@/components/TestimonialForm";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Edit Testimonial</h1>
      <TestimonialForm initial={{ ...testimonial, quoteAr: testimonial.quoteAr ?? "" }} />
    </div>
  );
}

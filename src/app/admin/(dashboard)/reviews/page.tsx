import { prisma } from "@/lib/prisma";
import ReviewsTable from "@/components/ReviewsTable";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { product: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Reviews</h1>
      <ReviewsTable
        reviews={reviews.map((r) => ({
          id: r.id,
          authorName: r.authorName,
          rating: r.rating,
          comment: r.comment,
          approved: r.approved,
          createdAt: r.createdAt.toISOString(),
          product: r.product,
        }))}
      />
    </div>
  );
}

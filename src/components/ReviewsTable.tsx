"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type ReviewRow = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
  product: { title: string };
};

export default function ReviewsTable({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setApproved(id: string, approved: boolean) {
    setBusyId(id);
    await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    setBusyId(id);
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-foreground/40 border-b border-brand-light/60">
            <th className="p-4 font-medium">Product</th>
            <th className="p-4 font-medium">Author</th>
            <th className="p-4 font-medium">Rating</th>
            <th className="p-4 font-medium">Comment</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id} className="border-b border-brand-light/40 last:border-0 align-top">
              <td className="p-4">{r.product.title}</td>
              <td className="p-4">{r.authorName}</td>
              <td className="p-4 text-brand-dark">{"★".repeat(r.rating)}</td>
              <td className="p-4 max-w-xs">{r.comment}</td>
              <td className="p-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    r.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {r.approved ? "Approved" : "Pending"}
                </span>
              </td>
              <td className="p-4 text-right whitespace-nowrap">
                {r.approved ? (
                  <button
                    disabled={busyId === r.id}
                    onClick={() => setApproved(r.id, false)}
                    className="text-foreground/50 font-medium mr-3 disabled:opacity-50"
                  >
                    Unapprove
                  </button>
                ) : (
                  <button
                    disabled={busyId === r.id}
                    onClick={() => setApproved(r.id, true)}
                    className="text-brand-dark font-medium mr-3 disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}
                <button
                  disabled={busyId === r.id}
                  onClick={() => remove(r.id)}
                  className="text-red-500 font-medium disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {reviews.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-foreground/40">
                No reviews yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

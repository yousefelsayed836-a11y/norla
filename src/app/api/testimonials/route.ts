import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { customerName, quote, quoteAr, rating, position } = await req.json();
  const maxPos = await prisma.testimonial.aggregate({ _max: { position: true } });
  const testimonial = await prisma.testimonial.create({
    data: {
      customerName,
      quote,
      quoteAr: quoteAr || null,
      rating: rating ?? 5,
      position: position ?? (maxPos._max.position ?? -1) + 1,
    },
  });
  revalidateStorefront();
  return NextResponse.json({ testimonial });
}

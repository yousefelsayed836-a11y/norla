import { prisma } from "@/lib/prisma";

export async function uniqueProductSlug(base: string) {
  let slug = base;
  let n = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${n}`;
    n++;
  }
  return slug;
}

export async function uniqueSectionSlug(base: string) {
  let slug = base;
  let n = 2;
  while (await prisma.homeSection.findUnique({ where: { slug } })) {
    slug = `${base}-${n}`;
    n++;
  }
  return slug;
}

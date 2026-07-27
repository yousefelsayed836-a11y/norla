import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  return prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
}

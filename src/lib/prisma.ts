import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const configuredPoolMax = Number.parseInt(process.env.DB_POOL_MAX ?? "", 10);
const poolMax = Number.isInteger(configuredPoolMax) && configuredPoolMax > 0 ? configuredPoolMax : 5;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: poolMax,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 10_000,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


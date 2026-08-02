import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { EGYPT_GOVERNORATES } from "./egypt-locations";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SeedVariant = {
  label: string;
  color: string | null;
  size: string | null;
  price: string | null;
  regular_price: string | null;
  stock_status: string;
  image: string | null;
};

type SeedProduct = {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string | null;
  sku: string | null;
  stock_status: string;
  stock_qty: string | null;
  category: string;
  images: string[];
  variants: SeedVariant[];
};

type SeedData = {
  categories: string[];
  products: SeedProduct[];
};

const CARE_INSTRUCTIONS = `Machine wash cold (30°C / 86°F) on a gentle cycle.

- Wash with similar colors.
- Turn garment inside out before washing.
- Do not use fabric softener.
- Hand wash recommended, or professional dry clean.
- For satin or galaxy fabrics, use a low-temperature steam iron to prevent scorching or burning.
- Don't bleach`;

const RETURN_POLICY = `We offer both exchanges and refunds within 14 days of receiving your order. To be eligible, please notify us within 48 hours of delivery and ensure the item is returned in its original condition.

- Please check your item upon delivery while the courier is still present.
- If the item isn't what you expected, you may return it directly to the courier, and only the shipping fee will apply.
- If you receive a wrong, defective, or damaged item, you can return it immediately to the courier at no extra cost — we'll cover the shipping fees.`;

const COLOR_HEX: Record<string, string> = {
  white: "#ffffff",
  "off white": "#f5f1e8",
  black: "#111111",
  brown: "#6b4226",
  maroon: "#7a1f2b",
  beige: "#d9c7a3",
  "navy blue": "#1f2a44",
  olive: "#6b7a3a",
  "baby blue": "#aedceb",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const raw = fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf-8");
  const data: SeedData = JSON.parse(raw);

  const categoryMap = new Map<string, string>();
  for (let i = 0; i < data.categories.length; i++) {
    const name = data.categories[i];
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name), position: i },
    });
    categoryMap.set(name, cat.id);
  }

  const extraCategories = ["Abayas", "ON SALE"];
  for (let i = 0; i < extraCategories.length; i++) {
    const name = extraCategories[i];
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name), position: data.categories.length + i },
    });
  }

  for (const p of data.products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        description: p.description,
        shortDescription: p.short_description,
        price: p.price,
        regularPrice: p.regular_price,
        sku: p.sku,
        stockStatus: p.stock_status,
        stockQty: p.stock_qty ? parseInt(p.stock_qty) : null,
        categoryId: categoryMap.get(p.category),
      },
      create: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        shortDescription: p.short_description,
        price: p.price,
        regularPrice: p.regular_price,
        sku: p.sku,
        stockStatus: p.stock_status,
        stockQty: p.stock_qty ? parseInt(p.stock_qty) : null,
        categoryId: categoryMap.get(p.category),
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({
        data: { productId: product.id, url: p.images[i], position: i },
      });
    }

    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    for (const v of p.variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          label: v.label,
          color: v.color,
          colorHex: v.color ? COLOR_HEX[v.color.toLowerCase()] : null,
          size: v.size,
          price: v.price,
          regularPrice: v.regular_price,
          stockStatus: v.stock_status,
        },
      });
    }
  }

  await prisma.product.updateMany({
    where: { careInstructions: "" },
    data: { careInstructions: CARE_INSTRUCTIONS },
  });

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      announcementText: "Enjoy FREE shipping on all orders",
      returnPolicyText: RETURN_POLICY,
      careInstructionsText: CARE_INSTRUCTIONS,
    },
  });

  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          customerName: "Mona A.",
          quote: "The fabric quality is amazing and the fit was perfect. Definitely ordering again!",
          rating: 5,
          position: 0,
        },
        {
          customerName: "Yasmin K.",
          quote: "Fast delivery and the dress looked even better in person. Loved it!",
          rating: 5,
          position: 1,
        },
      ],
    });
  }

  const allProducts = await prisma.product.findMany({ select: { id: true } });
  const existingSection = await prisma.homeSection.findUnique({ where: { slug: "new-drops" } });
  if (!existingSection) {
    await prisma.homeSection.create({
      data: {
        title: "New Drops",
        slug: "new-drops",
        position: 0,
        products: {
          create: allProducts.map((p, i) => ({ productId: p.id, position: i })),
        },
      },
    });
  }

  const zoneCount = await prisma.shippingZone.count();
  if (zoneCount === 0) {
    for (let i = 0; i < EGYPT_GOVERNORATES.length; i++) {
      const g = EGYPT_GOVERNORATES[i];
      await prisma.shippingZone.create({
        data: {
          governorate: g.name,
          governorateAr: g.nameAr,
          fee: 0,
          active: true,
          position: i,
          cities: { create: g.cities.map((c) => ({ name: c.name, nameAr: c.nameAr })) },
        },
      });
    }
    console.log(`Seeded ${EGYPT_GOVERNORATES.length} shipping zones (Egypt governorates).`);
  }

  const heroCount = await prisma.heroImage.count();
  if (heroCount === 0) {
    await prisma.heroImage.create({ data: { url: "/brand/hero.webp", position: 0 } });
  }

  const navCount = await prisma.navLink.count();
  if (navCount === 0) {
    await prisma.navLink.create({ data: { label: "All Products", href: "/products", position: 0 } });
    const cats = await prisma.category.findMany({ orderBy: { position: "asc" } });
    for (let i = 0; i < cats.length; i++) {
      await prisma.navLink.create({
        data: { label: cats[i].name, href: `/products?category=${cats[i].slug}`, position: i + 1 },
      });
    }
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@norla-designs.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash, name: "Admin", role: "ADMIN" },
  });

  console.log(`Seeded ${data.products.length} products, ${data.categories.length} categories.`);
  console.log(`Admin login -> email: ${adminEmail} / password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Standalone script: seed ProductView rows for every existing product.
 * Run with: npx tsx prisma/seed-views.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Map product slug → the image file already used as its main product image
const IMAGE_MAP: Record<string, string> = {
  "custom-paper-cup-8oz":         "/images/1.jpeg",
  "double-wall-cup-12oz":         "/images/2.png",
  "smoothie-cup-16oz":            "/images/3.webp",
  "mailer-box-small":             "/images/4.jpg",
  "rigid-gift-box-medium":        "/images/5.webp",
  "pizza-box-12":                 "/images/6.jpg",
  "kraft-paper-bag-medium":       "/images/7.jpg",
  "non-woven-tote-branded":       "/images/8.jpg",
  "pet-bottle-500ml":             "/images/9.jpg",
  "glass-spray-bottle-200ml":     "/images/10.jpg",
  "custom-vinyl-sticker-100":     "/images/11.jpg",
  "product-label-a4-24":         "/images/12.webp",
  "biodegradable-meal-box-750ml": "/images/13.webp",
  "sauce-cup-60ml-50pk":          "/images/14.jpg",
  "premium-embossed-box-large":   "/images/15.jpg",
};

// Products that support all 6 views (i.e. allowCustomPrint: true)
const FULL_VIEW_SLUGS = new Set([
  "custom-paper-cup-8oz",
  "double-wall-cup-12oz",
  "smoothie-cup-16oz",
  "mailer-box-small",
  "rigid-gift-box-medium",
  "pizza-box-12",
  "kraft-paper-bag-medium",
  "non-woven-tote-branded",
  "pet-bottle-500ml",
  "glass-spray-bottle-200ml",
  "custom-vinyl-sticker-100",
  "biodegradable-meal-box-750ml",
  "premium-embossed-box-large",
]);

const ALL_VIEWS = [
  { viewKey: "front",  name: "Front",  sortOrder: 0, isDefault: true  },
  { viewKey: "back",   name: "Back",   sortOrder: 1, isDefault: false },
  { viewKey: "left",   name: "Left",   sortOrder: 2, isDefault: false },
  { viewKey: "right",  name: "Right",  sortOrder: 3, isDefault: false },
  { viewKey: "top",    name: "Top",    sortOrder: 4, isDefault: false },
  { viewKey: "bottom", name: "Bottom", sortOrder: 5, isDefault: false },
];

async function main() {
  console.log("🌱 Seeding product views...\n");

  // Clear existing views first
  const deleted = await prisma.productView.deleteMany({});
  console.log(`  🗑️  Cleared ${deleted.count} existing product views`);

  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  console.log(`  📦 Found ${products.length} products\n`);

  let total = 0;
  for (const product of products) {
    const imageUrl = IMAGE_MAP[product.slug] ?? "/images/1.jpeg";
    const views = FULL_VIEW_SLUGS.has(product.slug) ? ALL_VIEWS : ALL_VIEWS.slice(0, 2);

    for (const view of views) {
      await prisma.productView.create({
        data: {
          productId:    product.id,
          viewKey:      view.viewKey,
          name:         view.name,
          baseImageUrl: imageUrl,
          sortOrder:    view.sortOrder,
          isDefault:    view.isDefault,
        },
      });
      total++;
    }

    console.log(`  ✅ ${product.slug} → ${views.length} views (${views.map(v => v.viewKey).join(", ")})`);
  }

  console.log(`\n🎉 Done! ${total} product views created.`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

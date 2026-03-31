import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding PAC-8 database...\n");

  // ─── 1. Permissions ──────────────────────────────────
  const permissionDefs = [
    { resource: "users", action: "create", description: "Create users" },
    { resource: "users", action: "read", description: "View users" },
    { resource: "users", action: "update", description: "Update users" },
    { resource: "users", action: "delete", description: "Delete users" },
    { resource: "roles", action: "create", description: "Create roles" },
    { resource: "roles", action: "read", description: "View roles" },
    { resource: "roles", action: "update", description: "Update roles" },
    { resource: "roles", action: "delete", description: "Delete roles" },
    { resource: "permissions", action: "create", description: "Create permissions" },
    { resource: "permissions", action: "read", description: "View permissions" },
    { resource: "permissions", action: "update", description: "Update permissions" },
    { resource: "permissions", action: "delete", description: "Delete permissions" },
    { resource: "products", action: "create", description: "Create products" },
    { resource: "products", action: "read", description: "View products" },
    { resource: "products", action: "update", description: "Update products" },
    { resource: "products", action: "delete", description: "Delete products" },
    { resource: "orders", action: "create", description: "Create orders" },
    { resource: "orders", action: "read", description: "View orders" },
    { resource: "orders", action: "update", description: "Update orders" },
    { resource: "orders", action: "delete", description: "Delete orders" },
    { resource: "categories", action: "create", description: "Create categories" },
    { resource: "categories", action: "read", description: "View categories" },
    { resource: "categories", action: "update", description: "Update categories" },
    { resource: "categories", action: "delete", description: "Delete categories" },
  ];

  const permissions = [];
  for (const def of permissionDefs) {
    const permission = await prisma.permission.upsert({
      where: { resource_action: { resource: def.resource, action: def.action } },
      update: {},
      create: def,
    });
    permissions.push(permission);
  }
  console.log(`  ✅ ${permissions.length} permissions created`);

  // ─── 2. Roles ────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin", description: "Full system administrator" },
  });

  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }
  console.log("  ✅ Admin role created with all permissions");

  const viewerRole = await prisma.role.upsert({
    where: { name: "viewer" },
    update: {},
    create: { name: "viewer", description: "Read-only access" },
  });

  const readPerms = permissions.filter((p) => p.action === "read");
  for (const perm of readPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: viewerRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: viewerRole.id, permissionId: perm.id },
    });
  }
  console.log("  ✅ Viewer role created with read permissions");

  const customerRole = await prisma.role.upsert({
    where: { name: "Customer" },
    update: {},
    create: { name: "Customer", description: "Default customer role" },
  });
  console.log("  ✅ Customer role created");

  // ─── 3. Users ────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@pac8.dev" },
    update: { phone: "+2348000000001" },
    create: {
      email: "admin@pac8.dev",
      phone: "+2348000000001",
      password: await hash("admin123", 12),
      name: "System Admin",
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });
  console.log("  ✅ Admin user created (admin@pac8.dev / admin123)");

  const viewerUser = await prisma.user.upsert({
    where: { email: "viewer@pac8.dev" },
    update: { phone: "+2348000000002" },
    create: {
      email: "viewer@pac8.dev",
      phone: "+2348000000002",
      password: await hash("viewer123", 12),
      name: "Demo Viewer",
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: viewerUser.id, roleId: viewerRole.id } },
    update: {},
    create: { userId: viewerUser.id, roleId: viewerRole.id },
  });
  console.log("  ✅ Viewer user created (viewer@pac8.dev / viewer123)");

  const demoCustomer = await prisma.user.upsert({
    where: { email: "demo@pac8.dev" },
    update: { phone: "+2348000000003" },
    create: {
      email: "demo@pac8.dev",
      phone: "+2348000000003",
      password: await hash("demo1234", 12),
      name: "Demo Customer",
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: demoCustomer.id, roleId: customerRole.id } },
    update: {},
    create: { userId: demoCustomer.id, roleId: customerRole.id },
  });
  console.log("  ✅ Demo customer created (demo@pac8.dev / demo1234)");

  // ─── 4. Categories ───────────────────────────────────
  const categoryDefs = [
    { name: "Cups", slug: "cups", description: "Paper and plastic cups — perfect for drinks, ice cream, and branded giveaways", sortOrder: 1, image: "/images/categories/cups.jpg" },
    { name: "Boxes", slug: "boxes", description: "Custom rigid and folding boxes for products, gifts, and food packaging", sortOrder: 2, image: "/images/categories/boxes.jpg" },
    { name: "Bags", slug: "bags", description: "Paper bags, poly bags, and tote bags with your brand", sortOrder: 3, image: "/images/categories/bags.jpg" },
    { name: "Bottles", slug: "bottles", description: "Branded bottles for water, juice, and cosmetics", sortOrder: 4, image: "/images/categories/bottles.jpg" },
    { name: "Labels & Stickers", slug: "labels-stickers", description: "Custom adhesive labels and stickers for any surface", sortOrder: 5, image: "/images/categories/labels.jpg" },
    { name: "Food Containers", slug: "food-containers", description: "Takeaway containers, bowls, and meal prep packaging", sortOrder: 6, image: "/images/categories/food-containers.jpg" },
  ];

  const categories = [];
  for (const cat of categoryDefs) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(created);
  }
  console.log(`  ✅ ${categories.length} categories created`);

  // ─── 5. Product Categories (legacy grouping) ────────
  const productCategoryDefs = [
    { name: "Drinkware", description: "All cups, bottles, and drink containers", sort: 1 },
    { name: "Packaging", description: "Boxes, bags, and containers", sort: 2 },
    { name: "Print & Brand", description: "Labels, stickers, and branded accessories", sort: 3 },
  ];

  const productCategories = [];
  for (const pc of productCategoryDefs) {
    const created = await prisma.productCategory.create({ data: pc });
    productCategories.push(created);
  }
  console.log(`  ✅ ${productCategories.length} product categories created`);

  // ─── 6. Products ─────────────────────────────────────
  const [cups, boxes, bags, bottles, labels, foodContainers] = categories;
  const [drinkware, packaging, printBrand] = productCategories;

  const productDefs = [
    // CUPS
    {
      name: "Custom Branded Paper Cup (8oz)",
      slug: "custom-paper-cup-8oz",
      sku: "PAC-CUP-8OZ",
      description: "Eco-friendly single wall paper cup, perfect for hot drinks. Full-color custom printing available. Minimum order 100 units.",
      shortDescription: "Eco-friendly,Full custom print,Hot drink safe,Food-grade paper",
      price: 750,
      comparePrice: 950,
      costPrice: 350,
      quantity: 5000,
      lowStockThreshold: 200,
      deliveryTime: "3-5 business days",
      weight: 0.02,
      allowCustomPrint: true,
      printPrice: 150,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: true,
      categoryId: cups.id,
      productCategoryId: drinkware.id,
    },
    {
      name: "Double Wall Insulated Cup (12oz)",
      slug: "double-wall-cup-12oz",
      sku: "PAC-CUP-12DW",
      description: "Premium double-wall insulated paper cup. Keeps drinks hotter for longer without burning hands. Great for cafés and events.",
      shortDescription: "Double insulated,No sleeve needed,Premium feel,12oz capacity",
      price: 1200,
      comparePrice: 1500,
      costPrice: 550,
      quantity: 3000,
      lowStockThreshold: 150,
      deliveryTime: "3-5 business days",
      weight: 0.03,
      allowCustomPrint: true,
      printPrice: 200,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: true,
      categoryId: cups.id,
      productCategoryId: drinkware.id,
    },
    {
      name: "Plastic Smoothie Cup with Dome Lid (16oz)",
      slug: "smoothie-cup-16oz",
      sku: "PAC-CUP-16SM",
      description: "Crystal-clear PET cup with dome lid, perfect for smoothies, bubble tea, and cold drinks. Custom logo printing available.",
      shortDescription: "Crystal clear PET,Dome lid included,Cold drink perfect,Custom logo ready",
      price: 600,
      costPrice: 280,
      quantity: 8000,
      lowStockThreshold: 300,
      deliveryTime: "2-4 business days",
      weight: 0.015,
      allowCustomPrint: true,
      printPrice: 120,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: false,
      categoryId: cups.id,
      productCategoryId: drinkware.id,
    },
    // BOXES
    {
      name: "Mailer Box (Small – 20×15×8cm)",
      slug: "mailer-box-small",
      sku: "PAC-BOX-SM",
      description: "Durable corrugated mailer box with tuck flap. Perfect for e-commerce shipping and subscription boxes. Full CMYK custom printing.",
      shortDescription: "Corrugated cardboard,E-commerce ready,Full color printing,Self-locking design",
      price: 2500,
      comparePrice: 3200,
      costPrice: 1100,
      quantity: 2000,
      lowStockThreshold: 100,
      deliveryTime: "5-7 business days",
      weight: 0.12,
      dimensions: '{"length":20,"width":15,"height":8}',
      allowCustomPrint: true,
      printPrice: 500,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: true,
      categoryId: boxes.id,
      productCategoryId: packaging.id,
    },
    {
      name: "Rigid Gift Box (Medium – 25×20×10cm)",
      slug: "rigid-gift-box-medium",
      sku: "PAC-BOX-GIFT-M",
      description: "Luxury rigid gift box with magnetic closure. Wrapped in premium art paper with spot UV and foil options. Perfect for premium branding.",
      shortDescription: "Magnetic closure,Luxury finish,Spot UV option,Foil stamping available",
      price: 5500,
      comparePrice: 6800,
      costPrice: 2800,
      quantity: 800,
      lowStockThreshold: 50,
      deliveryTime: "7-10 business days",
      weight: 0.35,
      dimensions: '{"length":25,"width":20,"height":10}',
      allowCustomPrint: true,
      printPrice: 800,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: true,
      categoryId: boxes.id,
      productCategoryId: packaging.id,
    },
    {
      name: "Pizza Box (12-inch)",
      slug: "pizza-box-12",
      sku: "PAC-BOX-PIZZA-12",
      description: "Standard white corrugated pizza box with grease-resistant coating. Custom brand printing on top panel.",
      shortDescription: "Grease resistant,Ventilation cuts,12-inch size,FDA compliant",
      price: 1800,
      costPrice: 800,
      quantity: 4000,
      lowStockThreshold: 200,
      deliveryTime: "3-5 business days",
      weight: 0.15,
      allowCustomPrint: true,
      printPrice: 350,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: false,
      categoryId: boxes.id,
      productCategoryId: packaging.id,
    },
    // BAGS
    {
      name: "Kraft Paper Bag (Medium)",
      slug: "kraft-paper-bag-medium",
      sku: "PAC-BAG-KFT-M",
      description: "Brown kraft paper bag with twisted handles. Eco-friendly and fully recyclable. One or two color print available.",
      shortDescription: "100% recyclable,Twisted rope handles,Sturdy construction,Brown kraft finish",
      price: 900,
      comparePrice: 1100,
      costPrice: 400,
      quantity: 6000,
      lowStockThreshold: 300,
      deliveryTime: "2-4 business days",
      weight: 0.04,
      allowCustomPrint: true,
      printPrice: 200,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: true,
      categoryId: bags.id,
      productCategoryId: packaging.id,
    },
    {
      name: "Non-Woven Tote Bag (Branded)",
      slug: "non-woven-tote-branded",
      sku: "PAC-BAG-TOTE-NW",
      description: "Reusable non-woven polypropylene tote bag. Lightweight yet durable. Available in 12 colors with full front print.",
      shortDescription: "Reusable & durable,12 color options,Full front print,Water resistant",
      price: 1500,
      comparePrice: 2000,
      costPrice: 650,
      quantity: 3000,
      lowStockThreshold: 150,
      deliveryTime: "5-7 business days",
      weight: 0.06,
      allowCustomPrint: true,
      printPrice: 300,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: false,
      isLowBudget: true,
      categoryId: bags.id,
      productCategoryId: packaging.id,
    },
    // BOTTLES
    {
      name: "PET Water Bottle (500ml – Custom Label)",
      slug: "pet-bottle-500ml",
      sku: "PAC-BTL-PET-500",
      description: "Standard PET water bottle with custom wraparound label. BPA free, food-grade material. Perfect for events and corporate branding.",
      shortDescription: "BPA free,Food grade PET,Custom wraparound label,500ml capacity",
      price: 500,
      costPrice: 220,
      quantity: 10000,
      lowStockThreshold: 500,
      deliveryTime: "3-5 business days",
      weight: 0.025,
      allowCustomPrint: true,
      printPrice: 100,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: true,
      isLowBudget: true,
      categoryId: bottles.id,
      productCategoryId: drinkware.id,
    },
    {
      name: "Glass Spray Bottle (200ml – Frosted)",
      slug: "glass-spray-bottle-200ml",
      sku: "PAC-BTL-GLS-200",
      description: "Frosted glass spray bottle for cosmetics, perfumes, and cleaning products. Custom screen-printed or label wrapped.",
      shortDescription: "Frosted finish,Fine mist sprayer,200ml capacity,Screen print available",
      price: 3200,
      comparePrice: 4000,
      costPrice: 1500,
      quantity: 1500,
      lowStockThreshold: 80,
      deliveryTime: "7-10 business days",
      weight: 0.18,
      allowCustomPrint: true,
      printPrice: 600,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: false,
      categoryId: bottles.id,
      productCategoryId: drinkware.id,
    },
    // LABELS & STICKERS
    {
      name: "Custom Vinyl Sticker (100 roll)",
      slug: "custom-vinyl-sticker-100",
      sku: "PAC-LBL-VNL-100",
      description: "Die-cut vinyl stickers on a roll. Waterproof and UV resistant. Perfect for product branding, giveaways, and packaging seals.",
      shortDescription: "Waterproof vinyl,UV resistant,Die-cut shapes,Roll of 100",
      price: 4500,
      comparePrice: 5500,
      costPrice: 2000,
      quantity: 2000,
      lowStockThreshold: 100,
      deliveryTime: "5-7 business days",
      weight: 0.08,
      allowCustomPrint: true,
      printPrice: 0,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: true,
      categoryId: labels.id,
      productCategoryId: printBrand.id,
    },
    {
      name: "Product Label Sheet (A4 – 24 per sheet)",
      slug: "product-label-a4-24",
      sku: "PAC-LBL-A4-24",
      description: "Self-adhesive label sheets, 24 labels per A4 sheet. Laser and inkjet compatible. Great for small businesses and home labelling.",
      shortDescription: "24 per sheet,Printer compatible,Self-adhesive,Matte or gloss finish",
      price: 350,
      costPrice: 150,
      quantity: 15000,
      lowStockThreshold: 500,
      deliveryTime: "2-3 business days",
      weight: 0.01,
      allowCustomPrint: false,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: false,
      isLowBudget: true,
      categoryId: labels.id,
      productCategoryId: printBrand.id,
    },
    // FOOD CONTAINERS
    {
      name: "Biodegradable Meal Box (750ml)",
      slug: "biodegradable-meal-box-750ml",
      sku: "PAC-FDC-BIO-750",
      description: "Compostable bagasse meal box, microwave and freezer safe. Perfect for restaurants, event caterers, and food delivery businesses.",
      shortDescription: "100% compostable,Microwave safe,Freezer safe,Leak resistant",
      price: 1400,
      comparePrice: 1800,
      costPrice: 650,
      quantity: 5000,
      lowStockThreshold: 250,
      deliveryTime: "3-5 business days",
      weight: 0.03,
      allowCustomPrint: true,
      printPrice: 250,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: true,
      categoryId: foodContainers.id,
      productCategoryId: packaging.id,
    },
    {
      name: "Sauce Cup with Hinged Lid (60ml – 50 pack)",
      slug: "sauce-cup-60ml-50pk",
      sku: "PAC-FDC-SC-60",
      description: "Clear PP sauce cups with hinged lids. FDA approved, leak-proof seal. Sold in packs of 50.",
      shortDescription: "Hinged lid,Leak-proof,FDA approved,50 pack",
      price: 2200,
      costPrice: 1000,
      quantity: 3000,
      lowStockThreshold: 150,
      deliveryTime: "2-4 business days",
      weight: 0.10,
      allowCustomPrint: false,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: false,
      categoryId: foodContainers.id,
      productCategoryId: packaging.id,
    },
    // Out of stock test product
    {
      name: "Premium Embossed Box (Large)",
      slug: "premium-embossed-box-large",
      sku: "PAC-BOX-EMB-L",
      description: "Luxury embossed packaging box with velvet inlay. Currently restocking.",
      shortDescription: "Embossed finish,Velvet inlay,Premium grade,Currently restocking",
      price: 12000,
      costPrice: 6000,
      quantity: 0,
      lowStockThreshold: 10,
      deliveryTime: "10-14 business days",
      weight: 0.50,
      dimensions: '{"length":35,"width":25,"height":12}',
      allowCustomPrint: true,
      printPrice: 1500,
      status: "ACTIVE" as const,
      isActive: true,
      isFeatured: false,
      categoryId: boxes.id,
      productCategoryId: packaging.id,
    },
  ];

  for (const product of productDefs) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log(`  ✅ ${productDefs.length} products created`);

  // ─── 6b. Product Images ─────────────────────────────
  const allProducts = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  const existingImages = await prisma.productImage.findMany({ select: { productId: true } });
  const productsWithImages = new Set(existingImages.map((img) => img.productId));

  // Assign images from /public/images/product-*.jpg (1-15)
  for (let i = 0; i < allProducts.length; i++) {
    const prod = allProducts[i];
    if (productsWithImages.has(prod.id)) continue; // skip if already has images
    const imgIndex = (i % 15) + 1;
    const ext = [10, 14].includes(imgIndex) ? "png" : "jpg";
    await prisma.productImage.create({
      data: {
        productId: prod.id,
        url: `/images/product-${imgIndex}.${ext}`,
        altText: prod.name,
        sortOrder: 0,
        isMain: true,
      },
    });
  }
  console.log("  ✅ Product images assigned");

  // ─── 7. Price Tiers (bulk discounting) ───────────────
  const cupProduct = await prisma.product.findUnique({ where: { slug: "custom-paper-cup-8oz" } });
  const mailerBox = await prisma.product.findUnique({ where: { slug: "mailer-box-small" } });
  const kraftBag = await prisma.product.findUnique({ where: { slug: "kraft-paper-bag-medium" } });

  if (cupProduct) {
    const tierDefs = [
      { productId: cupProduct.id, minQuantity: 500, discountType: "PERCENTAGE", discountValue: 10 },
      { productId: cupProduct.id, minQuantity: 1000, discountType: "PERCENTAGE", discountValue: 18 },
      { productId: cupProduct.id, minQuantity: 5000, discountType: "PERCENTAGE", discountValue: 25 },
    ];
    for (const tier of tierDefs) {
      await prisma.priceTier.upsert({
        where: { productId_minQuantity: { productId: tier.productId, minQuantity: tier.minQuantity } },
        update: {},
        create: tier,
      });
    }
  }

  if (mailerBox) {
    const tierDefs = [
      { productId: mailerBox.id, minQuantity: 100, discountType: "PERCENTAGE", discountValue: 8 },
      { productId: mailerBox.id, minQuantity: 500, discountType: "PERCENTAGE", discountValue: 15 },
      { productId: mailerBox.id, minQuantity: 1000, discountType: "PERCENTAGE", discountValue: 22 },
    ];
    for (const tier of tierDefs) {
      await prisma.priceTier.upsert({
        where: { productId_minQuantity: { productId: tier.productId, minQuantity: tier.minQuantity } },
        update: {},
        create: tier,
      });
    }
  }

  if (kraftBag) {
    const tierDefs = [
      { productId: kraftBag.id, minQuantity: 200, discountType: "PERCENTAGE", discountValue: 7 },
      { productId: kraftBag.id, minQuantity: 1000, discountType: "PERCENTAGE", discountValue: 15 },
    ];
    for (const tier of tierDefs) {
      await prisma.priceTier.upsert({
        where: { productId_minQuantity: { productId: tier.productId, minQuantity: tier.minQuantity } },
        update: {},
        create: tier,
      });
    }
  }
  console.log("  ✅ Bulk price tiers created");

  // ─── 8. Hero Carousel Slides ─────────────────────────
  const now = new Date();
  const farFuture = new Date("2030-12-31");

  const carouselDefs = [
    {
      title: "Custom Packaging, Your Way",
      description: "Design and order branded cups, boxes, bags, and bottles — from a single unit to thousands.",
      imageUrl: "https://media.istockphoto.com/id/1390050937/photo/kraft-paper-utensils-on-green-background-paper-cups-and-containers-wooden-cutlery-street-food.webp?a=1&b=1&s=612x612&w=0&k=20&c=W3QdgPg5a7usPfUfjqFJqq9BuQ3NekW95I64y2-d5oo=",
      link: "/products",
      startDate: now,
      endDate: farFuture,
      isActive: true,
      type: "homepage" as const,
      sortOrder: 1,
    },
    {
      title: "Bulk Orders, Better Prices",
      description: "Order 500+ units and save up to 25%. Volume discounts automatically applied at checkout.",
      imageUrl: "https://images.unsplash.com/photo-1766040923580-16ad32fae8b4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGJ1bGslMjBvcmRlciUyQyUyMGJldHRlciUyMHByaWNlc3xlbnwwfHwwfHx8MA%3D%3D",
      link: "/products?isFeatured=true",
      startDate: now,
      endDate: farFuture,
      isActive: true,
      type: "homepage" as const,
      sortOrder: 2,
    },
    {
      title: "From Concept to Delivery",
      description: "Use our real-time design editor, preview your packaging instantly, and we handle the rest.",
      imageUrl: "https://images.unsplash.com/photo-1659353739687-6e37ee1c2ddf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fHBhY2thZ2luZyUyMGVjY29tZXJjZSUyMGFwcCUyMGhlcm8lMjBwaWN0dXJlfGVufDB8fDB8fHww",
      link: "/products",
      startDate: now,
      endDate: farFuture,
      isActive: true,
      type: "homepage" as const,
      sortOrder: 3,
    },
  ];

  // Delete old carousel data and recreate
  await prisma.carousel.deleteMany({ where: { type: "homepage" } });
  for (const slide of carouselDefs) {
    await prisma.carousel.create({ data: slide });
  }
  console.log(`  ✅ ${carouselDefs.length} carousel slides created`);

  // ─── 9. Testimonials ─────────────────────────────────
  const testimonialDefs = [
    {
      name: "Adaeze Okonkwo",
      role: "Event Planner",
      company: "Glow Events",
      content: "PAC-8 made my wedding favor packaging look absolutely stunning. The customization editor is so intuitive — I had 200 personalized boxes ready in minutes.",
      rating: 5,
      isVisible: true,
      sortOrder: 1,
    },
    {
      name: "Tunde Bakare",
      role: "Food Vendor",
      company: "Tunde's Grill House",
      content: "Our branded takeaway bags and cups have completely changed how customers perceive our brand. Quality is top-notch and delivery was faster than expected.",
      rating: 5,
      isVisible: true,
      sortOrder: 2,
    },
    {
      name: "Chioma Eze",
      role: "Startup Founder",
      company: "Bloom Skincare",
      content: "The bulk pricing made it affordable for us as a small business, and the design tool let us match our exact brand colors. Absolutely recommend PAC-8!",
      rating: 5,
      isVisible: true,
      sortOrder: 3,
    },
    {
      name: "Ibrahim Yusuf",
      role: "Restaurant Owner",
      company: "Abuja Bites",
      content: "We switched all our takeaway packaging to PAC-8 branded containers. Customers love the premium feel and our brand visibility has increased dramatically.",
      rating: 4,
      isVisible: true,
      sortOrder: 4,
    },
    {
      name: "Folake Adeyemi",
      role: "Corporate Buyer",
      company: "LuxeRetail Group",
      content: "Managing packaging for 15 retail locations used to be a nightmare. PAC-8's bulk ordering and consistent quality across orders has been a game-changer for us.",
      rating: 5,
      isVisible: true,
      sortOrder: 5,
    },
    {
      name: "Emeka Nnamdi",
      role: "Brand Designer",
      company: "Studio Muse",
      content: "As a designer, I'm picky about color accuracy. PAC-8 nailed our Pantone colors on the first batch. The online preview was spot-on with the final product.",
      rating: 5,
      isVisible: true,
      sortOrder: 6,
    },
  ];

  await prisma.testimonial.deleteMany({});
  for (const t of testimonialDefs) {
    await prisma.testimonial.create({ data: t });
  }
  console.log(`  ✅ ${testimonialDefs.length} testimonials created`);

  // ─── 10. FAQs ────────────────────────────────────────
  const faqDefs = [
    { question: "What is the minimum order quantity?", answer: "Most products can be ordered from as low as 1 unit for sampling. Custom print orders typically start at 100 units, but we offer flexible minimums for small businesses.", category: "Ordering", sortOrder: 1 },
    { question: "How long does delivery take?", answer: "Standard orders ship within 3-5 business days. Custom print orders take 5-10 business days depending on the product and design complexity. Express shipping is available at checkout.", category: "Shipping", sortOrder: 2 },
    { question: "Can I see a proof before production?", answer: "Yes! After you finalize your design in our editor, we generate a digital proof for your approval before printing. For large orders, we can also send a physical sample.", category: "Customization", sortOrder: 3 },
    { question: "What file formats do you accept for logos?", answer: "We accept PNG, SVG, PDF, and AI files. For best print quality, we recommend vector formats (SVG or AI) at 300 DPI or higher.", category: "Customization", sortOrder: 4 },
    { question: "Do you offer bulk discounts?", answer: "Absolutely! Volume discounts are automatically applied at checkout. Typical savings: 500+ units (10% off), 1000+ units (18% off), 5000+ units (25% off). Contact us for custom pricing on very large orders.", category: "Ordering", sortOrder: 5 },
    { question: "Are your packaging products eco-friendly?", answer: "Many of our products are made from recyclable, compostable, or biodegradable materials. Look for the eco badge on product pages. We're committed to sustainable packaging solutions.", category: "Products", sortOrder: 6 },
    { question: "What payment methods do you accept?", answer: "We accept card payments (Visa, Mastercard), bank transfers, and mobile money. Payments are processed securely through Stripe and Paystack.", category: "Payment", sortOrder: 7 },
    { question: "Can I return or exchange products?", answer: "Standard (non-custom) products can be returned within 14 days if unused and in original packaging. Custom printed items cannot be returned unless there is a manufacturing defect.", category: "Returns", sortOrder: 8 },
    { question: "Do you ship outside Nigeria?", answer: "Currently we ship nationwide within Nigeria. International shipping is coming soon — join our newsletter to be the first to know!", category: "Shipping", sortOrder: 9 },
    { question: "How does the design editor work?", answer: "Our online editor lets you upload your logo, choose fonts and colors, add text and QR codes, and preview your design on a realistic 3D mockup — all in your browser. No design software needed.", category: "Customization", sortOrder: 10 },
  ];

  await prisma.fAQ.deleteMany({});
  for (const faq of faqDefs) {
    await prisma.fAQ.create({ data: faq });
  }
  console.log(`  ✅ ${faqDefs.length} FAQs created`);

  // ─── 11. Promo Codes ─────────────────────────────────
  const promoDefs = [
    {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "PERCENTAGE" as const,
      discountValue: 10,
      minOrderAmount: 5000,
      maxDiscount: 10000,
      usageLimit: 500,
      perUserLimit: 1,
      isActive: true,
      expiresAt: farFuture,
    },
    {
      code: "BULK20",
      description: "₦20,000 off orders over ₦100,000",
      discountType: "FIXED_AMOUNT" as const,
      discountValue: 20000,
      minOrderAmount: 100000,
      maxDiscount: 20000,
      usageLimit: 100,
      perUserLimit: 3,
      isActive: true,
      expiresAt: farFuture,
    },
    {
      code: "PAC8LAUNCH",
      description: "15% launch discount — limited time",
      discountType: "PERCENTAGE" as const,
      discountValue: 15,
      minOrderAmount: 3000,
      maxDiscount: 15000,
      usageLimit: 200,
      perUserLimit: 1,
      isActive: true,
      expiresAt: new Date("2026-06-30"),
    },
  ];

  for (const promo of promoDefs) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: {},
      create: promo,
    });
  }
  console.log(`  ✅ ${promoDefs.length} promo codes created`);

  // ─── 12. Newsletter demo subscriber ──────────────────
  await prisma.newsletterSubscriber.upsert({
    where: { email: "demo@pac8.dev" },
    update: {},
    create: { email: "demo@pac8.dev", name: "Demo User" },
  });
  console.log("  ✅ Newsletter demo subscriber created");

  console.log("\n🎉 PAC-8 seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

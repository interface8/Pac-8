import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  ProductDto,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  AddProductImageInput,
  ProductImageDto,
} from "./types";

const productWithRelations = {
  include: {
    category: { select: { name: true } },
    productCategory: { select: { name: true } },
    images: { orderBy: { sortOrder: "asc" as const } },
    priceTiers: { where: { isActive: true }, orderBy: { minQuantity: "asc" as const } },
  },
} satisfies Prisma.ProductDefaultArgs;

type ProductWithRelations = Prisma.ProductGetPayload<typeof productWithRelations>;

function toProductDto(product: ProductWithRelations): ProductDto {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    shortDescription: product.shortDescription,
    price: product.price.toNumber(),
    comparePrice: product.comparePrice?.toNumber() ?? null,
    costPrice: product.costPrice?.toNumber() ?? null,
    quantity: product.quantity,
    trackQuantity: product.trackQuantity,
    lowStockThreshold: product.lowStockThreshold,
    deliveryTime: product.deliveryTime,
    weight: product.weight?.toNumber() ?? null,
    dimensions: product.dimensions,
    allowCustomPrint: product.allowCustomPrint,
    printPrice: product.printPrice?.toNumber() ?? null,
    status: product.status as ProductDto["status"],
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isLowBudget: product.isLowBudget,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    productCategoryId: product.productCategoryId,
    productCategoryName: product.productCategory?.name ?? null,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    metaKeywords: product.metaKeywords,
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      isMain: img.isMain,
      sortOrder: img.sortOrder,
    })),
    priceTiers: product.priceTiers.map((tier) => ({
      id: tier.id,
      minQuantity: tier.minQuantity,
      discountType: tier.discountType,
      discountValue: tier.discountValue.toNumber(),
      isActive: tier.isActive,
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function findProducts(filters: ProductFilters = {}): Promise<ProductDto[]> {
  const {
    search,
    categoryId,
    status,
    isFeatured,
    isLowBudget,
    minPrice,
    maxPrice,
    inStock,
  } = filters;

  const where: Prisma.ProductWhereInput = {
    ...(categoryId && { categoryId }),
    ...(filters.productCategoryId && { productCategoryId: filters.productCategoryId }),
    ...(status && { status }),
    ...(isFeatured !== undefined && { isFeatured }),
    ...(isLowBudget !== undefined && { isLowBudget }),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice ? { gte: minPrice } : {}),
            ...(maxPrice ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(inStock !== undefined
      ? inStock
        ? { quantity: { gt: 0 } }
        : { quantity: 0 }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { sku: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    ...productWithRelations,
  });

  return products.map(toProductDto);
}

export async function findProductById(id: string): Promise<ProductDto | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    ...productWithRelations,
  });
  return product ? toProductDto(product) : null;
}

export async function findProductBySlug(slug: string): Promise<ProductDto | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    ...productWithRelations,
  });
  return product ? toProductDto(product) : null;
}

export async function findProductBySku(sku: string): Promise<ProductDto | null> {
  const product = await prisma.product.findFirst({
    where: { sku: { equals: sku, mode: "insensitive" } },
    ...productWithRelations,
  });
  return product ? toProductDto(product) : null;
}

export async function createProduct(input: CreateProductInput): Promise<ProductDto> {
  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug || generateSlug(input.name),
      sku: input.sku,
      description: input.description,
      shortDescription: input.shortDescription,
      price: input.price,
      comparePrice: input.comparePrice,
      costPrice: input.costPrice,
      quantity: input.quantity ?? 0,
      trackQuantity: input.trackQuantity ?? true,
      lowStockThreshold: input.lowStockThreshold ?? 5,
      deliveryTime: input.deliveryTime,
      weight: input.weight,
      dimensions: input.dimensions,
      allowCustomPrint: input.allowCustomPrint ?? false,
      printPrice: input.printPrice,
      status: input.status ?? "DRAFT",
      isActive: input.isActive ?? true,
      isFeatured: input.isFeatured ?? false,
      isLowBudget: input.isLowBudget ?? false,
      categoryId: input.categoryId,
      productCategoryId: input.productCategoryId,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      metaKeywords: input.metaKeywords,
    },
    ...productWithRelations,
  });
  return toProductDto(product);
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<ProductDto> {
  const product = await prisma.product.update({
    where: { id },
    data: input,
    ...productWithRelations,
  });
  return toProductDto(product);
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}

export async function productExists(id: string): Promise<boolean> {
  const count = await prisma.product.count({ where: { id } });
  return count > 0;
}

// ─── Product Images ────────────────────────────────────

export async function addProductImage(input: AddProductImageInput): Promise<ProductImageDto> {
  if (input.isMain) {
    await prisma.productImage.updateMany({
      where: { productId: input.productId, isMain: true },
      data: { isMain: false },
    });
  }

  const image = await prisma.productImage.create({
    data: {
      productId: input.productId,
      url: input.url,
      altText: input.altText,
      sortOrder: input.sortOrder ?? 0,
      isMain: input.isMain ?? false,
    },
  });

  return {
    id: image.id,
    url: image.url,
    altText: image.altText,
    isMain: image.isMain,
    sortOrder: image.sortOrder,
  };
}

export async function removeProductImage(imageId: string): Promise<void> {
  await prisma.productImage.delete({ where: { id: imageId } });
}

export async function setMainProductImage(productId: string, imageId: string): Promise<void> {
  await prisma.productImage.updateMany({
    where: { productId, isMain: true },
    data: { isMain: false },
  });
  await prisma.productImage.update({
    where: { id: imageId },
    data: { isMain: true },
  });
}

// ─── Helpers ───────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

import { prisma } from "@/lib/prisma";
import type { ProductDto, CreateProductInput, UpdateProductInput, ProductFilters } from "./types";

const productWithRelations = {
  include: {
    category: { select: { name: true } },
    company: { select: { name: true } },
  },
} as const;

function toProductDto(product: {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  category: { name: string };
  companyId: string;
  company: { name: string };
  price: { toNumber: () => number };
  warranty: number;
  capacity: number;
  imageUrl: string | null;
  stockQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ProductDto {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    companyId: product.companyId,
    companyName: product.company.name,
    price: product.price.toNumber(),
    warranty: product.warranty,
    capacity: product.capacity,
    imageUrl: product.imageUrl,
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function findProducts(filters: ProductFilters = {}): Promise<ProductDto[]> {
  const { search, categoryId, companyId } = filters;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
      ...(companyId ? { companyId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
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

export async function createProduct(input: CreateProductInput): Promise<ProductDto> {
  const product = await prisma.product.create({
    data: input,
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

export async function findProductByName(name: string): Promise<ProductDto | null> {
  const product = await prisma.product.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    ...productWithRelations,
  });
  return product ? toProductDto(product) : null;
}

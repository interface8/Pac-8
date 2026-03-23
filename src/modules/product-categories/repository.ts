import { prisma } from "@/lib/prisma";
import type {
  ProductCategoryDto,
  CreateProductCategoryInput,
  UpdateProductCategoryInput,
} from "./types";

function toCategoryDto(category: {
  id: string;
  name: string;
  description: string | null;
  sort: number;
  createdAt: Date;
  updatedAt: Date;
}): ProductCategoryDto {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    sort: category.sort,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function findCategories(): Promise<ProductCategoryDto[]> {
  const categories = await prisma.productCategory.findMany({
    orderBy: { sort: "asc" },
  });
  return categories.map(toCategoryDto);
}

export async function findCategoryById(id: string): Promise<ProductCategoryDto | null> {
  const category = await prisma.productCategory.findUnique({ where: { id } });
  return category ? toCategoryDto(category) : null;
}

export async function createCategory(input: CreateProductCategoryInput): Promise<ProductCategoryDto> {
  const category = await prisma.productCategory.create({ data: input });
  return toCategoryDto(category);
}

export async function updateCategory(id: string, input: UpdateProductCategoryInput): Promise<ProductCategoryDto> {
  const category = await prisma.productCategory.update({
    where: { id },
    data: input,
  });
  return toCategoryDto(category);
}

export async function deleteCategory(id: string): Promise<void> {
  await prisma.productCategory.delete({ where: { id } });
}

export async function categoryExists(id: string): Promise<boolean> {
  const count = await prisma.productCategory.count({ where: { id } });
  return count > 0;
}

export async function findCategoryByName(name: string): Promise<ProductCategoryDto | null> {
  const category = await prisma.productCategory.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  return category ? toCategoryDto(category) : null;
}


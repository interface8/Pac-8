import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  CategoryDto,
  CategoryTreeDto,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilters,
} from "./types";

type CategoryRecord = Prisma.CategoryGetPayload<object>;

function toCategoryDto(category: CategoryRecord): CategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parentId: category.parentId,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function findCategories(
  filters: CategoryFilters = {}
): Promise<CategoryDto[]> {
  const { parentId, isActive, search } = filters;

  const categories = await prisma.category.findMany({
    where: {
      ...(parentId !== undefined ? { parentId } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return categories.map(toCategoryDto);
}

export async function findCategoryTree(
  onlyActive = false
): Promise<CategoryTreeDto[]> {
  const allCategories = await prisma.category.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  // Build tree structure
  const categoryMap = new Map<string, CategoryTreeDto>();
  const rootCategories: CategoryTreeDto[] = [];

  // First pass: create all category nodes
  allCategories.forEach((cat) => {
    const categoryTree: CategoryTreeDto = {
      ...toCategoryDto(cat),
      children: [],
      productCount: cat._count.products,
    };
    categoryMap.set(cat.id, categoryTree);
  });

  // Second pass: build hierarchy
  allCategories.forEach((cat) => {
    const categoryNode = categoryMap.get(cat.id)!;
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(categoryNode);
      } else {
        // Parent not found or filtered out, treat as root
        rootCategories.push(categoryNode);
      }
    } else {
      rootCategories.push(categoryNode);
    }
  });

  return rootCategories;
}

export async function findCategoryById(
  id: string
): Promise<CategoryDto | null> {
  const category = await prisma.category.findUnique({
    where: { id },
  });
  return category ? toCategoryDto(category) : null;
}

export async function findCategoryBySlug(
  slug: string
): Promise<CategoryDto | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  return category ? toCategoryDto(category) : null;
}

export async function createCategory(
  input: CreateCategoryInput
): Promise<CategoryDto> {
  const category = await prisma.category.create({
    data: {
      name: input.name,
      slug: input.slug || generateSlug(input.name),
      description: input.description,
      image: input.image,
      parentId: input.parentId,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    },
  });
  return toCategoryDto(category);
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<CategoryDto> {
  const category = await prisma.category.update({
    where: { id },
    data: input,
  });
  return toCategoryDto(category);
}

export async function deleteCategory(id: string): Promise<void> {
  await prisma.category.delete({ where: { id } });
}

export async function categoryExists(id: string): Promise<boolean> {
  const count = await prisma.category.count({ where: { id } });
  return count > 0;
}

export async function findChildCategories(
  parentId: string
): Promise<CategoryDto[]> {
  const categories = await prisma.category.findMany({
    where: { parentId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return categories.map(toCategoryDto);
}

export async function countProductsInCategory(categoryId: string): Promise<number> {
  return prisma.product.count({
    where: { categoryId },
  });
}

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single
}

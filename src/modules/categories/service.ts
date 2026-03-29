import * as categoryRepo from "./repository";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilters,
  CategoryTreeDto,
} from "./types";

export async function listCategories(filters: CategoryFilters) {
  return categoryRepo.findCategories(filters);
}

export async function getCategoryTree(onlyActive = false): Promise<CategoryTreeDto[]> {
  return categoryRepo.findCategoryTree(onlyActive);
}

export async function getCategoryById(id: string) {
  const category = await categoryRepo.findCategoryById(id);
  if (!category) throw new Error("Category not found");
  return category;
}

export async function getCategoryBySlug(slug: string) {
  const category = await categoryRepo.findCategoryBySlug(slug);
  if (!category) throw new Error("Category not found");
  return category;
}

export async function createCategory(input: CreateCategoryInput) {
  // Check for duplicate slug
  if (input.slug) {
    const existing = await categoryRepo.findCategoryBySlug(input.slug);
    if (existing) {
      throw new Error("Category with this slug already exists");
    }
  }

  // Validate parent exists if provided
  if (input.parentId) {
    const parentExists = await categoryRepo.categoryExists(input.parentId);
    if (!parentExists) {
      throw new Error("Parent category not found");
    }
  }

  return categoryRepo.createCategory(input);
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  // Check category exists
  if (!(await categoryRepo.categoryExists(id))) {
    throw new Error("Category not found");
  }

  // Check for duplicate slug if changing
  if (input.slug) {
    const existing = await categoryRepo.findCategoryBySlug(input.slug);
    if (existing && existing.id !== id) {
      throw new Error("Category with this slug already exists");
    }
  }

  // Prevent setting self as parent
  if (input.parentId === id) {
    throw new Error("Category cannot be its own parent");
  }

  // Validate parent exists if provided
  if (input.parentId) {
    const parentExists = await categoryRepo.categoryExists(input.parentId);
    if (!parentExists) {
      throw new Error("Parent category not found");
    }

    // Check for circular reference (parent cannot be a child of this category)
    const isCircular = await checkCircularReference(id, input.parentId);
    if (isCircular) {
      throw new Error("Circular parent-child relationship detected");
    }
  }

  return categoryRepo.updateCategory(id, input);
}

export async function deleteCategory(id: string) {
  if (!(await categoryRepo.categoryExists(id))) {
    throw new Error("Category not found");
  }

  // Check if category has products
  const productCount = await categoryRepo.countProductsInCategory(id);
  if (productCount > 0) {
    throw new Error(
      `Cannot delete category with ${productCount} products. Move or delete products first.`
    );
  }

  // Check if category has children
  const children = await categoryRepo.findChildCategories(id);
  if (children.length > 0) {
    throw new Error(
      `Cannot delete category with ${children.length} subcategories. Delete or move them first.`
    );
  }

  return categoryRepo.deleteCategory(id);
}

// Helper to check for circular references
async function checkCircularReference(
  categoryId: string,
  newParentId: string
): Promise<boolean> {
  let currentId: string | null = newParentId;

  while (currentId) {
    if (currentId === categoryId) {
      return true; // Circular reference detected
    }

    const category = await categoryRepo.findCategoryById(currentId);
    currentId = category?.parentId || null;
  }

  return false;
}

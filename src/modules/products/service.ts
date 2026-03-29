import * as productRepo from "./repository";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  AddProductImageInput,
} from "./types";

export async function listProducts(filters: ProductFilters) {
  return productRepo.findProducts(filters);
}

export async function getProductById(id: string) {
  const product = await productRepo.findProductById(id);
  if (!product) throw new Error("Product not found");
  return product;
}

export async function getProductBySlug(slug: string) {
  const product = await productRepo.findProductBySlug(slug);
  if (!product) throw new Error("Product not found");
  return product;
}

export async function createProduct(input: CreateProductInput) {
  // Check SKU uniqueness
  if (await productRepo.findProductBySku(input.sku)) {
    throw new Error("Product with this SKU already exists");
  }

  // Check slug uniqueness if provided
  if (input.slug) {
    const existing = await productRepo.findProductBySlug(input.slug);
    if (existing) {
      throw new Error("Product with this slug already exists");
    }
  }

  return productRepo.createProduct(input);
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  if (!(await productRepo.productExists(id))) {
    throw new Error("Product not found");
  }

  // Check SKU uniqueness if changing
  if (input.sku) {
    const existing = await productRepo.findProductBySku(input.sku);
    if (existing && existing.id !== id) {
      throw new Error("Product with this SKU already exists");
    }
  }

  // Check slug uniqueness if changing
  if (input.slug) {
    const existing = await productRepo.findProductBySlug(input.slug);
    if (existing && existing.id !== id) {
      throw new Error("Product with this slug already exists");
    }
  }

  return productRepo.updateProduct(id, input);
}

export async function deleteProduct(id: string) {
  if (!(await productRepo.productExists(id))) {
    throw new Error("Product not found");
  }
  return productRepo.deleteProduct(id);
}

export async function updateProductStatus(
  id: string,
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED"
) {
  if (!(await productRepo.productExists(id))) {
    throw new Error("Product not found");
  }

  // Business rule: Can't activate a product without images
  if (status === "ACTIVE") {
    const product = await productRepo.findProductById(id);
    if (!product || product.images.length === 0) {
      throw new Error("Cannot activate product without images");
    }
  }

  return productRepo.updateProduct(id, { status });
}

// Product Images
export async function addProductImage(input: AddProductImageInput) {
  if (!(await productRepo.productExists(input.productId))) {
    throw new Error("Product not found");
  }
  return productRepo.addProductImage(input);
}

export async function removeProductImage(imageId: string) {
  return productRepo.removeProductImage(imageId);
}

export async function setMainProductImage(productId: string, imageId: string) {
  if (!(await productRepo.productExists(productId))) {
    throw new Error("Product not found");
  }
  return productRepo.setMainProductImage(productId, imageId);
}

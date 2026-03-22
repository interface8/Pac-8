import * as productRepo from "./repository";
import type { CreateProductInput, UpdateProductInput, ProductFilters } from "./types";

export async function listProducts(filters: ProductFilters) {
  return productRepo.findProducts(filters);
}

export async function getProductById(id: string) {
  const product = await productRepo.findProductById(id);
  if (!product) throw new Error("Product not found");
  return product;
}

export async function createProduct(input: CreateProductInput) {
   if (await productRepo.findProductByName(input.name)) {
    throw new Error("Product already exists");
  }
  return productRepo.createProduct(input);
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  if (!(await productRepo.productExists(id))) {
    throw new Error("Product not found");
  }
  return productRepo.updateProduct(id, input);
}

export async function deleteProduct(id: string) {
  if (!(await productRepo.productExists(id))) {
    throw new Error("Product not found");
  }
  return productRepo.deleteProduct(id);
}

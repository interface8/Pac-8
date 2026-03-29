export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface ProductImageDto {
  id: string;
  url: string;
  altText: string | null;
  isMain: boolean;
  sortOrder: number;
}

export interface PriceTierDto {
  id: string;
  minQuantity: number;
  discountType: string;
  discountValue: number;
  isActive: boolean;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  quantity: number;
  trackQuantity: boolean;
  lowStockThreshold: number;
  deliveryTime: string | null;
  weight: number | null;
  dimensions: string | null;
  allowCustomPrint: boolean;
  printPrice: number | null;
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  isLowBudget: boolean;
  categoryId: string;
  categoryName: string;
  productCategoryId: string | null;
  productCategoryName: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  metaKeywords: string | null;
  images: ProductImageDto[];
  priceTiers: PriceTierDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  quantity?: number;
  trackQuantity?: boolean;
  lowStockThreshold?: number;
  deliveryTime?: string;
  weight?: number;
  dimensions?: string;
  allowCustomPrint?: boolean;
  printPrice?: number;
  status?: ProductStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  isLowBudget?: boolean;
  categoryId: string;
  productCategoryId?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  isLowBudget?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  productCategoryId?: string;
}

export interface AddProductImageInput {
  productId: string;
  url: string;
  altText?: string;
  sortOrder?: number;
  isMain?: boolean;
}

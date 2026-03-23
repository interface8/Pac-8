export interface ProductCategoryDto {
  id: string;
  name: string;
  description: string | null;
  sort: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductCategoryInput {
  name: string;
  description?: string;
  sort: number;
}

export type UpdateProductCategoryInput = Partial<CreateProductCategoryInput>;

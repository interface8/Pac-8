export interface ProductDto {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  companyId: string;
  companyName: string;
  price: number;
  warranty: number;
  capacity: number;
  imageUrl: string | null;
  stockQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  categoryId: string;
  companyId: string;
  price: number;
  warranty: number;
  capacity: number;
  imageUrl?: string;
  stockQuantity?: number;
  isActive?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  companyId?: string;
}

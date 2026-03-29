export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryTreeDto extends CategoryDto {
  children: CategoryTreeDto[];
  productCount?: number;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface CategoryFilters {
  parentId?: string | null; // null = root categories only, undefined = all
  isActive?: boolean;
  search?: string;
}

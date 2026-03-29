export interface WishlistItemDto {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  productPrice: number;
  productInStock: boolean;
  createdAt: Date;
}

export interface AddToWishlistInput {
  userId?: string;
  sessionId?: string;
  productId: string;
}

export interface MergeWishlistInput {
  userId: string;
  sessionId: string;
}

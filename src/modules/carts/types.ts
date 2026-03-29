export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  quantity: number;
  customPrint: boolean;
  printText: string | null;
  unitPrice: number;
  totalPrice: number;
  savedForLater: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartDto {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItemDto[];
  subtotal: number; // Calculated
  totalItems: number; // Calculated
  savedForLater: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartInput {
  userId?: string;
  sessionId?: string;
  productId: string;
  quantity: number;
  customPrint?: boolean;
  printText?: string;
}

export interface UpdateCartItemInput {
  quantity?: number;
  customPrint?: boolean;
  printText?: string;
  savedForLater?: boolean;
}

export interface MergeCartInput {
  userId: string;
  sessionId: string;
}



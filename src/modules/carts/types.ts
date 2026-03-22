export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartDto {
  cartId: string;
  userId: string;
  items: CartItemDto[];
  total: number;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}


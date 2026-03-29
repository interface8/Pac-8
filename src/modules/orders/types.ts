export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "AWAITING_PAYMENT"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage: string | null;
  quantity: number;
  customPrint: boolean;
  printText: string | null;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerEmail: string;
  customerPhone: string | null;
  customerName: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddressId: string | null;
  billingAddressId: string | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  bankAccountInfo: string | null;
  customerNotes: string | null;
  adminNotes: string | null;
  items: OrderItemDto[];
  createdAt: Date;
  updatedAt: Date;
  shippedAt: Date | null;
  deliveredAt: Date | null;
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  customPrint?: boolean;
  printText?: string;
}

export interface CreateOrderInput {
  userId?: string;
  customerEmail: string;
  customerPhone?: string;
  customerName: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingMethod?: string;
  paymentMethod?: string;
  customerNotes?: string;
  items: CreateOrderItemInput[];
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  shippingMethod?: string;
  adminNotes?: string;
  paymentReference?: string;
}

export interface OrderFilters {
  userId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  page?: number;
  limit?: number;
}

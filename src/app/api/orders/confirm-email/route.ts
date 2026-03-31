import { orderService } from "@/modules/orders";
import { jsonResponse, errorResponse } from "@/lib/http";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { NextRequest } from "next/server";

// POST /api/orders/confirm-email — send order confirmation email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId || typeof orderId !== "string") {
      return errorResponse("orderId is required", 400);
    }

    const order = await orderService.getOrderById(orderId);

    await sendOrderConfirmationEmail({
      to_name: order.customerName,
      to_email: order.customerEmail,
      order_number: order.orderNumber,
      order_total: `₦${order.totalAmount.toLocaleString()}`,
      items_summary: order.items
        .map((item) => `${item.productName} × ${item.quantity}`)
        .join(", "),
      payment_method: order.paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : "Card Payment",
    });

    return jsonResponse({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    return errorResponse(message, 500);
  }
}

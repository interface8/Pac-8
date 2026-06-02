import { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { createA1PayCheckout, isA1PayConfigured } from "@/lib/a1pay";
import { errorResponse, jsonResponse } from "@/lib/http";

const schema = z.object({
  orderId: z.string().min(1),
  callbackPath: z.string().optional(),
});

// POST /api/payments/a1pay/initiate
export async function POST(request: NextRequest) {
  if (!isA1PayConfigured) {
    return errorResponse("A1 Pay is currently unavailable", 503);
  }

  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const { orderId, callbackPath } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        orderNumber: true,
        totalAmount: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
      },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    if (order.userId && user && order.userId !== user.id) {
      return errorResponse("You cannot pay for this order", 403);
    }

    const appUrl = env.APP_URL.replace(/\/$/, "");
    const callbackUrl = `${appUrl}/api/webhooks/a1pay`;
    const returnUrl = `${appUrl}${callbackPath || `/orders/${order.orderNumber}/confirmation`}`;

    const result = await createA1PayCheckout({
      amount: Number(order.totalAmount),
      currency: "NGN",
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      callbackUrl,
      returnUrl,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: "A1PAY",
        paymentReference: result.reference,
      },
    });

    return jsonResponse({
      data: {
        checkoutUrl: result.checkoutUrl,
        reference: result.reference,
        returnUrl,
      },
    });
  } catch (error: unknown) {
    console.error("[A1 Pay] Initialize error:", {
      error,
      hasPublicKey: Boolean(env.A1PAY_PUBLIC_KEY),
      hasMerchantId: Boolean(env.A1PAY_MERCHANT_ID),
      hasSecretKey: Boolean(env.A1PAY_SECRET_KEY),
      initializeUrl: env.A1PAY_INITIALIZE_URL,
      appUrl: env.APP_URL,
    });
    const message = error instanceof Error ? error.message : "Failed to initialize A1 Pay";
    return errorResponse(message, 500);
  }
}

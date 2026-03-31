import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";
import { z } from "zod";

const createIntentSchema = z.object({
  amount: z.number().min(100, "Minimum amount is ₦100"),
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  orderId: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

// POST /api/payments/create-intent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createIntentSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
      return errorResponse(firstError, 400);
    }

    const { amount, customerEmail, customerName, orderId, metadata } = parsed.data;
    const user = await getCurrentUser();

    // Amount in kobo (smallest unit — NGN has 100 kobo per naira)
    const amountInKobo = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInKobo,
      currency: "ngn",
      metadata: {
        ...(metadata ?? {}),
        ...(orderId ? { orderId } : {}),
        ...(user ? { userId: user.id } : {}),
        customerEmail,
        customerName,
      },
      receipt_email: customerEmail,
    });

    return jsonResponse({
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error: unknown) {
    console.error("[Stripe] Create intent error:", error);
    const message = error instanceof Error ? error.message : "Failed to create payment";
    return errorResponse(message, 500);
  }
}

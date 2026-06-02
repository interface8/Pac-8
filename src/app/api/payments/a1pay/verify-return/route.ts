import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errorResponse, jsonResponse } from "@/lib/http";
import { queryA1PayTransaction } from "@/lib/a1pay";

const schema = z.object({
  orderNumber: z.string().min(1),
  ref: z.string().optional(),
  merchantRef: z.string().optional(),
  response: z.string().optional(),
});

type VerificationStatus = "PAID" | "FAILED" | "PENDING";

function toVerificationStatus(value: string | null | undefined): VerificationStatus {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return "PENDING";

  if (["success", "succeeded", "successful", "paid", "completed", "approved"].includes(normalized)) {
    return "PAID";
  }

  if (["failed", "failure", "declined", "cancelled", "canceled", "expired"].includes(normalized)) {
    return "FAILED";
  }

  return "PENDING";
}

// GET /api/payments/a1pay/verify-return?orderNumber=...&ref=...&merchantRef=...&response=...
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const parsed = schema.safeParse({
    orderNumber: url.searchParams.get("orderNumber") ?? undefined,
    ref: url.searchParams.get("Ref") ?? url.searchParams.get("ref") ?? undefined,
    merchantRef:
      url.searchParams.get("MerchantRef") ??
      url.searchParams.get("merchantRef") ??
      url.searchParams.get("merchantref") ??
      undefined,
    response: url.searchParams.get("Response") ?? url.searchParams.get("response") ?? undefined,
  });

  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Validation failed";
    return errorResponse(firstError, 400);
  }

  const { orderNumber, ref, merchantRef, response } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        paymentMethod: true,
        paymentStatus: true,
        paymentReference: true,
      },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    const reference = ref || merchantRef || order.paymentReference || order.orderNumber;

    // Always prefer server-to-server verification when query endpoint is configured.
    const queried = await queryA1PayTransaction({
      paymentReference: reference,
      orderNumber: order.orderNumber,
    });

    let finalStatus: VerificationStatus;
    if (queried?.status) {
      finalStatus = queried.status;
    } else {
      // Fallback to known DB status, then to return URL hint.
      if (order.paymentStatus === "PAID") {
        finalStatus = "PAID";
      } else if (order.paymentStatus === "FAILED") {
        finalStatus = "FAILED";
      } else {
        finalStatus = toVerificationStatus(response);
      }
    }

    // Keep order in sync when verification gives a stronger signal.
    if (finalStatus === "PAID" && order.paymentStatus !== "PAID") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentMethod: "A1PAY",
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paymentReference: reference,
        },
      });
    }

    if (finalStatus === "FAILED" && order.paymentStatus !== "FAILED") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentMethod: "A1PAY",
          paymentStatus: "FAILED",
          paymentReference: reference,
        },
      });
    }

    return jsonResponse({
      data: {
        status: finalStatus,
        orderNumber: order.orderNumber,
        paymentReference: reference,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to verify payment";
    return errorResponse(message, 500);
  }
}

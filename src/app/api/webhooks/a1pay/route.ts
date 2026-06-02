import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import type { PaymentStatus } from "@/modules/orders/types";
import {
  parseA1PayWebhookPayload,
  parseA1PayWebhookStatus,
  pickA1PayReference,
  queryA1PayTransaction,
  verifyA1PaySignature,
} from "@/lib/a1pay";

function extractOrderKeys(payload: Record<string, unknown>) {
  const data = (payload.data as Record<string, unknown> | undefined) ?? {};

  const metadata = (data.metadata as Record<string, unknown> | undefined) ??
    (payload.metadata as Record<string, unknown> | undefined) ??
    {};

  const orderId =
    (data.orderId as string | undefined) ??
    (payload.orderId as string | undefined) ??
    (metadata.orderId as string | undefined);

  const orderNumber =
    (data.orderNumber as string | undefined) ??
    (payload.orderNumber as string | undefined) ??
    (metadata.orderNumber as string | undefined) ??
    (payload.reference as string | undefined) ??
    (data.reference as string | undefined);

  const paymentReference =
    (payload.reference as string | undefined) ??
    (data.reference as string | undefined) ??
    (data.transactionRef as string | undefined) ??
    (data.id as string | undefined);

  return { orderId, orderNumber, paymentReference };
}

// POST /api/webhooks/a1pay
export async function POST(request: NextRequest) {
  const body = await request.text();

  const shouldVerifySignature = Boolean(env.A1PAY_WEBHOOK_SECRET);
  const signature =
    (env.A1PAY_SIGNATURE_HEADER ? request.headers.get(env.A1PAY_SIGNATURE_HEADER) : null) ??
    request.headers.get("x-signature") ??
    request.headers.get("signature");
  const timestamp = env.A1PAY_SIGNATURE_TIMESTAMP_HEADER
    ? request.headers.get(env.A1PAY_SIGNATURE_TIMESTAMP_HEADER)
    : null;

  if (shouldVerifySignature && !verifyA1PaySignature(body, signature, timestamp)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = parseA1PayWebhookPayload(body);
  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const paymentStatus = parseA1PayWebhookStatus(payload);

  if (!paymentStatus) {
    return NextResponse.json({ received: true });
  }

  const { orderId, orderNumber, paymentReference } = extractOrderKeys(payload);
  if (!orderId && !orderNumber) {
    return NextResponse.json({ received: true });
  }

  const verifiedStatus =
    paymentReference
      ? (await queryA1PayTransaction({
          paymentReference,
          orderNumber,
        }))?.status ?? paymentStatus
      : paymentStatus;

  const existingOrder = await prisma.order.findFirst({
    where: orderId ? { id: orderId } : { orderNumber: orderNumber! },
    select: {
      id: true,
      paymentStatus: true,
      paymentReference: true,
    },
  });

  if (!existingOrder) {
    return NextResponse.json({ received: true });
  }

  const resolvedReference = pickA1PayReference(payload, paymentReference ?? orderNumber ?? existingOrder.id);
  if (
    existingOrder.paymentStatus === "PAID" &&
    verifiedStatus === "PAID" &&
    existingOrder.paymentReference === resolvedReference
  ) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        paymentMethod: "A1PAY",
        paymentStatus: verifiedStatus as PaymentStatus,
        status: verifiedStatus === "PAID" ? "CONFIRMED" : undefined,
        paymentReference: resolvedReference,
      },
    });
  } catch (error) {
    console.error("[A1 Pay Webhook] Failed to update order", {
      orderId: existingOrder.id,
      verifiedStatus,
      error,
    });
    return NextResponse.json({ received: true, processed: false });
  }

  return NextResponse.json({ received: true });
}

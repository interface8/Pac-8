import crypto from "crypto";
import { env } from "@/lib/env";

export type A1PayStatus = "PAID" | "FAILED";

interface A1PayInitiateInput {
  amount: number;
  currency?: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  callbackUrl: string;
  returnUrl: string;
}

interface A1PayStatusQueryInput {
  paymentReference: string;
  orderNumber?: string;
}

export interface A1PayInitiateResult {
  checkoutUrl: string;
  reference: string;
  raw: Record<string, unknown>;
}

export interface A1PayStatusResult {
  status: A1PayStatus;
  raw: Record<string, unknown>;
}

export const isA1PayConfigured =
  Boolean(env.A1PAY_PUBLIC_KEY || env.A1PAY_MERCHANT_ID) &&
  Boolean(env.A1PAY_SECRET_KEY) &&
  Boolean(env.A1PAY_INITIALIZE_URL);

function normalizeAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid payment amount");
  }
  return Number(amount.toFixed(2));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone?: string | null) {
  const value = phone?.trim();
  return value && value.length > 0 ? value : undefined;
}

function ensurePhoneNumber(phone?: string | null) {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    throw new Error("Phone number is required for A1 Pay payments");
  }
  return normalized;
}

function cleanString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const candidate = cleanString(value);
    if (candidate) return candidate;
  }

  return null;
}

function parseJsonSafe(body: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function sanitizeRawGatewayText(rawText: string, maxLength = 300) {
  return rawText.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function getMerchantId() {
  return env.A1PAY_MERCHANT_ID || env.A1PAY_PUBLIC_KEY;
}

function getInitializeUrl() {
  return env.A1PAY_INITIALIZE_URL;
}

function buildA1PayHeaders() {
  const merchantId = getMerchantId();
  const publicKey = env.A1PAY_PUBLIC_KEY;

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.A1PAY_SECRET_KEY}`,
    ...(merchantId ? { "x-merchant-id": merchantId } : {}),
    ...(publicKey ? { "x-public-key": publicKey } : {}),
  };
}

async function postA1InitializeWithAuthFallback(
  url: string,
  payload: Record<string, unknown>,
) {
  const secret = env.A1PAY_SECRET_KEY;
  const merchantId = getMerchantId();
  const publicKey = env.A1PAY_PUBLIC_KEY;

  const basicPublicSecret = Buffer.from(`${publicKey}:${secret}`).toString("base64");
  const basicSecretPublic = Buffer.from(`${secret}:${publicKey}`).toString("base64");

  const baseHeaders = {
    "Content-Type": "application/json",
    ...(merchantId ? { "x-merchant-id": merchantId } : {}),
    ...(publicKey ? { "x-public-key": publicKey } : {}),
  };

  const headerVariants: Array<{ label: string; headers: Record<string, string> }> = [
    { label: "bearer-secret", headers: { ...baseHeaders, Authorization: `Bearer ${secret}` } },
    { label: "bearer-public", headers: { ...baseHeaders, Authorization: `Bearer ${publicKey}` } },
    { label: "raw-secret", headers: { ...baseHeaders, Authorization: secret } },
    { label: "x-api-key", headers: { ...baseHeaders, "x-api-key": secret } },
    { label: "x-secret-key", headers: { ...baseHeaders, "x-secret-key": secret } },
    {
      label: "x-key-pair",
      headers: { ...baseHeaders, "x-secret-key": secret, "x-public-key": publicKey },
    },
    { label: "basic-public-secret", headers: { ...baseHeaders, Authorization: `Basic ${basicPublicSecret}` } },
    { label: "basic-secret-public", headers: { ...baseHeaders, Authorization: `Basic ${basicSecretPublic}` } },
  ];

  let lastResponse: Response | null = null;
  const trace: string[] = [];
  for (const attempt of headerVariants) {
    const res = await fetch(url, {
      method: "POST",
      headers: attempt.headers,
      body: JSON.stringify(payload),
    });

    lastResponse = res;
    trace.push(`${attempt.label}:${res.status}`);
    // Return immediately on success or non-auth error so we preserve the real server message.
    if (res.ok || res.status !== 401) {
      if (trace.length > 1) {
        console.info("[A1 Pay] Initialize auth trace", trace.join(", "));
      }
      return res;
    }
  }

  if (trace.length > 0) {
    console.info("[A1 Pay] Initialize auth trace", trace.join(", "));
  }

  return lastResponse!;
}

function normalizeProvidedSignature(signature: string) {
  return signature.trim().replace(/^sha256=/i, "").replace(/^hmac-sha256=/i, "");
}

function signA1PayPayload(payload: string) {
  const secret = env.A1PAY_WEBHOOK_SECRET;
  return {
    hex: crypto.createHmac("sha256", secret).update(payload).digest("hex"),
    base64: crypto.createHmac("sha256", secret).update(payload).digest("base64"),
  };
}

function timingSafeEqualLoose(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function pickCheckoutUrl(payload: Record<string, unknown>): string | null {
  const data = (payload.data as Record<string, unknown> | undefined) ?? {};
  return firstString(
    payload.checkoutUrl,
    payload.checkout_url,
    payload.paymentUrl,
    payload.payment_url,
    payload.authorization_url,
    payload.payment_link,
    payload.paymentLink,
    payload.link,
    payload.url,
    data.checkoutUrl,
    data.checkout_url,
    data.paymentUrl,
    data.payment_url,
    data.authorization_url,
    data.payment_link,
    data.paymentLink,
    data.link,
    data.url,
  );
}

function pickReference(payload: Record<string, unknown>, fallback: string): string {
  const data = (payload.data as Record<string, unknown> | undefined) ?? {};
  return firstString(
    payload.reference,
    payload.paymentReference,
    payload.tx_ref,
    payload.transactionRef,
    payload.transaction_ref,
    payload.id,
    data.reference,
    data.paymentReference,
    data.tx_ref,
    data.transactionRef,
    data.transaction_ref,
    data.id,
  ) ?? fallback;
}

function pickStatus(payload: Record<string, unknown>): string | null {
  const data = (payload.data as Record<string, unknown> | undefined) ?? {};
  const value = firstString(
    payload.status,
    payload.paymentStatus,
    payload.event,
    data.status,
    data.paymentStatus,
    data.event,
  );

  return value ? value.toLowerCase() : null;
}

function mapStatus(statusRaw: string | null): A1PayStatus | null {
  if (!statusRaw) return null;
  if (["success", "succeeded", "successful", "paid", "completed", "approved"].includes(statusRaw)) {
    return "PAID" as const;
  }
  if (["failed", "failure", "declined", "cancelled", "canceled", "expired"].includes(statusRaw)) {
    return "FAILED" as const;
  }
  return null;
}

export async function createA1PayCheckout(
  input: A1PayInitiateInput,
): Promise<A1PayInitiateResult> {
  if (!isA1PayConfigured) {
    throw new Error("A1 Pay is not configured");
  }

  const payload = {
    transType: "Product Purchase",
    merchantId: getMerchantId(),
    customerName: input.customerName,
    paymentReference: input.orderNumber,
    phoneNumber: ensurePhoneNumber(input.customerPhone),
    PhoneNumber: ensurePhoneNumber(input.customerPhone),
    emailAddress: normalizeEmail(input.customerEmail),
    amount: normalizeAmount(input.amount),
    callbackUrl: input.callbackUrl,
    returnUrl: input.returnUrl,
    metadata: {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
    },
  };

  const res = await postA1InitializeWithAuthFallback(getInitializeUrl(), payload);

  const rawText = await res.text();
  const json = parseJsonSafe(rawText) ?? {};

  const gatewayDeclaredFailure =
    (typeof json.success === "boolean" && json.success === false) ||
    (typeof json.status === "boolean" && json.status === false);

  if (!res.ok || gatewayDeclaredFailure) {
    const compactText = sanitizeRawGatewayText(rawText);
    const validationErrors = (json.errors as Record<string, string[] | string> | undefined);
    const firstValidationError = validationErrors
      ? Object.values(validationErrors).flatMap((v) => Array.isArray(v) ? v : [String(v)])[0]
      : undefined;
    const message =
      firstValidationError ??
      (json.message as string | undefined) ??
      (json.responseMessage as string | undefined) ??
      (json.error as string | undefined) ??
      compactText ??
      "Failed to create A1 Pay checkout";

    throw new Error(
      `A1 initialize failed (HTTP ${res.status}): ${message}`,
    );
  }

  const checkoutUrl = pickCheckoutUrl(json);
  if (!checkoutUrl) {
    throw new Error("A1 Pay response did not include a checkout URL");
  }

  return {
    checkoutUrl,
    reference: pickReference(json, input.orderNumber),
    raw: json,
  };
}

export async function queryA1PayTransaction(
  input: A1PayStatusQueryInput,
): Promise<A1PayStatusResult | null> {
  if (!env.A1PAY_QUERY_URL) return null;

  const res = await fetch(env.A1PAY_QUERY_URL, {
    method: "POST",
    headers: buildA1PayHeaders(),
    body: JSON.stringify({
      paymentReference: input.paymentReference,
      orderNumber: input.orderNumber,
      merchantId: getMerchantId(),
    }),
  });

  const rawText = await res.text();
  const json = parseJsonSafe(rawText) ?? {};

  if (!res.ok) {
    return null;
  }

  const status = mapStatus(pickStatus(json));
  if (!status) return null;

  return { status, raw: json };
}

export function verifyA1PaySignature(
  body: string,
  signature: string | null,
  timestamp?: string | null,
): boolean {
  if (!env.A1PAY_WEBHOOK_SECRET) return false;
  if (!signature) return false;

  const normalized = normalizeProvidedSignature(signature);
  const candidates = [body, ...(timestamp ? [`${timestamp}.${body}`] : [])]
    .flatMap((value) => {
      const signed = signA1PayPayload(value);
      return [signed.hex, signed.base64];
    });

  try {
    return candidates.some((candidate) => timingSafeEqualLoose(candidate, normalized));
  } catch {
    return false;
  }
}

export function parseA1PayWebhookStatus(payload: Record<string, unknown>) {
  return mapStatus(pickStatus(payload));
}

export function pickA1PayReference(payload: Record<string, unknown>, fallback: string) {
  return pickReference(payload, fallback);
}

export function parseA1PayWebhookPayload(body: string) {
  return parseJsonSafe(body);
}

export const initializeA1PayPayment = createA1PayCheckout;

// ─── Centralized HTTP client with error normalization ──

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export class HttpError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor({ message, status, errors }: ApiError) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.errors = errors;
  }
}

// ─── Internal fetch wrapper (server-side, repo layer) ──
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function normalizeError(res: Response): Promise<HttpError> {
  let body: Record<string, unknown> = {};
  try {
    body = await res.json();
  } catch {
    /* empty */
  }
  return new HttpError({
    message: (body.message as string) ?? res.statusText,
    status: res.status,
    errors: body.errors as Record<string, string[]> | undefined,
  });
}

export async function http<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!res.ok) {
    throw await normalizeError(res);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Typed JSON response helpers for API routes ────────
export function jsonResponse<T>(data: T, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ message }, { status });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

/**
 * Shared HTTP helpers for API route handlers: consistent JSON shapes, auth,
 * body parsing and error handling. Keeps every route small and uniform.
 */

/** JSON success response. */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/** JSON error response with a safe, client-facing message. */
export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Error carrying an HTTP status. Thrown by helpers below and mapped to a
 * response by `handleRoute`.
 */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export type SessionUser = { id: string; username: string; email: string };

/** Return the authenticated user, or throw `HttpError(401)`. */
export async function requireUser(): Promise<SessionUser> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new HttpError(401, "Unauthorized");
  }
  return session.user;
}

/** Parse and validate a JSON body against a Zod schema, or throw `HttpError(400)`. */
export async function parseBody<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new HttpError(400, result.error.issues[0]?.message ?? "Invalid request");
  }
  return result.data;
}

/** Best-effort client IP from trusted edge proxy headers. */
export function getClientIp(req: Request): string {
  const vercelIp = req.headers.get("x-vercel-ip") || req.headers.get("x-real-ip");
  if (vercelIp) return vercelIp.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

/**
 * Wrap a route handler so every error is handled uniformly:
 * `HttpError`s map to their status; anything else is logged and returned as a
 * generic 500 (never leaks stack traces or internal messages to clients).
 */
export function handleRoute<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof HttpError) {
        return apiError(err.message, err.status);
      }
      console.error("Unhandled API error:", err);
      return apiError("Something went wrong. Please try again.", 500);
    }
  };
}

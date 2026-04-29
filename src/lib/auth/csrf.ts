import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_FORM_FIELD = "_csrf";

function generateCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

function _hashCsrf(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Get or create a CSRF token for the current request.
 * Sets the token as an httpOnly cookie and returns the plain token
 * to be embedded in forms / sent as header.
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (existing) {
    return existing;
  }

  const token = generateCsrfToken();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return token;
}

/**
 * Validate CSRF token from form data or header against the cookie.
 * Must be called in every server action that mutates data.
 */
export async function validateCsrf(
  formData?: FormData,
  request?: Request,
): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!cookieToken) {
    return false;
  }

  // Check form field first
  if (formData) {
    const formToken = formData.get(CSRF_FORM_FIELD);
    if (typeof formToken === "string" && formToken === cookieToken) {
      return true;
    }
  }

  // Check header
  if (request) {
    const headerToken = request.headers.get(CSRF_HEADER_NAME);
    if (headerToken && headerToken === cookieToken) {
      return true;
    }
  }

  return false;
}

/**
 * Require valid CSRF. Throws if invalid.
 */
export async function requireCsrf(
  formData?: FormData,
  request?: Request,
): Promise<void> {
  const valid = await validateCsrf(formData, request);
  if (!valid) {
    throw new Error("CSRF validation failed");
  }
}

export { CSRF_COOKIE_NAME, CSRF_FORM_FIELD, CSRF_HEADER_NAME };

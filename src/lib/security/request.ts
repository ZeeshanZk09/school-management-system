import { headers } from "next/headers";

/**
 * Resolves the client's IP address from request headers.
 * Supports standard proxy headers like x-forwarded-for and x-real-ip.
 * 
 * @returns {Promise<string | null>} The resolved IP address or null.
 */
export async function getClientIp(): Promise<string | null> {
  try {
    const requestHeaders = await headers();
    const forwardedFor = requestHeaders.get("x-forwarded-for");
    
    if (forwardedFor) {
      return forwardedFor.split(",")[0]?.trim() ?? null;
    }

    return requestHeaders.get("x-real-ip") ?? null;
  } catch {
    // Headers unavailable in some execution contexts (e.g., static generation)
    return null;
  }
}

/**
 * Resolves the client's User-Agent string from request headers.
 * 
 * @returns {Promise<string | null>} The User-Agent string or null.
 */
export async function getClientUserAgent(): Promise<string | null> {
  try {
    const requestHeaders = await headers();
    return requestHeaders.get("user-agent");
  } catch {
    return null;
  }
}

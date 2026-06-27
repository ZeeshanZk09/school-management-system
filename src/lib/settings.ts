import { cache } from "react";
import prisma from "@/lib/prisma";
import { logger } from "./logger";

/**
 * Fallback settings used when the database is unavailable or empty.
 */
const EMPTY_SYSTEM_SETTINGS = {
  schoolName: "Zebotix School",
  schoolLogoUrl: null,
  addressLine1: "",
  addressLine2: null,
  city: null,
  state: null,
  country: null,
  postalCode: null,
  contactEmail: null,
  contactPhone: null,
  allowSelfRegistration: false,
  attendanceSessions: ["Morning", "Afternoon"],
};

/**
 * Checks if the DATABASE_URL environment variable is properly configured.
 */
function hasDatabaseUrl(): boolean {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  return Boolean(databaseUrl && !["undefined", "null", ""].includes(databaseUrl));
}

/**
 * Fetches global system settings from the database.
 * Results are cached for the duration of the request.
 *
 * @returns The current system settings or a default fallback.
 */
export const getSystemSettings = cache(async () => {
  if (!hasDatabaseUrl()) {
    return EMPTY_SYSTEM_SETTINGS;
  }

  try {
    const settings = await prisma.systemSettings.findFirst();
    return settings || EMPTY_SYSTEM_SETTINGS;
  } catch (error) {
    logger.error("Failed to fetch system settings", { error });
    return EMPTY_SYSTEM_SETTINGS;
  }
});

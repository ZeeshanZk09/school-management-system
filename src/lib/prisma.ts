import { PrismaClient } from "./generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Manually parses the connection string and populates PG environment variables.
 * This is a proven fix for the 'No database host set' error in serverless environments.
 */
function forcePgEnvironment(connectionString: string) {
  try {
    const url = new URL(connectionString);
    process.env.PGHOST = url.hostname;
    process.env.PGUSER = url.username;
    process.env.PGPASSWORD = decodeURIComponent(url.password);
    process.env.PGDATABASE = url.pathname.substring(1);
    process.env.PGPORT = url.port || "5432";
    console.log(`[Prisma Fix] Forced PGHOST to ${url.hostname}`);
  } catch (e) {
    console.error("[Prisma Fix] Failed to parse connection string for manual setup.");
  }
}

function createPrismaClient(): PrismaClient {
  // Check for the most common connection string variables
  const connectionString = 
    process.env.DATABASE_URL || 
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;

  if (!connectionString || connectionString.trim() === "") {
    console.error("❌ DATABASE_URL is missing or empty.");
    throw new Error("DATABASE_URL is required to initialize PrismaClient.");
  }

  // Set environment variables manually as a final fallback for the pg driver
  forcePgEnvironment(connectionString);

  const isProduction = process.env.NODE_ENV === "production";
  const isNeon = connectionString.includes("neon.tech");

  if (isProduction || isNeon) {
    try {
      console.log("[Prisma] Initializing with Neon Serverless...");
      const { Pool, neonConfig } = require("@neondatabase/serverless");
      const { PrismaNeon } = require("@prisma/adapter-neon");
      const ws = require("ws");

      neonConfig.webSocketConstructor = ws;

      // Passing connectionString as a single string argument is often more robust
      const pool = new Pool({ connectionString: connectionString });
      const adapter = new PrismaNeon(pool);
      
      return new PrismaClient({ adapter });
    } catch (error) {
      console.error("⚠️ Neon initialization failed:", error);
    }
  }

  // Local / Fallback path
  try {
    console.log("[Prisma] Initializing with standard PG driver...");
    const { Pool } = require("pg");
    const { PrismaPg } = require("@prisma/adapter-pg");

    const pool = new Pool({ 
      connectionString: connectionString,
      ssl: isNeon ? { rejectUnauthorized: false } : false
    });

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("❌ ALL Prisma initialization paths failed.");
    throw error;
  }
}

// Singleton pattern
global.prisma ??= createPrismaClient();

export default global.prisma;

import { PrismaClient } from "./generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Optimized Prisma Client Factory
 * Local: Standard PostgreSQL
 * Production: Neon Serverless
 */
function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Detection logic for Vercel/Neon
  const connectionString = 
    process.env.DATABASE_URL || 
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing. Please check your environment variables.");
  }

  // --- PRODUCTION FLOW (NEON) ---
  if (isProduction || connectionString.includes("neon.tech")) {
    try {
      console.log("🚀 Initializing Neon Serverless Client...");
      const { Pool, neonConfig } = require("@neondatabase/serverless");
      const { PrismaNeon } = require("@prisma/adapter-neon");
      const ws = require("ws");

      neonConfig.webSocketConstructor = ws;
      
      const pool = new Pool({ connectionString });
      const adapter = new PrismaNeon(pool);
      
      return new PrismaClient({ adapter });
    } catch (error) {
      console.error("⚠️ Neon initialization failed, attempting standard PG fallback:", error);
    }
  }

  // --- LOCAL / FALLBACK FLOW (POSTGRESQL) ---
  try {
    console.log("💻 Initializing Standard PostgreSQL Client...");
    const { Pool } = require("pg");
    const { PrismaPg } = require("@prisma/adapter-pg");

    // Standard pg pool configuration
    const pool = new Pool({ 
      connectionString,
      // Only enable SSL for external connections (like Neon if accessed from local)
      ssl: connectionString.includes("neon.tech") ? { rejectUnauthorized: false } : false
    });

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("❌ All database initialization paths failed.");
    throw error;
  }
}

const prismaInstance = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaInstance;
}

export default prismaInstance;

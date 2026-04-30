import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Creates a Prisma Client based on the current environment.
 * Uses Neon serverless adapter in production and standard pg adapter in development.
 */
function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Try to find the connection string from various possible environment variables
  const connectionString = 
    process.env.DATABASE_URL || 
    process.env.POSTGRES_PRISMA_URL || 
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  // Extra check to ensure we have a non-empty string
  if (!connectionString || typeof connectionString !== "string" || connectionString.trim() === "") {
    console.error("❌ DATABASE_URL is missing or invalid in environment variables.");
    throw new Error("DATABASE_URL is required to initialize PrismaClient.");
  }

  // Debug log (masked) to verify presence in production logs
  console.log(`📡 Initializing Prisma in ${isProduction ? "production" : "development"} mode...`);
  console.log(`🔗 Connection string detected (length: ${connectionString.length})`);

  if (isProduction) {
    try {
      // Production: use Neon serverless adapter
      // Using standard imports/require pattern for serverless environments
      const { Pool, neonConfig } = require("@neondatabase/serverless");
      const { PrismaNeon } = require("@prisma/adapter-neon");
      const ws = require("ws");

      neonConfig.webSocketConstructor = ws;

      // Explicitly passing connectionString to Pool constructor
      const pool = new Pool({ connectionString: connectionString });
      const adapter = new PrismaNeon(pool);
      
      return new PrismaClient({ adapter });
    } catch (error) {
      console.error("⚠️ Failed to initialize PrismaNeon adapter:", error);
      // Fallback to standard adapter will happen below
    }
  }

  try {
    // Development or Fallback: use standard pg adapter
    const { Pool } = require("pg");
    const { PrismaPg } = require("@prisma/adapter-pg");

    const pool = new Pool({ connectionString: connectionString });
    const adapter = new PrismaPg(pool);
    
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("❌ Failed to initialize Prisma with any adapter:", error);
    // Ultimate fallback for types, though this will likely fail at runtime
    // if no connection string is provided by environment to the binary engine
    throw error;
  }
}

const prismaInstance = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaInstance;
}

export default prismaInstance;

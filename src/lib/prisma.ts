import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Creates a Prisma Client based on the current environment.
 * Uses Neon serverless adapter in production and standard pg adapter in development.
 * This implementation avoids the use of 'any' by adhering to the generated client's strict types.
 */
function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Vercel / Production environment often uses these variable names
  const connectionString = 
    process.env.DATABASE_URL || 
    process.env.POSTGRES_PRISMA_URL || 
    process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL is missing from environment variables.");
    throw new Error("DATABASE_URL is required to initialize PrismaClient.");
  }

  // Common initialization logic to avoid repetition and ensure type safety
  if (isProduction) {
    try {
      // Production: use Neon serverless adapter
      const { Pool, neonConfig } = require("@neondatabase/serverless");
      const { PrismaNeon } = require("@prisma/adapter-neon");
      const ws = require("ws");

      neonConfig.webSocketConstructor = ws;

      const pool = new Pool({ connectionString });
      const adapter = new PrismaNeon(pool);
      
      // The generated client requires an adapter property
      return new PrismaClient({ adapter });
    } catch (error) {
      console.error("Failed to initialize PrismaNeon adapter:", error);
      // Fallback will proceed to the standard pg adapter below
    }
  }

  // Development or Fallback: use standard pg adapter
  // We ensure we satisfy the strict PrismaClientOptions type (requires 'adapter' or 'accelerateUrl')
  const { PrismaPg } = require("@prisma/adapter-pg");
  const { Pool } = require("pg");

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
}

const prismaInstance = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaInstance;
}

export default prismaInstance;

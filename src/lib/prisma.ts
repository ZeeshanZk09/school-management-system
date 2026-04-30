import { PrismaClient } from "./generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  let connectionString = 
    process.env.DATABASE_URL || 
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;

  if (!connectionString || connectionString.trim() === "") {
    throw new Error("DATABASE_URL is missing.");
  }

  const isProduction = process.env.NODE_ENV === "production";
  const isNeon = connectionString.includes("neon.tech");

  // Force best-practice parameters for Neon Serverless
  if (isNeon) {
    if (!connectionString.includes("sslmode")) {
      connectionString += connectionString.includes("?") ? "&sslmode=require" : "?sslmode=require";
    }
    if (!connectionString.includes("connection_limit")) {
      connectionString += `&connection_limit=${isProduction ? 1 : 10}`;
    }
  }

  if (isProduction || isNeon) {
    try {
      console.log("[Prisma] Initializing with Neon Serverless config...");
      const { Pool, neonConfig } = require("@neondatabase/serverless");
      const { PrismaNeon } = require("@prisma/adapter-neon");
      const ws = require("ws");

      // Official Neon Serverless recommendations
      neonConfig.webSocketConstructor = ws;
      neonConfig.pipelineTLS = false; // Helps with handshake issues in some environments
      neonConfig.useSecureWebSocket = true;

      const pool = new Pool({ 
        connectionString,
        max: 1, // Optimal for serverless functions
        idleTimeoutMillis: 10000, // Close idle connections quickly
        connectionTimeoutMillis: 15000 // Give it time to wake up Neon
      });
      
      const adapter = new PrismaNeon(pool);
      return new PrismaClient({ adapter });
    } catch (error) {
      console.error("⚠️ Neon initialization error:", error);
    }
  }

  // --- LOCAL / FALLBACK ---
  try {
    console.log("[Prisma] Falling back to standard PG driver...");
    const { Pool } = require("pg");
    const { PrismaPg } = require("@prisma/adapter-pg");

    const pool = new Pool({ 
      connectionString,
      max: isProduction ? 1 : undefined,
      ssl: isNeon ? { rejectUnauthorized: false } : false
    });

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("❌ ALL Prisma initialization paths failed.");
    throw error;
  }
}

global.prisma ??= createPrismaClient();

export default global.prisma;

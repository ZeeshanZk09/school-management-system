import { PrismaClient } from "./generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function getConnectionString(): string {
  let url = process.env.DATABASE_URL || 
            process.env.POSTGRES_URL_NON_POOLING ||
            process.env.POSTGRES_URL;

  if (!url || url.trim() === "") {
    throw new Error("DATABASE_URL is missing.");
  }

  // Auto-patch for Neon
  if (url.includes("neon.tech")) {
    if (!url.includes("sslmode")) {
      url += url.includes("?") ? "&sslmode=require" : "?sslmode=require";
    }
    if (!url.includes("connection_limit")) {
      url += `&connection_limit=${process.env.NODE_ENV === "production" ? 1 : 10}`;
    }
  }
  return url;
}

function initNeonAdapter(connectionString: string): PrismaClient {
  console.log("[Prisma] Initializing with Neon Serverless config...");
  const { Pool, neonConfig } = require("@neondatabase/serverless");
  const { PrismaNeon } = require("@prisma/adapter-neon");
  const ws = require("ws");

  neonConfig.webSocketConstructor = ws;
  neonConfig.pipelineTLS = false;
  neonConfig.useSecureWebSocket = true;

  const pool = new Pool({ 
    connectionString,
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 15000
  });
  
  return new PrismaClient({ adapter: new PrismaNeon(pool) });
}

function initStandardAdapter(connectionString: string): PrismaClient {
  console.log("[Prisma] Falling back to standard PG driver...");
  const { Pool } = require("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");

  const pool = new Pool({ 
    connectionString,
    max: process.env.NODE_ENV === "production" ? 1 : undefined,
    ssl: connectionString.includes("neon.tech") ? { rejectUnauthorized: false } : false
  });

  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

function createPrismaClient(): PrismaClient {
  const url = getConnectionString();
  const isProduction = process.env.NODE_ENV === "production";
  const isNeon = url.includes("neon.tech");

  if (isProduction || isNeon) {
    try {
      return initNeonAdapter(url);
    } catch (error) {
      console.error("⚠️ Neon initialization error:", error);
    }
  }

  try {
    return initStandardAdapter(url);
  } catch (error) {
    console.error("❌ ALL Prisma initialization paths failed.");
    throw error;
  }
}

global.prisma ??= createPrismaClient();

export default global.prisma;

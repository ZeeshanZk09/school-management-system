import "dotenv/config";

import { PrismaClient } from "./generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // Production: use Neon serverless adapter
    // Dynamic import to avoid bundling neon in dev
    const { Pool, neonConfig } = require("@neondatabase/serverless");
    const { PrismaNeon } = require("@prisma/adapter-neon");
    const ws = require("ws");

    neonConfig.webSocketConstructor = ws;

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required to initialize PrismaClient.");
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  }

  // Development: use standard pg adapter (local PostgreSQL)
  const { PrismaPg } = require("@prisma/adapter-pg");
  const { Pool } = require("pg");

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize PrismaClient.");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prismaInstance = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaInstance;
}

export default prismaInstance;

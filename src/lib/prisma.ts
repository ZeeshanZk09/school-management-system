import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import ws from "ws";

declare global {
  var prisma: PrismaClient | undefined;
}

function getConnectionString(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;

  if (!url || url.trim() === "") {
    throw new Error(
      "DATABASE_URL is missing. Please set it in your environment variables."
    );
  }
  return url;
}

function createNeonClient(connectionString: string): PrismaClient {
  neonConfig.webSocketConstructor = ws;
  neonConfig.pipelineTLS = false;
  neonConfig.useSecureWebSocket = true;

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

function createPgClient(connectionString: string): PrismaClient {
  const { Pool: PgPool } = require("pg");
  const pool = new PgPool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function createPrismaClient(): PrismaClient {
  const connectionString = getConnectionString();
  const isNeon = connectionString.includes("neon.tech");

  if (isNeon) {
    return createNeonClient(connectionString);
  }
  return createPgClient(connectionString);
}

global.prisma ??= createPrismaClient();

export default global.prisma;

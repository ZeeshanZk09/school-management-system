/**
 * Prisma Client Singleton
 *
 * Production (Neon): Uses @prisma/adapter-neon for serverless WebSocket connections
 * Local (PostgreSQL): Uses @prisma/adapter-pg for standard TCP connections
 *
 * Based on official Neon + Prisma guide:
 * https://neon.tech/docs/guides/prisma
 */

import { PrismaClient } from './generated/prisma/client';

declare global {
  var prisma: PrismaClient;
}

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Add it to your .env or Vercel Environment Variables.'
    );
  }

  const isNeon = connectionString.includes('neon.tech');

  if (isNeon) {
    // --- NEON SERVERLESS (Production on Vercel) ---
    // Official pattern from https://neon.tech/docs/guides/prisma
    const { neonConfig } = require('@neondatabase/serverless');
    const { PrismaNeon } = require('@prisma/adapter-neon');
    const ws = require('ws');

    neonConfig.webSocketConstructor = ws;

    // Pass connectionString directly to PrismaNeon — NOT via Pool constructor
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter });
  }

  // --- STANDARD POSTGRESQL (Local Development) ---
  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

global.prisma ??= createPrismaClient();

export default global.prisma;

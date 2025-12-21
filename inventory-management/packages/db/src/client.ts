/**
 * Prisma Client Singleton
 *
 * This module exports a singleton instance of PrismaClient
 * to be used throughout the application.
 *
 * For Prisma 7, the database connection is configured via:
 * - prisma/prisma.config.ts: Datasource configuration for Migrate
 * - DATABASE_URL: PostgreSQL connection string (environment variable)
 * - NODE_ENV: Environment (development/production)
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

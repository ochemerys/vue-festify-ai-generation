/**
 * Prisma Client Singleton
 *
 * This module exports a singleton instance of PrismaClient
 * to be used throughout the application.
 *
 * For Prisma 7, the database connection is configured via:
 * - DATABASE_URL: PostgreSQL connection string (environment variable)
 * - NODE_ENV: Environment (development/production)
 * - PrismaClient adapter: Uses @prisma/adapter-pg for direct connections
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_TEST_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL or DATABASE_TEST_URL environment variable is not set. ' +
    'Please ensure the .env file exists with DATABASE_URL configured, ' +
    'or .env.test with DATABASE_TEST_URL for testing.'
  )
}

// Create a PostgreSQL pool
const pool = new pg.Pool({
  connectionString: databaseUrl,
})

// Create Prisma adapter
const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

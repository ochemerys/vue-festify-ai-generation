/**
 * Prisma Configuration for Prisma 7
 *
 * This file configures the database connection URL for Prisma Migrate.
 * The DATABASE_URL environment variable is read at runtime.
 */

export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}

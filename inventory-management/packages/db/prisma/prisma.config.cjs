/**
 * Prisma Configuration for Prisma 7
 *
 * This file configures the database connection URL for Prisma Migrate.
 * The DATABASE_URL environment variable is read from the root .env file.
 *
 * @see ../../../ENV_SETUP.md for environment configuration guide
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please ensure the root .env file exists with DATABASE_URL configured. ' +
    'See ENV_SETUP.md for setup instructions.'
  )
}

module.exports = {
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
}
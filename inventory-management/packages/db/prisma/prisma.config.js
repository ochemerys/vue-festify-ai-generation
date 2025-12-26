/**
 * Prisma Configuration for Prisma 7
 *
 * This file configures the database connection URL for Prisma Migrate.
 * The DATABASE_URL environment variable is read from the root .env file.
 *
 * @see ../../../ENV_SETUP.md for environment configuration guide
 */

import { config } from 'dotenv'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

config({ path: join(__dirname, '../../../.env') })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please ensure the root .env file exists with DATABASE_URL configured. ' +
    'See ENV_SETUP.md for setup instructions.'
  )
}

export default {
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
}
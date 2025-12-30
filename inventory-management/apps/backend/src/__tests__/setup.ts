// IMPORTANT: Import env-setup FIRST to set environment variables
import './env-setup.js'

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { prisma } from '@inventory/db'
import { cleanupTestData } from './helpers/factories.js'

// Database connection management - only for integration tests
let isDatabaseAvailable = false

beforeAll(async () => {
  try {
    // Try to connect to test database
    await prisma.$connect()

    // Verify we're using test database
    const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_TEST_URL
    if (dbUrl?.includes('test')) {
      isDatabaseAvailable = true
    } else {
      console.warn('Not using test database - skipping database operations')
    }
  } catch (error) {
    console.warn('Database not available - running unit tests only')
  }
})

afterAll(async () => {
  // Disconnect from database if connected
  if (isDatabaseAvailable) {
    await prisma.$disconnect()
  }
})

// Clean up test data before each test - only if database is available
beforeEach(async () => {
  if (isDatabaseAvailable) {
    await cleanupTestData()
  }
})

// Optional: Clean up after each test as well
afterEach(async () => {
  // You can add additional cleanup here if needed
})

// Global error handler for unhandled rejections in tests
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection in test:', error)
})

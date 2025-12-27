/**
 * Environment Setup for Tests
 * 
 * This file MUST be imported before any other imports that use environment variables.
 * It sets up the test environment variables before Prisma client is initialized.
 */

// Set test environment variables BEFORE any imports
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = process.env.DATABASE_TEST_URL || 'postgresql://postgres:postgres@localhost:5433/inventory_test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key'

// Log configuration for debugging
if (process.env.DEBUG_TESTS) {
  console.log('Test Environment Configuration:')
  console.log('- NODE_ENV:', process.env.NODE_ENV)
  console.log('- DATABASE_URL:', process.env.DATABASE_URL)
  console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '***' : 'not set')
}

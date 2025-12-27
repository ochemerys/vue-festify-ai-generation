import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { prisma } from '@inventory/db'

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key'

export interface TestUser {
  userId: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER'
}

/**
 * Generate a test JWT token
 */
export function generateTestToken(user: TestUser): string {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

/**
 * Create auth headers for testing
 */
export function createAuthHeaders(role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER' = 'ADMIN') {
  const token = generateTestToken({
    userId: `test-user-${role.toLowerCase()}`,
    email: `test-${role.toLowerCase()}@example.com`,
    role,
  })
  
  return {
    authorization: `Bearer ${token}`,
  }
}

/**
 * Create a test user in the database
 */
export async function createTestUser(
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER' = 'ADMIN',
  overrides?: Partial<{
    email: string
    firstName: string
    lastName: string
    password: string
  }>
) {
  const hashedPassword = await bcrypt.hash(overrides?.password || 'password123', 10)
  
  const user = await prisma.user.create({
    data: {
      email: overrides?.email || `test-${role.toLowerCase()}-${Date.now()}@example.com`,
      password: hashedPassword,
      firstName: overrides?.firstName || 'Test',
      lastName: overrides?.lastName || 'User',
      role,
      isActive: true,
    },
  })

  return user
}

/**
 * Create test user and return auth headers
 */
export async function createTestUserWithAuth(
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER' = 'ADMIN'
) {
  const user = await createTestUser(role)
  const token = generateTestToken({
    userId: user.id,
    email: user.email,
    role: user.role as any,
  })

  return {
    user,
    token,
    headers: {
      authorization: `Bearer ${token}`,
    },
  }
}

/**
 * Clean up test users
 */
export async function cleanupTestUsers() {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: 'test-',
      },
    },
  })
}

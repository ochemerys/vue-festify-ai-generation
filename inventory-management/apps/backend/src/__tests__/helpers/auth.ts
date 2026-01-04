import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { AppDataSource, User } from '@inventory/db'

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
  const dataSource = AppDataSource.isInitialized ? AppDataSource : await AppDataSource.initialize()
  const userRepo = dataSource.getRepository(User)

  const hashedPassword = await bcrypt.hash(overrides?.password || 'password123', 10)

  const user = userRepo.create({
    email: overrides?.email || `test-${role.toLowerCase()}-${Date.now()}@example.com`,
    password: hashedPassword,
    firstName: overrides?.firstName || 'Test',
    lastName: overrides?.lastName || 'User',
    role: role as any,
    isActive: true,
  })

  return await userRepo.save(user)
}

/**
 * Create test user and return auth headers
 */
export async function createTestUserWithAuth(
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER' = 'ADMIN'
) {
  const user = await createTestUser(role)
  const token = generateTestToken({
    userId: (user as any).id,
    email: (user as any).email,
    role: (user as any).role,
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
  const dataSource = AppDataSource.isInitialized ? AppDataSource : await AppDataSource.initialize()
  const userRepo = dataSource.getRepository(User)
  await userRepo.delete({ email: AppDataSource.driver.options.type === 'postgres' ? ("" as any) : (undefined as any) })
  await userRepo.createQueryBuilder()
    .delete()
    .from(User)
    .where('email LIKE :pattern', { pattern: '%test-%' })
    .execute()
}

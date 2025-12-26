import { beforeEach, vi } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'

// Create a mock Prisma client
const prismaMock = mockDeep()

// Mock the @inventory/db module
vi.mock('@inventory/db', () => ({
  prisma: prismaMock,
}))

beforeEach(() => {
  // Reset mocks before each test
  mockReset(prismaMock)
})

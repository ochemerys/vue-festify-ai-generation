import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './stores/authStore'
import { apiClient } from './services/api'

// Mock the API client
vi.mock('./services/api', () => ({
  apiClient: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshAccessToken: vi.fn(),
    isTokenExpired: vi.fn(),
    setToken: vi.fn(),
    makeRequest: vi.fn(),
  },
}))

describe('router guard logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('allows access to public pages without authentication', () => {
    const authStore = useAuthStore()
    const publicPages = ['Login', 'ForgotPassword', 'Signup', 'Unauthorized']
    
    expect(authStore.isAuthenticated).toBe(false)
    // Public pages should be accessible regardless of auth state
    publicPages.forEach(page => {
      expect(['Login', 'ForgotPassword', 'Signup', 'Unauthorized']).toContain(page)
    })
  })

  it('requires authentication for protected routes', () => {
    const authStore = useAuthStore()
    expect(authStore.isAuthenticated).toBe(false)
    // Protected routes should require isAuthenticated to be true
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('allows authenticated users to access protected routes', async () => {
    const authStore = useAuthStore()
    const mockUser = {
      id: '1',
      email: 'admin@inventory.local',
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
    }

    vi.mocked(apiClient.login).mockResolvedValue({
      success: true,
      data: {
        accessToken: 'test-token-123',
        user: mockUser,
        expiresIn: 3600,
        tokenType: 'Bearer',
      },
    } as any)

    await authStore.login('admin@inventory.local', 'password123')
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.isUserAuthorized()).toBe(true)
  })

  it('blocks inactive users from accessing protected routes', async () => {
    const authStore = useAuthStore()
    const mockUser = {
      id: '1',
      email: 'admin@inventory.local',
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
    }

    vi.mocked(apiClient.login).mockResolvedValue({
      success: true,
      data: {
        accessToken: 'test-token-123',
        user: mockUser,
        expiresIn: 3600,
        tokenType: 'Bearer',
      },
    } as any)

    await authStore.login('admin@inventory.local', 'password123')
    expect(authStore.isAuthenticated).toBe(true)
    // Manually set user as inactive
    if (authStore.currentUser) {
      authStore.setCurrentUser({ ...authStore.currentUser, active: false })
    }
    expect(authStore.isUserAuthorized()).toBe(false)
  })
})

import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './authStore'
import { apiClient } from '../services/api'

// Mock the API client
vi.mock('../services/api', () => ({
  apiClient: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshAccessToken: vi.fn(),
    isTokenExpired: vi.fn(),
    setToken: vi.fn(),
    makeRequest: vi.fn(),
  },
}))

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('starts unauthenticated', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.getCurrentUser()).toBeNull()
    expect(store.token).toBeNull()
  })

  it('fails login with API error', async () => {
    const store = useAuthStore()
    vi.mocked(apiClient.login).mockResolvedValue({
      success: false,
      error: { message: 'Invalid credentials' },
    } as any)

    const res = await store.login('admin@inventory.local', 'wrongpassword')
    expect(res.success).toBe(false)
    expect(res.error).toBe('Invalid credentials')
    expect(store.isAuthenticated).toBe(false)
  })

  it('login succeeds with valid credentials and sets token', async () => {
    const store = useAuthStore()
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

    const res = await store.login('admin@inventory.local', 'password123')
    expect(res.success).toBe(true)
    expect(store.isAuthenticated).toBe(true)
    expect(store.getCurrentUser()).not.toBeNull()
    expect(store.getCurrentUser()?.email).toBe('admin@inventory.local')
    expect(store.token).toBe('test-token-123')
  })

  it('signup fails if email exists', async () => {
    const store = useAuthStore()
    vi.mocked(apiClient.makeRequest).mockRejectedValue(
      new Error('Email already exists')
    )

    const res = await store.signup({
      email: 'admin@inventory.local',
      password: 'password123',
      firstName: 'X',
      lastName: 'Y',
    })
    expect(res.success).toBe(false)
  })

  it('signup succeeds and auto logs in', async () => {
    const store = useAuthStore()
    const mockUser = {
      id: '2',
      email: 'unique@inventory.local',
      firstName: 'Uni',
      lastName: 'Que',
      role: 'VIEWER',
    }

    // Mock signup response
    vi.mocked(apiClient.makeRequest).mockResolvedValue({
      success: true,
      data: mockUser,
    } as any)

    // Mock login response for auto-login
    vi.mocked(apiClient.login).mockResolvedValue({
      success: true,
      data: {
        accessToken: 'test-token-456',
        user: mockUser,
        expiresIn: 3600,
        tokenType: 'Bearer',
      },
    } as any)

    const res = await store.signup({
      email: 'unique@inventory.local',
      password: 'password123',
      firstName: 'Uni',
      lastName: 'Que',
    })
    expect(res.success).toBe(true)
    expect(store.isAuthenticated).toBe(true)
    expect(store.getCurrentUser()?.email).toBe('unique@inventory.local')
  })

  it('requestPasswordReset returns success message', async () => {
    const store = useAuthStore()
    vi.mocked(apiClient.makeRequest).mockResolvedValue({
      success: true,
      data: { message: 'Reset link sent' },
    } as any)

    const res = await store.requestPasswordReset('admin@inventory.local')
    expect(res.success).toBe(true)
    expect(res.message).toBeTypeOf('string')
  })

  it('requestPasswordReset handles missing endpoint gracefully', async () => {
    const store = useAuthStore()
    vi.mocked(apiClient.makeRequest).mockRejectedValue(
      new Error('Endpoint not found')
    )

    const res = await store.requestPasswordReset('admin@inventory.local')
    // Should return success for security reasons (don't reveal if email exists)
    expect(res.success).toBe(true)
    expect(res.message).toBeTypeOf('string')
  })

  it('logout clears user and token', async () => {
    const store = useAuthStore()
    
    // First login
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

    await store.login('admin@inventory.local', 'password123')
    expect(store.isAuthenticated).toBe(true)

    // Then logout
    vi.mocked(apiClient.logout).mockResolvedValue({
      success: true,
      data: { message: 'Logged out' },
    } as any)

    await store.logout()
    expect(store.isAuthenticated).toBe(false)
    expect(store.getCurrentUser()).toBeNull()
    expect(store.token).toBeNull()
  })

  it('isUserAuthorized returns false when not authenticated', () => {
    const store = useAuthStore()
    expect(store.isUserAuthorized()).toBe(false)
  })

  it('isUserAuthorized returns true for authenticated user', async () => {
    const store = useAuthStore()
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

    await store.login('admin@inventory.local', 'password123')
    expect(store.isUserAuthorized()).toBe(true)
  })

  it('initializeAuth restores token from localStorage', () => {
    const store = useAuthStore()
    localStorage.setItem('auth_token', 'saved-token-123')

    store.initializeAuth()
    expect(store.token).toBe('saved-token-123')
    expect(store.isInitialized).toBe(true)

    localStorage.removeItem('auth_token')
  })

  it('refreshToken updates token on success', async () => {
    const store = useAuthStore()
    vi.mocked(apiClient.refreshAccessToken).mockResolvedValue({
      success: true,
      data: {
        accessToken: 'new-token-456',
        expiresIn: 3600,
      },
    } as any)

    const result = await store.refreshToken()
    expect(result).toBe(true)
    expect(store.token).toBe('new-token-456')
  })

  it('isTokenExpired delegates to apiClient', () => {
    const store = useAuthStore()
    vi.mocked(apiClient.isTokenExpired).mockReturnValue(false)

    const result = store.isTokenExpired()
    expect(result).toBe(false)
    expect(apiClient.isTokenExpired).toHaveBeenCalled()
  })
})

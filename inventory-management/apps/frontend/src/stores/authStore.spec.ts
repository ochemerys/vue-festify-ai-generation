import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts unauthenticated', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.getCurrentUser()).toBeNull()
    expect(store.token).toBeNull()
  })

  it('fails login with short password', () => {
    const store = useAuthStore()
    const res = store.login('admin@inventory.local', 'short')
    expect(res.success).toBe(false)
    expect(res.error).toBe('Invalid password')
    expect(store.isAuthenticated).toBe(false)
  })

  it('login succeeds with valid credentials and sets token', () => {
    const store = useAuthStore()
    const res = store.login('admin@inventory.local', 'password123')
    expect(res.success).toBe(true)
    expect(store.isAuthenticated).toBe(true)
    expect(store.getCurrentUser()).not.toBeNull()
    expect(store.token).toMatch(/^mock-token-/)
  })

  it('signup fails if email exists', () => {
    const store = useAuthStore()
    // First, ensure user exists by logging in (MOCK_USERS contains admin)
    const res = store.signup({ email: 'admin@inventory.local', password: 'password123', firstName: 'X', lastName: 'Y' })
    expect(res.success).toBe(false)
    expect(res.error).toBe('Email is already registered')
  })

  it('signup validates password length', () => {
    const store = useAuthStore()
    const res = store.signup({ email: 'new@inventory.local', password: 'short', firstName: 'New', lastName: 'User' })
    expect(res.success).toBe(false)
    expect(res.error).toBe('Password must be at least 8 characters')
  })

  it('signup succeeds and auto logs in', () => {
    const store = useAuthStore()
    const res = store.signup({ email: 'unique@inventory.local', password: 'password123', firstName: 'Uni', lastName: 'Que' })
    expect(res.success).toBe(true)
    expect(store.isAuthenticated).toBe(true)
    expect(store.getCurrentUser()).not.toBeNull()
    expect(store.getCurrentUser()!.email).toBe('unique@inventory.local')
    expect(store.token).toMatch(/^mock-token-/)
  })

  it('requestPasswordReset returns success and message for existing user', () => {
    const store = useAuthStore()
    const res = store.requestPasswordReset('admin@inventory.local')
    expect(res.success).toBe(true)
    expect(res.message).toBeTypeOf('string')
  })

  it('requestPasswordReset returns false for non-existing user', () => {
    const store = useAuthStore()
    const res = store.requestPasswordReset('nonexistent@inventory.local')
    expect(res.success).toBe(false)
    expect(res.message).toBeTypeOf('string')
  })

  it('logout clears user and token', () => {
    const store = useAuthStore()
    store.signup({ email: 'logout@inventory.local', password: 'password123', firstName: 'Log', lastName: 'Out' })
    expect(store.isAuthenticated).toBe(true)
    store.logout()
    expect(store.isAuthenticated).toBe(false)
    expect(store.getCurrentUser()).toBeNull()
    expect(store.token).toBeNull()
  })

  it('isUserAuthorized returns false when not authenticated', () => {
    const store = useAuthStore()
    expect(store.isUserAuthorized()).toBe(false)
  })

  it('isUserAuthorized returns true for active user', () => {
    const store = useAuthStore()
    store.signup({ email: 'active@inventory.local', password: 'password123', firstName: 'A', lastName: 'U' })
    expect(store.isUserAuthorized()).toBe(true)
  })
})

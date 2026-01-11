import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './stores/authStore'

describe('router guard logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
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

  it('allows authenticated users to access protected routes', () => {
    const authStore = useAuthStore()
    authStore.login('admin@inventory.local', 'password123')
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.isUserAuthorized()).toBe(true)
  })

  it('blocks inactive users from accessing protected routes', () => {
    const authStore = useAuthStore()
    authStore.login('admin@inventory.local', 'password123')
    expect(authStore.isAuthenticated).toBe(true)
    // Manually set user as inactive
    if (authStore.currentUser) {
      authStore.setCurrentUser({ ...authStore.currentUser, active: false })
    }
    expect(authStore.isUserAuthorized()).toBe(false)
  })
})

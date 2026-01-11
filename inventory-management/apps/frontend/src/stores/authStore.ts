import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER'
  active: boolean
}

// Mock users database
const MOCK_USERS: AuthUser[] = [
  { id: 1, email: 'admin@inventory.local', firstName: 'System', lastName: 'Admin', role: 'ADMIN', active: true },
  { id: 2, email: 'manager@inventory.local', firstName: 'Marta', lastName: 'Manager', role: 'MANAGER', active: true },
  { id: 3, email: 'staff@inventory.local', firstName: 'Sam', lastName: 'Staff', role: 'STAFF', active: true }
]

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<AuthUser | null>(null)
  const isAuthenticated = computed(() => currentUser.value !== null)
  const token = ref<string | null>(null)

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    // Find user by email in mock data
    const user = MOCK_USERS.find(u => u.email === email)

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    if (!user.active) {
      return { success: false, error: 'User account is inactive' }
    }

    // TODO: In production, validate password against backend
    // For now, accept any password for demo purposes
    if (!password || password.length < 8) {
      return { success: false, error: 'Invalid password' }
    }

    // Set current user and generate mock token
    currentUser.value = user
    token.value = `mock-token-${user.id}-${Date.now()}`

    return { success: true }
  }

  const signup = (payload: { email: string; password: string; firstName: string; lastName: string }): { success: boolean; error?: string } => {
    const { email, password, firstName, lastName } = payload
    const exists = MOCK_USERS.some(u => u.email === email)
    if (exists) return { success: false, error: 'Email is already registered' }
    if (!password || password.length < 8) return { success: false, error: 'Password must be at least 8 characters' }
    const newUser: AuthUser = {
      id: MOCK_USERS.length + 1,
      email,
      firstName,
      lastName,
      role: 'VIEWER',
      active: true
    }
    // Push to mock database
    MOCK_USERS.push(newUser)
    // Auto-login new user
    currentUser.value = newUser
    token.value = `mock-token-${newUser.id}-${Date.now()}`
    return { success: true }
  }

  const requestPasswordReset = (email: string): { success: boolean; message?: string } => {
    const user = MOCK_USERS.find(u => u.email === email)
    if (!user) return { success: false, message: 'If the email exists, a reset link will be sent' }
    // In real app, call backend to send reset email. Here we just succeed.
    return { success: true, message: 'Password reset link sent to your email' }
  }

  const logout = () => {
    currentUser.value = null
    token.value = null
  }

  const setCurrentUser = (user: AuthUser | null) => {
    currentUser.value = user
  }

  const getCurrentUser = () => {
    return currentUser.value
  }

  const isUserAuthorized = () => {
    return isAuthenticated.value && currentUser.value?.active
  }

  return {
    currentUser,
    isAuthenticated,
    token,
    login,
    signup,
    requestPasswordReset,
    logout,
    setCurrentUser,
    getCurrentUser,
    isUserAuthorized
  }
})

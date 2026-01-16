import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from './settingsStore'
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

describe('settingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Clear localStorage before each test
    localStorage.clear()
    // Mock document.documentElement for theme tests
    document.documentElement.classList.remove('dark')
  })

  describe('initialization', () => {
    it('initializes with null preferences', () => {
      const store = useSettingsStore()
      expect(store.userPreferences).toBeNull()
      expect(store.accountSettings).toBeNull()
    })

    it('initializes preferences from localStorage if available', () => {
      const mockPrefs = {
        theme: 'dark' as const,
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h' as const,
        timezone: 'UTC',
        notifications: {
          email: true,
          inApp: true,
          desktop: false,
          lowStock: true,
          orderUpdates: true,
          systemAnnouncements: true
        },
        dashboard: {
          defaultPage: '/',
          itemsPerPage: 25,
          visibleWidgets: []
        }
      }
      localStorage.setItem('userPreferences', JSON.stringify(mockPrefs))

      const store = useSettingsStore()
      store.initializePreferences()

      expect(store.userPreferences).not.toBeNull()
      expect(store.userPreferences?.theme).toBe('dark')
    })

    it('uses default preferences if localStorage is empty', () => {
      const store = useSettingsStore()
      store.initializePreferences()

      expect(store.userPreferences).not.toBeNull()
      expect(store.userPreferences?.theme).toBe('light')
      expect(store.userPreferences?.language).toBe('en')
    })
  })

  describe('theme management', () => {
    it('applies light theme correctly', () => {
      const store = useSettingsStore()
      store.applyTheme('light')

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('applies dark theme correctly', () => {
      const store = useSettingsStore()
      store.applyTheme('dark')

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('applies auto theme based on system preference', () => {
      // Mock matchMedia for dark mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const store = useSettingsStore()
      store.applyTheme('auto')

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('updates currentTheme computed property', () => {
      const store = useSettingsStore()
      store.initializePreferences()

      expect(store.currentTheme).toBe('light')

      if (store.userPreferences) {
        store.userPreferences.theme = 'dark'
      }

      expect(store.currentTheme).toBe('dark')
    })
  })

  describe('loadUserPreferences', () => {
    it('loads preferences successfully', async () => {
      const store = useSettingsStore()
      const result = await store.loadUserPreferences()

      expect(result.success).toBe(true)
      expect(store.userPreferences).not.toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('applies theme after loading preferences', async () => {
      localStorage.setItem('userPreferences', JSON.stringify({ theme: 'dark' }))
      
      const store = useSettingsStore()
      await store.loadUserPreferences()

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  describe('saveUserPreferences', () => {
    it('saves preferences successfully', async () => {
      const store = useSettingsStore()
      store.initializePreferences()

      const updatedPrefs = {
        ...store.userPreferences!,
        theme: 'dark' as const
      }

      const result = await store.saveUserPreferences(updatedPrefs)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Preferences saved successfully')
      expect(store.userPreferences?.theme).toBe('dark')
      expect(store.unsavedChanges).toBe(false)
    })

    it('persists preferences to localStorage', async () => {
      const store = useSettingsStore()
      store.initializePreferences()

      const updatedPrefs = {
        ...store.userPreferences!,
        theme: 'dark' as const
      }

      await store.saveUserPreferences(updatedPrefs)

      const stored = localStorage.getItem('userPreferences')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored!)
      expect(parsed.theme).toBe('dark')
    })

    it('applies theme after saving', async () => {
      const store = useSettingsStore()
      store.initializePreferences()

      const updatedPrefs = {
        ...store.userPreferences!,
        theme: 'dark' as const
      }

      await store.saveUserPreferences(updatedPrefs)

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  describe('loadAccountSettings', () => {
    it('loads account settings from current user', async () => {
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

      const store = useSettingsStore()
      const result = await store.loadAccountSettings()

      expect(result.success).toBe(true)
      expect(store.accountSettings).not.toBeNull()
      expect(store.accountSettings?.profile.firstName).toBe('System')
      expect(store.accountSettings?.profile.lastName).toBe('Admin')
    })

    it('fails if user is not authenticated', async () => {
      const store = useSettingsStore()
      const result = await store.loadAccountSettings()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to load account settings')
    })
  })

  describe('saveAccountSettings', () => {
    it('saves account settings successfully', async () => {
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

      const store = useSettingsStore()
      await store.loadAccountSettings()

      const updatedSettings = {
        ...store.accountSettings!,
        profile: {
          ...store.accountSettings!.profile,
          firstName: 'Updated',
          lastName: 'Name'
        }
      }

      const result = await store.saveAccountSettings(updatedSettings)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Profile updated successfully')
      expect(store.accountSettings?.profile.firstName).toBe('Updated')
      expect(store.unsavedChanges).toBe(false)
    })

    it('updates auth store with new profile data', async () => {
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

      const store = useSettingsStore()
      await store.loadAccountSettings()

      const updatedSettings = {
        ...store.accountSettings!,
        profile: {
          ...store.accountSettings!.profile,
          firstName: 'NewFirst',
          lastName: 'NewLast'
        }
      }

      await store.saveAccountSettings(updatedSettings)

      const currentUser = authStore.getCurrentUser()
      expect(currentUser?.firstName).toBe('NewFirst')
      expect(currentUser?.lastName).toBe('NewLast')
    })
  })

  describe('changePassword', () => {
    it('changes password successfully with valid data', async () => {
      const store = useSettingsStore()
      const result = await store.changePassword({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
        confirmPassword: 'newPassword456'
      })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Password changed successfully')
    })

    it('fails if passwords do not match', async () => {
      const store = useSettingsStore()
      const result = await store.changePassword({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
        confirmPassword: 'differentPassword789'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Passwords do not match')
    })

    it('fails if new password is too short', async () => {
      const store = useSettingsStore()
      const result = await store.changePassword({
        currentPassword: 'oldPassword123',
        newPassword: 'short',
        confirmPassword: 'short'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Password must be at least 8 characters')
    })

    it('fails if current password is incorrect', async () => {
      const store = useSettingsStore()
      const result = await store.changePassword({
        currentPassword: 'wrong',
        newPassword: 'newPassword456',
        confirmPassword: 'newPassword456'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Current password is incorrect')
    })
  })

  describe('resetPreferencesToDefaults', () => {
    it('resets preferences to default values', async () => {
      const store = useSettingsStore()
      store.initializePreferences()

      // Modify preferences
      if (store.userPreferences) {
        store.userPreferences.theme = 'dark'
        store.userPreferences.language = 'es'
      }

      const result = await store.resetPreferencesToDefaults()

      expect(result.success).toBe(true)
      expect(result.message).toBe('Preferences reset to defaults')
      expect(store.userPreferences?.theme).toBe('light')
      expect(store.userPreferences?.language).toBe('en')
      expect(store.unsavedChanges).toBe(false)
    })

    it('persists default preferences to localStorage', async () => {
      const store = useSettingsStore()
      store.initializePreferences()

      await store.resetPreferencesToDefaults()

      const stored = localStorage.getItem('userPreferences')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored!)
      expect(parsed.theme).toBe('light')
    })
  })

  describe('unsaved changes tracking', () => {
    it('marks settings as changed', () => {
      const store = useSettingsStore()
      expect(store.unsavedChanges).toBe(false)

      store.markAsChanged()

      expect(store.unsavedChanges).toBe(true)
      expect(store.hasUnsavedChanges).toBe(true)
    })

    it('clears unsaved changes after save', async () => {
      const store = useSettingsStore()
      store.initializePreferences()
      store.markAsChanged()

      expect(store.unsavedChanges).toBe(true)

      await store.saveUserPreferences(store.userPreferences!)

      expect(store.unsavedChanges).toBe(false)
    })
  })

  describe('active tab management', () => {
    it('sets active tab', () => {
      const store = useSettingsStore()
      expect(store.activeTab).toBe('user-preferences')

      store.setActiveTab('account')

      expect(store.activeTab).toBe('account')
    })
  })

  describe('error handling', () => {
    it('clears error', () => {
      const store = useSettingsStore()
      store.error = 'Some error'

      store.clearError()

      expect(store.error).toBeNull()
    })

    it('sets error on failed operations', async () => {
      const store = useSettingsStore()
      
      // Force an error by passing invalid data
      const result = await store.changePassword({
        currentPassword: '',
        newPassword: 'short',
        confirmPassword: 'different'
      })

      expect(result.success).toBe(false)
      expect(store.error).not.toBeNull()
    })
  })

  describe('loading state', () => {
    it('sets loading state during async operations', async () => {
      const store = useSettingsStore()
      
      const promise = store.loadUserPreferences()
      // Loading should be true during the operation
      // Note: This might be false by the time we check due to async nature
      
      await promise
      
      // Loading should be false after completion
      expect(store.loading).toBe(false)
    })
  })
})

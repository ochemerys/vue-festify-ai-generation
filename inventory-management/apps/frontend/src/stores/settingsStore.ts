import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserPreferences, AccountSettings, PasswordChangeData, SettingsResponse } from '../types/settings'
import { useAuthStore } from './authStore'

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
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
    visibleWidgets: ['sales-overview', 'low-stock-alerts', 'recent-orders', 'top-products']
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const authStore = useAuthStore()

  // State
  const userPreferences = ref<UserPreferences | null>(null)
  const accountSettings = ref<AccountSettings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const unsavedChanges = ref(false)
  const activeTab = ref('user-preferences')

  // Computed
  const hasUnsavedChanges = computed(() => unsavedChanges.value)
  const currentTheme = computed(() => userPreferences.value?.theme || 'light')

  // Load preferences from localStorage or use defaults
  function loadPreferencesFromStorage(): UserPreferences {
    const stored = localStorage.getItem('userPreferences')
    if (stored) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
      } catch (e) {
        console.error('Failed to parse stored preferences:', e)
      }
    }
    return { ...DEFAULT_PREFERENCES }
  }

  // Save preferences to localStorage
  function savePreferencesToStorage(preferences: UserPreferences) {
    localStorage.setItem('userPreferences', JSON.stringify(preferences))
  }

  // Initialize preferences
  function initializePreferences() {
    if (!userPreferences.value) {
      userPreferences.value = loadPreferencesFromStorage()
      applyTheme(userPreferences.value.theme)
    }
  }

  // Apply theme to document
  function applyTheme(theme: 'light' | 'dark' | 'auto') {
    const root = document.documentElement
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }

  // Load user preferences
  async function loadUserPreferences(): Promise<SettingsResponse<UserPreferences>> {
    loading.value = true
    error.value = null
    
    try {
      // For now, load from localStorage (mock API)
      // In production, this would be: const response = await fetch('/api/settings/preferences')
      const preferences = loadPreferencesFromStorage()
      userPreferences.value = preferences
      applyTheme(preferences.theme)
      
      return { success: true, data: preferences }
    } catch (err) {
      error.value = 'Failed to load preferences'
      console.error(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Save user preferences
  async function saveUserPreferences(preferences: UserPreferences): Promise<SettingsResponse<UserPreferences>> {
    loading.value = true
    error.value = null
    
    try {
      // For now, save to localStorage (mock API)
      // In production: const response = await fetch('/api/settings/preferences', { method: 'PUT', body: JSON.stringify(preferences) })
      savePreferencesToStorage(preferences)
      userPreferences.value = preferences
      applyTheme(preferences.theme)
      unsavedChanges.value = false
      
      return { success: true, data: preferences, message: 'Preferences saved successfully' }
    } catch (err) {
      error.value = 'Failed to save preferences'
      console.error(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Load account settings
  async function loadAccountSettings(): Promise<SettingsResponse<AccountSettings>> {
    loading.value = true
    error.value = null
    
    try {
      const currentUser = authStore.getCurrentUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      // Mock account settings from current user
      const settings: AccountSettings = {
        profile: {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          phone: '',
          jobTitle: '',
          profilePicture: null
        },
        security: {
          twoFactorEnabled: false
        }
      }
      
      accountSettings.value = settings
      return { success: true, data: settings }
    } catch (err) {
      error.value = 'Failed to load account settings'
      console.error(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Save account settings
  async function saveAccountSettings(settings: AccountSettings): Promise<SettingsResponse<AccountSettings>> {
    loading.value = true
    error.value = null
    
    try {
      // In production: const response = await fetch('/api/settings/account', { method: 'PUT', body: JSON.stringify(settings) })
      
      // Update auth store with new profile data
      const currentUser = authStore.getCurrentUser()
      if (currentUser) {
        currentUser.firstName = settings.profile.firstName
        currentUser.lastName = settings.profile.lastName
        currentUser.email = settings.profile.email
        authStore.setCurrentUser(currentUser)
      }
      
      accountSettings.value = settings
      unsavedChanges.value = false
      
      return { success: true, data: settings, message: 'Profile updated successfully' }
    } catch (err) {
      error.value = 'Failed to save account settings'
      console.error(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Change password
  async function changePassword(data: PasswordChangeData): Promise<SettingsResponse<void>> {
    loading.value = true
    error.value = null
    
    try {
      // Validate passwords match
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Validate password length
      if (data.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      // In production: const response = await fetch('/api/settings/account/password', { method: 'POST', body: JSON.stringify(data) })
      
      // Mock validation of current password
      if (data.currentPassword.length < 8) {
        throw new Error('Current password is incorrect')
      }

      return { success: true, message: 'Password changed successfully' }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Reset preferences to defaults
  async function resetPreferencesToDefaults(): Promise<SettingsResponse<UserPreferences>> {
    loading.value = true
    error.value = null
    
    try {
      const defaults = { ...DEFAULT_PREFERENCES }
      savePreferencesToStorage(defaults)
      userPreferences.value = defaults
      applyTheme(defaults.theme)
      unsavedChanges.value = false
      
      return { success: true, data: defaults, message: 'Preferences reset to defaults' }
    } catch (err) {
      error.value = 'Failed to reset preferences'
      console.error(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Mark settings as changed
  function markAsChanged() {
    unsavedChanges.value = true
  }

  // Set active tab
  function setActiveTab(tab: string) {
    activeTab.value = tab
  }

  // Clear error
  function clearError() {
    error.value = null
  }

  return {
    // State
    userPreferences,
    accountSettings,
    loading,
    error,
    activeTab,
    unsavedChanges,
    
    // Computed
    hasUnsavedChanges,
    currentTheme,
    
    // Actions
    initializePreferences,
    loadUserPreferences,
    saveUserPreferences,
    loadAccountSettings,
    saveAccountSettings,
    changePassword,
    resetPreferencesToDefaults,
    markAsChanged,
    setActiveTab,
    clearError,
    applyTheme
  }
})

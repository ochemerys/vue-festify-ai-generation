export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  timezone: string
  notifications: {
    email: boolean
    inApp: boolean
    desktop: boolean
    lowStock: boolean
    orderUpdates: boolean
    systemAnnouncements: boolean
  }
  dashboard: {
    defaultPage: string
    itemsPerPage: number
    visibleWidgets: string[]
  }
}

export interface AccountSettings {
  profile: {
    firstName: string
    lastName: string
    email: string
    phone: string
    jobTitle: string
    profilePicture: string | null
  }
  security: {
    twoFactorEnabled: boolean
  }
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface SettingsResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

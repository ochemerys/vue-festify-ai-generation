import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationSettings from './NotificationSettings.vue'
import SettingsSection from '../SettingsSection.vue'
import type { UserPreferences } from '../../../types/settings'

describe('NotificationSettings', () => {
  const mockPreferences: UserPreferences = {
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
      visibleWidgets: []
    }
  }

  it('renders SettingsSection with correct title', () => {
    const wrapper = mount(NotificationSettings, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.text()).toContain('Notifications')
    expect(wrapper.text()).toContain('Manage your notification preferences')
  })

  it('renders email notification section', () => {
    const wrapper = mount(NotificationSettings, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.text()).toContain('Email Notifications')
    expect(wrapper.text()).toContain('Enable email notifications')
    expect(wrapper.text()).toContain('Low stock alerts')
    expect(wrapper.text()).toContain('Order updates')
    expect(wrapper.text()).toContain('System announcements')
  })

  it('renders in-app notification section', () => {
    const wrapper = mount(NotificationSettings, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.text()).toContain('In-App Notifications')
    expect(wrapper.text()).toContain('Enable in-app notifications')
    expect(wrapper.text()).toContain('Show desktop notifications')
  })

  it('checks correct checkboxes based on preferences', () => {
    const wrapper = mount(NotificationSettings, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true)  // email
    expect((checkboxes[1].element as HTMLInputElement).checked).toBe(true)  // lowStock
    expect((checkboxes[2].element as HTMLInputElement).checked).toBe(true)  // orderUpdates
    expect((checkboxes[3].element as HTMLInputElement).checked).toBe(true)  // systemAnnouncements
    expect((checkboxes[4].element as HTMLInputElement).checked).toBe(true)  // inApp
    expect((checkboxes[5].element as HTMLInputElement).checked).toBe(false) // desktop
  })

  it('emits update event when email notification is toggled', async () => {
    const wrapper = mount(NotificationSettings, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const emailCheckbox = wrapper.findAll('input[type="checkbox"]')[0]
    await emailCheckbox.setValue(false)

    expect(wrapper.emitted('update')).toBeTruthy()
    const emittedPrefs = wrapper.emitted('update')?.[0][0] as UserPreferences
    expect(emittedPrefs.notifications.email).toBe(false)
  })

  it('emits update event when low stock alert is toggled', async () => {
    const wrapper = mount(NotificationSettings, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const lowStockCheckbox = wrapper.findAll('input[type="checkbox"]')[1]
    await lowStockCheckbox.setValue(false)

    expect(wrapper.emitted('update')).toBeTruthy()
    const emittedPrefs = wrapper.emitted('update')?.[0][0] as UserPreferences
    expect(emittedPrefs.notifications.lowStock).toBe(false)
  })

  it('disables sub-options when email is disabled', async () => {
    const prefsWithEmailDisabled = {
      ...mockPreferences,
      notifications: {
        ...mockPreferences.notifications,
        email: false
      }
    }

    const wrapper = mount(NotificationSettings, {
      props: {
        preferences: prefsWithEmailDisabled
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect((checkboxes[1].element as HTMLInputElement).disabled).toBe(true) // lowStock
    expect((checkboxes[2].element as HTMLInputElement).disabled).toBe(true) // orderUpdates
    expect((checkboxes[3].element as HTMLInputElement).disabled).toBe(true) // systemAnnouncements
  })

  it('updates local notifications when preferences prop changes', async () => {
    const wrapper = mount(NotificationSettings, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const updatedPrefs = {
      ...mockPreferences,
      notifications: {
        ...mockPreferences.notifications,
        desktop: true
      }
    }

    await wrapper.setProps({ preferences: updatedPrefs })

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect((checkboxes[5].element as HTMLInputElement).checked).toBe(true)
  })

  it('emits update with all notification settings intact', async () => {
    const wrapper = mount(NotificationSettings, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const inAppCheckbox = wrapper.findAll('input[type="checkbox"]')[4]
    await inAppCheckbox.setValue(false)

    const emittedPrefs = wrapper.emitted('update')?.[0][0] as UserPreferences
    expect(emittedPrefs.notifications.inApp).toBe(false)
    expect(emittedPrefs.notifications.email).toBe(true)
    expect(emittedPrefs.notifications.lowStock).toBe(true)
    expect(emittedPrefs.theme).toBe('light')
  })
})

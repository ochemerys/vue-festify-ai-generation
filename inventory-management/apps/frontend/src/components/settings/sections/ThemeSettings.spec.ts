import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeSettings from './ThemeSettings.vue'
import SettingsSection from '../SettingsSection.vue'
import type { UserPreferences } from '../../../types/settings'

describe('ThemeSettings', () => {
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
    const wrapper = mount(ThemeSettings, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.text()).toContain('Theme')
    expect(wrapper.text()).toContain('Choose your preferred color theme')
  })

  it('renders all theme options', () => {
    const wrapper = mount(ThemeSettings, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.text()).toContain('Light Mode')
    expect(wrapper.text()).toContain('Dark Mode')
    expect(wrapper.text()).toContain('Auto (System)')
  })

  it('checks the correct theme radio button', () => {
    const wrapper = mount(ThemeSettings, {
      props: {
        preferences: { ...mockPreferences, theme: 'dark' }
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const radios = wrapper.findAll('input[type="radio"]')
    expect((radios[0].element as HTMLInputElement).checked).toBe(false) // light
    expect((radios[1].element as HTMLInputElement).checked).toBe(true)  // dark
    expect((radios[2].element as HTMLInputElement).checked).toBe(false) // auto
  })

  it('emits update event when theme is changed', async () => {
    const wrapper = mount(ThemeSettings, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const darkRadio = wrapper.findAll('input[type="radio"]')[1]
    await darkRadio.trigger('change')

    expect(wrapper.emitted('update')).toBeTruthy()
    const emittedPrefs = wrapper.emitted('update')?.[0][0] as UserPreferences
    expect(emittedPrefs.theme).toBe('dark')
  })

  it('shows checkmark icon for selected theme', () => {
    const wrapper = mount(ThemeSettings, {
      props: {
        preferences: { ...mockPreferences, theme: 'light' }
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const checkmarks = wrapper.findAll('.bg-blue-600')
    expect(checkmarks.length).toBeGreaterThan(0)
  })

  it('updates local theme when preferences prop changes', async () => {
    const wrapper = mount(ThemeSettings, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    await wrapper.setProps({
      preferences: { ...mockPreferences, theme: 'dark' }
    })

    const radios = wrapper.findAll('input[type="radio"]')
    expect((radios[1].element as HTMLInputElement).checked).toBe(true)
  })

  it('applies hover styles to theme options', () => {
    const wrapper = mount(ThemeSettings, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const labels = wrapper.findAll('label')
    labels.forEach(label => {
      expect(label.classes()).toContain('hover:bg-slate-50')
    })
  })
})

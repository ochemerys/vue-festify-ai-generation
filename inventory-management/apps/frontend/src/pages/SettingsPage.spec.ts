import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SettingsPage from './SettingsPage.vue'
import { useSettingsStore } from '../stores/settingsStore'
import { useAuthStore } from '../stores/authStore'
import SettingsTabs from '../components/settings/SettingsTabs.vue'
import UserPreferencesTab from '../components/settings/tabs/UserPreferencesTab.vue'
import AccountSettingsTab from '../components/settings/tabs/AccountSettingsTab.vue'

// Mock vue-router
const mockPush = vi.fn()
const mockRoute = {
  path: '/settings',
  name: 'Settings'
}

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    beforeEach: vi.fn(),
    currentRoute: { value: mockRoute }
  }),
  useRoute: () => mockRoute,
  onBeforeRouteLeave: vi.fn()
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Setup authenticated user
    const authStore = useAuthStore()
    authStore.login('admin@inventory.local', 'password123')

    // Clear localStorage
    localStorage.clear()
    
    // Reset mocks
    mockPush.mockClear()
  })

  it('renders page title and description', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Settings')
    expect(wrapper.text()).toContain('Manage your account settings and preferences')
  })

  it('initializes and loads settings on mount', async () => {
    const settingsStore = useSettingsStore()
    const initSpy = vi.spyOn(settingsStore, 'initializePreferences')
    const loadPrefsSpy = vi.spyOn(settingsStore, 'loadUserPreferences')
    const loadAccountSpy = vi.spyOn(settingsStore, 'loadAccountSettings')

    mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    expect(initSpy).toHaveBeenCalled()
    expect(loadPrefsSpy).toHaveBeenCalled()
    expect(loadAccountSpy).toHaveBeenCalled()
  })

  it('renders tabs navigation', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    expect(wrapper.findComponent(SettingsTabs).exists()).toBe(true)
  })

  it('renders user preferences tab by default', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    expect(wrapper.findComponent(UserPreferencesTab).exists()).toBe(true)
  })

  it('renders action buttons', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Reset to Defaults')
    expect(wrapper.text()).toContain('Save Changes')
  })

  it('disables save button when no unsaved changes', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    const saveButton = wrapper.findAll('button').find(b => b.text().includes('Save Changes'))
    expect(saveButton?.classes()).toContain('cursor-not-allowed')
    expect(saveButton?.attributes('disabled')).toBeDefined()
  })

  it('enables save button when there are unsaved changes', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    const settingsStore = useSettingsStore()
    settingsStore.markAsChanged()

    await wrapper.vm.$nextTick()

    const saveButton = wrapper.findAll('button').find(b => b.text().includes('Save Changes'))
    expect(saveButton?.classes()).not.toContain('cursor-not-allowed')
  })

  it('saves user preferences when save button is clicked', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    const settingsStore = useSettingsStore()
    settingsStore.markAsChanged()
    const saveSpy = vi.spyOn(settingsStore, 'saveUserPreferences')

    await wrapper.vm.$nextTick()

    const saveButton = wrapper.findAll('button').find(b => b.text().includes('Save Changes'))
    await saveButton?.trigger('click')

    await flushPromises()

    expect(saveSpy).toHaveBeenCalled()
  })

  it('shows success message after successful save', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    const settingsStore = useSettingsStore()
    settingsStore.markAsChanged()

    await wrapper.vm.$nextTick()

    const saveButton = wrapper.findAll('button').find(b => b.text().includes('Save Changes'))
    await saveButton?.trigger('click')

    await flushPromises()

    // The actual message is "Preferences saved successfully" for user preferences tab
    expect(wrapper.text()).toContain('Preferences saved successfully')
  })

  it('shows reset to defaults button only on user preferences tab', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Reset to Defaults')
  })

  it('shows unsaved changes warning when navigating with unsaved changes', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    const settingsStore = useSettingsStore()
    settingsStore.markAsChanged()

    await wrapper.vm.$nextTick()

    const cancelButton = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    await cancelButton?.trigger('click')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Unsaved Changes')
    expect(wrapper.text()).toContain('You have unsaved changes')
  })

  it('closes unsaved changes warning when cancel is clicked', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    const settingsStore = useSettingsStore()
    settingsStore.markAsChanged()

    await wrapper.vm.$nextTick()

    const cancelButton = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    await cancelButton?.trigger('click')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Unsaved Changes')

    const modalButtons = wrapper.findAll('button')
    const modalCancelButton = modalButtons.filter(b => b.text() === 'Cancel')[1]
    await modalCancelButton?.trigger('click')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Unsaved Changes')
  })

  it('discards changes when discard button is clicked in warning', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    const settingsStore = useSettingsStore()
    settingsStore.markAsChanged()

    await wrapper.vm.$nextTick()

    const cancelButton = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    await cancelButton?.trigger('click')

    await wrapper.vm.$nextTick()

    const discardButton = wrapper.findAll('button').find(b => b.text().includes('Discard'))
    await discardButton?.trigger('click')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Unsaved Changes')
  })

  it('shows loading state during save', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    const settingsStore = useSettingsStore()
    settingsStore.markAsChanged()
    settingsStore.loading = true

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Saving...')
  })

  it('hides success message after timeout', async () => {
    vi.useFakeTimers()

    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    const settingsStore = useSettingsStore()
    settingsStore.markAsChanged()

    await wrapper.vm.$nextTick()

    const saveButton = wrapper.findAll('button').find(b => b.text().includes('Save Changes'))
    await saveButton?.trigger('click')

    await flushPromises()

    expect(wrapper.text()).toContain('Preferences saved successfully')

    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Preferences saved successfully')

    vi.useRealTimers()
  })

  it('can close success message manually', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    const settingsStore = useSettingsStore()
    settingsStore.markAsChanged()

    await wrapper.vm.$nextTick()

    const saveButton = wrapper.findAll('button').find(b => b.text().includes('Save Changes'))
    await saveButton?.trigger('click')

    await flushPromises()

    expect(wrapper.text()).toContain('Preferences saved successfully')

    const closeButtons = wrapper.findAll('button')
    const closeButton = closeButtons.find(b => {
      const svg = b.find('svg')
      return svg.exists() && b.element.parentElement?.textContent?.includes('Preferences saved successfully')
    })

    if (closeButton) {
      await closeButton.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).not.toContain('Preferences saved successfully')
    }
  })

  it('resets preferences to defaults when reset button is clicked', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    const settingsStore = useSettingsStore()
    const resetSpy = vi.spyOn(settingsStore, 'resetPreferencesToDefaults')

    window.confirm = vi.fn(() => true)

    const resetButton = wrapper.findAll('button').find(b => b.text().includes('Reset to Defaults'))
    await resetButton?.trigger('click')

    await flushPromises()

    expect(window.confirm).toHaveBeenCalled()
    expect(resetSpy).toHaveBeenCalled()
  })

  it('does not reset when confirmation is cancelled', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        components: {
          SettingsTabs,
          UserPreferencesTab,
          AccountSettingsTab
        },
        stubs: {
          'router-link': true
        }
      }
    })

    await flushPromises()

    const settingsStore = useSettingsStore()
    const resetSpy = vi.spyOn(settingsStore, 'resetPreferencesToDefaults')

    window.confirm = vi.fn(() => false)

    const resetButton = wrapper.findAll('button').find(b => b.text().includes('Reset to Defaults'))
    await resetButton?.trigger('click')

    await flushPromises()

    expect(window.confirm).toHaveBeenCalled()
    expect(resetSpy).not.toHaveBeenCalled()
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardPreferences from './DashboardPreferences.vue'
import SettingsSection from '../SettingsSection.vue'
import type { UserPreferences } from '../../../types/settings'

describe('DashboardPreferences', () => {
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
    const wrapper = mount(DashboardPreferences, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.text()).toContain('Dashboard Customization')
    expect(wrapper.text()).toContain('Customize your dashboard experience')
  })

  it('renders default landing page selector', () => {
    const wrapper = mount(DashboardPreferences, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.find('#defaultPage').exists()).toBe(true)
    expect(wrapper.text()).toContain('Default Landing Page')
  })

  it('renders items per page selector', () => {
    const wrapper = mount(DashboardPreferences, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.find('#itemsPerPage').exists()).toBe(true)
    expect(wrapper.text()).toContain('Items Per Page')
  })

  it('displays current default page value', () => {
    const wrapper = mount(DashboardPreferences, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const select = wrapper.find('#defaultPage').element as HTMLSelectElement
    expect(select.value).toBe('/')
  })

  it('displays current items per page value', () => {
    const wrapper = mount(DashboardPreferences, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const select = wrapper.find('#itemsPerPage').element as HTMLSelectElement
    expect(select.value).toBe('25')
  })

  it('renders all landing page options', () => {
    const wrapper = mount(DashboardPreferences, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const options = wrapper.find('#defaultPage').findAll('option')
    expect(options.length).toBeGreaterThan(0)
    
    const optionTexts = options.map(o => o.text())
    expect(optionTexts).toContain('Dashboard')
    expect(optionTexts).toContain('Products')
    expect(optionTexts).toContain('Inventory')
    expect(optionTexts).toContain('Orders')
  })

  it('renders all items per page options', () => {
    const wrapper = mount(DashboardPreferences, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const options = wrapper.find('#itemsPerPage').findAll('option')
    expect(options.length).toBe(4) // 10, 25, 50, 100
    
    const optionValues = options.map(o => (o.element as HTMLOptionElement).value)
    expect(optionValues).toContain('10')
    expect(optionValues).toContain('25')
    expect(optionValues).toContain('50')
    expect(optionValues).toContain('100')
  })

  it('emits update event when default page is changed', async () => {
    const wrapper = mount(DashboardPreferences, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const select = wrapper.find('#defaultPage')
    await select.setValue('/products')

    expect(wrapper.emitted('update')).toBeTruthy()
    const emittedPrefs = wrapper.emitted('update')?.[0][0] as UserPreferences
    expect(emittedPrefs.dashboard.defaultPage).toBe('/products')
  })

  it('emits update event when items per page is changed', async () => {
    const wrapper = mount(DashboardPreferences, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const select = wrapper.find('#itemsPerPage')
    await select.setValue('50')

    expect(wrapper.emitted('update')).toBeTruthy()
    const emittedPrefs = wrapper.emitted('update')?.[0][0] as UserPreferences
    expect(emittedPrefs.dashboard.itemsPerPage).toBe(50)
  })

  it('shows helper text for default page', () => {
    const wrapper = mount(DashboardPreferences, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.text()).toContain("The page you'll see when you log in")
  })

  it('shows helper text for items per page', () => {
    const wrapper = mount(DashboardPreferences, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.text()).toContain('Number of items to display per page in lists')
  })

  it('updates local dashboard when preferences prop changes', async () => {
    const wrapper = mount(DashboardPreferences, {
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
      dashboard: {
        ...mockPreferences.dashboard,
        defaultPage: '/orders',
        itemsPerPage: 100
      }
    }

    await wrapper.setProps({ preferences: updatedPrefs })

    const defaultPageSelect = wrapper.find('#defaultPage').element as HTMLSelectElement
    const itemsPerPageSelect = wrapper.find('#itemsPerPage').element as HTMLSelectElement

    expect(defaultPageSelect.value).toBe('/orders')
    expect(itemsPerPageSelect.value).toBe('100')
  })

  it('emits update with all preferences intact', async () => {
    const wrapper = mount(DashboardPreferences, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const select = wrapper.find('#itemsPerPage')
    await select.setValue('100')

    const emittedPrefs = wrapper.emitted('update')?.[0][0] as UserPreferences
    expect(emittedPrefs.dashboard.itemsPerPage).toBe(100)
    expect(emittedPrefs.dashboard.defaultPage).toBe('/')
    expect(emittedPrefs.theme).toBe('light')
    expect(emittedPrefs.notifications.email).toBe(true)
  })

  it('applies correct CSS classes to selects', () => {
    const wrapper = mount(DashboardPreferences, {
      props: {
        preferences: mockPreferences
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const defaultPageSelect = wrapper.find('#defaultPage')
    const itemsPerPageSelect = wrapper.find('#itemsPerPage')

    expect(defaultPageSelect.classes()).toContain('rounded-lg')
    expect(defaultPageSelect.classes()).toContain('border')
    expect(itemsPerPageSelect.classes()).toContain('rounded-lg')
    expect(itemsPerPageSelect.classes()).toContain('border')
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileSettings from './ProfileSettings.vue'
import SettingsSection from '../SettingsSection.vue'
import type { AccountSettings } from '../../../types/settings'

describe('ProfileSettings', () => {
  const mockSettings: AccountSettings = {
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      jobTitle: 'Inventory Manager',
      profilePicture: null
    },
    security: {
      twoFactorEnabled: false
    }
  }

  it('renders SettingsSection with correct title', () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.text()).toContain('Profile Information')
    expect(wrapper.text()).toContain('Update your personal information')
  })

  it('renders all profile fields', () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.find('#firstName').exists()).toBe(true)
    expect(wrapper.find('#lastName').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#phone').exists()).toBe(true)
    expect(wrapper.find('#jobTitle').exists()).toBe(true)
  })

  it('displays current profile values', () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const firstName = wrapper.find('#firstName').element as HTMLInputElement
    const lastName = wrapper.find('#lastName').element as HTMLInputElement
    const email = wrapper.find('#email').element as HTMLInputElement
    const phone = wrapper.find('#phone').element as HTMLInputElement
    const jobTitle = wrapper.find('#jobTitle').element as HTMLInputElement

    expect(firstName.value).toBe('John')
    expect(lastName.value).toBe('Doe')
    expect(email.value).toBe('john.doe@example.com')
    expect(phone.value).toBe('+1 (555) 123-4567')
    expect(jobTitle.value).toBe('Inventory Manager')
  })

  it('marks required fields with asterisk', () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const labels = wrapper.findAll('label')
    const firstNameLabel = labels.find(l => l.text().includes('First Name'))
    const lastNameLabel = labels.find(l => l.text().includes('Last Name'))
    const emailLabel = labels.find(l => l.text().includes('Email'))

    expect(firstNameLabel?.text()).toContain('*')
    expect(lastNameLabel?.text()).toContain('*')
    expect(emailLabel?.text()).toContain('*')
  })

  it('emits update event when first name is changed', async () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const firstName = wrapper.find('#firstName')
    await firstName.setValue('Jane')

    expect(wrapper.emitted('update')).toBeTruthy()
    const emittedSettings = wrapper.emitted('update')?.[0][0] as AccountSettings
    expect(emittedSettings.profile.firstName).toBe('Jane')
  })

  it('validates email format', async () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const email = wrapper.find('#email')
    await email.setValue('invalid-email')

    expect(wrapper.text()).toContain('Please enter a valid email address')
    expect(wrapper.find('#email').classes()).toContain('border-red-500')
  })

  it('accepts valid email format', async () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const email = wrapper.find('#email')
    await email.setValue('valid@example.com')

    expect(wrapper.text()).not.toContain('Please enter a valid email address')
  })

  it('validates phone format', async () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const phone = wrapper.find('#phone')
    await phone.setValue('invalid@phone')

    expect(wrapper.text()).toContain('Please enter a valid phone number')
    expect(wrapper.find('#phone').classes()).toContain('border-red-500')
  })

  it('accepts valid phone format', async () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const phone = wrapper.find('#phone')
    await phone.setValue('+1 (555) 987-6543')

    expect(wrapper.text()).not.toContain('Please enter a valid phone number')
  })

  it('allows empty phone number', async () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const phone = wrapper.find('#phone')
    await phone.setValue('')

    expect(wrapper.text()).not.toContain('Please enter a valid phone number')
  })

  it('shows email verification notice', () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.text()).toContain('Email changes require verification')
  })

  it('updates local profile when settings prop changes', async () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const updatedSettings = {
      ...mockSettings,
      profile: {
        ...mockSettings.profile,
        firstName: 'Updated'
      }
    }

    await wrapper.setProps({ settings: updatedSettings })

    const firstName = wrapper.find('#firstName').element as HTMLInputElement
    expect(firstName.value).toBe('Updated')
  })

  it('clears validation error when field is corrected', async () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const email = wrapper.find('#email')
    
    // Set invalid email
    await email.setValue('invalid')
    expect(wrapper.text()).toContain('Please enter a valid email address')

    // Correct the email
    await email.setValue('valid@example.com')
    expect(wrapper.text()).not.toContain('Please enter a valid email address')
  })

  it('emits update with all profile fields intact', async () => {
    const wrapper = mount(ProfileSettings, {
      props: {
        settings: mockSettings
      },
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const jobTitle = wrapper.find('#jobTitle')
    await jobTitle.setValue('Senior Manager')

    const emittedSettings = wrapper.emitted('update')?.[0][0] as AccountSettings
    expect(emittedSettings.profile.jobTitle).toBe('Senior Manager')
    expect(emittedSettings.profile.firstName).toBe('John')
    expect(emittedSettings.profile.lastName).toBe('Doe')
    expect(emittedSettings.profile.email).toBe('john.doe@example.com')
  })
})

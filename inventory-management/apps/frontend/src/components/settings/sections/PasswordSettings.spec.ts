import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordSettings from './PasswordSettings.vue'
import SettingsSection from '../SettingsSection.vue'

describe('PasswordSettings', () => {
  it('renders SettingsSection with correct title', () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.text()).toContain('Password & Security')
    expect(wrapper.text()).toContain('Change your password and manage security settings')
  })

  it('renders all password fields', () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    expect(wrapper.find('#currentPassword').exists()).toBe(true)
    expect(wrapper.find('#newPassword').exists()).toBe(true)
    expect(wrapper.find('#confirmPassword').exists()).toBe(true)
  })

  it('renders password fields as password type by default', () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const currentPassword = wrapper.find('#currentPassword').element as HTMLInputElement
    const newPassword = wrapper.find('#newPassword').element as HTMLInputElement
    const confirmPassword = wrapper.find('#confirmPassword').element as HTMLInputElement

    expect(currentPassword.type).toBe('password')
    expect(newPassword.type).toBe('password')
    expect(confirmPassword.type).toBe('password')
  })

  it('toggles password visibility when eye icon is clicked', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const toggleButtons = wrapper.findAll('button[type="button"]')
    const currentPasswordToggle = toggleButtons[0]

    // Initially password type
    let currentPassword = wrapper.find('#currentPassword').element as HTMLInputElement
    expect(currentPassword.type).toBe('password')

    // Click to show
    await currentPasswordToggle.trigger('click')
    currentPassword = wrapper.find('#currentPassword').element as HTMLInputElement
    expect(currentPassword.type).toBe('text')

    // Click to hide
    await currentPasswordToggle.trigger('click')
    currentPassword = wrapper.find('#currentPassword').element as HTMLInputElement
    expect(currentPassword.type).toBe('password')
  })

  it('shows password strength indicator when new password is entered', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const newPassword = wrapper.find('#newPassword')
    await newPassword.setValue('weakpass')

    expect(wrapper.text()).toContain('Weak')
  })

  it('calculates password strength correctly - weak', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const newPassword = wrapper.find('#newPassword')
    await newPassword.setValue('weak')

    expect(wrapper.text()).toContain('Weak')
  })

  it('calculates password strength correctly - fair', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const newPassword = wrapper.find('#newPassword')
    // Password with 8+ chars, lowercase, uppercase, number = score 3 = Fair
    await newPassword.setValue('Password1')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Fair')
  })

  it('calculates password strength correctly - good', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const newPassword = wrapper.find('#newPassword')
    await newPassword.setValue('Password1234')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Good')
  })

  it('calculates password strength correctly - strong', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const newPassword = wrapper.find('#newPassword')
    await newPassword.setValue('Password123!@#')

    expect(wrapper.text()).toContain('Strong')
  })

  it('shows error when password is too short', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const newPassword = wrapper.find('#newPassword')
    await newPassword.setValue('short')

    expect(wrapper.text()).toContain('Password must be at least 8 characters')
  })

  it('shows error when passwords do not match', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const newPassword = wrapper.find('#newPassword')
    const confirmPassword = wrapper.find('#confirmPassword')

    await newPassword.setValue('password123')
    await confirmPassword.setValue('different123')

    expect(wrapper.text()).toContain('Passwords do not match')
  })

  it('disables submit button when form is invalid', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const submitButton = wrapper.findAll('button').find(b => b.text().includes('Change Password'))
    expect(submitButton?.classes()).toContain('cursor-not-allowed')
  })

  it('enables submit button when form is valid', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const currentPassword = wrapper.find('#currentPassword')
    const newPassword = wrapper.find('#newPassword')
    const confirmPassword = wrapper.find('#confirmPassword')

    await currentPassword.setValue('oldPassword123')
    await newPassword.setValue('newPassword456')
    await confirmPassword.setValue('newPassword456')

    const submitButton = wrapper.findAll('button').find(b => b.text().includes('Change Password'))
    expect(submitButton?.classes()).not.toContain('cursor-not-allowed')
  })

  it('emits change-password event when form is submitted', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const currentPassword = wrapper.find('#currentPassword')
    const newPassword = wrapper.find('#newPassword')
    const confirmPassword = wrapper.find('#confirmPassword')

    await currentPassword.setValue('oldPassword123')
    await newPassword.setValue('newPassword456')
    await confirmPassword.setValue('newPassword456')

    const submitButton = wrapper.findAll('button').find(b => b.text().includes('Change Password'))
    await submitButton?.trigger('click')

    expect(wrapper.emitted('change-password')).toBeTruthy()
    const emittedData = wrapper.emitted('change-password')?.[0][0]
    expect(emittedData).toEqual({
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456',
      confirmPassword: 'newPassword456'
    })
  })

  it('clears form after successful submission', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const currentPassword = wrapper.find('#currentPassword')
    const newPassword = wrapper.find('#newPassword')
    const confirmPassword = wrapper.find('#confirmPassword')

    await currentPassword.setValue('oldPassword123')
    await newPassword.setValue('newPassword456')
    await confirmPassword.setValue('newPassword456')

    const submitButton = wrapper.findAll('button').find(b => b.text().includes('Change Password'))
    await submitButton?.trigger('click')

    // Check that fields are cleared
    const currentPasswordEl = wrapper.find('#currentPassword').element as HTMLInputElement
    const newPasswordEl = wrapper.find('#newPassword').element as HTMLInputElement
    const confirmPasswordEl = wrapper.find('#confirmPassword').element as HTMLInputElement

    expect(currentPasswordEl.value).toBe('')
    expect(newPasswordEl.value).toBe('')
    expect(confirmPasswordEl.value).toBe('')
  })

  it('does not submit when current password is empty', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const newPassword = wrapper.find('#newPassword')
    const confirmPassword = wrapper.find('#confirmPassword')

    await newPassword.setValue('newPassword456')
    await confirmPassword.setValue('newPassword456')

    const submitButton = wrapper.findAll('button').find(b => b.text().includes('Change Password'))
    await submitButton?.trigger('click')

    expect(wrapper.emitted('change-password')).toBeFalsy()
  })

  it('does not submit when passwords do not match', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const currentPassword = wrapper.find('#currentPassword')
    const newPassword = wrapper.find('#newPassword')
    const confirmPassword = wrapper.find('#confirmPassword')

    await currentPassword.setValue('oldPassword123')
    await newPassword.setValue('newPassword456')
    await confirmPassword.setValue('different456')

    const submitButton = wrapper.findAll('button').find(b => b.text().includes('Change Password'))
    await submitButton?.trigger('click')

    expect(wrapper.emitted('change-password')).toBeFalsy()
  })

  it('hides password strength indicator when new password is empty', async () => {
    const wrapper = mount(PasswordSettings, {
      global: {
        components: {
          SettingsSection
        }
      }
    })

    const newPassword = wrapper.find('#newPassword')
    await newPassword.setValue('Password1')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Fair')

    await newPassword.setValue('')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).not.toContain('Weak')
    expect(wrapper.text()).not.toContain('Fair')
    expect(wrapper.text()).not.toContain('Good')
    expect(wrapper.text()).not.toContain('Strong')
  })
})

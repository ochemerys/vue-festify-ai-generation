import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import ForgotPasswordPage from './ForgotPasswordPage.vue'

vi.mock('lucide-vue-next', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    Mail: { name: 'Mail', template: '<div></div>' },
    ArrowLeft: { name: 'ArrowLeft', template: '<div></div>' },
    Send: { name: 'Send', template: '<div></div>' }
  }
})

vi.mock('vue-router', async (orig) => {
  const actual = await (orig as any)()
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() })
  }
})

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('validates email field', async () => {
    const wrapper = mount(ForgotPasswordPage)
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Email is required')

    const emailInput = wrapper.find('input[type="email"]')
    await emailInput.setValue('bad-email')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Invalid email format')
  })

  it('calls requestPasswordReset and shows message', async () => {
    const wrapper = mount(ForgotPasswordPage)
    const authStore = useAuthStore()
    const resetSpy = vi.spyOn(authStore, 'requestPasswordReset').mockReturnValueOnce({ success: true, message: 'Password reset link sent to your email' })
    
    const emailInput = wrapper.find('input[type="email"]')
    await emailInput.setValue('admin@inventory.local')
    await wrapper.find('form').trigger('submit.prevent')
    // wait for async setTimeout in component
    await new Promise((r) => setTimeout(r, 900))
    await wrapper.vm.$nextTick()

    expect(resetSpy).toHaveBeenCalledWith('admin@inventory.local')
    expect(wrapper.text()).toContain('Password reset link sent to your email')
  })
})

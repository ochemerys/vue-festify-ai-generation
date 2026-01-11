import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import SignupPage from './SignupPage.vue'

vi.mock('lucide-vue-next', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    Eye: { name: 'Eye', template: '<div></div>' },
    EyeOff: { name: 'EyeOff', template: '<div></div>' },
    UserPlus: { name: 'UserPlus', template: '<div></div>' }
  }
})

const routerPush = vi.fn()
vi.mock('vue-router', async (orig) => {
  const actual = await (orig as any)()
  return {
    ...actual,
    useRouter: () => ({ push: routerPush })
  }
})

describe('SignupPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    routerPush.mockReset()
    vi.clearAllMocks()
  })

  it('validates required fields and matching passwords', async () => {
    const wrapper = mount(SignupPage)
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('First name is required')
    expect(wrapper.text()).toContain('Last name is required')
    expect(wrapper.text()).toContain('Email is required')
    expect(wrapper.text()).toContain('Password is required')
  })

  it('shows validation for email format and password length', async () => {
    const wrapper = mount(SignupPage)
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('A') // firstName
    await inputs[1].setValue('B') // lastName
    await inputs[2].setValue('bad-email') // email
    await inputs[3].setValue('short') // password
    await inputs[4].setValue('short') // confirmPassword
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Invalid email format')
    expect(wrapper.text()).toContain('Password must be at least 8 characters')
  })

  it('calls signup and handles duplicate email error', async () => {
    const wrapper = mount(SignupPage)
    const authStore = useAuthStore()
    const signupSpy = vi.spyOn(authStore, 'signup').mockReturnValueOnce({ success: false, error: 'Email is already registered' })
    
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('A') // firstName
    await inputs[1].setValue('B') // lastName
    await inputs[2].setValue('admin@inventory.local') // email
    await inputs[3].setValue('password123') // password
    await inputs[4].setValue('password123') // confirmPassword
    await wrapper.find('form').trigger('submit.prevent')
    await new Promise((r) => setTimeout(r, 900))
    await wrapper.vm.$nextTick()

    expect(signupSpy).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Email is already registered')
  })

  it('navigates to dashboard on successful signup', async () => {
    const wrapper = mount(SignupPage)
    const authStore = useAuthStore()
    const signupSpy = vi.spyOn(authStore, 'signup').mockReturnValueOnce({ success: true })
    
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('A') // firstName
    await inputs[1].setValue('B') // lastName
    await inputs[2].setValue('new@inventory.local') // email
    await inputs[3].setValue('password123') // password
    await inputs[4].setValue('password123') // confirmPassword
    await wrapper.find('form').trigger('submit.prevent')
    await new Promise((r) => setTimeout(r, 900))
    await wrapper.vm.$nextTick()

    expect(signupSpy).toHaveBeenCalled()
    expect(routerPush).toHaveBeenCalledWith('/')
  })
})

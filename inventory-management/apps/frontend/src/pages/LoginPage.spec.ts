import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { apiClient } from '../services/api'
import LoginPage from './LoginPage.vue'

// Mock lucide-vue-next
vi.mock('lucide-vue-next', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    Eye: { name: 'Eye', template: '<div></div>' },
    EyeOff: { name: 'EyeOff', template: '<div></div>' },
    LogIn: { name: 'LogIn', template: '<div></div>' }
  }
})

// Mock API client
vi.mock('../services/api', () => ({
  apiClient: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshAccessToken: vi.fn(),
    isTokenExpired: vi.fn(),
    setToken: vi.fn(),
    makeRequest: vi.fn(),
  },
}))

const routerPush = vi.fn()
vi.mock('vue-router', async (orig) => {
  const actual = await (orig as any)()
  return {
    ...actual,
    useRouter: () => ({ push: routerPush })
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    routerPush.mockReset()
    vi.clearAllMocks()
  })

  it('shows email required error when email is empty', async () => {
    const wrapper = mount(LoginPage)
    const inputs = wrapper.findAll('input')
    await inputs[1].setValue('password123') // password only
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Email is required')
  })

  it('shows password required error when password is empty', async () => {
    const wrapper = mount(LoginPage)
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('user@example.com') // email only
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Password is required')
  })

  it('shows error on short password', async () => {
    const wrapper = mount(LoginPage)
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('user@example.com') // email
    await inputs[1].setValue('short') // password
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Password must be at least 8 characters')
  })

  it('calls store login on submit with valid credentials', async () => {
    const mockUser = {
      id: '1',
      email: 'admin@inventory.local',
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
    }

    vi.mocked(apiClient.login).mockResolvedValue({
      success: true,
      data: {
        accessToken: 'test-token-123',
        user: mockUser,
        expiresIn: 3600,
        tokenType: 'Bearer',
      },
    } as any)

    const wrapper = mount(LoginPage)
    const authStore = useAuthStore()
    const loginSpy = vi.spyOn(authStore, 'login')
    
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('admin@inventory.local') // email
    await inputs[1].setValue('password123') // password
    await wrapper.find('form').trigger('submit.prevent')
    
    // Wait for async login to complete
    await new Promise((r) => setTimeout(r, 100))
    await wrapper.vm.$nextTick()

    expect(loginSpy).toHaveBeenCalledWith('admin@inventory.local', 'password123')
    expect(routerPush).toHaveBeenCalledWith('/')
  })
})

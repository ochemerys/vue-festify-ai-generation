<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, LogIn } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<{ email?: string; password?: string }>({})

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    fieldErrors.value.email = 'Email is required'
    return false
  }
  if (!emailRegex.test(email.value)) {
    fieldErrors.value.email = 'Invalid email format'
    return false
  }
  delete fieldErrors.value.email
  return true
}

const validatePassword = () => {
  if (!password.value) {
    fieldErrors.value.password = 'Password is required'
    return false
  }
  if (password.value.length < 8) {
    fieldErrors.value.password = 'Password must be at least 8 characters'
    return false
  }
  delete fieldErrors.value.password
  return true
}

const handleSubmit = async () => {
  error.value = null
  if (!validateEmail() || !validatePassword()) return
  loading.value = true
  try {
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800))

    // Attempt login with auth store
    const result = authStore.login(email.value, password.value)

    if (!result.success) {
      error.value = result.error || 'Login failed'
      return
    }

    // Save email if remember me is checked
    if (rememberMe.value) {
      localStorage.setItem('rememberedEmail', email.value)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    // Redirect to dashboard on successful login
    router.push('/')
  } catch (e: any) {
    error.value = e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// Load remembered email on mount
if (typeof window !== 'undefined') {
  const remembered = localStorage.getItem('rememberedEmail')
  if (remembered) {
    email.value = remembered
    rememberMe.value = true
  }
}

</script>

<template>
  <div class="min-h-screen w-screen flex items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-md">
      <!-- Brand -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg mb-2">IM</div>
        <h1 class="text-xl font-semibold text-slate-900">Inventory Management</h1>
        <p class="text-sm text-slate-600">Sign in to continue</p>
      </div>

      <!-- Card -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <!-- Error banner -->
        <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit" aria-label="Login form" class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input id="email" type="email" v-model="email" :aria-invalid="!!fieldErrors.email" :aria-describedby="fieldErrors.email ? 'email-error' : undefined" class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" :class="fieldErrors.email ? 'border-red-300' : 'border-slate-300'" placeholder="you@example.com" />
            <p v-if="fieldErrors.email" id="email-error" class="mt-1 text-xs text-red-600">{{ fieldErrors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div class="relative">
              <input id="password" :type="showPassword ? 'text' : 'password'" v-model="password" :aria-invalid="!!fieldErrors.password" :aria-describedby="fieldErrors.password ? 'password-error' : undefined" class="w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" :class="fieldErrors.password ? 'border-red-300' : 'border-slate-300'" placeholder="Your secure password" />
              <button type="button" class="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700" :aria-label="showPassword ? 'Hide password' : 'Show password'" :aria-pressed="showPassword" @click="togglePassword">
                <component :is="showPassword ? EyeOff : Eye" :size="18" />
              </button>
            </div>
            <p v-if="fieldErrors.password" id="password-error" class="mt-1 text-xs text-red-600">{{ fieldErrors.password }}</p>
          </div>

          <!-- Remember me -->
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" v-model="rememberMe" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            Remember me
          </label>

          <!-- Submit -->
          <button type="submit" class="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" :disabled="loading">
            <LogIn :size="18" />
            <span>{{ loading ? 'Logging in...' : 'Login' }}</span>
          </button>

          <!-- Links -->
          <div class="flex items-center justify-between text-sm">
            <router-link to="/forgot-password" class="text-blue-600 hover:text-blue-700">Forgot password?</router-link>
            <router-link to="/signup" class="text-blue-600 hover:text-blue-700">Sign up</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

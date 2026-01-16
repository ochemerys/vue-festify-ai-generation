<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, UserPlus } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<{ firstName?: string; lastName?: string; email?: string; password?: string; confirmPassword?: string }>({})

const validate = () => {
  fieldErrors.value = {}
  if (!firstName.value) fieldErrors.value.firstName = 'First name is required'
  if (!lastName.value) fieldErrors.value.lastName = 'Last name is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) fieldErrors.value.email = 'Email is required'
  else if (!emailRegex.test(email.value)) fieldErrors.value.email = 'Invalid email format'
  if (!password.value) fieldErrors.value.password = 'Password is required'
  else if (password.value.length < 8) fieldErrors.value.password = 'Password must be at least 8 characters'
  if (confirmPassword.value !== password.value) fieldErrors.value.confirmPassword = 'Passwords do not match'
  return Object.keys(fieldErrors.value).length === 0
}

const handleSubmit = async () => {
  error.value = null
  if (!validate()) return
  loading.value = true
  try {
    const res = await authStore.signup({ email: email.value, password: password.value, firstName: firstName.value, lastName: lastName.value })
    if (!res.success) {
      error.value = res.error || 'Sign up failed'
      return
    }
    router.push('/')
  } catch (e: any) {
    error.value = e?.message || 'Sign up failed'
  } finally {
    loading.value = false
  }
}

const togglePassword = () => { showPassword.value = !showPassword.value }
</script>

<template>
  <div class="min-h-screen w-screen flex items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-md">
      <!-- Brand -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg mb-2">IM</div>
        <h1 class="text-xl font-semibold text-slate-900">Create your account</h1>
        <p class="text-sm text-slate-600">Join Inventory Management</p>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1" for="firstName">First name</label>
              <input id="firstName" v-model="firstName" class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" :class="fieldErrors.firstName ? 'border-red-300' : 'border-slate-300'" />
              <p v-if="fieldErrors.firstName" class="mt-1 text-xs text-red-600">{{ fieldErrors.firstName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1" for="lastName">Last name</label>
              <input id="lastName" v-model="lastName" class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" :class="fieldErrors.lastName ? 'border-red-300' : 'border-slate-300'" />
              <p v-if="fieldErrors.lastName" class="mt-1 text-xs text-red-600">{{ fieldErrors.lastName }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1" for="email">Email</label>
            <input id="email" type="email" v-model="email" class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" :class="fieldErrors.email ? 'border-red-300' : 'border-slate-300'" placeholder="you@example.com" />
            <p v-if="fieldErrors.email" class="mt-1 text-xs text-red-600">{{ fieldErrors.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1" for="password">Password</label>
            <div class="relative">
              <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" class="w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" :class="fieldErrors.password ? 'border-red-300' : 'border-slate-300'" placeholder="At least 8 characters" />
              <button type="button" class="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700" :aria-label="showPassword ? 'Hide password' : 'Show password'" :aria-pressed="showPassword" @click="togglePassword">
                <component :is="showPassword ? EyeOff : Eye" :size="18" />
              </button>
            </div>
            <p v-if="fieldErrors.password" class="mt-1 text-xs text-red-600">{{ fieldErrors.password }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1" for="confirmPassword">Confirm password</label>
            <input :type="showPassword ? 'text' : 'password'" id="confirmPassword" v-model="confirmPassword" class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" :class="fieldErrors.confirmPassword ? 'border-red-300' : 'border-slate-300'" />
            <p v-if="fieldErrors.confirmPassword" class="mt-1 text-xs text-red-600">{{ fieldErrors.confirmPassword }}</p>
          </div>

          <button type="submit" class="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" :disabled="loading">
            <UserPlus :size="18" />
            <span>{{ loading ? 'Creating account...' : 'Create account' }}</span>
          </button>

          <div class="flex items-center justify-between text-sm">
            <router-link to="/login" class="text-blue-600 hover:text-blue-700">Already have an account? Log in</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { Mail, ArrowLeft, Send } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const email = ref('')
const loading = ref(false)
const message = ref<string | null>(null)
const error = ref<string | null>(null)
const fieldErrors = ref<{ email?: string }>({})

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

const handleSubmit = async () => {
  error.value = null
  message.value = null
  if (!validateEmail()) return
  loading.value = true
  try {
    const res = await authStore.requestPasswordReset(email.value)
    if (!res.success) {
      message.value = res.message || 'If the email exists, a reset link will be sent'
    } else {
      message.value = res.message || 'Password reset link sent'
    }
  } catch (e: any) {
    error.value = e?.message || 'Request failed'
  } finally {
    loading.value = false
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
        <p class="text-sm text-slate-600">Reset your password</p>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
          {{ error }}
        </div>
        <div v-if="message" class="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm" role="status">
          {{ message }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div class="relative">
              <input id="email" type="email" v-model="email" :aria-invalid="!!fieldErrors.email" :aria-describedby="fieldErrors.email ? 'email-error' : undefined" class="w-full rounded-lg border pl-4 pr-11 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" :class="fieldErrors.email ? 'border-red-300' : 'border-slate-300'" placeholder="you@example.com" />
              <Mail :size="18" class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <p v-if="fieldErrors.email" id="email-error" class="mt-1 text-xs text-red-600">{{ fieldErrors.email }}</p>
          </div>

          <button type="submit" class="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" :disabled="loading">
            <Send :size="18" />
            <span>{{ loading ? 'Sending...' : 'Send reset link' }}</span>
          </button>

          <div class="flex items-center justify-between text-sm">
            <router-link to="/login" class="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900">
              <ArrowLeft :size="14" />
              Back to login
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

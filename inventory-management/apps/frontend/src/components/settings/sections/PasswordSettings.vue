<script setup lang="ts">
import { ref, computed } from 'vue'
import SettingsSection from '../SettingsSection.vue'
import type { PasswordChangeData } from '../../../types/settings'

/**
 * PasswordSettings.vue - Password change section
 */

interface Emits {
  (e: 'change-password', data: PasswordChangeData): void
}

const emit = defineEmits<Emits>()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Password strength calculation
const passwordStrength = computed(() => {
  const password = newPassword.value
  if (!password) return { score: 0, label: '', color: '' }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
  if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' }
  if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' }
  return { score, label: 'Strong', color: 'bg-green-500' }
})

const errors = computed(() => {
  const errs: string[] = []
  
  if (newPassword.value && newPassword.value.length < 8) {
    errs.push('Password must be at least 8 characters')
  }
  
  if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
    errs.push('Passwords do not match')
  }
  
  return errs
})

const canSubmit = computed(() => {
  return currentPassword.value.length > 0 &&
         newPassword.value.length >= 8 &&
         newPassword.value === confirmPassword.value &&
         errors.value.length === 0
})

const handleSubmit = () => {
  if (!canSubmit.value) return

  emit('change-password', {
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
    confirmPassword: confirmPassword.value
  })

  // Clear form
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}
</script>

<template>
  <SettingsSection
    title="Password & Security"
    description="Change your password and manage security settings"
  >
    <div class="space-y-4">
      <!-- Current Password -->
      <div>
        <label
          for="currentPassword"
          class="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1"
        >
          Current Password <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            id="currentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            v-model="currentPassword"
            class="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter current password"
            required
          >
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            @click="showCurrentPassword = !showCurrentPassword"
          >
            <svg
              v-if="!showCurrentPassword"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- New Password -->
      <div>
        <label
          for="newPassword"
          class="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1"
        >
          New Password <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            id="newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            v-model="newPassword"
            class="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter new password"
            required
          >
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            @click="showNewPassword = !showNewPassword"
          >
            <svg
              v-if="!showNewPassword"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          </button>
        </div>
        <!-- Password Strength Indicator -->
        <div
          v-if="newPassword"
          class="mt-2"
        >
          <div class="flex items-center gap-2 mb-1">
            <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                :class="[passwordStrength.color, 'h-full transition-all duration-300']"
                :style="{ width: `${(passwordStrength.score / 5) * 100}%` }"
              />
            </div>
            <span class="text-xs font-medium text-slate-600 dark:text-slate-400">
              {{ passwordStrength.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Confirm Password -->
      <div>
        <label
          for="confirmPassword"
          class="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1"
        >
          Confirm New Password <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            id="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="confirmPassword"
            class="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm new password"
            required
          >
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <svg
              v-if="!showConfirmPassword"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Errors -->
      <div
        v-if="errors.length > 0"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
      >
        <ul class="text-sm text-red-600 dark:text-red-400 space-y-1">
          <li
            v-for="(error, index) in errors"
            :key="index"
          >
            • {{ error }}
          </li>
        </ul>
      </div>

      <!-- Submit Button -->
      <div class="pt-2">
        <button
          type="button"
          :disabled="!canSubmit"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            canSubmit
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
          ]"
          @click="handleSubmit"
        >
          Change Password
        </button>
      </div>
    </div>
  </SettingsSection>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '../../../stores/settingsStore'
import ProfileSettings from '../sections/ProfileSettings.vue'
import PasswordSettings from '../sections/PasswordSettings.vue'
import type { AccountSettings, PasswordChangeData } from '../../../types/settings'

/**
 * AccountSettingsTab.vue - Account settings tab content
 */

const settingsStore = useSettingsStore()

const localSettings = ref<AccountSettings | null>(null)
const passwordChangeMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

// Watch for changes in store
watch(() => settingsStore.accountSettings, (newSettings) => {
  if (newSettings) {
    localSettings.value = { ...newSettings }
  }
}, { immediate: true, deep: true })

const handleUpdate = (updatedSettings: AccountSettings) => {
  localSettings.value = updatedSettings
  settingsStore.markAsChanged()
}

const handlePasswordChange = async (data: PasswordChangeData) => {
  passwordChangeMessage.value = null
  const result = await settingsStore.changePassword(data)
  
  if (result.success) {
    passwordChangeMessage.value = {
      type: 'success',
      text: result.message || 'Password changed successfully'
    }
    // Clear message after 5 seconds
    setTimeout(() => {
      passwordChangeMessage.value = null
    }, 5000)
  } else {
    passwordChangeMessage.value = {
      type: 'error',
      text: result.error || 'Failed to change password'
    }
  }
}
</script>

<template>
  <div
    v-if="localSettings"
    class="space-y-6"
  >
    <!-- Password Change Message -->
    <div
      v-if="passwordChangeMessage"
      :class="[
        'p-4 rounded-lg border',
        passwordChangeMessage.type === 'success'
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
      ]"
    >
      <div class="flex items-center">
        <svg
          v-if="passwordChangeMessage.type === 'success'"
          class="w-5 h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          class="w-5 h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="text-sm font-medium">{{ passwordChangeMessage.text }}</span>
        <button
          class="ml-auto"
          @click="passwordChangeMessage = null"
        >
          <svg
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <ProfileSettings
      :settings="localSettings"
      @update="handleUpdate"
    />
    
    <PasswordSettings
      @change-password="handlePasswordChange"
    />
  </div>
  <div
    v-else
    class="flex items-center justify-center py-12"
  >
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      <p class="mt-4 text-slate-600 dark:text-slate-400">
        Loading account settings...
      </p>
    </div>
  </div>
</template>

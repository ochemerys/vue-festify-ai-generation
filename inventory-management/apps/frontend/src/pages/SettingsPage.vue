<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useSettingsStore } from '../stores/settingsStore'
import SettingsTabs from '../components/settings/SettingsTabs.vue'
import UserPreferencesTab from '../components/settings/tabs/UserPreferencesTab.vue'
import AccountSettingsTab from '../components/settings/tabs/AccountSettingsTab.vue'

/**
 * SettingsPage.vue - Main settings page
 * 
 * Features:
 * - Tabbed interface for different settings categories
 * - Unsaved changes warning
 * - Save/Cancel/Reset actions
 * - Loading states
 * - Success/Error notifications
 */

const router = useRouter()
const settingsStore = useSettingsStore()

const activeTab = ref('user-preferences')
const saveMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)
const showUnsavedWarning = ref(false)
const pendingNavigation = ref<(() => void) | null>(null)

const tabs = [
  { id: 'user-preferences', label: 'User Preferences' },
  { id: 'account', label: 'Account Settings' }
]

// Load settings on mount
onMounted(async () => {
  settingsStore.initializePreferences()
  await settingsStore.loadUserPreferences()
  await settingsStore.loadAccountSettings()
})

// Computed
const hasUnsavedChanges = computed(() => settingsStore.hasUnsavedChanges)
const isLoading = computed(() => settingsStore.loading)

// Handle tab change
const handleTabChange = (tabId: string) => {
  if (hasUnsavedChanges.value) {
    showUnsavedWarning.value = true
    pendingNavigation.value = () => {
      activeTab.value = tabId
      settingsStore.setActiveTab(tabId)
      showUnsavedWarning.value = false
      pendingNavigation.value = null
    }
  } else {
    activeTab.value = tabId
    settingsStore.setActiveTab(tabId)
  }
}

// Save settings
const handleSave = async () => {
  saveMessage.value = null
  
  try {
    let result
    
    if (activeTab.value === 'user-preferences' && settingsStore.userPreferences) {
      result = await settingsStore.saveUserPreferences(settingsStore.userPreferences)
    } else if (activeTab.value === 'account' && settingsStore.accountSettings) {
      result = await settingsStore.saveAccountSettings(settingsStore.accountSettings)
    }
    
    if (result?.success) {
      saveMessage.value = {
        type: 'success',
        text: result.message || 'Settings saved successfully'
      }
      // Clear message after 3 seconds
      setTimeout(() => {
        saveMessage.value = null
      }, 3000)
    } else {
      saveMessage.value = {
        type: 'error',
        text: result?.error || 'Failed to save settings'
      }
    }
  } catch (error) {
    saveMessage.value = {
      type: 'error',
      text: 'An error occurred while saving settings'
    }
  }
}

// Cancel changes
const handleCancel = () => {
  if (hasUnsavedChanges.value) {
    showUnsavedWarning.value = true
    pendingNavigation.value = async () => {
      // Reload settings from store/API
      if (activeTab.value === 'user-preferences') {
        await settingsStore.loadUserPreferences()
      } else if (activeTab.value === 'account') {
        await settingsStore.loadAccountSettings()
      }
      settingsStore.unsavedChanges = false
      showUnsavedWarning.value = false
      pendingNavigation.value = null
    }
  }
}

// Reset to defaults
const handleReset = async () => {
  if (activeTab.value === 'user-preferences') {
    if (confirm('Are you sure you want to reset all preferences to defaults?')) {
      const result = await settingsStore.resetPreferencesToDefaults()
      if (result.success) {
        saveMessage.value = {
          type: 'success',
          text: result.message || 'Preferences reset to defaults'
        }
        setTimeout(() => {
          saveMessage.value = null
        }, 3000)
      }
    }
  }
}

// Confirm unsaved changes
const confirmUnsavedChanges = () => {
  if (pendingNavigation.value) {
    pendingNavigation.value()
  }
}

// Cancel unsaved changes warning
const cancelUnsavedChanges = () => {
  showUnsavedWarning.value = false
  pendingNavigation.value = null
}

// Warn before leaving page with unsaved changes
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('You have unsaved changes. Do you want to leave without saving?')
    if (answer) {
      settingsStore.unsavedChanges = false
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})

// Warn before closing browser tab
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p class="mt-2 text-slate-600 dark:text-slate-400">
          Manage your account settings and preferences
        </p>
      </div>

      <!-- Save Message -->
      <div
        v-if="saveMessage"
        :class="[
          'mb-6 p-4 rounded-lg border flex items-center justify-between',
          saveMessage.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        ]"
      >
        <div class="flex items-center">
          <svg
            v-if="saveMessage.type === 'success'"
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
          <span class="text-sm font-medium">{{ saveMessage.text }}</span>
        </div>
        <button
          @click="saveMessage = null"
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

      <!-- Settings Container -->
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <!-- Tabs -->
        <div class="px-6 pt-6">
          <SettingsTabs
            :tabs="tabs"
            :active-tab="activeTab"
            @update:active-tab="handleTabChange"
          />
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <UserPreferencesTab v-if="activeTab === 'user-preferences'" />
          <AccountSettingsTab v-else-if="activeTab === 'account'" />
        </div>

        <!-- Action Buttons -->
        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between rounded-b-lg">
          <div class="flex gap-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              @click="handleCancel"
            >
              Cancel
            </button>
            <button
              v-if="activeTab === 'user-preferences'"
              type="button"
              class="px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              @click="handleReset"
            >
              Reset to Defaults
            </button>
          </div>
          <button
            type="button"
            :disabled="!hasUnsavedChanges || isLoading"
            :class="[
              'px-6 py-2 rounded-lg font-medium text-sm transition-colors',
              hasUnsavedChanges && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
            ]"
            @click="handleSave"
          >
            <span v-if="isLoading">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Unsaved Changes Warning Modal -->
    <div
      v-if="showUnsavedWarning"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="cancelUnsavedChanges"
    >
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Unsaved Changes
        </h3>
        <p class="text-slate-600 dark:text-slate-400 mb-6">
          You have unsaved changes. Are you sure you want to continue without saving?
        </p>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            @click="cancelUnsavedChanges"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
            @click="confirmUnsavedChanges"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

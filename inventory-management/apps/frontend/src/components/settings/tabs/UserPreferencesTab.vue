<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '../../../stores/settingsStore'
import ThemeSettings from '../sections/ThemeSettings.vue'
import NotificationSettings from '../sections/NotificationSettings.vue'
import DashboardPreferences from '../sections/DashboardPreferences.vue'
import type { UserPreferences } from '../../../types/settings'

/**
 * UserPreferencesTab.vue - User preferences tab content
 */

const settingsStore = useSettingsStore()

const localPreferences = ref<UserPreferences | null>(null)

// Watch for changes in store
watch(() => settingsStore.userPreferences, (newPrefs) => {
  if (newPrefs) {
    localPreferences.value = { ...newPrefs }
  }
}, { immediate: true, deep: true })

const handleUpdate = (updatedPreferences: UserPreferences) => {
  localPreferences.value = updatedPreferences
  settingsStore.markAsChanged()
}
</script>

<template>
  <div
    v-if="localPreferences"
    class="space-y-6"
  >
    <ThemeSettings
      :preferences="localPreferences"
      @update="handleUpdate"
    />
    
    <NotificationSettings
      :preferences="localPreferences"
      @update="handleUpdate"
    />
    
    <DashboardPreferences
      :preferences="localPreferences"
      @update="handleUpdate"
    />
  </div>
  <div
    v-else
    class="flex items-center justify-center py-12"
  >
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      <p class="mt-4 text-slate-600 dark:text-slate-400">
        Loading preferences...
      </p>
    </div>
  </div>
</template>

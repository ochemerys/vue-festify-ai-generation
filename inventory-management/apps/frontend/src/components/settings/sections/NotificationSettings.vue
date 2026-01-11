<script setup lang="ts">
import { ref, watch } from 'vue'
import SettingsSection from '../SettingsSection.vue'
import type { UserPreferences } from '../../../types/settings'

/**
 * NotificationSettings.vue - Notification preferences section
 */

interface Props {
  preferences: UserPreferences
}

interface Emits {
  (e: 'update', preferences: UserPreferences): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localNotifications = ref({ ...props.preferences.notifications })

watch(() => props.preferences.notifications, (newNotifications) => {
  localNotifications.value = { ...newNotifications }
}, { deep: true })

const updateNotification = (key: keyof typeof localNotifications.value, value: boolean) => {
  localNotifications.value[key] = value
  emit('update', {
    ...props.preferences,
    notifications: { ...localNotifications.value }
  })
}
</script>

<template>
  <SettingsSection
    title="Notifications"
    description="Manage your notification preferences"
  >
    <div class="space-y-4">
      <!-- Email Notifications -->
      <div class="pb-4 border-b border-slate-200 dark:border-slate-700">
        <h4 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
          Email Notifications
        </h4>
        <div class="space-y-3">
          <label class="flex items-center justify-between">
            <div>
              <div class="text-sm text-slate-900 dark:text-slate-100">
                Enable email notifications
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Receive notifications via email
              </div>
            </div>
            <input
              type="checkbox"
              :checked="localNotifications.email"
              class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              @change="updateNotification('email', ($event.target as HTMLInputElement).checked)"
            >
          </label>

          <label class="flex items-center justify-between ml-6">
            <div>
              <div class="text-sm text-slate-900 dark:text-slate-100">
                Low stock alerts
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Get notified when products are low in stock
              </div>
            </div>
            <input
              type="checkbox"
              :checked="localNotifications.lowStock"
              :disabled="!localNotifications.email"
              class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
              @change="updateNotification('lowStock', ($event.target as HTMLInputElement).checked)"
            >
          </label>

          <label class="flex items-center justify-between ml-6">
            <div>
              <div class="text-sm text-slate-900 dark:text-slate-100">
                Order updates
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Receive updates about order status changes
              </div>
            </div>
            <input
              type="checkbox"
              :checked="localNotifications.orderUpdates"
              :disabled="!localNotifications.email"
              class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
              @change="updateNotification('orderUpdates', ($event.target as HTMLInputElement).checked)"
            >
          </label>

          <label class="flex items-center justify-between ml-6">
            <div>
              <div class="text-sm text-slate-900 dark:text-slate-100">
                System announcements
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Important system updates and announcements
              </div>
            </div>
            <input
              type="checkbox"
              :checked="localNotifications.systemAnnouncements"
              :disabled="!localNotifications.email"
              class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
              @change="updateNotification('systemAnnouncements', ($event.target as HTMLInputElement).checked)"
            >
          </label>
        </div>
      </div>

      <!-- In-App Notifications -->
      <div>
        <h4 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
          In-App Notifications
        </h4>
        <div class="space-y-3">
          <label class="flex items-center justify-between">
            <div>
              <div class="text-sm text-slate-900 dark:text-slate-100">
                Enable in-app notifications
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Show notifications within the application
              </div>
            </div>
            <input
              type="checkbox"
              :checked="localNotifications.inApp"
              class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              @change="updateNotification('inApp', ($event.target as HTMLInputElement).checked)"
            >
          </label>

          <label class="flex items-center justify-between">
            <div>
              <div class="text-sm text-slate-900 dark:text-slate-100">
                Show desktop notifications
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Display browser notifications on your desktop
              </div>
            </div>
            <input
              type="checkbox"
              :checked="localNotifications.desktop"
              class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              @change="updateNotification('desktop', ($event.target as HTMLInputElement).checked)"
            >
          </label>
        </div>
      </div>
    </div>
  </SettingsSection>
</template>

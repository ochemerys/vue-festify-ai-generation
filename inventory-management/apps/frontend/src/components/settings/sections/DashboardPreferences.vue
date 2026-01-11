<script setup lang="ts">
import { ref, watch } from 'vue'
import SettingsSection from '../SettingsSection.vue'
import type { UserPreferences } from '../../../types/settings'

/**
 * DashboardPreferences.vue - Dashboard customization section
 */

interface Props {
  preferences: UserPreferences
}

interface Emits {
  (e: 'update', preferences: UserPreferences): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localDashboard = ref({ ...props.preferences.dashboard })

watch(() => props.preferences.dashboard, (newDashboard) => {
  localDashboard.value = { ...newDashboard }
}, { deep: true })

const landingPages = [
  { value: '/', label: 'Dashboard' },
  { value: '/products', label: 'Products' },
  { value: '/inventory', label: 'Inventory' },
  { value: '/orders', label: 'Orders' },
  { value: '/purchase-orders', label: 'Purchase Orders' },
  { value: '/reports', label: 'Reports' }
]

const itemsPerPageOptions = [10, 25, 50, 100]

const updateDefaultPage = (page: string) => {
  localDashboard.value.defaultPage = page
  emit('update', {
    ...props.preferences,
    dashboard: { ...localDashboard.value }
  })
}

const updateItemsPerPage = (items: number) => {
  localDashboard.value.itemsPerPage = items
  emit('update', {
    ...props.preferences,
    dashboard: { ...localDashboard.value }
  })
}
</script>

<template>
  <SettingsSection
    title="Dashboard Customization"
    description="Customize your dashboard experience"
  >
    <div class="space-y-6">
      <!-- Default Landing Page -->
      <div>
        <label
          for="defaultPage"
          class="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2"
        >
          Default Landing Page
        </label>
        <select
          id="defaultPage"
          :value="localDashboard.defaultPage"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @change="updateDefaultPage(($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="page in landingPages"
            :key="page.value"
            :value="page.value"
          >
            {{ page.label }}
          </option>
        </select>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          The page you'll see when you log in
        </p>
      </div>

      <!-- Items Per Page -->
      <div>
        <label
          for="itemsPerPage"
          class="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2"
        >
          Items Per Page
        </label>
        <select
          id="itemsPerPage"
          :value="localDashboard.itemsPerPage"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @change="updateItemsPerPage(Number(($event.target as HTMLSelectElement).value))"
        >
          <option
            v-for="option in itemsPerPageOptions"
            :key="option"
            :value="option"
          >
            {{ option }} items
          </option>
        </select>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Number of items to display per page in lists
        </p>
      </div>
    </div>
  </SettingsSection>
</template>

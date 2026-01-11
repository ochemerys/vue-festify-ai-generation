<script setup lang="ts">
import { computed } from 'vue'

/**
 * SettingsTabs.vue - Tab navigation for settings page
 */

interface Tab {
  id: string
  label: string
  icon?: string
}

interface Props {
  tabs: Tab[]
  activeTab: string
}

interface Emits {
  (e: 'update:activeTab', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isActive = (tabId: string) => computed(() => props.activeTab === tabId)

const selectTab = (tabId: string) => {
  emit('update:activeTab', tabId)
}
</script>

<template>
  <div class="settings-tabs border-b border-slate-200 dark:border-slate-700">
    <nav
      class="flex space-x-8 overflow-x-auto"
      aria-label="Settings tabs"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors',
          isActive(tab.id).value
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
        ]"
        :aria-current="isActive(tab.id).value ? 'page' : undefined"
        @click="selectTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </nav>
  </div>
</template>

<style scoped>
.settings-tabs nav {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.5) transparent;
}

.settings-tabs nav::-webkit-scrollbar {
  height: 4px;
}

.settings-tabs nav::-webkit-scrollbar-track {
  background: transparent;
}

.settings-tabs nav::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.5);
  border-radius: 2px;
}
</style>

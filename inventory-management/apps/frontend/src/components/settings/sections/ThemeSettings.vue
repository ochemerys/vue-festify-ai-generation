<script setup lang="ts">
import { ref, watch } from 'vue'
import SettingsSection from '../SettingsSection.vue'
import type { UserPreferences } from '../../../types/settings'

/**
 * ThemeSettings.vue - Theme configuration section
 */

interface Props {
  preferences: UserPreferences
}

interface Emits {
  (e: 'update', preferences: UserPreferences): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localTheme = ref(props.preferences.theme)

watch(() => props.preferences.theme, (newTheme) => {
  localTheme.value = newTheme
})

const updateTheme = (theme: 'light' | 'dark' | 'auto') => {
  localTheme.value = theme
  emit('update', { ...props.preferences, theme })
}
</script>

<template>
  <SettingsSection
    title="Theme"
    description="Choose your preferred color theme"
  >
    <div class="space-y-3">
      <label class="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <input
          type="radio"
          name="theme"
          value="light"
          :checked="localTheme === 'light'"
          class="w-4 h-4 text-blue-600 focus:ring-blue-500"
          @change="updateTheme('light')"
        >
        <div class="ml-3 flex-1">
          <div class="text-sm font-medium text-slate-900 dark:text-slate-100">
            Light Mode
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400">
            Use light theme
          </div>
        </div>
        <div
          v-if="localTheme === 'light'"
          class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </label>

      <label class="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <input
          type="radio"
          name="theme"
          value="dark"
          :checked="localTheme === 'dark'"
          class="w-4 h-4 text-blue-600 focus:ring-blue-500"
          @change="updateTheme('dark')"
        >
        <div class="ml-3 flex-1">
          <div class="text-sm font-medium text-slate-900 dark:text-slate-100">
            Dark Mode
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400">
            Use dark theme
          </div>
        </div>
        <div
          v-if="localTheme === 'dark'"
          class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </label>

      <label class="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <input
          type="radio"
          name="theme"
          value="auto"
          :checked="localTheme === 'auto'"
          class="w-4 h-4 text-blue-600 focus:ring-blue-500"
          @change="updateTheme('auto')"
        >
        <div class="ml-3 flex-1">
          <div class="text-sm font-medium text-slate-900 dark:text-slate-100">
            Auto (System)
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400">
            Follow system preference
          </div>
        </div>
        <div
          v-if="localTheme === 'auto'"
          class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </label>
    </div>
  </SettingsSection>
</template>

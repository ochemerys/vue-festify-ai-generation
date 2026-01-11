<script setup lang="ts">
/**
 * SettingsSection.vue - Reusable section wrapper for settings
 * 
 * Provides consistent styling and structure for settings sections
 */

interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="settings-section bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {{ title }}
      </h3>
      <p
        v-if="description"
        class="text-sm text-slate-600 dark:text-slate-400 mt-1"
      >
        {{ description }}
      </p>
    </div>
    <div class="settings-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.settings-section {
  transition: all 0.2s ease;
}
</style>

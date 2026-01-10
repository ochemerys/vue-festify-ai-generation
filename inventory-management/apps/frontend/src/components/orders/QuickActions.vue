<template>
  <div class="space-y-3 xl:sticky xl:top-20" role="region" aria-label="Quick actions">
    <h3 class="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
    
    <div v-for="a in props.actions" :key="a.id" class="w-full">
      <button
        type="button"
        class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        @click="emit('execute', a.id)"
        :aria-label="a.label"
      >
        <!-- Icon -->
        <component :is="getIcon(a.icon)" class="h-4 w-4" aria-hidden="true" />
        
        <!-- Label -->
        <span class="truncate">{{ a.label }}</span>
      </button>
    </div>

    <!-- Keyboard Shortcuts Help -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <h4 class="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
        Keyboard Shortcuts
      </h4>
      <dl class="space-y-2 text-xs text-gray-600">
        <div class="flex items-center justify-between">
          <dt>New Order</dt>
          <dd class="font-mono bg-gray-100 px-2 py-0.5 rounded">Ctrl+N</dd>
        </div>
        <div class="flex items-center justify-between">
          <dt>Search</dt>
          <dd class="font-mono bg-gray-100 px-2 py-0.5 rounded">Ctrl+F</dd>
        </div>
        <div class="flex items-center justify-between">
          <dt>Export</dt>
          <dd class="font-mono bg-gray-100 px-2 py-0.5 rounded">Ctrl+E</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

interface ActionItem {
  label: string
  icon: string
  id: string
}

interface Props {
  actions: ActionItem[]
}

interface Emits {
  (e: 'execute', actionId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Get icon component based on icon name
 */
function getIcon(iconName: string) {
  const icons: Record<string, any> = {
    Plus: () =>
      h(
        'svg',
        {
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
          'aria-hidden': 'true',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M12 4v16m8-8H4',
          }),
        ]
      ),
    Download: () =>
      h(
        'svg',
        {
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'currentColor',
          'aria-hidden': 'true',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
          }),
        ]
      ),
  }

  return icons[iconName] || icons.Plus
}
</script>

<script setup lang="ts">
import {
  Plus,
  Edit,
  AlertTriangle,
  BarChart3,
  ChevronRight
} from 'lucide-vue-next'

/**
 * QuickActions.vue - Action buttons rail
 * 
 * Features:
 * - Vertical stack of action buttons
 * - Icon + label + description
 * - Emits action ID on click
 * - Responsive design
 * 
 * Accessibility:
 * - Semantic button elements
 * - aria-label for icon buttons
 * - Proper focus management
 */

interface Action {
  id: string
  label: string
  icon: string
  description?: string
}

interface Props {
  actions: Action[]
}

interface Emits {
  (e: 'execute', actionId: string): void
}

defineProps<Props>()
defineEmits<Emits>()

// Icon component map
const iconMap: Record<string, any> = {
  Plus,
  Edit,
  AlertTriangle,
  BarChart3,
  ChevronRight
}

const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || Plus
}
</script>

<template>
  <div class="space-y-3">
    <button
      v-for="action in actions"
      :key="action.id"
      class="w-full bg-white rounded-lg border border-slate-200 p-4 text-left hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
      :aria-label="action.label"
      @click="$emit('execute', action.id)"
    >
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
          <component
            :is="getIconComponent(action.icon)"
            :size="20"
            class="text-blue-600"
            :aria-hidden="true"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-900">
            {{ action.label }}
          </p>
          <p
            v-if="action.description"
            class="text-xs text-slate-600 mt-1"
          >
            {{ action.description }}
          </p>
        </div>

        <!-- Chevron -->
        <ChevronRight
          :size="16"
          class="text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-0.5"
          :aria-hidden="true"
        />
      </div>
    </button>
  </div>
</template>

<style scoped>
button {
  transition: all 0.2s ease;
}

button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>

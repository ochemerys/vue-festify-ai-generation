<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

/**
 * MetricCard.vue - Single metric card with trend indicator
 * 
 * Features:
 * - Displays metric value with label
 * - Shows trend direction and percentage
 * - Distinguishes urgent cards with red left border
 * - Skeleton loading state
 * 
 * Accessibility:
 * - Semantic article element
 * - aria-label for trend information
 * - Proper color contrast
 */

interface Props {
  label: string
  value: string | number
  trend?: number
  trendDirection?: 'up' | 'down' | 'neutral'
  isUrgent?: boolean
  loading?: boolean
}

const props = defineProps<Props>()

// Computed classes
const cardClasses = computed(() => {
  const baseClasses = 'bg-white rounded-lg p-6 shadow-sm border transition-all duration-200 hover:shadow-md'
  const borderClass = props.isUrgent ? 'border-l-4 border-l-red-500' : 'border border-slate-200'
  return `${baseClasses} ${borderClass}`
})

const trendClasses = computed(() => {
  const baseClasses = 'inline-flex items-center gap-1 text-sm font-medium'
  switch (props.trendDirection) {
    case 'up':
      return `${baseClasses} text-green-600`
    case 'down':
      return `${baseClasses} text-red-600`
    default:
      return `${baseClasses} text-slate-600`
  }
})
</script>

<template>
  <article
    :class="cardClasses"
    :aria-label="`${props.label}: ${props.value}${props.trend ? ` (${props.trendDirection === 'up' ? '+' : props.trendDirection === 'down' ? '-' : ''}${props.trend}%)` : ''}`"
  >
    <!-- Skeleton loading state -->
    <div v-if="props.loading" class="space-y-3">
      <div class="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
      <div class="h-8 bg-slate-200 rounded w-1/2 animate-pulse" />
      <div class="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
    </div>

    <!-- Content -->
    <div v-else class="space-y-2">
      <!-- Label -->
      <p class="text-sm font-medium text-slate-600">
        {{ props.label }}
      </p>

      <!-- Value -->
      <p class="text-3xl font-bold text-slate-900">
        {{ props.value }}
      </p>

      <!-- Trend -->
      <div v-if="props.trend !== undefined && props.trendDirection" :class="trendClasses">
        <component
          :is="props.trendDirection === 'up' ? TrendingUp : TrendingDown"
          :size="16"
          :aria-hidden="true"
        />
        <span>
          {{ props.trendDirection === 'up' ? '+' : props.trendDirection === 'down' ? '-' : '' }}{{ props.trend }}%
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* Smooth animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>

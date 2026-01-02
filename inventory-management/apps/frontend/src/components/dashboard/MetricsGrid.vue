<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import MetricCard from './MetricCard.vue'

/**
 * MetricsGrid.vue - Displays 4x2 grid of metric cards
 * 
 * Features:
 * - Responsive grid layout (1 col mobile, 2 col tablet, 4 col desktop)
 * - Skeleton loading state
 * - Distinguishes urgent vs info cards
 * 
 * Accessibility:
 * - Semantic grid structure
 * - Proper heading hierarchy
 */

interface Metric {
  id: string
  label: string
  value: number | string
  trend?: number
  trendDirection?: 'up' | 'down' | 'neutral'
  isUrgent?: boolean
  loading?: boolean
}

interface Props {
  metrics: Metric[]
  loading?: boolean
}

const props = defineProps<Props>()

// Compute grid items with loading skeletons
const gridItems = computed(() => {
  return Array.from({ length: 8 }, (_, i) => props.metrics[i] || null)
})
</script>

<template>
  <div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    role="region"
    aria-label="Key metrics"
  >
    <MetricCard
      v-for="(metric, index) in gridItems"
      :key="metric?.id || `skeleton-${index}`"
      :label="metric?.label || ''"
      :value="metric?.value || '—'"
      :trend="metric?.trend"
      :trend-direction="metric?.trendDirection"
      :is-urgent="metric?.isUrgent"
      :loading="loading || metric?.loading"
    />
  </div>
</template>

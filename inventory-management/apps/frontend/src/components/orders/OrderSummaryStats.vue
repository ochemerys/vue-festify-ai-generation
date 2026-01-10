<template>
  <section aria-labelledby="summary-heading" class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <h2 id="summary-heading" class="sr-only">Order summary statistics</h2>
    
    <!-- Loading State -->
    <div v-if="props.loading" class="grid grid-cols-2 md:grid-cols-5 gap-4" role="status" aria-label="Loading order statistics">
      <div v-for="i in 5" :key="i" class="h-20 rounded-lg bg-gray-100 animate-pulse" />
      <span class="sr-only">Loading order statistics...</span>
    </div>
    
    <!-- Normal State -->
    <dl v-else class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <!-- Total Orders -->
      <div 
        class="flex flex-col items-start gap-1 p-3 rounded-lg border border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100"
        role="group"
        aria-labelledby="stat-total"
      >
        <dt id="stat-total" class="text-xs font-medium uppercase tracking-wide text-gray-600">
          Total
        </dt>
        <dd class="text-2xl font-bold text-gray-900">
          {{ formatNumber(props.summary.totalOrders) }}
        </dd>
        <span class="text-xs text-gray-500">All orders</span>
      </div>

      <!-- Pending Orders -->
      <div 
        class="flex flex-col items-start gap-1 p-3 rounded-lg border border-amber-200 bg-amber-50 transition-colors hover:bg-amber-100"
        role="group"
        aria-labelledby="stat-pending"
      >
        <dt id="stat-pending" class="text-xs font-medium uppercase tracking-wide text-amber-700">
          Pending
        </dt>
        <dd class="text-2xl font-bold text-amber-900">
          {{ formatNumber(props.summary.pendingOrders) }}
        </dd>
        <span class="text-xs text-amber-600">Awaiting processing</span>
      </div>

      <!-- Processing Orders -->
      <div 
        class="flex flex-col items-start gap-1 p-3 rounded-lg border border-blue-200 bg-blue-50 transition-colors hover:bg-blue-100"
        role="group"
        aria-labelledby="stat-processing"
      >
        <dt id="stat-processing" class="text-xs font-medium uppercase tracking-wide text-blue-700">
          Processing
        </dt>
        <dd class="text-2xl font-bold text-blue-900">
          {{ formatNumber(props.summary.processingOrders) }}
        </dd>
        <span class="text-xs text-blue-600">Being prepared</span>
      </div>

      <!-- Shipped Orders -->
      <div 
        class="flex flex-col items-start gap-1 p-3 rounded-lg border border-violet-200 bg-violet-50 transition-colors hover:bg-violet-100"
        role="group"
        aria-labelledby="stat-shipped"
      >
        <dt id="stat-shipped" class="text-xs font-medium uppercase tracking-wide text-violet-700">
          Shipped
        </dt>
        <dd class="text-2xl font-bold text-violet-900">
          {{ formatNumber(props.summary.shippedOrders) }}
        </dd>
        <span class="text-xs text-violet-600">In transit</span>
      </div>

      <!-- Delivered Orders -->
      <div 
        class="flex flex-col items-start gap-1 p-3 rounded-lg border border-green-200 bg-green-50 transition-colors hover:bg-green-100"
        role="group"
        aria-labelledby="stat-delivered"
      >
        <dt id="stat-delivered" class="text-xs font-medium uppercase tracking-wide text-green-700">
          Delivered
        </dt>
        <dd class="text-2xl font-bold text-green-900">
          {{ formatNumber(props.summary.deliveredOrders) }}
        </dd>
        <span class="text-xs text-green-600">Completed</span>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
interface Props {
  summary: {
    totalOrders: number
    pendingOrders: number
    processingOrders: number
    shippedOrders: number
    deliveredOrders: number
  }
  loading: boolean
}

const props = defineProps<Props>()

/**
 * Format number with thousands separator
 */
function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}
</script>

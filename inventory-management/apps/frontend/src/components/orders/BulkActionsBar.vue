<template>
  <div 
    class="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm"
    role="region"
    aria-label="Bulk actions"
  >
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <!-- Selection Info -->
      <div class="flex items-center gap-2">
        <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-medium text-blue-900">
          <span class="font-bold">{{ props.selectedIds.length }}</span>
          {{ props.selectedIds.length === 1 ? 'order' : 'orders' }} selected
        </p>
      </div>

      <!-- Bulk Actions -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Update Status Dropdown -->
        <label class="inline-flex items-center gap-2">
          <span class="text-sm font-medium text-blue-900">Update status:</span>
          <select 
            class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
            @change="onBulkStatus"
            aria-label="Select status to apply to selected orders"
          >
            <option value="">Choose status...</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <!-- Cancel Pending Button -->
        <button 
          type="button" 
          class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          @click="onBulkCancelClick"
          aria-label="Cancel all selected pending orders"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel pending
        </button>

        <!-- Clear Selection Button -->
        <button 
          type="button" 
          class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          @click="emit('clear-selection')"
          aria-label="Clear selection"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedIds: string[]
}

interface Emits {
  (e: 'bulk-update', status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'): void
  (e: 'bulk-cancel'): void
  (e: 'clear-selection'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Handle bulk status update
 */
function onBulkStatus(e: Event): void {
  const target = e.target as HTMLSelectElement
  const status = target.value as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  
  if (status) {
    if (confirm(`Update ${props.selectedIds.length} order(s) to "${status}" status?`)) {
      emit('bulk-update', status)
      // Reset select
      target.value = ''
    } else {
      // Reset select if cancelled
      target.value = ''
    }
  }
}

/**
 * Handle bulk cancel with confirmation
 */
function onBulkCancelClick(): void {
  if (confirm(`Cancel all pending orders in the ${props.selectedIds.length} selected order(s)?`)) {
    emit('bulk-cancel')
  }
}
</script>

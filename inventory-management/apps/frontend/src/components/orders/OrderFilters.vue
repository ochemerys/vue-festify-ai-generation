<template>
  <section 
    class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" 
    aria-labelledby="filters-heading"
  >
    <h2 id="filters-heading" class="sr-only">Filter and search orders</h2>

    <!-- Loading State -->
    <div v-if="props.loading" class="grid grid-cols-1 md:grid-cols-4 gap-4" role="status" aria-label="Loading filters">
      <div class="h-10 rounded bg-gray-100 animate-pulse" />
      <div class="h-10 rounded bg-gray-100 animate-pulse" />
      <div class="h-10 rounded bg-gray-100 animate-pulse" />
      <div class="h-10 rounded bg-gray-100 animate-pulse" />
      <span class="sr-only">Loading filters...</span>
    </div>

    <!-- Normal State -->
    <form v-else class="space-y-4" @submit.prevent>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- First Column: Search and Status -->
        <div class="space-y-4">
          <!-- Search Input -->
          <label class="block">
            <span class="block text-sm font-medium text-gray-700 mb-1">
              Search
            </span>
            <input
              ref="searchInputRef"
              type="text"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Order #, customer, email..."
              :value="props.filters.search || ''"
              @input="onSearchInput"
              aria-label="Search orders by order number, customer name, or email"
            />
          </label>

          <!-- Status Filter -->
          <fieldset class="block">
            <legend class="block text-sm font-medium text-gray-700 mb-1">
              Status
            </legend>
            <div class="relative">
              <select
                multiple
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                :value="props.filters.status || []"
                @change="onMultiSelect"
                aria-label="Filter by order status (hold Ctrl/Cmd to select multiple)"
                size="1"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Hold Ctrl/Cmd to select multiple
            </p>
          </fieldset>
        </div>

        <!-- Second Column: Date Range -->
        <div class="space-y-4">
          <!-- Start Date -->
          <label class="block">
            <span class="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </span>
            <input
              type="date"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              :value="props.filters.startDate || ''"
              @input="onInput('startDate', ($event.target as HTMLInputElement).value)"
              aria-label="Filter orders from this date"
            />
          </label>

          <!-- End Date -->
          <label class="block">
            <span class="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </span>
            <input
              type="date"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              :value="props.filters.endDate || ''"
              @input="onInput('endDate', ($event.target as HTMLInputElement).value)"
              aria-label="Filter orders until this date"
            />
          </label>
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="flex items-center justify-between pt-2 border-t border-gray-200">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span v-if="hasActiveFilters" class="inline-flex items-center gap-1">
            <svg class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span class="font-medium text-blue-600">Filters active</span>
          </span>
        </div>
        
        <button 
          type="button" 
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="!hasActiveFilters"
          @click="emit('reset')"
          aria-label="Clear all filters"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear filters
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface Props {
  filters: {
    search?: string
    status?: OrderStatus[]
    startDate?: string
    endDate?: string
  }
  loading: boolean
}

interface Emits {
  (e: 'update:filters', value: Props['filters']): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchInputRef = ref<HTMLInputElement | null>(null)

// Debounce timer for search input
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Check if any filters are active
 */
const hasActiveFilters = computed(() => {
  return !!(
    props.filters.search ||
    (props.filters.status && props.filters.status.length > 0) ||
    props.filters.startDate ||
    props.filters.endDate
  )
})

/**
 * Handle search input with debouncing (300ms)
 */
function onSearchInput(e: Event): void {
  const value = (e.target as HTMLInputElement).value
  
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  
  searchDebounceTimer = setTimeout(() => {
    emit('update:filters', { ...props.filters, search: value })
  }, 300)
}

/**
 * Handle generic input changes
 */
function onInput<K extends keyof Props['filters']>(key: K, value: Props['filters'][K]): void {
  emit('update:filters', { ...props.filters, [key]: value })
}

/**
 * Handle multi-select status filter
 */
function onMultiSelect(e: Event): void {
  const target = e.target as HTMLSelectElement
  const values = Array.from(target.selectedOptions)
    .map((o) => o.value)
    .filter((v) => v !== '') as OrderStatus[]
  emit('update:filters', { ...props.filters, status: values })
}

/**
 * Expose search input ref for parent to focus
 */
defineExpose({
  focusSearch: () => searchInputRef.value?.focus(),
})
</script>

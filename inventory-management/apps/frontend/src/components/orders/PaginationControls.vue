<template>
  <nav 
    class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm" 
    aria-label="Pagination navigation"
  >
    <!-- Page Info & Navigation -->
    <div class="flex items-center gap-3">
      <button 
        type="button" 
        class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :disabled="props.page <= 1" 
        @click="updatePage(props.page - 1)"
        aria-label="Go to previous page"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="hidden sm:inline">Previous</span>
      </button>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-700">
          Page <span class="font-medium">{{ props.page }}</span> of <span class="font-medium">{{ totalPages }}</span>
        </span>
      </div>

      <button 
        type="button" 
        class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :disabled="props.page >= totalPages" 
        @click="updatePage(props.page + 1)"
        aria-label="Go to next page"
      >
        <span class="hidden sm:inline">Next</span>
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Results Info & Page Size Selector -->
    <div class="flex items-center gap-4 text-sm">
      <span class="text-gray-600">
        Showing 
        <span class="font-medium text-gray-900">{{ startItem }}</span>
        -
        <span class="font-medium text-gray-900">{{ endItem }}</span>
        of 
        <span class="font-medium text-gray-900">{{ props.total }}</span>
        results
      </span>

      <label class="inline-flex items-center gap-2">
        <span class="text-gray-700 font-medium">Rows per page:</span>
        <select 
          class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          :value="props.pageSize" 
          @change="onChangeSize"
          aria-label="Select number of rows per page"
        >
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </label>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  page: number
  pageSize: number
  total: number
}

interface Emits {
  (e: 'update:page', value: number): void
  (e: 'update:page-size', value: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Calculate total number of pages
 */
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

/**
 * Calculate start item number for current page
 */
const startItem = computed(() => {
  if (props.total === 0) return 0
  return (props.page - 1) * props.pageSize + 1
})

/**
 * Calculate end item number for current page
 */
const endItem = computed(() => {
  const end = props.page * props.pageSize
  return Math.min(end, props.total)
})

/**
 * Update page number with bounds checking
 */
function updatePage(next: number): void {
  const clamped = Math.min(totalPages.value, Math.max(1, next))
  if (clamped !== props.page) {
    emit('update:page', clamped)
  }
}

/**
 * Handle page size change
 */
function onChangeSize(e: Event): void {
  const size = Number((e.target as HTMLSelectElement).value)
  emit('update:page-size', size)
}
</script>

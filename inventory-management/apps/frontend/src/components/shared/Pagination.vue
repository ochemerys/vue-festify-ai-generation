<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

/**
 * Pagination.vue - Reusable pagination component
 *
 * Features:
 * - Page navigation
 * - Page size selection
 * - Item count display
 * - Responsive design
 * - Keyboard navigation
 *
 * Accessibility:
 * - Proper ARIA labels
 * - Keyboard navigation
 * - Screen reader support
 */

interface Props {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
}

interface Emits {
  (e: 'page-change', page: number): void
  (e: 'page-size-change', size: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Page size options
const pageSizeOptions = [10, 25, 50, 100]

// Computed properties
const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  if (props.totalItems === 0) return 0
  return Math.min(props.currentPage * props.pageSize, props.totalItems)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Show smart pagination for more than 7 pages
    pages.push(1)

    if (current > 4) {
      pages.push('...')
    }

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < total - 3) {
      pages.push('...')
    }

    if (total > 1) {
      pages.push(total)
    }
  }

  return pages
})

// Methods
const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}

const goToPrevious = () => {
  goToPage(props.currentPage - 1)
}

const goToNext = () => {
  goToPage(props.currentPage + 1)
}

const changePageSize = (size: number) => {
  emit('page-size-change', size)
}

// Check if page is active
const isPageActive = (page: number | string): boolean => {
  return typeof page === 'number' && page === props.currentPage
}

// Check if page is clickable
const isPageClickable = (page: number | string): boolean => {
  return typeof page === 'number'
}
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-slate-200">
    <!-- Items count -->
    <div class="text-sm text-slate-700">
      Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} results
    </div>

    <!-- Pagination controls -->
    <div class="flex items-center gap-2">
      <!-- Page size selector -->
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <span>Show</span>
        <select
          :value="pageSize"
          class="px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label="Items per page"
          @change="(e) => changePageSize(Number((e.target as HTMLSelectElement).value))"
        >
          <option
            v-for="size in pageSizeOptions"
            :key="size"
            :value="size"
          >
            {{ size }}
          </option>
        </select>
        <span>per page</span>
      </div>

      <!-- Page navigation -->
      <nav
        class="flex items-center gap-1"
        aria-label="Pagination"
      >
        <!-- Previous button -->
        <button
          :disabled="currentPage <= 1"
          :class="[
            'p-2 rounded-lg border transition-colors',
            currentPage <= 1
              ? 'border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
              : 'border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          ]"
          aria-label="Previous page"
          @click="goToPrevious"
        >
          <ChevronLeft :size="16" />
        </button>

        <!-- Page numbers -->
        <template
          v-for="page in visiblePages"
          :key="page"
        >
          <button
            v-if="isPageClickable(page)"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
              isPageActive(page)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            ]"
            :aria-label="`Page ${page}`"
            :aria-current="isPageActive(page) ? 'page' : undefined"
            @click="goToPage(page as number)"
          >
            {{ page }}
          </button>
          <span
            v-else
            class="px-3 py-2 text-sm text-slate-400"
            aria-hidden="true"
          >
            {{ page }}
          </span>
        </template>

        <!-- Next button -->
        <button
          :disabled="currentPage >= totalPages"
          :class="[
            'p-2 rounded-lg border transition-colors',
            currentPage >= totalPages
              ? 'border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
              : 'border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          ]"
          aria-label="Next page"
          @click="goToNext"
        >
          <ChevronRight :size="16" />
        </button>
      </nav>
    </div>
  </div>
</template>

<style scoped>
/* Ensure consistent button sizing */
button {
  min-width: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
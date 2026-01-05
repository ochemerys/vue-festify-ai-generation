<script setup lang="ts">
import { CheckCircle, AlertTriangle, XCircle, Package } from 'lucide-vue-next'

/**
 * InventorySummary.vue - Inventory summary statistics
 *
 * Features:
 * - Display total items count
 * - Show in-stock, low-stock, and out-of-stock counts
 * - Color-coded status cards
 * - Responsive grid layout
 *
 * Accessibility:
 * - Semantic HTML with proper headings
 * - Descriptive labels
 * - Screen reader friendly
 */

interface InventorySummary {
  totalItems: number
  inStockCount: number
  lowStockCount: number
  outOfStockCount: number
}

interface Props {
  summary: InventorySummary
}

defineProps<Props>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Total Items Card -->
    <div class="bg-white rounded-lg border border-slate-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-slate-600">
            Total Items
          </p>
          <p class="text-2xl font-bold text-slate-900 mt-2">
            {{ summary.totalItems }}
          </p>
        </div>
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Package
            :size="24"
            class="text-blue-600"
          />
        </div>
      </div>
    </div>

    <!-- In Stock Card -->
    <div class="bg-white rounded-lg border border-slate-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-slate-600">
            In Stock
          </p>
          <p class="text-2xl font-bold text-green-600 mt-2">
            {{ summary.inStockCount }}
          </p>
        </div>
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <CheckCircle
            :size="24"
            class="text-green-600"
          />
        </div>
      </div>
      <div class="mt-3 flex items-center text-xs text-slate-500">
        <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-2" />
        Above reorder level
      </div>
    </div>

    <!-- Low Stock Card -->
    <div class="bg-white rounded-lg border border-slate-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-slate-600">
            Low Stock
          </p>
          <p class="text-2xl font-bold text-amber-600 mt-2">
            {{ summary.lowStockCount }}
          </p>
        </div>
        <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
          <AlertTriangle
            :size="24"
            class="text-amber-600"
          />
        </div>
      </div>
      <div class="mt-3 flex items-center text-xs text-slate-500">
        <span class="inline-block w-2 h-2 bg-amber-500 rounded-full mr-2" />
        At or below reorder level
      </div>
    </div>

    <!-- Out of Stock Card -->
    <div class="bg-white rounded-lg border border-slate-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-slate-600">
            Out of Stock
          </p>
          <p class="text-2xl font-bold text-red-600 mt-2">
            {{ summary.outOfStockCount }}
          </p>
        </div>
        <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
          <XCircle
            :size="24"
            class="text-red-600"
          />
        </div>
      </div>
      <div class="mt-3 flex items-center text-xs text-slate-500">
        <span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-2" />
        Requires immediate reorder
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Card hover effect */
.bg-white {
  transition: box-shadow 0.2s ease-in-out;
}

.bg-white:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>

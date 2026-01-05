<script setup lang="ts">
import InventoryRow from './InventoryRow.vue'

/**
 * InventoryTable.vue - Inventory data table
 *
 * Features:
 * - Display inventory items with stock levels
 * - Status indicators (in-stock, low-stock, out-of-stock)
 * - Action buttons for adjust, history, reorder
 * - Loading skeleton states
 * - Responsive design
 *
 * Accessibility:
 * - Proper table semantics
 * - Keyboard navigation
 * - Screen reader support
 */

interface InventoryItem {
  id: string
  productId: string
  productName: string
  sku: string
  category: string
  currentQuantity: number
  reorderLevel: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  lastRestockDate?: Date
  supplier: string
  price: number
}

interface Props {
  items: InventoryItem[]
  loading?: boolean
}

interface Emits {
  (e: 'adjust-stock', itemId: string): void
  (e: 'view-history', itemId: string): void
  (e: 'reorder', itemId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Column definitions
const columns = [
  { key: 'productName', label: 'Product Name', width: '25%' },
  { key: 'sku', label: 'SKU', width: '12%' },
  { key: 'category', label: 'Category', width: '15%' },
  { key: 'currentQuantity', label: 'Current', width: '10%' },
  { key: 'reorderLevel', label: 'Reorder', width: '10%' },
  { key: 'status', label: 'Status', width: '13%' },
  { key: 'actions', label: 'Actions', width: '15%' }
]
</script>

<template>
  <div class="overflow-x-auto">
    <table
      class="w-full"
      role="table"
      aria-label="Inventory table"
    >
      <!-- Table Header -->
      <thead class="bg-slate-50 border-b border-slate-200">
        <tr>
          <!-- Column Headers -->
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width }"
            scope="col"
            class="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>

      <!-- Table Body -->
      <tbody class="bg-white divide-y divide-slate-200">
        <!-- Loading skeleton rows -->
        <tr
          v-for="i in 5"
          v-if="loading"
          :key="`skeleton-${i}`"
        >
          <td class="px-6 py-4">
            <div class="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
          </td>
          <td class="px-6 py-4">
            <div class="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
          </td>
          <td class="px-6 py-4">
            <div class="h-4 bg-slate-200 rounded w-2/3 animate-pulse" />
          </td>
          <td class="px-6 py-4">
            <div class="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
          </td>
          <td class="px-6 py-4">
            <div class="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
          </td>
          <td class="px-6 py-4">
            <div class="h-6 bg-slate-200 rounded-full w-20 animate-pulse" />
          </td>
          <td class="px-6 py-4">
            <div class="flex gap-2">
              <div class="h-8 bg-slate-200 rounded w-16 animate-pulse" />
              <div class="h-8 bg-slate-200 rounded w-16 animate-pulse" />
            </div>
          </td>
        </tr>

        <!-- Inventory rows -->
        <InventoryRow
          v-for="item in items"
          v-else
          :key="item.id"
          :item="item"
          @adjust-stock="emit('adjust-stock', item.id)"
          @view-history="emit('view-history', item.id)"
          @reorder="emit('reorder', item.id)"
        />

        <!-- Empty state row -->
        <tr v-if="!loading && items.length === 0">
          <td
            :colspan="columns.length"
            class="px-6 py-12 text-center text-slate-500"
          >
            <div class="flex flex-col items-center gap-2">
              <svg
                class="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <span>No inventory items to display</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
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

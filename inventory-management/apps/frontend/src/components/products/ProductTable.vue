<script setup lang="ts">
import { ChevronUp, ChevronDown } from 'lucide-vue-next'
import ProductRow from './ProductRow.vue'

/**
 * ProductTable.vue - Product data table with sorting and selection
 *
 * Features:
 * - Sortable column headers
 * - Row selection with checkboxes
 * - Responsive design
 * - Loading skeleton states
 * - Action buttons for edit/delete
 *
 * Accessibility:
 * - Proper table semantics
 * - Keyboard navigation
 * - Screen reader support
 */

interface Product {
  id: string
  name: string
  sku: string
  category: string
  supplier: string
  price: number
  cost: number
  quantity: number
  reorderLevel: number
  status: 'active' | 'inactive' | 'discontinued'
  image?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

interface SortOptions {
  field: 'name' | 'price' | 'quantity' | 'createdAt'
  direction: 'asc' | 'desc'
}

interface Props {
  products: Product[]
  loading?: boolean
  sort: SortOptions
  selectedProducts: Set<string>
  allSelected: boolean
  someSelected: boolean
}

interface Emits {
  (e: 'sort', field: string, direction: 'asc' | 'desc'): void
  (e: 'select-all'): void
  (e: 'select-product', productId: string, selected: boolean): void
  (e: 'edit-product', productId: string): void
  (e: 'delete-product', productId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Column definitions
const columns = [
  { key: 'name', label: 'Product Name', sortable: true, width: '25%' },
  { key: 'sku', label: 'SKU', sortable: false, width: '15%' },
  { key: 'category', label: 'Category', sortable: false, width: '15%' },
  { key: 'price', label: 'Price', sortable: true, width: '12%' },
  { key: 'quantity', label: 'Stock', sortable: true, width: '10%' },
  { key: 'status', label: 'Status', sortable: false, width: '10%' },
  { key: 'actions', label: 'Actions', sortable: false, width: '13%' }
]

// Handle column sorting
const handleSort = (field: string) => {
  if (!columns.find(col => col.key === field)?.sortable) return

  const newDirection = props.sort.field === field && props.sort.direction === 'asc' ? 'desc' : 'asc'
  emit('sort', field, newDirection)
}

// Get sort icon for column
const getSortIcon = (field: string) => {
  if (props.sort.field !== field) return null
  return props.sort.direction === 'asc' ? ChevronUp : ChevronDown
}

</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full" role="table" aria-label="Products table">
      <!-- Table Header -->
      <thead class="bg-slate-50 border-b border-slate-200">
        <tr>
          <!-- Select All Checkbox -->
          <th scope="col" class="px-6 py-4 text-left">
            <input
              :checked="allSelected"
              :indeterminate="someSelected"
              @change="emit('select-all')"
              type="checkbox"
              class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              aria-label="Select all products"
            />
          </th>

          <!-- Column Headers -->
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width }"
            scope="col"
            class="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            :class="{ 'cursor-pointer hover:bg-slate-100': column.sortable }"
            @click="column.sortable ? handleSort(column.key) : null"
          >
            <div class="flex items-center gap-1">
              <span>{{ column.label }}</span>
              <component
                :is="getSortIcon(column.key)"
                v-if="column.sortable && getSortIcon(column.key)"
                :size="16"
                class="text-slate-400"
                aria-hidden="true"
              />
            </div>
          </th>
        </tr>
      </thead>

      <!-- Table Body -->
      <tbody class="bg-white divide-y divide-slate-200">
        <!-- Loading skeleton rows -->
        <tr v-if="loading" v-for="i in 5" :key="`skeleton-${i}`">
          <td class="px-6 py-4">
            <div class="w-4 h-4 bg-slate-200 rounded animate-pulse"></div>
          </td>
          <td class="px-6 py-4">
            <div class="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
          </td>
          <td class="px-6 py-4">
            <div class="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
          </td>
          <td class="px-6 py-4">
            <div class="h-4 bg-slate-200 rounded w-2/3 animate-pulse"></div>
          </td>
          <td class="px-6 py-4">
            <div class="h-4 bg-slate-200 rounded w-1/3 animate-pulse"></div>
          </td>
          <td class="px-6 py-4">
            <div class="h-4 bg-slate-200 rounded w-1/4 animate-pulse"></div>
          </td>
          <td class="px-6 py-4">
            <div class="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
          </td>
          <td class="px-6 py-4">
            <div class="flex gap-2">
              <div class="w-8 h-8 bg-slate-200 rounded animate-pulse"></div>
              <div class="w-8 h-8 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </td>
        </tr>

        <!-- Product rows -->
        <ProductRow
          v-else
          v-for="product in products"
          :key="product.id"
          :product="product"
          :selected="selectedProducts.has(product.id)"
          @select="emit('select-product', product.id, $event)"
          @edit="emit('edit-product', product.id)"
          @delete="emit('delete-product', product.id)"
        />

        <!-- Empty state row -->
        <tr v-if="!loading && products.length === 0">
          <td :colspan="columns.length + 1" class="px-6 py-12 text-center text-slate-500">
            <div class="flex flex-col items-center gap-2">
              <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span>No products to display</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Custom checkbox styling */
input[type="checkbox"]:indeterminate {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M4 8h8'/%3e%3c/svg%3e");
  background-color: #3b82f6;
  background-size: 16px 16px;
  background-position: center;
  background-repeat: no-repeat;
}

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
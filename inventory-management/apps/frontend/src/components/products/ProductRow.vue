<script setup lang="ts">
import { computed } from 'vue'
import { Edit, Trash2 } from 'lucide-vue-next'

/**
 * ProductRow.vue - Individual product table row
 *
 * Features:
 * - Product information display
 * - Selection checkbox
 * - Action buttons (edit/delete)
 * - Status badges
 * - Hover effects
 *
 * Accessibility:
 * - Proper table cell semantics
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

interface Props {
  product: Product
  selected?: boolean
}

interface Emits {
  (e: 'select', selected: boolean): void
  (e: 'edit'): void
  (e: 'delete'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed properties
const stockStatus = computed(() => {
  if (props.product.quantity === 0) return 'out of stock'
  if (props.product.quantity <= props.product.reorderLevel) return 'low stock'
  return 'in stock'
})

const stockStatusClass = computed(() => {
  switch (stockStatus.value) {
    case 'out of stock':
      return 'text-red-600 bg-red-50'
    case 'low stock':
      return 'text-amber-600 bg-amber-50'
    default:
      return 'text-green-600 bg-green-50'
  }
})

const statusBadgeClass = computed(() => {
  switch (props.product.status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'inactive':
      return 'bg-yellow-100 text-yellow-800'
    case 'discontinued':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
})

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Handle checkbox change
const handleSelectChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('select', target.checked)
}

// Handle action buttons
const handleEdit = () => {
  emit('edit')
}

const handleDelete = () => {
  emit('delete')
}
</script>

<template>
  <tr
    class="hover:bg-slate-50 transition-colors"
    :class="{ 'bg-blue-50': selected }"
  >
    <!-- Selection Checkbox -->
    <td class="px-6 py-4 whitespace-nowrap">
      <input
        :checked="selected"
        type="checkbox"
        class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        :aria-label="`Select product ${product.name}`"
        @change="handleSelectChange"
      >
    </td>

    <!-- Product Name -->
    <td class="px-6 py-4 whitespace-nowrap max-w-xs truncate">
      <div class="flex items-center">
        <div class="flex-shrink-0 h-10 w-10 bg-slate-200">
          <div class="h-10 w-10 rounded-lg bg-slate-200 flex items-center justify-center">
            <svg
              class="h-6 w-6 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        </div>
        <div class="ml-4">
          <div class="text-sm font-medium text-slate-900">
            {{ product.name }}
          </div>
          <div class="text-sm text-slate-500">
            {{ product.description }}
          </div>
        </div>
      </div>
    </td>

    <!-- SKU -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="text-sm font-mono text-slate-900">
        {{ product.sku }}
      </div>
    </td>

    <!-- Category -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="text-sm text-slate-900">
        {{ product.category }}
      </div>
      <div class="text-sm text-slate-500">
        {{ product.supplier }}
      </div>
    </td>

    <!-- Price -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="text-sm font-medium text-slate-900">
        {{ formatCurrency(product.price) }}
      </div>
      <div class="text-sm text-slate-500">
        Cost: {{ formatCurrency(product.cost) }}
      </div>
    </td>

    <!-- Stock -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-slate-900">
          {{ product.quantity }}
        </span>
        <span
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          :class="stockStatusClass"
        >
          {{ stockStatus }}
        </span>
      </div>
    </td>

    <!-- Status -->
    <td class="px-6 py-4 whitespace-nowrap">
      <span
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize status-badge"
        :class="statusBadgeClass"
      >
        {{ product.status }}
      </span>
    </td>

    <!-- Actions -->
    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div class="flex items-center justify-end gap-2">
        <button
          class="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
          aria-label="Edit product"
          @click="handleEdit"
        >
          <Edit :size="16" />
        </button>
        <button
          class="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
          aria-label="Delete product"
          @click="handleDelete"
        >
          <Trash2 :size="16" />
        </button>
      </div>
    </td>
  </tr>
</template>

<style scoped>
/* Truncate text with ellipsis */
.max-w-xs {
  max-width: 12rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
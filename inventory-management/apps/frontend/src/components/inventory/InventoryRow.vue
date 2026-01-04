<script setup lang="ts">
import { computed } from 'vue'
import { Edit, History, ShoppingCart } from 'lucide-vue-next'

/**
 * InventoryRow.vue - Single inventory item row
 *
 * Features:
 * - Display inventory item details
 * - Status badge with color coding
 * - Action buttons (adjust, history, reorder)
 * - Hover effects
 *
 * Accessibility:
 * - Semantic table row
 * - Descriptive button labels
 * - Status role for status badge
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
  item: InventoryItem
}

interface Emits {
  (e: 'adjust-stock'): void
  (e: 'view-history'): void
  (e: 'reorder'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Status badge configuration
const statusConfig = computed(() => {
  switch (props.item.status) {
    case 'in-stock':
      return {
        label: 'In Stock',
        icon: '✓',
        classes: 'bg-green-100 text-green-800 border-green-200'
      }
    case 'low-stock':
      return {
        label: 'Low Stock',
        icon: '⚠',
        classes: 'bg-amber-100 text-amber-800 border-amber-200'
      }
    case 'out-of-stock':
      return {
        label: 'Out of Stock',
        icon: '✗',
        classes: 'bg-red-100 text-red-800 border-red-200'
      }
    default:
      return {
        label: 'Unknown',
        icon: '?',
        classes: 'bg-slate-100 text-slate-800 border-slate-200'
      }
  }
})

// Quantity display with color coding
const quantityClasses = computed(() => {
  if (props.item.currentQuantity === 0) {
    return 'text-red-600 font-semibold'
  } else if (props.item.currentQuantity <= props.item.reorderLevel) {
    return 'text-amber-600 font-semibold'
  }
  return 'text-slate-900'
})
</script>

<template>
  <tr class="hover:bg-slate-50 transition-colors">
    <!-- Product Name -->
    <td class="px-6 py-4">
      <div class="text-sm font-medium text-slate-900">
        {{ item.productName }}
      </div>
      <div class="text-xs text-slate-500 mt-1">
        {{ item.supplier }}
      </div>
    </td>

    <!-- SKU -->
    <td class="px-6 py-4">
      <div class="text-sm text-slate-900 font-mono">
        {{ item.sku }}
      </div>
    </td>

    <!-- Category -->
    <td class="px-6 py-4">
      <div class="text-sm text-slate-600">
        {{ item.category }}
      </div>
    </td>

    <!-- Current Quantity -->
    <td class="px-6 py-4">
      <div class="text-sm" :class="quantityClasses">
        {{ item.currentQuantity }}
      </div>
    </td>

    <!-- Reorder Level -->
    <td class="px-6 py-4">
      <div class="text-sm text-slate-600">
        {{ item.reorderLevel }}
      </div>
    </td>

    <!-- Status -->
    <td class="px-6 py-4">
      <span
        :class="statusConfig.classes"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
        role="status"
        :aria-label="statusConfig.label"
      >
        <span aria-hidden="true">{{ statusConfig.icon }}</span>
        {{ statusConfig.label }}
      </span>
    </td>

    <!-- Actions -->
    <td class="px-6 py-4">
      <div class="flex items-center gap-2">
        <!-- Adjust Stock Button -->
        <button
          @click="emit('adjust-stock')"
          class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          :aria-label="`Adjust stock for ${item.productName}`"
        >
          <Edit :size="14" />
          Adjust
        </button>

        <!-- View History Button -->
        <button
          @click="emit('view-history')"
          class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          :aria-label="`View history for ${item.productName}`"
        >
          <History :size="14" />
        </button>

        <!-- Reorder Button (only show for low/out of stock) -->
        <button
          v-if="item.status === 'low-stock' || item.status === 'out-of-stock'"
          @click="emit('reorder')"
          class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          :aria-label="`Reorder ${item.productName}`"
        >
          <ShoppingCart :size="14" />
        </button>
      </div>
    </td>
  </tr>
</template>

<style scoped>
/* Smooth transitions */
.transition-colors {
  transition-property: background-color, border-color, color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * InventoryFilters.vue - Inventory filtering component
 *
 * Features:
 * - Filter by category
 * - Filter by supplier
 * - Filter by stock status
 * - Low stock only toggle
 * - Real-time filter updates
 *
 * Accessibility:
 * - Proper label associations
 * - Keyboard navigation
 * - Clear filter descriptions
 */

interface InventoryFilters {
  search?: string
  category?: string
  status?: 'in-stock' | 'low-stock' | 'out-of-stock'
  supplier?: string
  lowStockOnly?: boolean
}

interface Props {
  filters: InventoryFilters
}

interface Emits {
  (e: 'update:filters', filters: InventoryFilters): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local filter state
const localFilters = ref<InventoryFilters>({ ...props.filters })

// Available filter options (in real app, these would come from API)
const categories = [
  'Electronics',
  'Furniture',
  'Kitchenware',
  'Sports & Fitness',
  'Food & Beverage',
  'Stationery'
]

const suppliers = [
  'TechCorp',
  'OfficeSupplies Inc',
  'HomeGoods Ltd',
  'LightTech',
  'FitnessPro',
  'CoffeeMasters',
  'PaperWorks'
]

const stockStatuses = [
  { value: 'in-stock', label: 'In Stock' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' }
]

// Watch for changes and emit updates
watch(localFilters, (newFilters) => {
  emit('update:filters', { ...newFilters })
}, { deep: true })
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Category Filter -->
    <div>
      <label
        for="category-filter"
        class="block text-sm font-medium text-slate-700 mb-2"
      >
        Category
      </label>
      <select
        id="category-filter"
        v-model="localFilters.category"
        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option :value="undefined">
          All Categories
        </option>
        <option
          v-for="category in categories"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>
    </div>

    <!-- Supplier Filter -->
    <div>
      <label
        for="supplier-filter"
        class="block text-sm font-medium text-slate-700 mb-2"
      >
        Supplier
      </label>
      <select
        id="supplier-filter"
        v-model="localFilters.supplier"
        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option :value="undefined">
          All Suppliers
        </option>
        <option
          v-for="supplier in suppliers"
          :key="supplier"
          :value="supplier"
        >
          {{ supplier }}
        </option>
      </select>
    </div>

    <!-- Stock Status Filter -->
    <div>
      <label
        for="status-filter"
        class="block text-sm font-medium text-slate-700 mb-2"
      >
        Stock Status
      </label>
      <select
        id="status-filter"
        v-model="localFilters.status"
        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option :value="undefined">
          All Statuses
        </option>
        <option
          v-for="status in stockStatuses"
          :key="status.value"
          :value="status.value"
        >
          {{ status.label }}
        </option>
      </select>
    </div>

    <!-- Low Stock Only Toggle -->
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-2">
        Quick Filters
      </label>
      <div class="flex items-center h-10">
        <label class="inline-flex items-center cursor-pointer">
          <input
            v-model="localFilters.lowStockOnly"
            type="checkbox"
            class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          >
          <span class="ml-2 text-sm text-slate-700">Low Stock Only</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom select styling */
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* Smooth transitions */
select,
input[type="checkbox"] {
  transition-property: background-color, border-color, color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>

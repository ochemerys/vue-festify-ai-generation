<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

/**
 * ProductFilters.vue - Advanced product filtering component
 *
 * Features:
 * - Category filter
 * - Supplier filter
 * - Price range filter
 * - Stock status filter
 * - Product status filter
 * - Reset functionality
 *
 * Accessibility:
 * - Proper form labels
 * - Keyboard navigation
 * - Screen reader support
 */

interface ProductFilters {
  search?: string
  category?: string
  supplier?: string
  priceMin?: number
  priceMax?: number
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock'
  status?: 'active' | 'inactive' | 'discontinued'
}

interface Props {
  filters: ProductFilters
}

interface Emits {
  (e: 'update:filters', filters: ProductFilters): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local filter state
const localFilters = ref<ProductFilters>({ ...props.filters })

// Available filter options (mock data)
const categories = ref<string[]>([
  'Electronics',
  'Furniture',
  'Kitchenware',
  'Sports & Fitness',
  'Food & Beverage',
  'Stationery'
])

const suppliers = ref<string[]>([
  'TechCorp',
  'OfficeSupplies Inc',
  'HomeGoods Ltd',
  'LightTech',
  'FitnessPro',
  'CoffeeMasters',
  'PaperWorks'
])

// Computed properties
const hasActiveFilters = computed(() => {
  return Object.values(localFilters.value).some(value =>
    value !== undefined && value !== null && value !== ''
  )
})

// Methods
const updateFilters = () => {
  // Convert empty strings to undefined
  const cleanedFilters: ProductFilters = { ...localFilters.value };
  (Object.keys(cleanedFilters) as Array<keyof ProductFilters>).forEach((key: keyof ProductFilters) => {
    if (cleanedFilters[key] === '') {
      cleanedFilters[key] = undefined as any
    }
  })
  emit('update:filters', cleanedFilters)
}

const resetFilters = () => {
  localFilters.value = {}
  updateFilters()
}

const clearField = (field: keyof ProductFilters) => {
  localFilters.value[field] = undefined
  updateFilters()
}

// Watch for prop changes (when filters are reset externally)
const updateLocalFilters = () => {
  localFilters.value = { ...props.filters }
}

// Initialize
onMounted(() => {
  updateLocalFilters()
})
</script>

<template>
  <div class="border-t border-slate-200 pt-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Category Filter -->
      <div>
        <label for="category-filter" class="block text-sm font-medium text-slate-700 mb-2">
          Category
        </label>
        <select
          id="category-filter"
          v-model="localFilters.category"
          @change="updateFilters"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <!-- Supplier Filter -->
      <div>
        <label for="supplier-filter" class="block text-sm font-medium text-slate-700 mb-2">
          Supplier
        </label>
        <select
          id="supplier-filter"
          v-model="localFilters.supplier"
          @change="updateFilters"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">All Suppliers</option>
          <option v-for="supplier in suppliers" :key="supplier" :value="supplier">
            {{ supplier }}
          </option>
        </select>
      </div>

      <!-- Price Range Filter -->
      <div>
        <span class="block text-sm font-medium text-slate-700 mb-2">
          Price Range
        </span>
        <div class="flex gap-2">
          <label class="sr-only" for="price-min">Minimum Price</label>
          <input
            id="price-min"
            v-model.number="localFilters.priceMin"
            @input="updateFilters"
            type="number"
            placeholder="Min"
            min="0"
            step="0.01"
            class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <label class="sr-only" for="price-max">Maximum Price</label>
          <input
            id="price-max"
            v-model.number="localFilters.priceMax"
            @input="updateFilters"
            type="number"
            placeholder="Max"
            min="0"
            step="0.01"
            class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <!-- Stock Status Filter -->
      <div>
        <label for="stock-status-filter" class="block text-sm font-medium text-slate-700 mb-2">
          Stock Status
        </label>
        <select
          id="stock-status-filter"
          v-model="localFilters.stockStatus"
          @change="updateFilters"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">All Stock Status</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      <!-- Product Status Filter -->
      <div>
        <label for="status-filter" class="block text-sm font-medium text-slate-700 mb-2">
          Product Status
        </label>
        <select
          id="status-filter"
          v-model="localFilters.status"
          @change="updateFilters"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="discontinued">Discontinued</option>
        </select>
      </div>

      <!-- Reset Button -->
      <div class="flex items-end">
        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Active Filters Summary -->
    <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
      <span class="text-sm text-slate-600">Active filters:</span>

      <span
        v-if="localFilters.category"
        class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
      >
        Category: {{ localFilters.category }}
        <button
          @click="clearField('category')"
          class="ml-1 hover:bg-blue-200 rounded-full p-0.5"
          aria-label="Remove category filter"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>

      <span
        v-if="localFilters.supplier"
        class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
      >
        Supplier: {{ localFilters.supplier }}
        <button
          @click="clearField('supplier')"
          class="ml-1 hover:bg-blue-200 rounded-full p-0.5"
          aria-label="Remove supplier filter"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>

      <span
        v-if="localFilters.priceMin !== undefined || localFilters.priceMax !== undefined"
        class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
      >
        Price: ${{ localFilters.priceMin || 0 }} - ${{ localFilters.priceMax || '∞' }}
        <button
          @click="() => { localFilters.priceMin = undefined; localFilters.priceMax = undefined; updateFilters() }"
          class="ml-1 hover:bg-blue-200 rounded-full p-0.5"
          aria-label="Remove price filter"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>

      <span
        v-if="localFilters.stockStatus"
        class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
      >
        Stock: {{ localFilters.stockStatus.replace('-', ' ') }}
        <button
          @click="clearField('stockStatus')"
          class="ml-1 hover:bg-blue-200 rounded-full p-0.5"
          aria-label="Remove stock status filter"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>

      <span
        v-if="localFilters.status"
        class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
      >
        Status: {{ localFilters.status }}
        <button
          @click="clearField('status')"
          class="ml-1 hover:bg-blue-200 rounded-full p-0.5"
          aria-label="Remove status filter"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>
    </div>
  </div>
</template>

<style scoped>
/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Custom number input styling */
input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
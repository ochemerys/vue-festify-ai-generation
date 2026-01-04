<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Download, Filter, Boxes, AlertTriangle } from 'lucide-vue-next'
import InventoryTable from '../components/inventory/InventoryTable.vue'
import InventoryFilters from '../components/inventory/InventoryFilters.vue'
import InventorySummary from '../components/inventory/InventorySummary.vue'
import Pagination from '../components/shared/Pagination.vue'

/**
 * InventoryListPage.vue - Main inventory levels page
 *
 * Responsibilities:
 * - Manages inventory list state, filtering, and pagination
 * - Handles search and filter operations
 * - Coordinates data fetching and error handling
 * - Provides stock adjustment interface
 *
 * Data flow:
 * 1. Component mounts → fetch inventory from API/store
 * 2. User interacts → update filters/search → refetch data
 * 3. Display results in table with pagination
 */

// Inventory item interface (should match backend contract)
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

interface InventoryFilters {
  search?: string
  category?: string
  status?: 'in-stock' | 'low-stock' | 'out-of-stock'
  supplier?: string
  lowStockOnly?: boolean
}

interface InventorySummary {
  totalItems: number
  inStockCount: number
  lowStockCount: number
  outOfStockCount: number
}

// State
const isLoading = ref<boolean>(true)
const error = ref<string | null>(null)
const showFilters = ref<boolean>(false)

// Inventory data
const inventoryItems = ref<InventoryItem[]>([])
const total = ref<number>(0)
const page = ref<number>(1)
const pageSize = ref<number>(10)

// Filters and search
const filters = ref<InventoryFilters>({})
const searchQuery = ref<string>('')

// Summary stats
const summary = ref<InventorySummary>({
  totalItems: 0,
  inStockCount: 0,
  lowStockCount: 0,
  outOfStockCount: 0
})

// Mock data for demonstration
const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Wireless Bluetooth Headphones',
    sku: 'WBH-001',
    category: 'Electronics',
    currentQuantity: 150,
    reorderLevel: 50,
    status: 'in-stock',
    lastRestockDate: new Date('2024-01-15'),
    supplier: 'TechCorp',
    price: 89.99
  },
  {
    id: '2',
    productId: '2',
    productName: 'Ergonomic Office Chair',
    sku: 'EOC-002',
    category: 'Furniture',
    currentQuantity: 45,
    reorderLevel: 50,
    status: 'low-stock',
    lastRestockDate: new Date('2024-01-10'),
    supplier: 'OfficeSupplies Inc',
    price: 299.99
  },
  {
    id: '3',
    productId: '3',
    productName: 'Stainless Steel Water Bottle',
    sku: 'SSWB-003',
    category: 'Kitchenware',
    currentQuantity: 8,
    reorderLevel: 50,
    status: 'low-stock',
    lastRestockDate: new Date('2024-01-08'),
    supplier: 'HomeGoods Ltd',
    price: 24.99
  },
  {
    id: '4',
    productId: '4',
    productName: 'LED Desk Lamp',
    sku: 'LDL-004',
    category: 'Electronics',
    currentQuantity: 0,
    reorderLevel: 50,
    status: 'out-of-stock',
    lastRestockDate: new Date('2023-12-20'),
    supplier: 'LightTech',
    price: 49.99
  },
  {
    id: '5',
    productId: '5',
    productName: 'Yoga Mat Premium',
    sku: 'YMP-005',
    category: 'Sports & Fitness',
    currentQuantity: 75,
    reorderLevel: 20,
    status: 'in-stock',
    lastRestockDate: new Date('2024-01-12'),
    supplier: 'FitnessPro',
    price: 39.99
  },
  {
    id: '6',
    productId: '6',
    productName: 'Coffee Beans - Colombian',
    sku: 'CBC-006',
    category: 'Food & Beverage',
    currentQuantity: 200,
    reorderLevel: 30,
    status: 'in-stock',
    lastRestockDate: new Date('2024-01-14'),
    supplier: 'CoffeeMasters',
    price: 15.99
  },
  {
    id: '7',
    productId: '7',
    productName: 'Wireless Mouse',
    sku: 'WM-007',
    category: 'Electronics',
    currentQuantity: 120,
    reorderLevel: 25,
    status: 'in-stock',
    lastRestockDate: new Date('2024-01-13'),
    supplier: 'TechCorp',
    price: 29.99
  },
  {
    id: '8',
    productId: '8',
    productName: 'Notebook A5 Lined',
    sku: 'NAL-008',
    category: 'Stationery',
    currentQuantity: 300,
    reorderLevel: 50,
    status: 'in-stock',
    lastRestockDate: new Date('2024-01-11'),
    supplier: 'PaperWorks',
    price: 4.99
  }
]

// Computed properties
const filteredInventory = computed(() => {
  let result = [...mockInventoryItems]

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item =>
      item.productName.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    )
  }

  // Apply category filter
  if (filters.value.category) {
    result = result.filter(item => item.category === filters.value.category)
  }

  // Apply supplier filter
  if (filters.value.supplier) {
    result = result.filter(item => item.supplier === filters.value.supplier)
  }

  // Apply status filter
  if (filters.value.status) {
    result = result.filter(item => item.status === filters.value.status)
  }

  // Apply low stock only filter
  if (filters.value.lowStockOnly) {
    result = result.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock')
  }

  return result
})

const paginatedInventory = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredInventory.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredInventory.value.length / pageSize.value)
})

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value =>
    value !== undefined && value !== null && value !== ''
  ) || searchQuery.value.trim() !== ''
})

// Calculate summary stats
const calculateSummary = () => {
  const items = filteredInventory.value
  summary.value = {
    totalItems: items.length,
    inStockCount: items.filter(item => item.status === 'in-stock').length,
    lowStockCount: items.filter(item => item.status === 'low-stock').length,
    outOfStockCount: items.filter(item => item.status === 'out-of-stock').length
  }
}

// Methods
const fetchInventory = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    // In real implementation, this would call:
    // const response = await inventoryApi.getInventory({
    //   page: page.value,
    //   pageSize: pageSize.value,
    //   filters: filters.value,
    //   search: searchQuery.value
    // })

    total.value = mockInventoryItems.length
    inventoryItems.value = mockInventoryItems
    calculateSummary()

    isLoading.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load inventory'
    isLoading.value = false
  }
}

const handleSearch = (query: string) => {
  searchQuery.value = query
  page.value = 1 // Reset to first page
  calculateSummary()
}

const handleFiltersChange = (newFilters: InventoryFilters) => {
  filters.value = newFilters
  page.value = 1
  calculateSummary()
}

const handlePageChange = (newPage: number) => {
  page.value = newPage
}

const handlePageSizeChange = (newSize: number) => {
  pageSize.value = newSize
  page.value = 1
}

const handleAdjustStock = (itemId: string) => {
  // In real implementation, open stock adjustment modal
  console.log('Adjust stock for item:', itemId)
}

const handleViewHistory = (itemId: string) => {
  // In real implementation, navigate to transaction history page
  console.log('View history for item:', itemId)
}

const handleReorder = (itemId: string) => {
  // In real implementation, create purchase order
  console.log('Create purchase order for item:', itemId)
}

const handleExport = () => {
  // In real implementation, export inventory to CSV/Excel
  console.log('Export inventory')
}

const clearFilters = () => {
  filters.value = {}
  searchQuery.value = ''
  page.value = 1
  calculateSummary()
}

// Lifecycle
onMounted(() => {
  fetchInventory()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Page header -->
    <div class="bg-white border-b border-slate-200 px-6 py-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">Inventory Levels</h1>
            <p class="text-slate-600 mt-1">Monitor and manage stock quantities</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="handleExport"
              class="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <Download :size="16" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Summary stats -->
      <InventorySummary
        v-if="!isLoading"
        :summary="summary"
        class="mb-6"
      />

      <!-- Search and filters -->
      <div class="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search input -->
          <div class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" :size="20" />
              <input
                v-model="searchQuery"
                @input="handleSearch(searchQuery)"
                type="text"
                placeholder="Search by product name, SKU, or category..."
                class="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <!-- Filter toggle -->
          <button
            @click="showFilters = !showFilters"
            class="inline-flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            :class="{ 'bg-blue-50 border-blue-300': showFilters }"
          >
            <Filter :size="16" />
            Filters
            <span v-if="hasActiveFilters" class="ml-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              Active
            </span>
          </button>

          <!-- Clear filters -->
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Clear all
          </button>
        </div>

        <!-- Expandable filters -->
        <InventoryFilters
          v-if="showFilters"
          :filters="filters"
          @update:filters="handleFiltersChange"
          class="mt-6"
        />
      </div>

      <!-- Low stock alert -->
      <div
        v-if="!isLoading && summary.lowStockCount > 0"
        class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3"
      >
        <AlertTriangle :size="20" class="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="text-sm font-medium text-amber-900">Low Stock Alert</h3>
          <p class="text-sm text-amber-700 mt-1">
            {{ summary.lowStockCount }} product{{ summary.lowStockCount === 1 ? '' : 's' }} 
            {{ summary.lowStockCount === 1 ? 'is' : 'are' }} running low on stock. 
            Consider reordering soon.
          </p>
        </div>
      </div>

      <!-- Inventory table -->
      <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <InventoryTable
          :items="paginatedInventory"
          :loading="isLoading"
          @adjust-stock="handleAdjustStock"
          @view-history="handleViewHistory"
          @reorder="handleReorder"
        />
      </div>

      <!-- Pagination -->
      <div v-if="!isLoading && totalPages > 1" class="mt-6">
        <Pagination
          :current-page="page"
          :total-pages="totalPages"
          :page-size="pageSize"
          :total-items="filteredInventory.length"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>

      <!-- Empty state -->
      <div
        v-if="!isLoading && filteredInventory.length === 0"
        class="text-center py-12"
      >
        <div class="text-slate-400 mb-4">
          <Boxes :size="64" class="mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-slate-900 mb-2">No inventory items found</h3>
        <p class="text-slate-600 mb-6">
          {{ hasActiveFilters ? 'No items match your current filters.' : 'No inventory items available.' }}
        </p>
        <div class="flex items-center justify-center gap-3">
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-if="error"
        class="text-center py-12"
      >
        <div class="text-red-400 mb-4">
          <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-slate-900 mb-2">Failed to load inventory</h3>
        <p class="text-slate-600 mb-6">{{ error }}</p>
        <button
          @click="fetchInventory"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions */
:deep(.transition-all) {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>

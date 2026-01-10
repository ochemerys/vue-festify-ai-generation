<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Download, Filter, Package } from 'lucide-vue-next'
import ProductTable from '../components/products/ProductTable.vue'
import ProductFilters from '../components/products/ProductFilters.vue'
import Pagination from '../components/shared/Pagination.vue'

/**
 * ProductsListPage.vue - Main products catalog page
 *
 * Responsibilities:
 * - Manages product list state, filtering, and pagination
 * - Handles search and filter operations
 * - Coordinates data fetching and error handling
 * - Provides bulk operations interface
 *
 * Data flow:
 * 1. Component mounts → fetch products from API/store
 * 2. User interacts → update filters/search → refetch data
 * 3. Display results in table with pagination
 */

// Mock product interface (should match backend contract)
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

interface ProductFiltersInterface {
  search?: string
  category?: string
  supplier?: string
  priceMin?: number
  priceMax?: number
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock'
  status?: 'active' | 'inactive' | 'discontinued'
}

interface SortOptions {
  field: 'name' | 'price' | 'quantity' | 'createdAt'
  direction: 'asc' | 'desc'
}

// State
const isLoading = ref<boolean>(true)
const error = ref<string | null>(null)
const showFilters = ref<boolean>(false)

// Product data
const products = ref<Product[]>([])
const total = ref<number>(0)
const page = ref<number>(1)
const pageSize = ref<number>(10)

// Filters and search
const filters = ref<ProductFiltersInterface>({})
const sort = ref<SortOptions>({ field: 'name', direction: 'asc' })
const searchQuery = ref<string>('')

// Selection state for bulk operations
const selectedProducts = ref<Set<string>>(new Set())

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    sku: 'WBH-001',
    category: 'Electronics',
    supplier: 'TechCorp',
    price: 89.99,
    cost: 45.50,
    quantity: 150,
    reorderLevel: 20,
    status: 'active',
    description: 'High-quality wireless headphones with noise cancellation',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Ergonomic Office Chair',
    sku: 'EOC-002',
    category: 'Furniture',
    supplier: 'OfficeSupplies Inc',
    price: 299.99,
    cost: 150.00,
    quantity: 45,
    reorderLevel: 10,
    status: 'active',
    description: 'Adjustable ergonomic chair for office use',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: '3',
    name: 'Stainless Steel Water Bottle',
    sku: 'SSWB-003',
    category: 'Kitchenware',
    supplier: 'HomeGoods Ltd',
    price: 24.99,
    cost: 12.00,
    quantity: 8,
    reorderLevel: 15,
    status: 'active',
    description: 'Insulated stainless steel water bottle, 500ml',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13')
  },
  {
    id: '4',
    name: 'LED Desk Lamp',
    sku: 'LDL-004',
    category: 'Electronics',
    supplier: 'LightTech',
    price: 49.99,
    cost: 25.00,
    quantity: 0,
    reorderLevel: 12,
    status: 'active',
    description: 'Adjustable LED desk lamp with USB charging',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '5',
    name: 'Yoga Mat Premium',
    sku: 'YMP-005',
    category: 'Sports & Fitness',
    supplier: 'FitnessPro',
    price: 39.99,
    cost: 18.00,
    quantity: 75,
    reorderLevel: 20,
    status: 'active',
    description: 'Non-slip premium yoga mat, 6mm thick',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11')
  },
  {
    id: '6',
    name: 'Coffee Beans - Colombian',
    sku: 'CBC-006',
    category: 'Food & Beverage',
    supplier: 'CoffeeMasters',
    price: 15.99,
    cost: 8.50,
    quantity: 200,
    reorderLevel: 30,
    status: 'active',
    description: 'Premium Colombian coffee beans, 1kg',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '7',
    name: 'Wireless Mouse',
    sku: 'WM-007',
    category: 'Electronics',
    supplier: 'TechCorp',
    price: 29.99,
    cost: 14.00,
    quantity: 120,
    reorderLevel: 25,
    status: 'active',
    description: 'Ergonomic wireless optical mouse',
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09')
  },
  {
    id: '8',
    name: 'Notebook A5 Lined',
    sku: 'NAL-008',
    category: 'Stationery',
    supplier: 'PaperWorks',
    price: 4.99,
    cost: 2.00,
    quantity: 300,
    reorderLevel: 50,
    status: 'active',
    description: 'A5 lined notebook, 100 pages',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  }
]

// Computed properties
const filteredProducts = computed(() => {
  let result = [...mockProducts]

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    )
  }

  // Apply category filter
  if (filters.value.category) {
    result = result.filter(product => product.category === filters.value.category)
  }

  // Apply supplier filter
  if (filters.value.supplier) {
    result = result.filter(product => product.supplier === filters.value.supplier)
  }

  // Apply price range filter
  if (filters.value.priceMin !== undefined) {
    result = result.filter(product => product.price >= filters.value.priceMin!)
  }
  if (filters.value.priceMax !== undefined) {
    result = result.filter(product => product.price <= filters.value.priceMax!)
  }

  // Apply stock status filter
  if (filters.value.stockStatus) {
    result = result.filter(product => {
      switch (filters.value.stockStatus) {
        case 'out-of-stock':
          return product.quantity === 0
        case 'low-stock':
          return product.quantity > 0 && product.quantity <= product.reorderLevel
        case 'in-stock':
          return product.quantity > product.reorderLevel
        default:
          return true
      }
    })
  }

  // Apply status filter
  if (filters.value.status) {
    result = result.filter(product => product.status === filters.value.status)
  }

  // Apply sorting
  result.sort((a, b) => {
    const field = sort.value.field as keyof Product
    let aValue: string | number | Date = a[field] as string | number | Date
    let bValue: string | number | Date = b[field] as string | number | Date

    if (sort.value.field === 'createdAt') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    if (aValue < bValue) return sort.value.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sort.value.direction === 'asc' ? 1 : -1
    return 0
  })

  return result
})

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / pageSize.value)
})

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value =>
    value !== undefined && value !== null && value !== ''
  ) || searchQuery.value.trim() !== ''
})

const selectedCount = computed(() => selectedProducts.value.size)

const allSelected = computed(() => {
  return paginatedProducts.value.length > 0 &&
         paginatedProducts.value.every(product => selectedProducts.value.has(product.id))
})

const someSelected = computed(() => {
  return selectedProducts.value.size > 0 && !allSelected.value
})

// Methods
const fetchProducts = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    // In real implementation, this would call:
    // const response = await productApi.getProducts({
    //   page: page.value,
    //   pageSize: pageSize.value,
    //   filters: filters.value,
    //   sort: sort.value,
    //   search: searchQuery.value
    // })

    total.value = mockProducts.length
    products.value = mockProducts

    isLoading.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load products'
    isLoading.value = false
  }
}

const handleSearch = (query: string) => {
  searchQuery.value = query
  page.value = 1 // Reset to first page
  selectedProducts.value.clear() // Clear selection
}

const handleFiltersChange = (newFilters: ProductFiltersInterface) => {
  filters.value = newFilters
  page.value = 1
  selectedProducts.value.clear()
}

const handleSort = (field: string, direction: 'asc' | 'desc') => {
  sort.value = { field: field as 'name' | 'price' | 'quantity' | 'createdAt', direction }
}

const handlePageChange = (newPage: number) => {
  page.value = newPage
  selectedProducts.value.clear()
}

const handlePageSizeChange = (newSize: number) => {
  pageSize.value = newSize
  page.value = 1
  selectedProducts.value.clear()
}

const handleSelectAll = () => {
  if (allSelected.value) {
    // Deselect all visible products
    paginatedProducts.value.forEach(product => {
      selectedProducts.value.delete(product.id)
    })
  } else {
    // Select all visible products
    paginatedProducts.value.forEach(product => {
      selectedProducts.value.add(product.id)
    })
  }
}

const handleSelectProduct = (productId: string, selected: boolean) => {
  if (selected) {
    selectedProducts.value.add(productId)
  } else {
    selectedProducts.value.delete(productId)
  }
}

const handleBulkDelete = () => {
  if (selectedProducts.value.size === 0) return

  // In real implementation, show confirmation dialog
  if (confirm(`Delete ${selectedProducts.value.size} selected products?`)) {
    // Remove selected products from mock data
    const newProducts = mockProducts.filter(product =>
      !selectedProducts.value.has(product.id)
    )
    mockProducts.length = 0
    mockProducts.push(...newProducts)

    selectedProducts.value.clear()
    fetchProducts()
  }
}

const handleCreateProduct = () => {
  // In real implementation, navigate to create product page
  console.log('Navigate to create product page')
}

const handleEditProduct = (productId: string) => {
  // In real implementation, navigate to edit product page
  console.log('Edit product:', productId)
}

const handleDeleteProduct = (productId: string) => {
  // In real implementation, show confirmation dialog
  // eslint-disable-next-line no-alert
  if (confirm('Delete this product?')) {
    const index = mockProducts.findIndex(p => p.id === productId)
    if (index > -1) {
      mockProducts.splice(index, 1)
      selectedProducts.value.delete(productId)
      fetchProducts()
    }
  }
}

const handleExport = () => {
  // In real implementation, export products to CSV/Excel
  // eslint-disable-next-line no-console
  console.log('Export products')
}

const clearFilters = () => {
  filters.value = {}
  searchQuery.value = ''
  page.value = 1
  selectedProducts.value.clear()
}

// Lifecycle
onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Page header -->
    <div class="bg-white border-b border-slate-200 px-6 py-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">
              Product Catalog
            </h1>
            <p class="text-slate-600 mt-1">
              Manage your inventory products
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              @click="handleExport"
            >
              <Download :size="16" />
              Export
            </button>
            <button
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              @click="handleCreateProduct"
            >
              <Plus :size="16" />
              Create Product
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Search and filters -->
      <div class="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search input -->
          <div class="flex-1">
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                :size="20"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products by name, SKU, or category..."
                class="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                @input="handleSearch(searchQuery)"
              >
            </div>
          </div>

          <!-- Filter toggle -->
          <button
            class="inline-flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            :class="{ 'bg-blue-50 border-blue-300': showFilters }"
            @click="showFilters = !showFilters"
          >
            <Filter :size="16" />
            Filters
            <span
              v-if="hasActiveFilters"
              class="ml-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
            >
              Active
            </span>
          </button>

          <!-- Clear filters -->
          <button
            v-if="hasActiveFilters"
            class="px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            @click="clearFilters"
          >
            Clear all
          </button>
        </div>

        <!-- Expandable filters -->
        <ProductFilters
          v-if="showFilters"
          :filters="filters"
          class="mt-6"
          @update:filters="handleFiltersChange"
        />
      </div>

      <!-- Bulk actions bar -->
      <div
        v-if="selectedCount > 0"
        class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-blue-900">
            {{ selectedCount }} product{{ selectedCount === 1 ? '' : 's' }} selected
          </span>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            @click="handleBulkDelete"
          >
            Delete Selected
          </button>
        </div>
      </div>

      <!-- Products table -->
      <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <ProductTable
          :products="paginatedProducts"
          :loading="isLoading"
          :sort="sort"
          :selected-products="selectedProducts"
          :all-selected="allSelected"
          :some-selected="someSelected"
          @sort="handleSort"
          @select-all="handleSelectAll"
          @select-product="handleSelectProduct"
          @edit-product="handleEditProduct"
          @delete-product="handleDeleteProduct"
        />
      </div>

      <!-- Pagination -->
      <div
        v-if="!isLoading && totalPages > 1"
        class="mt-6"
      >
        <Pagination
          :current-page="page"
          :total-pages="totalPages"
          :page-size="pageSize"
          :total-items="filteredProducts.length"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>

      <!-- Empty state -->
      <div
        v-if="!isLoading && filteredProducts.length === 0"
        class="text-center py-12"
      >
        <div class="text-slate-400 mb-4">
          <Package
            :size="64"
            class="mx-auto"
          />
        </div>
        <h3 class="text-lg font-medium text-slate-900 mb-2">
          No products found
        </h3>
        <p class="text-slate-600 mb-6">
          {{ hasActiveFilters ? 'No products match your current filters.' : 'Get started by creating your first product.' }}
        </p>
        <div class="flex items-center justify-center gap-3">
          <button
            v-if="hasActiveFilters"
            class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            @click="clearFilters"
          >
            Clear Filters
          </button>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            @click="handleCreateProduct"
          >
            <Plus :size="16" />
            Create Product
          </button>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-if="error"
        class="text-center py-12"
      >
        <div class="text-red-400 mb-4">
          <svg
            class="mx-auto h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-slate-900 mb-2">
          Failed to load products
        </h3>
        <p class="text-slate-600 mb-6">
          {{ error }}
        </p>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          @click="fetchProducts"
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
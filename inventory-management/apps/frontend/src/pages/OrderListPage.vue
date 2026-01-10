<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Page header -->
    <div class="bg-white border-b border-slate-200 px-6 py-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">
              Orders
            </h1>
            <p class="text-slate-600 mt-1">
              Manage and track customer orders
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              @click="onQuickAction('export')"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              @click="onQuickAction('new-order')"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Order
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Summary stats -->
      <OrderSummaryStats
        :summary="response.summary"
        :loading="loading"
        class="mb-6"
      />

      <!-- Search and filters -->
      <div class="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search input -->
          <div class="flex-1">
            <div class="relative">
              <svg
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                placeholder="Search by order #, customer, or email..."
                class="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                @input="handleSearch"
              >
            </div>
          </div>

          <!-- Filter toggle -->
          <button
            class="inline-flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            :class="{ 'bg-blue-50 border-blue-300': showFilters }"
            @click="showFilters = !showFilters"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
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
        <OrderFilters
          v-if="showFilters"
          :filters="filters"
          :loading="false"
          class="mt-6"
          @update:filters="onUpdateFilters"
          @reset="clearFilters"
        />
      </div>

      <!-- Pending orders alert -->
      <div
        v-if="!loading && response.summary.pendingOrders > 0"
        class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3"
      >
        <svg
          class="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1-1.964-1-2.732 0L4.082 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-amber-900">
            Pending Orders
          </h3>
          <p class="text-sm text-amber-700 mt-1">
            {{ response.summary.pendingOrders }} order{{ response.summary.pendingOrders === 1 ? '' : 's' }} 
            {{ response.summary.pendingOrders === 1 ? 'is' : 'are' }} awaiting processing.
          </p>
        </div>
      </div>

      <!-- Orders table -->
      <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <!-- Desktop/Tablet Table View -->
        <div class="hidden md:block">
          <OrderTable
            :orders="pagedOrders"
            :loading="loading"
            :selected-ids="[]"
            :page="page"
            :page-size="pageSize"
            @view-details="openDetails"
            @update-status="onUpdateStatus"
            @cancel="onCancel"
          />
        </div>

        <!-- Mobile Card View -->
        <div class="md:hidden">
          <OrderCardList
            :orders="pagedOrders"
            :loading="loading"
            @view-details="openDetails"
          />
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="!loading && filtered.length > pageSize"
        class="mt-6"
      >
        <PaginationControls
          :page="page"
          :page-size="pageSize"
          :total="filtered.length"
          @update:page="onUpdatePage"
          @update:page-size="onUpdatePageSize"
        />
      </div>

      <!-- Empty state -->
      <div
        v-if="!loading && filtered.length === 0"
        class="text-center py-12"
      >
        <div class="text-slate-400 mb-4">
          <svg
            class="mx-auto h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-slate-900 mb-2">
          No orders found
        </h3>
        <p class="text-slate-600 mb-6">
          {{ hasActiveFilters ? 'No orders match your current filters.' : 'No orders available.' }}
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
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            @click="onQuickAction('new-order')"
          >
            Create Order
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
          Failed to load orders
        </h3>
        <p class="text-slate-600 mb-6">
          {{ error }}
        </p>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          @click="fetchOrders"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Order Details Modal -->
    <OrderDetailsModal
      :order="activeOrder"
      :open="detailsOpen"
      :loading="detailsLoading"
      @close="closeDetails"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import OrderSummaryStats from '../components/orders/OrderSummaryStats.vue'
import OrderFilters from '../components/orders/OrderFilters.vue'
import OrderTable from '../components/orders/OrderTable.vue'
import OrderCardList from '../components/orders/OrderCardList.vue'
import PaginationControls from '../components/orders/PaginationControls.vue'
import OrderDetailsModal from '../components/orders/OrderDetailsModal.vue'

/** Domain Types */
export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  itemCount: number
  createdAt: string
  updatedAt: string
  shippedAt?: string
  deliveredAt?: string
  notes?: string
}

export interface OrderListResponse {
  data: Order[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  summary: {
    totalOrders: number
    pendingOrders: number
    processingOrders: number
    shippedOrders: number
    deliveredOrders: number
  }
}

export interface OrderFiltersInterface {
  search?: string
  status?: ('pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled')[]
  startDate?: string
  endDate?: string
}

// Local state
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const detailsLoading = ref<boolean>(false)
const all = ref<Order[]>([])
const filters = ref<OrderFiltersInterface>({
  search: '',
  status: [],
  startDate: '',
  endDate: '',
})
const searchQuery = ref<string>('')
const showFilters = ref<boolean>(false)
const page = ref<number>(1)
const pageSize = ref<number>(10)
const detailsOpen = ref(false)
const activeOrder = ref<Order | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

// Debounce timer for search
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

// Computed properties
const response = computed<OrderListResponse>(() => {
  const summary = computeSummary(all.value)
  return {
    data: all.value,
    total: all.value.length,
    page: page.value,
    pageSize: pageSize.value,
    hasMore: page.value * pageSize.value < all.value.length,
    summary,
  }
})

const filtered = computed<Order[]>(() => {
  const q = (filters.value.search || '').toLowerCase().trim()
  const statusSet = new Set(filters.value.status || [])
  const start = filters.value.startDate ? new Date(filters.value.startDate).getTime() : -Infinity
  const end = filters.value.endDate ? new Date(filters.value.endDate).getTime() : Infinity

  return all.value.filter((o) => {
    const matchesQuery =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q)
    const matchesStatus = statusSet.size === 0 || statusSet.has(o.status)
    const created = new Date(o.createdAt).getTime()
    const matchesDate = created >= start && created <= end
    return matchesQuery && matchesStatus && matchesDate
  })
})

const pagedOrders = computed<Order[]>(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const hasActiveFilters = computed(() => {
  return !!(
    filters.value.search ||
    (filters.value.status && filters.value.status.length > 0) ||
    filters.value.startDate ||
    filters.value.endDate
  )
})

/**
 * Lifecycle: Load initial orders
 */
onMounted(async () => {
  await fetchOrders()

  // Setup keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcuts)
})

/**
 * Fetch orders from API
 */
async function fetchOrders(): Promise<void> {
  try {
    loading.value = true
    error.value = null

    // Simulated API delay
    await new Promise((r) => setTimeout(r, 300))
    all.value = generateMockOrders(48)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load orders'
  } finally {
    loading.value = false
  }
}

/**
 * Handle search input with debouncing
 */
function handleSearch(): void {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = setTimeout(() => {
    filters.value = { ...filters.value, search: searchQuery.value }
    page.value = 1
  }, 300)
}

/**
 * Keyboard shortcuts handler
 */
function handleKeyboardShortcuts(e: KeyboardEvent): void {
  // Ctrl+N: Create new order
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault()
    onQuickAction('new-order')
  }
  // Ctrl+F: Focus search field
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault()
    searchInputRef.value?.focus()
  }
  // Ctrl+E: Export orders
  if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
    e.preventDefault()
    onQuickAction('export')
  }
}

/**
 * Filter handlers
 */
function onUpdateFilters(next: OrderFiltersInterface): void {
  filters.value = { ...next }
  // Reset pagination on filter change
  page.value = 1
}

function clearFilters(): void {
  filters.value = { search: '', status: [], startDate: '', endDate: '' }
  searchQuery.value = ''
  page.value = 1
}

/**
 * Pagination handlers
 */
function onUpdatePage(val: number): void {
  page.value = val
}

function onUpdatePageSize(val: number): void {
  pageSize.value = val
  page.value = 1
}

/**
 * Order action handlers
 */
function onUpdateStatus(payload: { orderId: string; status: Order['status'] }): void {
  const idx = all.value.findIndex((o) => o.id === payload.orderId)
  if (idx < 0) return
  const old = all.value[idx] as Order
  all.value[idx] = {
    ...old,
    status: payload.status,
    updatedAt: new Date().toISOString(),
  }
}

function onCancel(orderId: string): void {
  const idx = all.value.findIndex((o) => o.id === orderId)
  if (idx < 0) return
  const current = all.value[idx] as Order
  if (current.status !== 'pending') return
  all.value[idx] = {
    ...current,
    status: 'cancelled',
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Details modal handlers
 */
function openDetails(orderId: string): void {
  detailsLoading.value = true
  activeOrder.value = all.value.find((o) => o.id === orderId) || null
  detailsOpen.value = true
  // Simulate loading delay
  setTimeout(() => {
    detailsLoading.value = false
  }, 200)
}

function closeDetails(): void {
  detailsOpen.value = false
  setTimeout(() => {
    activeOrder.value = null
  }, 300)
}

/**
 * Quick action handlers
 */
function onQuickAction(id: string): void {
  if (id === 'new-order') {
    const newOrder = createNewOrder()
    all.value = [newOrder, ...all.value]
  }
  if (id === 'export') {
    exportToCSV()
  }
}

/**
 * Export orders to CSV
 */
function exportToCSV(): void {
  const rows = [
    ['Order Number', 'Customer', 'Email', 'Status', 'Total', 'Items', 'Created At'],
    ...filtered.value.map((o) => [
      o.orderNumber,
      o.customerName,
      o.customerEmail,
      o.status,
      String(o.total),
      String(o.itemCount),
      o.createdAt,
    ]),
  ]
  const escapeCsv = (s: unknown) => String(s).split('"').join('""')
  const csv = rows.map((r) => r.map((x) => `"${escapeCsv(x)}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Helper: Compute summary statistics
 */
function computeSummary(list: Order[]): OrderListResponse['summary'] {
  const s = {
    totalOrders: list.length,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
  }
  for (const o of list) {
    if (o.status === 'pending') s.pendingOrders++
    else if (o.status === 'processing') s.processingOrders++
    else if (o.status === 'shipped') s.shippedOrders++
    else if (o.status === 'delivered') s.deliveredOrders++
  }
  return s
}

/**
 * Helper: Generate mock orders for demo
 */
function generateMockOrders(n: number): Order[] {
  const statuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered']
  const names = [
    'John Doe',
    'Jane Smith',
    'Bob Johnson',
    'Alice Brown',
    'Charlie Lee',
    'Diana Prince',
    'Eve Wilson',
    'Frank Miller',
  ]
  const list: Order[] = []
  for (let i = 1; i <= n; i++) {
    const status = statuses[i % statuses.length] as Order['status']
    const name = names[i % names.length] as string
    list.push({
      id: `o_${i}`,
      orderNumber: `ORD-2024-${String(i).padStart(3, '0')}`,
      customerId: `c_${i}`,
      customerName: name,
      customerEmail: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      status,
      total: Math.round((50 + Math.random() * 450) * 100) / 100,
      itemCount: 1 + (i % 5),
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      notes: i % 3 === 0 ? 'Customer requested express shipping' : undefined,
    })
  }
  return list
}

/**
 * Helper: Create new order
 */
function createNewOrder(): Order {
  const i = all.value.length + 1
  return {
    id: `o_new_${i}`,
    orderNumber: `ORD-2024-${String(2000 + i).padStart(3, '0')}`,
    customerId: `c_new_${i}`,
    customerName: `New Customer ${i}`,
    customerEmail: `new${i}@example.com`,
    status: 'pending',
    total: 0,
    itemCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
</script>

<style scoped>
/* Smooth transitions */
:deep(.transition-all) {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>

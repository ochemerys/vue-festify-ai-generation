<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Page header -->
    <div class="bg-white border-b border-slate-200 px-6 py-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">
              Purchase Orders
            </h1>
            <p class="text-slate-600 mt-1">
              Manage and track supplier purchase orders
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
              @click="onQuickAction('new-po')"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New PO
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
              <svg
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by PO #, supplier, or notes..."
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
        <div v-if="showFilters" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              v-model="filters.status"
              class="w-full border border-slate-300 rounded-lg px-3 py-2"
            >
              <option value="">All</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PARTIALLY_RECEIVED">Partially Received</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
            <input v-model="filters.supplier" class="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="e.g., Tech Supplies Inc" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Date From</label>
            <input type="date" v-model="filters.startDate" class="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Date To</label>
            <input type="date" v-model="filters.endDate" class="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>
        </div>
      </div>

      <!-- PO table/list -->
      <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div class="hidden md:block">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PO #</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Supplier</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expected</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-for="po in pagedPOs" :key="po.id">
                <td class="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                  <button class="text-blue-600 hover:underline" @click="openDetails(po.id)">{{ po.poNumber }}</button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-slate-700">{{ po.supplier }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        :class="statusClasses(po.status)">{{ po.status }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-slate-700">{{ po.expectedDate ? po.expectedDate.split('T')[0] : '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-slate-700">${{ po.total.toFixed(2) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="inline-flex gap-2">
                    <button class="text-slate-600 hover:text-slate-800" @click="onAction(po, 'submit')" v-if="po.status === 'DRAFT'">Submit</button>
                    <button class="text-slate-600 hover:text-slate-800" @click="onAction(po, 'confirm')" v-if="po.status === 'SUBMITTED'">Confirm</button>
                    <button class="text-slate-600 hover:text-slate-800" @click="onAction(po, 'receive')" v-if="po.status === 'CONFIRMED' || po.status === 'PARTIALLY_RECEIVED'">Receive</button>
                    <button class="text-red-600 hover:text-red-800" @click="onAction(po, 'cancel')" v-if="po.status === 'DRAFT'">Cancel</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile list -->
        <div class="md:hidden divide-y divide-slate-200">
          <div v-for="po in pagedPOs" :key="po.id" class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <button class="font-medium text-blue-600 hover:underline text-left" @click="openDetails(po.id)">{{ po.poNumber }}</button>
                <div class="text-sm text-slate-600">{{ po.supplier }}</div>
              </div>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="statusClasses(po.status)">{{ po.status }}</span>
            </div>
            <div class="mt-2 text-sm text-slate-600 flex items-center justify-between">
              <div>Expected: {{ po.expectedDate ? po.expectedDate.split('T')[0] : '-' }}</div>
              <div class="font-medium text-slate-900">${{ po.total.toFixed(2) }}</div>
            </div>
            <div class="mt-3 flex gap-3">
              <button class="text-slate-600" @click="onAction(po, 'submit')" v-if="po.status === 'DRAFT'">Submit</button>
              <button class="text-slate-600" @click="onAction(po, 'confirm')" v-if="po.status === 'SUBMITTED'">Confirm</button>
              <button class="text-slate-600" @click="onAction(po, 'receive')" v-if="po.status === 'CONFIRMED' || po.status === 'PARTIALLY_RECEIVED'">Receive</button>
              <button class="text-red-600" @click="onAction(po, 'cancel')" v-if="po.status === 'DRAFT'">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && filtered.length > pageSize" class="mt-6">
        <PaginationControls
          :page="page"
          :page-size="pageSize"
          :total="filtered.length"
          @update:page="onUpdatePage"
          @update:page-size="onUpdatePageSize"
        />
      </div>

      <!-- Empty state -->
      <div v-if="!loading && filtered.length === 0" class="text-center py-12">
        <div class="text-slate-400 mb-4">
          <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h18v4H3zM3 7h18v14H3z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-slate-900 mb-2">No purchase orders found</h3>
        <p class="text-slate-600 mb-6">{{ hasActiveFilters ? 'No purchase orders match your current filters.' : 'No purchase orders available.' }}</p>
        <div class="flex items-center justify-center gap-3">
          <button v-if="hasActiveFilters" class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors" @click="clearFilters">Clear Filters</button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors" @click="onQuickAction('new-po')">Create PO</button>
        </div>
      </div>

      <!-- Error state -->
      <div v-if="error" class="text-center py-12">
        <div class="text-red-400 mb-4">
          <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-slate-900 mb-2">Failed to load purchase orders</h3>
        <p class="text-slate-600 mb-6">{{ error }}</p>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors" @click="fetchPOs">Try Again</button>
      </div>
    </div>

    <!-- Details Modal (simplified inline) -->
    <div v-if="detailsOpen" class="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-xl font-semibold text-slate-900">PO {{ activePO?.poNumber }}</h3>
            <p class="text-slate-600">Supplier: {{ activePO?.supplier }}</p>
          </div>
          <button class="text-slate-500 hover:text-slate-700" @click="closeDetails">✕</button>
        </div>
        <div class="mt-4">
          <div class="text-sm text-slate-600">Status: <span class="font-medium text-slate-900">{{ activePO?.status }}</span></div>
          <div class="text-sm text-slate-600 mt-1">Expected: {{ activePO?.expectedDate ? activePO?.expectedDate.split('T')[0] : '-' }}</div>
          <div class="text-sm text-slate-600 mt-1">Notes: {{ activePO?.notes || '-' }}</div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50" @click="closeDetails">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PaginationControls from '../components/orders/PaginationControls.vue'

// Domain types aligned with BDD
export type POStatus = 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED'

export interface PurchaseOrderItem {
  sku: string
  productName: string
  quantity: number
  unitPrice: number
  receivedQuantity: number
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplier: string
  status: POStatus
  expectedDate?: string
  notes?: string
  total: number
  items: PurchaseOrderItem[]
  createdAt: string
}

export interface POFiltersInterface {
  search?: string
  status?: POStatus | ''
  supplier?: string
  startDate?: string
  endDate?: string
}

const loading = ref(false)
const error = ref<string | null>(null)
const all = ref<PurchaseOrder[]>([])
const filters = ref<POFiltersInterface>({ search: '', status: '', supplier: '', startDate: '', endDate: '' })
const searchQuery = ref('')
const showFilters = ref(false)
const page = ref(1)
const pageSize = ref(10)
const detailsOpen = ref(false)
const activePO = ref<PurchaseOrder | null>(null)

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const filtered = computed<PurchaseOrder[]>(() => {
  const q = (filters.value.search || '').toLowerCase().trim()
  const start = filters.value.startDate ? new Date(filters.value.startDate).getTime() : -Infinity
  const end = filters.value.endDate ? new Date(filters.value.endDate).getTime() : Infinity
  return all.value.filter((po) => {
    const matchesQuery =
      !q ||
      po.poNumber.toLowerCase().includes(q) ||
      po.supplier.toLowerCase().includes(q) ||
      (po.notes || '').toLowerCase().includes(q)
    const matchesStatus = !filters.value.status || po.status === filters.value.status
    const matchesSupplier = !filters.value.supplier || po.supplier.toLowerCase().includes(filters.value.supplier.toLowerCase())
    const created = new Date(po.createdAt).getTime()
    const matchesDate = created >= start && created <= end
    return matchesQuery && matchesStatus && matchesSupplier && matchesDate
  })
})

const pagedPOs = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const hasActiveFilters = computed(() => {
  return !!(
    filters.value.search ||
    filters.value.status ||
    filters.value.supplier ||
    filters.value.startDate ||
    filters.value.endDate
  )
})

onMounted(async () => {
  await fetchPOs()
})

async function fetchPOs(): Promise<void> {
  try {
    loading.value = true
    error.value = null
    await new Promise((r) => setTimeout(r, 250))
    all.value = generateMockPOs(24)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load purchase orders'
  } finally {
    loading.value = false
  }
}

function handleSearch(): void {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    filters.value = { ...filters.value, search: searchQuery.value }
    page.value = 1
  }, 300)
}

function onUpdatePage(val: number): void { page.value = val }
function onUpdatePageSize(val: number): void { pageSize.value = val; page.value = 1 }

function clearFilters(): void {
  filters.value = { search: '', status: '', supplier: '', startDate: '', endDate: '' }
  searchQuery.value = ''
  page.value = 1
}

function openDetails(id: string): void {
  activePO.value = all.value.find((x) => x.id === id) || null
  detailsOpen.value = true
}
function closeDetails(): void { detailsOpen.value = false }

function onQuickAction(id: string): void {
  if (id === 'new-po') {
    const po = createNewPO()
    all.value = [po, ...all.value]
  }
  if (id === 'export') exportToCSV()
}

function onAction(po: PurchaseOrder, action: 'submit' | 'confirm' | 'receive' | 'cancel'): void {
  if (action === 'submit' && po.status === 'DRAFT') po.status = 'SUBMITTED'
  else if (action === 'confirm' && po.status === 'SUBMITTED') po.status = 'CONFIRMED'
  else if (action === 'receive' && (po.status === 'CONFIRMED' || po.status === 'PARTIALLY_RECEIVED')) {
    const totalQty = po.items.reduce((a, b) => a + b.quantity, 0)
    const received = po.items.reduce((a, b) => a + b.receivedQuantity, 0)
    const remaining = totalQty - received
    const receiveNow = Math.min(remaining, Math.ceil(totalQty * 0.25))
    // Simulate receiving against first item for demo
    if (receiveNow > 0 && po.items.length > 0) {
      const first = po.items[0]
      if (first) {
        first.receivedQuantity = Math.min(first.quantity, first.receivedQuantity + receiveNow)
      }
    }
    const newReceived = po.items.reduce((a, b) => a + b.receivedQuantity, 0)
    po.status = newReceived >= totalQty ? 'RECEIVED' : 'PARTIALLY_RECEIVED'
  }
  else if (action === 'cancel' && po.status === 'DRAFT') po.status = 'CANCELLED'
}

function exportToCSV(): void {
  const rows = [
    ['PO Number', 'Supplier', 'Status', 'Expected', 'Total', 'Items', 'Created At'],
    ...filtered.value.map((po) => [
      po.poNumber,
      po.supplier,
      po.status,
      po.expectedDate ? po.expectedDate.split('T')[0] : '-',
      String(po.total.toFixed(2)),
      String(po.items.length),
      po.createdAt,
    ]),
  ]
  const escapeCsv = (s: unknown) => String(s).split('"').join('""')
  const csv = rows.map((r) => r.map((x) => `"${escapeCsv(x)}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function statusClasses(status: POStatus): string {
  if (status === 'DRAFT') return 'bg-slate-100 text-slate-700'
  if (status === 'SUBMITTED') return 'bg-blue-100 text-blue-700'
  if (status === 'CONFIRMED') return 'bg-indigo-100 text-indigo-700'
  if (status === 'PARTIALLY_RECEIVED') return 'bg-amber-100 text-amber-700'
  if (status === 'RECEIVED') return 'bg-emerald-100 text-emerald-700'
  if (status === 'CANCELLED') return 'bg-rose-100 text-rose-700'
  return 'bg-slate-100 text-slate-700'
}

function generateMockPOs(n: number): PurchaseOrder[] {
  const suppliers = ['Tech Supplies Inc', 'Fashion Wholesale']
  const skus = ['PROD-001', 'PROD-002']
  const names = ['Wireless Mouse', 'USB-C Cable']
  const statuses: POStatus[] = ['DRAFT', 'SUBMITTED', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED']
  const list: PurchaseOrder[] = []
  for (let i = 1; i <= n; i++) {
    const status = statuses[i % statuses.length] as POStatus
    const supplier = suppliers[i % suppliers.length] as string
    const qty1 = 50
    const qty2 = 100
    const price1 = 12.5
    const price2 = 4.0
    const items: PurchaseOrderItem[] = [
      { sku: skus[0] as string, productName: names[0] as string, quantity: qty1, unitPrice: price1, receivedQuantity: 0 },
      { sku: skus[1] as string, productName: names[1] as string, quantity: qty2, unitPrice: price2, receivedQuantity: 0 },
    ]
    const total = qty1 * price1 + qty2 * price2
    list.push({
      id: `po_${i}`,
      poNumber: `PO-2024-${String(i).padStart(3, '0')}`,
      supplier,
      status,
      expectedDate: new Date(Date.now() + i * 86400000).toISOString(),
      notes: i % 3 === 0 ? 'Urgent delivery' : '',
      total,
      items,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    })
  }
  return list
}

function createNewPO(): PurchaseOrder {
  const i = all.value.length + 1
  const items: PurchaseOrderItem[] = [
    { sku: 'PROD-001', productName: 'Wireless Mouse', quantity: 50, unitPrice: 12.5, receivedQuantity: 0 },
    { sku: 'PROD-002', productName: 'USB-C Cable', quantity: 100, unitPrice: 4.0, receivedQuantity: 0 },
  ]
  const total = items.reduce((a, b) => a + b.quantity * b.unitPrice, 0)
  return {
    id: `po_new_${i}`,
    poNumber: `PO-2024-${String(2000 + i).padStart(3, '0')}`,
    supplier: 'Tech Supplies Inc',
    status: 'DRAFT',
    expectedDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    notes: 'Auto-generated',
    total,
    items,
    createdAt: new Date().toISOString(),
  }
}
</script>

<style scoped>
:deep(.transition-all) {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>

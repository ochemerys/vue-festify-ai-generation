<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Page header -->
    <div class="bg-white border-b border-slate-200 px-6 py-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">
              Reports & Analytics
            </h1>
            <p class="text-slate-600 mt-1">
              Generate reports and view analytics for informed business decisions
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              @click="onQuickAction('history')"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Report Type Selection -->
      <div class="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Select Report Type</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="type in reportTypes"
            :key="type.id"
            class="p-4 border rounded-lg text-left transition-colors"
            :class="selectedReportType === type.id ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'"
            @click="selectReportType(type.id)"
          >
            <div class="flex items-start gap-3">
              <div class="text-blue-600">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="font-medium text-slate-900">{{ type.name }}</h3>
                <p class="text-sm text-slate-600 mt-1">{{ type.description }}</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div v-if="selectedReportType" class="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Report Parameters</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Date From</label>
            <input type="date" v-model="filters.startDate" class="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Date To</label>
            <input type="date" v-model="filters.endDate" class="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Format</label>
            <select v-model="filters.format" class="w-full border border-slate-300 rounded-lg px-3 py-2">
              <option value="table">Table View</option>
              <option value="csv">CSV Export</option>
              <option value="pdf">PDF Export</option>
            </select>
          </div>
        </div>
        <div class="mt-4 flex gap-3">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            @click="generateReport"
            :disabled="loading"
          >
            {{ loading ? 'Generating...' : 'Generate Report' }}
          </button>
          <button
            class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            @click="clearFilters"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Report Results -->
      <div v-if="reportData && !loading" class="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">{{ reportData.title }}</h2>
            <p class="text-sm text-slate-600">Generated on {{ reportData.generatedAt }}</p>
          </div>
          <div class="flex gap-2">
            <button
              class="px-3 py-1.5 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50"
              @click="exportReport('csv')"
            >
              Export CSV
            </button>
            <button
              class="px-3 py-1.5 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50"
              @click="exportReport('pdf')"
            >
              Export PDF
            </button>
          </div>
        </div>

        <!-- Summary Metrics -->
        <div v-if="reportData.summary" class="p-6 border-b border-slate-200">
          <h3 class="text-md font-semibold text-slate-900 mb-4">Summary</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="(value, key) in reportData.summary" :key="key" class="bg-slate-50 rounded-lg p-4">
              <div class="text-sm text-slate-600">{{ formatMetricName(key) }}</div>
              <div class="text-2xl font-bold text-slate-900 mt-1">{{ formatValue(value) }}</div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th v-for="col in reportData.columns" :key="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-for="(row, idx) in reportData.rows" :key="idx">
                <td v-for="col in reportData.columns" :key="col" class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {{ formatCellValue(row[col]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="text-slate-600 mt-4">Generating report...</p>
      </div>

      <!-- Empty state -->
      <div v-if="!selectedReportType && !loading" class="text-center py-12">
        <div class="text-slate-400 mb-4">
          <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-slate-900 mb-2">Select a Report Type</h3>
        <p class="text-slate-600">Choose a report type above to get started</p>
      </div>

      <!-- Error state -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-start gap-3">
          <svg class="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 class="text-sm font-medium text-red-900">Error generating report</h3>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Domain types aligned with BDD
export type ReportType = 'inventory-summary' | 'low-stock' | 'sales' | 'inventory-movement' | 'supplier-performance' | 'product-performance'

export interface ReportTypeInfo {
  id: ReportType
  name: string
  description: string
}

export interface ReportFilters {
  startDate: string
  endDate: string
  format: 'table' | 'csv' | 'pdf'
}

export interface ReportData {
  title: string
  generatedAt: string
  summary?: Record<string, number | string>
  columns: string[]
  rows: Record<string, any>[]
}

const loading = ref(false)
const error = ref<string | null>(null)
const selectedReportType = ref<ReportType | null>(null)
const reportData = ref<ReportData | null>(null)
const filters = ref<ReportFilters>({
  startDate: '',
  endDate: '',
  format: 'table'
})

const reportTypes: ReportTypeInfo[] = [
  {
    id: 'inventory-summary',
    name: 'Inventory Summary',
    description: 'Overview of total products, quantities, and inventory value'
  },
  {
    id: 'low-stock',
    name: 'Low Stock Report',
    description: 'Products below reorder level or out of stock'
  },
  {
    id: 'sales',
    name: 'Sales Report',
    description: 'Revenue, orders, and sales performance metrics'
  },
  {
    id: 'inventory-movement',
    name: 'Inventory Movement',
    description: 'Track purchases, sales, adjustments, and returns'
  },
  {
    id: 'supplier-performance',
    name: 'Supplier Performance',
    description: 'Analyze supplier delivery times and spending'
  },
  {
    id: 'product-performance',
    name: 'Product Performance',
    description: 'Top selling products by units and revenue'
  }
]

function selectReportType(type: ReportType): void {
  selectedReportType.value = type
  reportData.value = null
  error.value = null
}

function clearFilters(): void {
  filters.value = {
    startDate: '',
    endDate: '',
    format: 'table'
  }
}

async function generateReport(): Promise<void> {
  if (!selectedReportType.value) return

  try {
    loading.value = true
    error.value = null
    await new Promise((r) => setTimeout(r, 800))
    reportData.value = generateMockReport(selectedReportType.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate report'
  } finally {
    loading.value = false
  }
}

function generateMockReport(type: ReportType): ReportData {
  const now = new Date().toLocaleString()

  switch (type) {
    case 'inventory-summary':
      return {
        title: 'Inventory Summary Report',
        generatedAt: now,
        summary: {
          totalProducts: 3,
          totalQuantity: 350,
          totalInventoryValue: 7646.50,
          averageValuePerItem: 21.85
        },
        columns: ['SKU', 'Name', 'Quantity', 'Value'],
        rows: [
          { SKU: 'PROD-001', Name: 'Wireless Mouse', Quantity: 100, Value: 2999.00 },
          { SKU: 'PROD-002', Name: 'USB-C Cable', Quantity: 50, Value: 649.50 },
          { SKU: 'PROD-003', Name: 'T-Shirt', Quantity: 200, Value: 3998.00 }
        ]
      }

    case 'low-stock':
      return {
        title: 'Low Stock Report',
        generatedAt: now,
        summary: {
          lowStockItems: 2,
          outOfStockItems: 1
        },
        columns: ['SKU', 'Name', 'Current', 'Reorder', 'Status'],
        rows: [
          { SKU: 'PROD-001', Name: 'Wireless Mouse', Current: 8, Reorder: 10, Status: 'LOW_STOCK' },
          { SKU: 'PROD-002', Name: 'USB-C Cable', Current: 0, Reorder: 20, Status: 'OUT_OF_STOCK' }
        ]
      }

    case 'sales':
      return {
        title: 'Sales Report',
        generatedAt: now,
        summary: {
          totalOrders: 4,
          completedOrders: 3,
          totalRevenue: 325.00,
          averageOrderValue: 81.25,
          pendingRevenue: 200.00
        },
        columns: ['Order Number', 'Status', 'Total', 'Date'],
        rows: [
          { 'Order Number': 'ORD-2024-001', Status: 'DELIVERED', Total: 100.00, Date: '2024-01-01' },
          { 'Order Number': 'ORD-2024-002', Status: 'DELIVERED', Total: 150.00, Date: '2024-01-02' },
          { 'Order Number': 'ORD-2024-003', Status: 'DELIVERED', Total: 75.00, Date: '2024-01-03' },
          { 'Order Number': 'ORD-2024-004', Status: 'PENDING', Total: 200.00, Date: '2024-01-04' }
        ]
      }

    case 'inventory-movement':
      return {
        title: 'Inventory Movement Report',
        generatedAt: now,
        summary: {
          totalPurchases: 100,
          totalSales: 35,
          totalAdjustments: -5,
          totalReturns: 10,
          netMovement: 70
        },
        columns: ['Type', 'Quantity', 'Date'],
        rows: [
          { Type: 'PURCHASE', Quantity: 100, Date: '2024-01-01' },
          { Type: 'SALE', Quantity: -20, Date: '2024-01-02' },
          { Type: 'SALE', Quantity: -15, Date: '2024-01-03' },
          { Type: 'ADJUSTMENT', Quantity: -5, Date: '2024-01-04' },
          { Type: 'RETURN', Quantity: 10, Date: '2024-01-05' }
        ]
      }

    case 'supplier-performance':
      return {
        title: 'Supplier Performance Report',
        generatedAt: now,
        columns: ['Supplier', 'Total Orders', 'Total Spend', 'Avg Delivery Days'],
        rows: [
          { Supplier: 'Tech Supplies Inc', 'Total Orders': 2, 'Total Spend': 1500.00, 'Avg Delivery Days': 4.5 },
          { Supplier: 'Fashion Wholesale', 'Total Orders': 1, 'Total Spend': 750.00, 'Avg Delivery Days': 8 }
        ]
      }

    case 'product-performance':
      return {
        title: 'Product Performance Report',
        generatedAt: now,
        columns: ['SKU', 'Name', 'Units Sold', 'Revenue', 'Rank'],
        rows: [
          { SKU: 'PROD-002', Name: 'USB-C Cable', 'Units Sold': 100, Revenue: 1299.00, Rank: 1 },
          { SKU: 'PROD-001', Name: 'Wireless Mouse', 'Units Sold': 50, Revenue: 1499.50, Rank: 2 },
          { SKU: 'PROD-003', Name: 'T-Shirt', 'Units Sold': 30, Revenue: 599.70, Rank: 3 }
        ]
      }

    default:
      return {
        title: 'Report',
        generatedAt: now,
        columns: [],
        rows: []
      }
  }
}

function formatMetricName(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
}

function formatValue(value: number | string): string {
  if (typeof value === 'number') {
    if (value % 1 === 0) return value.toString()
    return value.toFixed(2)
  }
  return value
}

function formatCellValue(value: any): string {
  if (typeof value === 'number') {
    if (value % 1 === 0) return value.toString()
    return value.toFixed(2)
  }
  return String(value)
}

function exportReport(format: 'csv' | 'pdf'): void {
  if (!reportData.value) return

  if (format === 'csv') {
    const rows = [
      reportData.value.columns,
      ...reportData.value.rows.map(row => reportData.value!.columns.map(col => String(row[col])))
    ]
    const escapeCsv = (s: string) => s.split('"').join('""')
    const csv = rows.map(r => r.map(x => `"${escapeCsv(x)}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedReportType.value}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } else {
    alert('PDF export would be implemented with a PDF library')
  }
}

function onQuickAction(action: string): void {
  if (action === 'history') {
    alert('Report history would show previously generated reports')
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

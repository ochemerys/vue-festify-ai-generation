<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AlertTriangle, TrendingUp, Package, ShoppingCart } from 'lucide-vue-next'
import MetricsGrid from '../components/dashboard/MetricsGrid.vue'
import RecentOrders from '../components/dashboard/RecentOrders.vue'
import QuickActions from '../components/dashboard/QuickActions.vue'

/**
 * DashboardPage.vue - Main dashboard container
 * 
 * Responsibilities:
 * - Orchestrates data fetching from stores
 * - Manages loading and error states
 * - Passes data to presentational components
 * - Handles user interactions (quick actions, navigation)
 * 
 * Data flow:
 * 1. Component mounts → fetch metrics from stores
 * 2. Stores return data → update local state
 * 3. Render presentational components with data
 * 4. User interacts → emit events to parent or navigate
 */

// Mock data types
interface Metric {
  id: string
  label: string
  value: number | string
  trend?: number
  trendDirection?: 'up' | 'down' | 'neutral'
  isUrgent?: boolean
  loading?: boolean
}

interface RecentOrder {
  id: string
  orderNumber: string
  customer: string
  status: 'pending' | 'processing' | 'fulfilled' | 'cancelled'
  total: number
  date: string
}

interface QuickAction {
  id: string
  label: string
  icon: string
  description?: string
}

// State
const isLoading = ref<boolean>(true)
const error = ref<string | null>(null)

// Metrics data
const metrics = ref<Metric[]>([
  {
    id: 'total-products',
    label: 'Total Products',
    value: 1247,
    trend: 12,
    trendDirection: 'up',
    isUrgent: false,
    loading: false
  },
  {
    id: 'low-stock-alerts',
    label: 'Low Stock Alerts',
    value: 23,
    trend: 5,
    trendDirection: 'up',
    isUrgent: true,
    loading: false
  },
  {
    id: 'pending-orders',
    label: 'Purchase Orders',
    value: 8,
    trend: 2,
    trendDirection: 'down',
    isUrgent: false,
    loading: false
  },
  {
    id: 'overdue-orders',
    label: 'Overdue Orders',
    value: 3,
    trend: 1,
    trendDirection: 'up',
    isUrgent: true,
    loading: false
  },
  {
    id: 'inventory-value',
    label: 'Inventory Value',
    value: '$125,430',
    trend: 8,
    trendDirection: 'up',
    isUrgent: false,
    loading: false
  },
  {
    id: 'orders-this-month',
    label: 'Orders This Month',
    value: 156,
    trend: 23,
    trendDirection: 'up',
    isUrgent: false,
    loading: false
  },
  {
    id: 'supplier-performance',
    label: 'Supplier Performance',
    value: '94%',
    trend: 2,
    trendDirection: 'up',
    isUrgent: false,
    loading: false
  },
  {
    id: 'fulfillment-rate',
    label: 'Fulfillment Rate',
    value: '98.5%',
    trend: 1,
    trendDirection: 'up',
    isUrgent: false,
    loading: false
  }
])

// Recent orders data
const recentOrders = ref<RecentOrder[]>([
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: 'Acme Corp',
    status: 'fulfilled',
    total: 2450.00,
    date: '2024-01-15'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customer: 'Tech Solutions Inc',
    status: 'processing',
    total: 1890.50,
    date: '2024-01-14'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customer: 'Global Enterprises',
    status: 'pending',
    total: 3200.00,
    date: '2024-01-13'
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customer: 'Local Business LLC',
    status: 'fulfilled',
    total: 890.25,
    date: '2024-01-12'
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customer: 'International Trade Co',
    status: 'processing',
    total: 5600.00,
    date: '2024-01-11'
  }
])

// Quick actions
const quickActions = ref<QuickAction[]>([
  {
    id: 'create-po',
    label: 'Create Purchase Order',
    icon: 'Plus',
    description: 'Create a new purchase order'
  },
  {
    id: 'adjust-inventory',
    label: 'Adjust Inventory',
    icon: 'Edit',
    description: 'Adjust stock levels'
  },
  {
    id: 'view-alerts',
    label: 'View Low Stock Alerts',
    icon: 'AlertTriangle',
    description: 'Review low stock items'
  },
  {
    id: 'generate-report',
    label: 'Generate Report',
    icon: 'BarChart3',
    description: 'Create inventory report'
  }
])

// Computed
const lowStockCount = computed(() => {
  const metric = metrics.value.find(m => m.id === 'low-stock-alerts')
  return metric?.value || 0
})

const overdueOrdersCount = computed(() => {
  const metric = metrics.value.find(m => m.id === 'overdue-orders')
  return metric?.value || 0
})

const hasAlerts = computed(() => {
  return lowStockCount.value > 0 || overdueOrdersCount.value > 0
})

// Methods
const fetchDashboardData = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Simulate API calls
    // In real implementation, would call:
    // - useInventoryStore().fetchLowStockAlerts()
    // - useOrderStore().fetchOrders()
    // - usePurchaseOrderStore().fetchPurchaseOrders()
    // - useDashboardMetrics().refresh()

    await new Promise(resolve => setTimeout(resolve, 800))

    isLoading.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load dashboard data'
    isLoading.value = false
  }
}

const handleQuickAction = (actionId: string) => {
  console.log('Quick action triggered:', actionId)

  // Route to appropriate page based on action
  switch (actionId) {
    case 'create-po':
      // Navigate to purchase order creation
      break
    case 'adjust-inventory':
      // Navigate to inventory adjustment
      break
    case 'view-alerts':
      // Navigate to inventory with low stock filter
      break
    case 'generate-report':
      // Navigate to reports
      break
  }
}

const handleViewOrder = (orderId: string) => {
  console.log('View order:', orderId)
  // Navigate to order details
}

// Lifecycle
onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Page header -->
    <div class="bg-white border-b border-slate-200 px-6 py-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p class="text-slate-600 mt-1">Welcome back! Here's your inventory overview.</p>
      </div>
    </div>

    <!-- Main content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Alerts section -->
      <div v-if="hasAlerts" class="mb-8">
        <div
          v-if="lowStockCount > 0"
          class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-4"
          role="alert"
        >
          <AlertTriangle class="text-amber-600 flex-shrink-0 mt-0.5" :size="20" />
          <div class="flex-1">
            <h3 class="font-semibold text-amber-900">Low Stock Alerts</h3>
            <p class="text-sm text-amber-800 mt-1">
              {{ lowStockCount }} items are below their reorder level. Consider creating Purchase Orders.
            </p>
          </div>
          <a
            href="/inventory?filter=low-stock"
            class="text-sm font-medium text-amber-600 hover:text-amber-700 whitespace-nowrap ml-4"
          >
            View items →
          </a>
        </div>

        <div
          v-if="overdueOrdersCount > 0"
          class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-4 mt-4"
          role="alert"
        >
          <AlertTriangle class="text-red-600 flex-shrink-0 mt-0.5" :size="20" />
          <div class="flex-1">
            <h3 class="font-semibold text-red-900">Overdue Orders</h3>
            <p class="text-sm text-red-800 mt-1">
              {{ overdueOrdersCount }} orders are overdue. Immediate action required.
            </p>
          </div>
          <a
            href="/orders?status=overdue"
            class="text-sm font-medium text-red-600 hover:text-red-700 whitespace-nowrap ml-4"
          >
            View orders →
          </a>
        </div>
      </div>

      <!-- Metrics grid -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Key Metrics</h2>
        <MetricsGrid
          :metrics="metrics"
          :loading="isLoading"
        />
      </div>

      <!-- Bottom section: Recent orders + Quick actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent orders (2/3 width on desktop) -->
        <div class="lg:col-span-2">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Recent Orders</h2>
          <RecentOrders
            :orders="recentOrders"
            :loading="isLoading"
            @view-order="handleViewOrder"
          />
        </div>

        <!-- Quick actions (1/3 width on desktop) -->
        <div>
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <QuickActions
            :actions="quickActions"
            @execute="handleQuickAction"
          />
        </div>
      </div>

      <!-- Error state -->
      <div
        v-if="error"
        class="mt-8 bg-red-50 border border-red-200 rounded-lg p-4"
        role="alert"
      >
        <p class="text-red-800">{{ error }}</p>
        <button
          @click="fetchDashboardData"
          class="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
        >
          Try again
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

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

/**
 * RecentOrders.vue - Table of recent orders
 * 
 * Features:
 * - Displays recent orders with status badges
 * - Skeleton loading state
 * - Clickable rows for navigation
 * - Responsive table design
 * 
 * Accessibility:
 * - Semantic table element
 * - Proper table headers with scope
 * - Status badges with aria-label
 */

interface Order {
  id: string
  orderNumber: string
  customer: string
  status: 'pending' | 'processing' | 'fulfilled' | 'cancelled'
  total: number
  date: string
}

interface Props {
  orders: Order[]
  loading?: boolean
}

interface Emits {
  (e: 'view-order', orderId: string): void
}

defineProps<Props>()
defineEmits<Emits>()

// Status badge styling
const getStatusClasses = (status: string) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  switch (status) {
    case 'fulfilled':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'processing':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'cancelled':
      return `${baseClasses} bg-red-100 text-red-800`
    default:
      return `${baseClasses} bg-slate-100 text-slate-800`
  }
}

const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
    <!-- Skeleton loading state -->
    <div
      v-if="loading"
      class="divide-y divide-slate-200"
    >
      <div
        v-for="i in 5"
        :key="`skeleton-${i}`"
        class="p-4 space-y-3"
      >
        <div class="flex items-center justify-between">
          <div class="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
          <div class="h-4 bg-slate-200 rounded w-1/6 animate-pulse" />
        </div>
        <div class="flex items-center justify-between">
          <div class="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
          <div class="h-4 bg-slate-200 rounded w-1/5 animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div
      v-else
      class="overflow-x-auto"
    >
      <table
        class="w-full"
        role="table"
      >
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider"
            >
              Order Number
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider"
            >
              Customer
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase tracking-wider"
            >
              Total
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              class="relative px-6 py-3"
            >
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr
            v-for="order in orders"
            :key="order.id"
            class="hover:bg-slate-50 transition-colors cursor-pointer"
            @click="$emit('view-order', order.id)"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm font-medium text-blue-600 hover:text-blue-700">
                {{ order.orderNumber }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-slate-900">{{ order.customer }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="getStatusClasses(order.status)"
                :aria-label="`Status: ${getStatusLabel(order.status)}`"
              >
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <span class="text-sm font-medium text-slate-900">
                {{ formatCurrency(order.total) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-slate-600">
                {{ formatDate(order.date) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <ChevronRight
                :size="16"
                class="text-slate-400"
                :aria-hidden="true"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div
      v-if="!loading && orders.length === 0"
      class="px-6 py-12 text-center"
      role="status"
    >
      <p class="text-slate-600">
        No recent orders found.
      </p>
    </div>

    <!-- Footer -->
    <div
      v-if="!loading && orders.length > 0"
      class="px-6 py-4 border-t border-slate-200 bg-slate-50"
    >
      <a
        href="/orders"
        class="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
      >
        View all orders
        <ChevronRight :size="16" />
      </a>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>

<template>
  <section aria-labelledby="orders-cards-heading">
    <h2 id="orders-cards-heading" class="sr-only">Orders list (mobile view)</h2>

    <!-- Loading State -->
    <div v-if="props.loading" class="space-y-3" role="status" aria-label="Loading orders">
      <div v-for="i in 6" :key="i" class="h-32 rounded-lg bg-gray-100 animate-pulse" />
      <span class="sr-only">Loading orders...</span>
    </div>

    <!-- Empty State -->
    <div 
      v-else-if="props.orders.length === 0" 
      class="flex flex-col items-center justify-center py-12 px-4 bg-white border border-gray-200 rounded-lg"
      role="status"
    >
      <svg 
        class="h-16 w-16 text-gray-400 mb-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="1.5" 
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
        />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
      <p class="text-sm text-gray-500 text-center">
        No orders match your current filters.
      </p>
    </div>

    <!-- Normal State: Card List -->
    <ul v-else class="space-y-3">
      <li 
        v-for="o in props.orders" 
        :key="o.id" 
        class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <!-- Card Header: Order Number & Status -->
        <div class="flex items-start justify-between mb-3">
          <button 
            type="button" 
            class="text-base font-semibold text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            @click="emit('view-details', o.id)"
            :aria-label="`View details for order ${o.orderNumber}`"
          >
            {{ o.orderNumber }}
          </button>
          
          <span 
            :class="badgeClass(o.status)" 
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            role="status"
            :aria-label="`Order status: ${o.status}`"
          >
            <span 
              class="h-1.5 w-1.5 rounded-full" 
              :class="dotClass(o.status)" 
              aria-hidden="true"
            />
            <span class="capitalize">{{ o.status }}</span>
          </span>
        </div>

        <!-- Customer Info -->
        <div class="mb-3">
          <p class="text-sm font-medium text-gray-900">
            {{ o.customerName }}
          </p>
          <p class="text-xs text-gray-500">
            {{ o.customerEmail }}
          </p>
        </div>

        <!-- Order Details Grid -->
        <div class="grid grid-cols-2 gap-3 mb-3 pt-3 border-t border-gray-200">
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Total</p>
            <p class="text-sm font-semibold text-gray-900">
              {{ formatCurrency(o.total) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Items</p>
            <p class="text-sm font-semibold text-gray-900">
              {{ o.itemCount }}
            </p>
          </div>
          <div class="col-span-2">
            <p class="text-xs text-gray-500 mb-0.5">Created</p>
            <p class="text-sm text-gray-700">
              {{ formatDate(o.createdAt) }}
            </p>
          </div>
        </div>

        <!-- Action Button -->
        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          @click="emit('view-details', o.id)"
          :aria-label="`View full details for order ${o.orderNumber}`"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View details
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
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

interface Props {
  orders: Order[]
  loading: boolean
}

interface Emits {
  (e: 'view-details', orderId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Status badge styling
 */
function badgeClass(status: Order['status']): string {
  const baseClasses = 'ring-1'
  
  switch (status) {
    case 'pending':
      return `${baseClasses} bg-amber-50 text-amber-800 ring-amber-200`
    case 'processing':
      return `${baseClasses} bg-blue-50 text-blue-800 ring-blue-200`
    case 'shipped':
      return `${baseClasses} bg-violet-50 text-violet-800 ring-violet-200`
    case 'delivered':
      return `${baseClasses} bg-green-50 text-green-800 ring-green-200`
    case 'cancelled':
      return `${baseClasses} bg-red-50 text-red-800 ring-red-200`
    default:
      return `${baseClasses} bg-gray-50 text-gray-800 ring-gray-200`
  }
}

/**
 * Status dot color
 */
function dotClass(status: Order['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-500'
    case 'processing':
      return 'bg-blue-500'
    case 'shipped':
      return 'bg-violet-500'
    case 'delivered':
      return 'bg-green-500'
    case 'cancelled':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Format date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
</script>

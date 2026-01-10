<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="props.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
        @click.self="emit('close')"
      >
        <!-- Backdrop -->
        <div 
          class="fixed inset-0 bg-black/50 backdrop-blur-sm" 
          aria-hidden="true"
          @click="emit('close')"
        />

        <!-- Modal Content -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div 
            v-if="props.open"
            class="relative bg-white w-full max-w-2xl rounded-lg shadow-xl focus:outline-none"
            @click.stop
          >
            <!-- Header -->
            <header class="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 id="order-details-title" class="text-xl font-semibold text-gray-900">
                Order Details
              </h3>
              <button 
                type="button" 
                class="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Close modal"
                @click="emit('close')"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <!-- Body -->
            <div class="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <!-- Loading State -->
              <div v-if="props.loading" class="space-y-4" role="status" aria-label="Loading order details">
                <div class="h-6 bg-gray-100 rounded animate-pulse" />
                <div class="h-6 bg-gray-100 rounded animate-pulse w-3/4" />
                <div class="h-32 bg-gray-100 rounded animate-pulse" />
                <span class="sr-only">Loading order details...</span>
              </div>

              <!-- Order Details -->
              <div v-else-if="props.order" class="space-y-6">
                <!-- Order Header Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p class="text-sm font-medium text-gray-500 mb-1">Order Number</p>
                    <p class="text-lg font-semibold text-gray-900">
                      {{ props.order.orderNumber }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <span 
                      :class="statusBadgeClass" 
                      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      <span 
                        class="h-2 w-2 rounded-full" 
                        :class="statusDotClass" 
                        aria-hidden="true"
                      />
                      <span class="capitalize">{{ props.order.status }}</span>
                    </span>
                  </div>
                </div>

                <!-- Customer Information -->
                <div class="border-t border-gray-200 pt-6">
                  <h4 class="text-base font-semibold text-gray-900 mb-4">Customer Information</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm font-medium text-gray-500 mb-1">Name</p>
                      <p class="text-sm text-gray-900">{{ props.order.customerName }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500 mb-1">Email</p>
                      <p class="text-sm text-gray-900">
                        <a 
                          :href="`mailto:${props.order.customerEmail}`"
                          class="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {{ props.order.customerEmail }}
                        </a>
                      </p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500 mb-1">Customer ID</p>
                      <p class="text-sm text-gray-900 font-mono">{{ props.order.customerId }}</p>
                    </div>
                  </div>
                </div>

                <!-- Order Summary -->
                <div class="border-t border-gray-200 pt-6">
                  <h4 class="text-base font-semibold text-gray-900 mb-4">Order Summary</h4>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-gray-50 rounded-lg p-4">
                      <p class="text-sm font-medium text-gray-500 mb-1">Total Amount</p>
                      <p class="text-2xl font-bold text-gray-900">
                        {{ formatCurrency(props.order.total) }}
                      </p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4">
                      <p class="text-sm font-medium text-gray-500 mb-1">Items</p>
                      <p class="text-2xl font-bold text-gray-900">
                        {{ props.order.itemCount }}
                      </p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4">
                      <p class="text-sm font-medium text-gray-500 mb-1">Order ID</p>
                      <p class="text-sm font-mono text-gray-900 break-all">
                        {{ props.order.id }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Dates -->
                <div class="border-t border-gray-200 pt-6">
                  <h4 class="text-base font-semibold text-gray-900 mb-4">Timeline</h4>
                  <div class="space-y-3">
                    <div class="flex items-start gap-3">
                      <div class="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">Created</p>
                        <p class="text-sm text-gray-500">{{ formatDateTime(props.order.createdAt) }}</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">Last Updated</p>
                        <p class="text-sm text-gray-500">{{ formatDateTime(props.order.updatedAt) }}</p>
                      </div>
                    </div>
                    <div v-if="props.order.shippedAt" class="flex items-start gap-3">
                      <div class="flex-shrink-0 h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                        <svg class="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">Shipped</p>
                        <p class="text-sm text-gray-500">{{ formatDateTime(props.order.shippedAt) }}</p>
                      </div>
                    </div>
                    <div v-if="props.order.deliveredAt" class="flex items-start gap-3">
                      <div class="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">Delivered</p>
                        <p class="text-sm text-gray-500">{{ formatDateTime(props.order.deliveredAt) }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div v-if="props.order.notes" class="border-t border-gray-200 pt-6">
                  <h4 class="text-base font-semibold text-gray-900 mb-2">Notes</h4>
                  <p class="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                    {{ props.order.notes }}
                  </p>
                </div>
              </div>

              <!-- No Order Selected -->
              <div v-else class="text-center py-8">
                <p class="text-sm text-gray-500">No order selected</p>
              </div>
            </div>

            <!-- Footer -->
            <footer class="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                type="button" 
                class="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                @click="emit('close')"
              >
                Close
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
  order: Order | null
  open: boolean
  loading: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Status badge styling
 */
const statusBadgeClass = computed(() => {
  if (!props.order) return ''
  const s = props.order.status
  const baseClasses = 'ring-1'
  
  switch (s) {
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
})

/**
 * Status dot color
 */
const statusDotClass = computed(() => {
  if (!props.order) return ''
  const s = props.order.status
  
  switch (s) {
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
})

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
 * Format date and time
 */
function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
</script>

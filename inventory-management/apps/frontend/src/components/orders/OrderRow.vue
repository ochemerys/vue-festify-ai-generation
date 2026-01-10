<template>
  <tr 
    class="hover:bg-gray-50 transition-colors"
    role="row"
  >
    <!-- Order Number -->
    <td class="pl-6 pr-4 py-3 whitespace-nowrap">
      <button 
        type="button" 
        class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
        @click="emit('view-details', props.order.id)"
        :aria-label="`View details for order ${props.order.orderNumber}`"
      >
        {{ props.order.orderNumber }}
      </button>
    </td>

    <!-- Customer Info -->
    <td class="px-4 py-3">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-gray-900">
          {{ props.order.customerName }}
        </span>
        <span class="text-xs text-gray-500">
          {{ props.order.customerEmail }}
        </span>
      </div>
    </td>

    <!-- Status Badge -->
    <td class="px-4 py-3 whitespace-nowrap">
      <span 
        :class="badgeClass" 
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        role="status"
        :aria-label="`Order status: ${props.order.status}`"
      >
        <span 
          class="h-1.5 w-1.5 rounded-full" 
          :class="dotClass" 
          aria-hidden="true"
        />
        <span class="capitalize">{{ props.order.status }}</span>
      </span>
    </td>

    <!-- Total -->
    <td class="px-4 py-3 text-right whitespace-nowrap">
      <span class="text-sm font-medium text-gray-900">
        {{ formatCurrency(props.order.total) }}
      </span>
    </td>

    <!-- Created Date -->
    <td class="px-4 py-3 text-right whitespace-nowrap">
      <span class="text-sm text-gray-700">
        {{ formatDate(props.order.createdAt) }}
      </span>
    </td>

    <!-- Details Button with Dropdown -->
    <td class="pl-4 pr-6 py-3 text-right whitespace-nowrap">
      <div class="relative inline-block text-left">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
          @click="toggleDropdown"
          :aria-label="`Actions for order ${props.order.orderNumber}`"
          :aria-expanded="isDropdownOpen"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
          Actions
        </button>

        <!-- Dropdown Menu -->
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="isDropdownOpen"
            class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
          >
            <div class="py-1">
              <!-- View Details -->
              <button
                type="button"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                role="menuitem"
                @click="handleViewDetails"
              >
                <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>

              <!-- Item Count Info -->
              <div class="px-4 py-2 text-sm text-gray-500 border-t border-gray-100">
                <div class="flex items-center justify-between">
                  <span>Items:</span>
                  <span class="font-medium text-gray-900">{{ props.order.itemCount }}</span>
                </div>
              </div>

              <!-- Status Update -->
              <div class="border-t border-gray-100 px-4 py-2">
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Update Status
                </label>
                <select
                  class="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  :value="props.order.status"
                  @change="onChangeStatus"
                  @click.stop
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <!-- Cancel Order (only for pending) -->
              <div v-if="props.order.status === 'pending'" class="border-t border-gray-100">
                <button
                  type="button"
                  class="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                  role="menuitem"
                  @click="handleCancelOrder"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

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
  order: Order
}

interface Emits {
  (e: 'view-details', orderId: string): void
  (e: 'update-status', payload: { orderId: string; status: Order['status'] }): void
  (e: 'cancel', orderId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isDropdownOpen = ref(false)
let dropdownRef: HTMLElement | null = null

/**
 * Toggle dropdown menu
 */
function toggleDropdown(): void {
  isDropdownOpen.value = !isDropdownOpen.value
}

/**
 * Close dropdown when clicking outside
 */
function handleClickOutside(event: MouseEvent): void {
  const target = event.target as HTMLElement
  if (isDropdownOpen.value && !target.closest('.relative')) {
    isDropdownOpen.value = false
  }
}

/**
 * Handle view details action
 */
function handleViewDetails(): void {
  emit('view-details', props.order.id)
  isDropdownOpen.value = false
}

/**
 * Handle cancel order action
 */
function handleCancelOrder(): void {
  if (confirm(`Are you sure you want to cancel order ${props.order.orderNumber}?`)) {
    emit('cancel', props.order.id)
    isDropdownOpen.value = false
  }
}

/**
 * Status badge styling based on order status
 */
const badgeClass = computed(() => {
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
 * Status dot color based on order status
 */
const dotClass = computed(() => {
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
 * Handle status change
 */
function onChangeStatus(e: Event): void {
  const value = (e.target as HTMLSelectElement).value as Order['status']
  if (value !== props.order.status) {
    emit('update-status', { orderId: props.order.id, status: value })
    isDropdownOpen.value = false
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

// Setup click outside listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <section 
    class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm" 
    aria-labelledby="orders-table-heading"
  >
    <h2 id="orders-table-heading" class="sr-only">Orders table</h2>

    <!-- Loading State -->
    <div v-if="props.loading" class="divide-y divide-gray-200" role="status" aria-label="Loading orders">
      <div class="bg-gray-50 h-12" />
      <div v-for="i in 5" :key="i" class="h-16 bg-white animate-pulse flex items-center px-4 gap-4">
        <div class="h-4 w-4 bg-gray-200 rounded" />
        <div class="h-4 w-24 bg-gray-200 rounded" />
        <div class="h-4 w-32 bg-gray-200 rounded" />
        <div class="h-4 w-20 bg-gray-200 rounded" />
        <div class="h-4 w-16 bg-gray-200 rounded ml-auto" />
      </div>
      <span class="sr-only">Loading orders...</span>
    </div>

    <!-- Empty State -->
    <div 
      v-else-if="props.orders.length === 0" 
      class="flex flex-col items-center justify-center py-12 px-4"
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
      <p class="text-sm text-gray-500 mb-4">
        No orders match your current filters.
      </p>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        @click="emit('reset-filters')"
      >
        Clear filters
      </button>
    </div>

    <!-- Normal State: Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200" role="grid" aria-label="Orders">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="pl-6 pr-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order #
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" class="w-32 pl-4 pr-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <OrderRow
            v-for="o in props.orders"
            :key="o.id"
            :order="o"
            @view-details="(id: string) => emit('view-details', id)"
            @update-status="(p: { orderId: string; status: Order['status'] }) => emit('update-status', p)"
            @cancel="(id: string) => emit('cancel', id)"
          />
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrderRow from './OrderRow.vue'

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
  selectedIds: string[]
  page: number
  pageSize: number
}

interface Emits {
  (e: 'view-details', orderId: string): void
  (e: 'update-status', payload: { orderId: string; status: Order['status'] }): void
  (e: 'cancel', orderId: string): void
  (e: 'select', payload: { orderId: string; selected: boolean }): void
  (e: 'reset-filters'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

</script>

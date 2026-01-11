import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'

// Mock orders data
const MOCK_ORDERS = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    status: 'PENDING',
    total: 1029.97,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    status: 'COMPLETED',
    total: 179.98,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    status: 'PENDING',
    total: 49.99,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    status: 'COMPLETED',
    total: 999.99,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    orderNumber: 'ORD-005',
    status: 'SHIPPED',
    total: 299.97,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * Mock API function - simulates fetching orders with pagination
 * Will be replaced with real API call: apiClient.getOrders()
 */
async function mockGetOrders(params: { page: number; pageSize: number }) {
  await new Promise(resolve => setTimeout(resolve, 500))

  const { page, pageSize } = params
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = MOCK_ORDERS.slice(start, end)

  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total: MOCK_ORDERS.length,
      totalPages: Math.ceil(MOCK_ORDERS.length / pageSize),
    },
  }
}

/**
 * Mock API function - simulates fetching single order
 * Will be replaced with real API call: apiClient.getOrder()
 */
async function mockGetOrder(id: string) {
  await new Promise(resolve => setTimeout(resolve, 300))
  const order = MOCK_ORDERS.find(o => o.id === id)
  return {
    success: !!order,
    data: order,
  }
}

/**
 * Mock API function - simulates creating an order
 * Will be replaced with real API call: apiClient.createOrder()
 */
async function mockCreateOrder(data: any) {
  await new Promise(resolve => setTimeout(resolve, 300))

  const newOrder = {
    id: Date.now().toString(),
    orderNumber: `ORD-${String(MOCK_ORDERS.length + 1).padStart(3, '0')}`,
    status: 'PENDING',
    total: data.total || 0,
    createdAt: new Date().toISOString(),
  }

  MOCK_ORDERS.unshift(newOrder)
  return { success: true, data: newOrder }
}

/**
 * Fetch orders with pagination
 */
export function useOrders(page = ref(1), pageSize = ref(10)) {
  const query = useQuery({
    queryKey: ['orders', page, pageSize],
    queryFn: () =>
      mockGetOrders({
        page: page.value,
        pageSize: pageSize.value,
      }),
    staleTime: 1000 * 60 * 5,
  })

  return {
    orders: computed(() => {
      if (query.data && 'data' in query.data) {
        return query.data.data || []
      }
      return []
    }),
    pagination: computed(() => {
      if (query.data && 'pagination' in query.data) {
        return query.data.pagination
      }
      return undefined
    }),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}

/**
 * Fetch single order by ID
 */
export function useOrder(id: string) {
  const query = useQuery({
    queryKey: ['order', id],
    queryFn: () => mockGetOrder(id),
    enabled: !!id,
  })

  return {
    order: computed(() => {
      if (query.data && 'data' in query.data) {
        return query.data.data
      }
      return undefined
    }),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}

/**
 * Create order mutation
 */
export function useCreateOrder() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => mockCreateOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  return {
    createOrder: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

/**
 * Update order mutation
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await new Promise(resolve => setTimeout(resolve, 300))

      const order = MOCK_ORDERS.find(o => o.id === id)
      if (order) {
        Object.assign(order, data)
      }

      return { success: !!order, data: order }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
  })

  return {
    updateOrder: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

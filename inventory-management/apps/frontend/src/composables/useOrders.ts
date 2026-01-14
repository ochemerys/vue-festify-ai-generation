import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed, type Ref } from 'vue'
import { apiClient } from '../services/api'

/**
 * Fetch orders with pagination
 */
export function useOrders(
  page: Ref<number> = ref(1),
  pageSize: Ref<number> = ref(10)
) {
  const query = useQuery({
    queryKey: ['orders', page, pageSize],
    queryFn: () =>
      apiClient.getOrders({
        page: page.value,
        pageSize: pageSize.value,
      }),
    staleTime: 1000 * 60 * 3, // 3 minutes
  })

  return {
    orders: computed(() => query.data.value?.data || []),
    pagination: computed(() => query.data.value?.pagination),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Fetch single order by ID
 */
export function useOrder(id: Ref<string> | string) {
  const orderId = typeof id === 'string' ? ref(id) : id

  const query = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => apiClient.getOrder(orderId.value),
    enabled: computed(() => !!orderId.value),
    staleTime: 1000 * 60 * 3, // 3 minutes
  })

  return {
    order: computed(() => query.data.value?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Create order mutation
 */
export function useCreateOrder() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.createOrder(data),
    onSuccess: () => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      // Also invalidate inventory as orders affect stock
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })

  return {
    createOrder: mutation.mutate,
    createOrderAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

/**
 * Update order mutation
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient.updateOrder(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      // Invalidate inventory if order status changed
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })

  return {
    updateOrder: mutation.mutate,
    updateOrderAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

/**
 * Fetch purchase orders with pagination
 */
export function usePurchaseOrders(
  page: Ref<number> = ref(1),
  pageSize: Ref<number> = ref(10)
) {
  const query = useQuery({
    queryKey: ['purchase-orders', page, pageSize],
    queryFn: () =>
      apiClient.getPurchaseOrders({
        page: page.value,
        pageSize: pageSize.value,
      }),
    staleTime: 1000 * 60 * 3, // 3 minutes
  })

  return {
    purchaseOrders: computed(() => query.data.value?.data || []),
    pagination: computed(() => query.data.value?.pagination),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Fetch single purchase order by ID
 */
export function usePurchaseOrder(id: Ref<string> | string) {
  const poId = typeof id === 'string' ? ref(id) : id

  const query = useQuery({
    queryKey: ['purchase-order', poId],
    queryFn: () => apiClient.getPurchaseOrder(poId.value),
    enabled: computed(() => !!poId.value),
    staleTime: 1000 * 60 * 3, // 3 minutes
  })

  return {
    purchaseOrder: computed(() => query.data.value?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Create purchase order mutation
 */
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    },
  })

  return {
    createPurchaseOrder: mutation.mutate,
    createPurchaseOrderAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

/**
 * Update purchase order mutation
 */
export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient.updatePurchaseOrder(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] })
      // Invalidate inventory if PO was received
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })

  return {
    updatePurchaseOrder: mutation.mutate,
    updatePurchaseOrderAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

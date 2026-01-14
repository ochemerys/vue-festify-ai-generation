import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed, type Ref } from 'vue'
import { apiClient } from '../services/api'

/**
 * Fetch inventory with pagination
 */
export function useInventory(
  page: Ref<number> = ref(1),
  pageSize: Ref<number> = ref(10)
) {
  const query = useQuery({
    queryKey: ['inventory', page, pageSize],
    queryFn: () =>
      apiClient.getInventory({
        page: page.value,
        pageSize: pageSize.value,
      }),
    staleTime: 1000 * 60 * 2, // 2 minutes (inventory changes frequently)
  })

  return {
    inventory: computed(() => query.data.value?.data || []),
    pagination: computed(() => query.data.value?.pagination),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Fetch inventory for specific product
 */
export function useProductInventory(productId: Ref<string> | string) {
  const id = typeof productId === 'string' ? ref(productId) : productId

  const query = useQuery({
    queryKey: ['inventory', 'product', id],
    queryFn: () => apiClient.getProductInventory(id.value),
    enabled: computed(() => !!id.value),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  return {
    inventory: computed(() => query.data.value?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Adjust inventory mutation
 */
export function useAdjustInventory() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: {
      productId: string
      quantity: number
      type: 'IN' | 'OUT' | 'ADJUSTMENT'
      reason: string
      reference?: string
    }) => apiClient.adjustInventory(data.productId, data),
    onSuccess: (response, variables) => {
      // Invalidate inventory queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ 
        queryKey: ['inventory', 'product', variables.productId] 
      })
      // Also invalidate products as stock levels affect product data
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return {
    adjustInventory: mutation.mutate,
    adjustInventoryAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

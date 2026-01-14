import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref, ref } from 'vue'
import { apiClient } from '../services/api'

/**
 * Fetch reports with filters
 */
export function useReports(
  filters: Ref<{
    startDate?: string
    endDate?: string
    type?: string
    [key: string]: unknown
  }> = ref({})
) {
  const query = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => apiClient.getReports(filters.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    reports: computed(() => query.data.value?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Fetch sales report
 */
export function useSalesReport(
  startDate: Ref<string> | string,
  endDate: Ref<string> | string
) {
  const start = typeof startDate === 'string' ? ref(startDate) : startDate
  const end = typeof endDate === 'string' ? ref(endDate) : endDate

  const query = useQuery({
    queryKey: ['reports', 'sales', start, end],
    queryFn: () =>
      apiClient.getReports({
        type: 'sales',
        startDate: start.value,
        endDate: end.value,
      }),
    enabled: computed(() => !!start.value && !!end.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    salesReport: computed(() => query.data.value?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Fetch inventory report
 */
export function useInventoryReport() {
  const query = useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: () =>
      apiClient.getReports({
        type: 'inventory',
      }),
    staleTime: 1000 * 60 * 2, // 2 minutes (inventory changes frequently)
  })

  return {
    inventoryReport: computed(() => query.data.value?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Fetch low stock report
 */
export function useLowStockReport() {
  const query = useQuery({
    queryKey: ['reports', 'low-stock'],
    queryFn: () =>
      apiClient.getReports({
        type: 'low-stock',
      }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  return {
    lowStockReport: computed(() => query.data.value?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

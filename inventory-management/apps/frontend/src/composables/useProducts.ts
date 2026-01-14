import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed, type Ref } from 'vue'
import { apiClient, type CreateProductRequest, type UpdateProductRequest } from '../services/api'

/**
 * Fetch products with pagination and filters
 */
export function useProducts(
  page: Ref<number> = ref(1),
  pageSize: Ref<number> = ref(10),
  filters: Ref<{
    category?: string
    supplier?: string
    minPrice?: number
    maxPrice?: number
    search?: string
  }> = ref({})
) {
  const query = useQuery({
    queryKey: ['products', page, pageSize, filters],
    queryFn: () =>
      apiClient.getProducts({
        page: page.value,
        pageSize: pageSize.value,
        ...filters.value,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    products: computed(() => query.data.value?.data || []),
    pagination: computed(() => query.data.value?.pagination),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Fetch single product by ID
 */
export function useProduct(id: Ref<string> | string) {
  const productId = typeof id === 'string' ? ref(id) : id

  const query = useQuery({
    queryKey: ['product', productId],
    queryFn: () => apiClient.getProduct(productId.value),
    enabled: computed(() => !!productId.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    product: computed(() => query.data.value?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Fetch product by SKU
 */
export function useProductBySku(sku: Ref<string> | string) {
  const productSku = typeof sku === 'string' ? ref(sku) : sku

  const query = useQuery({
    queryKey: ['product', 'sku', productSku],
    queryFn: () => apiClient.getProductBySku(productSku.value),
    enabled: computed(() => !!productSku.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    product: computed(() => query.data.value?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Create product mutation
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateProductRequest) => apiClient.createProduct(data),
    onSuccess: () => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return {
    createProduct: mutation.mutate,
    createProductAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

/**
 * Update product mutation
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      apiClient.updateProduct(id, data),
    onSuccess: (response, { id }) => {
      // Invalidate both list and single product queries
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
    },
  })

  return {
    updateProduct: mutation.mutate,
    updateProductAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

/**
 * Deactivate product mutation
 */
export function useDeactivateProduct() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => apiClient.deactivateProduct(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
    },
  })

  return {
    deactivateProduct: mutation.mutate,
    deactivateProductAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

/**
 * Delete product mutation
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return {
    deleteProduct: mutation.mutate,
    deleteProductAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

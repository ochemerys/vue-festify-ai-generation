import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'

// Mock data
const MOCK_PRODUCTS = [
  {
    id: '1',
    sku: 'PROD-001',
    name: 'Laptop',
    description: 'High-performance laptop for professionals',
    category: 'Electronics',
    supplier: 'Tech Corp',
    price: 999.99,
    cost: 500.00,
    reorderLevel: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    sku: 'PROD-002',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    category: 'Electronics',
    supplier: 'Tech Corp',
    price: 29.99,
    cost: 10.00,
    reorderLevel: 50,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    sku: 'PROD-003',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard',
    category: 'Electronics',
    supplier: 'Tech Corp',
    price: 149.99,
    cost: 75.00,
    reorderLevel: 20,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    sku: 'PROD-004',
    name: 'USB-C Cable',
    description: '2m USB-C charging cable',
    category: 'Accessories',
    supplier: 'Cable Co',
    price: 12.99,
    cost: 3.00,
    reorderLevel: 100,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    sku: 'PROD-005',
    name: 'Monitor Stand',
    description: 'Adjustable monitor stand',
    category: 'Furniture',
    supplier: 'Furniture Plus',
    price: 49.99,
    cost: 20.00,
    reorderLevel: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

/**
 * Mock API function - simulates fetching products with pagination
 * Will be replaced with real API call: apiClient.getProducts()
 */
async function mockGetProducts(params: { page: number; pageSize: number }) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  const { page, pageSize } = params
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = MOCK_PRODUCTS.slice(start, end)

  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total: MOCK_PRODUCTS.length,
      totalPages: Math.ceil(MOCK_PRODUCTS.length / pageSize),
    },
  }
}

/**
 * Mock API function - simulates creating a product
 * Will be replaced with real API call: apiClient.createProduct()
 */
async function mockCreateProduct(data: any) {
  await new Promise(resolve => setTimeout(resolve, 300))

  const newProduct = {
    id: Date.now().toString(),
    sku: data.sku || `PROD-${Date.now()}`,
    name: data.name,
    description: data.description || '',
    category: data.category,
    supplier: data.supplier,
    price: data.price,
    cost: data.cost || 0,
    reorderLevel: data.reorderLevel || 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  MOCK_PRODUCTS.unshift(newProduct)
  return { success: true, data: newProduct }
}

/**
 * Mock API function - simulates deleting a product
 * Will be replaced with real API call: apiClient.deleteProduct()
 */
async function mockDeleteProduct(id: string) {
  await new Promise(resolve => setTimeout(resolve, 300))

  const index = MOCK_PRODUCTS.findIndex(p => p.id === id)
  if (index !== -1) {
    MOCK_PRODUCTS.splice(index, 1)
  }

  return { success: true }
}

/**
 * Fetch products with pagination
 * Currently uses mock data, will switch to API when ready
 */
export function useProducts(page = ref(1), pageSize = ref(10)) {
  const query = useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: () =>
      mockGetProducts({
        page: page.value,
        pageSize: pageSize.value,
      }),
    staleTime: 1000 * 60 * 5,
  })

  return {
    products: computed(() => {
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
    refetch: query.refetch,
  }
}

/**
 * Fetch single product by ID
 */
export function useProduct(id: string) {
  const query = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      const product = MOCK_PRODUCTS.find(p => p.id === id)
      return {
        success: !!product,
        data: product,
      }
    },
    enabled: !!id,
  })

  return {
    product: computed(() => {
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
 * Create product mutation
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => mockCreateProduct(data),
    onSuccess: () => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return {
    createProduct: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

/**
 * Update product mutation
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await new Promise(resolve => setTimeout(resolve, 300))

      const product = MOCK_PRODUCTS.find(p => p.id === id)
      if (product) {
        Object.assign(product, data, { updatedAt: new Date().toISOString() })
      }

      return { success: !!product, data: product }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
    },
  })

  return {
    updateProduct: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

/**
 * Delete product mutation
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => mockDeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return {
    deleteProduct: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

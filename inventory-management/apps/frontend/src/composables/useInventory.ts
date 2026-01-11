import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'

// Mock inventory data
const MOCK_INVENTORY = [
  {
    id: '1',
    productId: '1',
    currentQuantity: 100,
    reservedQuantity: 20,
    availableQuantity: 80,
  },
  {
    id: '2',
    productId: '2',
    currentQuantity: 500,
    reservedQuantity: 50,
    availableQuantity: 450,
  },
  {
    id: '3',
    productId: '3',
    currentQuantity: 200,
    reservedQuantity: 30,
    availableQuantity: 170,
  },
  {
    id: '4',
    productId: '4',
    currentQuantity: 1000,
    reservedQuantity: 100,
    availableQuantity: 900,
  },
  {
    id: '5',
    productId: '5',
    currentQuantity: 50,
    reservedQuantity: 10,
    availableQuantity: 40,
  },
]

/**
 * Mock API function - simulates fetching inventory with pagination
 * Will be replaced with real API call: apiClient.getInventory()
 */
async function mockGetInventory(params: { page: number; pageSize: number }) {
  await new Promise(resolve => setTimeout(resolve, 500))

  const { page, pageSize } = params
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = MOCK_INVENTORY.slice(start, end)

  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total: MOCK_INVENTORY.length,
      totalPages: Math.ceil(MOCK_INVENTORY.length / pageSize),
    },
  }
}

/**
 * Mock API function - simulates adjusting inventory
 * Will be replaced with real API call: apiClient.adjustInventory()
 */
async function mockAdjustInventory(data: {
  productId: string
  quantity: number
  type: string
  reason: string
}) {
  await new Promise(resolve => setTimeout(resolve, 300))

  const inventory = MOCK_INVENTORY.find(i => i.productId === data.productId)
  if (inventory) {
    if (data.type === 'IN') {
      inventory.currentQuantity += data.quantity
    } else if (data.type === 'OUT') {
      inventory.currentQuantity -= data.quantity
    }
    inventory.availableQuantity =
      inventory.currentQuantity - inventory.reservedQuantity
  }

  return { success: true, data: inventory }
}

/**
 * Fetch inventory with pagination
 */
export function useInventory(page = ref(1), pageSize = ref(10)) {
  const query = useQuery({
    queryKey: ['inventory', page, pageSize],
    queryFn: () =>
      mockGetInventory({
        page: page.value,
        pageSize: pageSize.value,
      }),
    staleTime: 1000 * 60 * 5,
  })

  return {
    inventory: computed(() => {
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
 * Fetch inventory for specific product
 */
export function useProductInventory(productId: string) {
  const query = useQuery({
    queryKey: ['inventory', productId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      const inventory = MOCK_INVENTORY.find(i => i.productId === productId)
      return {
        success: !!inventory,
        data: inventory,
      }
    },
    enabled: !!productId,
  })

  return {
    inventory: computed(() => {
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
 * Adjust inventory mutation
 */
export function useAdjustInventory() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => mockAdjustInventory(data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', productId] })
    },
  })

  return {
    adjustInventory: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

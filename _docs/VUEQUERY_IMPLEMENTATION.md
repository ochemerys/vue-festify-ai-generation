# Vue Query Implementation Guide

## Quick Start (30 minutes)

### Step 1: Install Vue Query

```bash
cd inventory-management/apps/frontend

npm install @tanstack/vue-query
```

### Step 2: Create Query Client

Create `src/lib/queryClient.ts`:

```typescript
import { QueryClient } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

### Step 3: Setup Vue Query Plugin

Update `src/main.ts`:

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from './router'
import { queryClient } from './lib/queryClient'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(VueQueryPlugin, { queryClient })
app.use(router)

app.mount('#app')
```

### Step 4: Create First Composable

Create `src/composables/useProducts.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'
import { apiClient } from '@/services/api'
import type { Product } from '@/services/api'

export function useProducts(page = ref(1), pageSize = ref(10)) {
  const query = useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: () =>
      apiClient.getProducts({
        page: page.value,
        pageSize: pageSize.value,
      }),
    staleTime: 1000 * 60 * 5,
  })

  return {
    products: computed(() => query.data?.data || []),
    pagination: computed(() => query.data?.pagination),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useProduct(id: string) {
  const query = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiClient.getProduct(id),
    enabled: !!id,
  })

  return {
    product: computed(() => query.data?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.createProduct(data),
    onSuccess: () => {
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

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateProduct(id, data),
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
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
```

### Step 5: Update Component

Update `src/pages/ProductsListPage.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useProducts, useCreateProduct, useDeleteProduct } from '@/composables/useProducts'

const page = ref(1)
const pageSize = ref(10)

const { products, pagination, isLoading, error } = useProducts(page, pageSize)
const { createProduct, isLoading: isCreating } = useCreateProduct()
const { deleteProduct, isLoading: isDeleting } = useDeleteProduct()

const handleCreate = (data: any) => {
  createProduct(data)
}

const handleDelete = (id: string) => {
  deleteProduct(id)
}

const goToPage = (newPage: number) => {
  page.value = newPage
}
</script>

<template>
  <div class="products-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      <p>Loading products...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>Error: {{ error.message }}</p>
      <button @click="$router.go(0)">Retry</button>
    </div>

    <!-- Products List -->
    <div v-else class="products-list">
      <div v-for="product in products" :key="product.id" class="product-card">
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <p>Price: ${{ product.price }}</p>
        <button @click="handleDelete(product.id)" :disabled="isDeleting">
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </button>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button
          @click="goToPage(page - 1)"
          :disabled="page === 1"
        >
          Previous
        </button>
        <span>Page {{ page }} of {{ pagination?.totalPages }}</span>
        <button
          @click="goToPage(page + 1)"
          :disabled="page === pagination?.totalPages"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-page {
  padding: 20px;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
}

.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  grid-column: 1 / -1;
}
</style>
```

---

## Complete Composables Library

### Auth Composables

Create `src/composables/useAuth.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiClient } from '@/services/api'

export function useLogin() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login(email, password),
    onSuccess: () => {
      // Clear all queries on login to fetch fresh data
      queryClient.clear()
    },
  })

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export function useLogout() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear()
    },
  })

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
  }
}

export function useSignup() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: {
      email: string
      password: string
      firstName: string
      lastName: string
    }) => apiClient.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.clear()
    },
  })

  return {
    signup: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
```

### Inventory Composables

Create `src/composables/useInventory.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'
import { apiClient } from '@/services/api'

export function useInventory(page = ref(1), pageSize = ref(10)) {
  const query = useQuery({
    queryKey: ['inventory', page, pageSize],
    queryFn: () =>
      apiClient.getInventory({
        page: page.value,
        pageSize: pageSize.value,
      }),
    staleTime: 1000 * 60 * 5,
  })

  return {
    inventory: computed(() => query.data?.data || []),
    pagination: computed(() => query.data?.pagination),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useProductInventory(productId: string) {
  const query = useQuery({
    queryKey: ['inventory', productId],
    queryFn: () => apiClient.getProductInventory(productId),
    enabled: !!productId,
  })

  return {
    inventory: computed(() => query.data?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}

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
```

### Order Composables

Create `src/composables/useOrders.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'
import { apiClient } from '@/services/api'

export function useOrders(page = ref(1), pageSize = ref(10)) {
  const query = useQuery({
    queryKey: ['orders', page, pageSize],
    queryFn: () =>
      apiClient.getOrders({
        page: page.value,
        pageSize: pageSize.value,
      }),
    staleTime: 1000 * 60 * 5,
  })

  return {
    orders: computed(() => query.data?.data || []),
    pagination: computed(() => query.data?.pagination),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useOrder(id: string) {
  const query = useQuery({
    queryKey: ['order', id],
    queryFn: () => apiClient.getOrder(id),
    enabled: !!id,
  })

  return {
    order: computed(() => query.data?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.createOrder(data),
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

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateOrder(id, data),
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
```

### User Composables

Create `src/composables/useUsers.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'
import { apiClient } from '@/services/api'

export function useUsers(page = ref(1), pageSize = ref(10)) {
  const query = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () =>
      apiClient.getUsers({
        page: page.value,
        pageSize: pageSize.value,
      }),
    staleTime: 1000 * 60 * 5,
  })

  return {
    users: computed(() => query.data?.data || []),
    pagination: computed(() => query.data?.pagination),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useUser(id: string) {
  const query = useQuery({
    queryKey: ['user', id],
    queryFn: () => apiClient.getUser(id),
    enabled: !!id,
  })

  return {
    user: computed(() => query.data?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return {
    createUser: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
  })

  return {
    updateUser: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => apiClient.deactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
  })

  return {
    deactivateUser: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
```

---

## Advanced Features

### Infinite Queries (Load More)

```typescript
import { useInfiniteQuery } from '@tanstack/vue-query'

export function useProductsInfinite() {
  const query = useInfiniteQuery({
    queryKey: ['products-infinite'],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getProducts({ page: pageParam, pageSize: 10 }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
  })

  return {
    products: computed(() =>
      query.data?.pages.flatMap(page => page.data) || []
    ),
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isPending,
  }
}
```

### Optimistic Updates

```typescript
export function useUpdateProductOptimistic() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['products'] })

      // Snapshot old data
      const previousData = queryClient.getQueryData(['products'])

      // Update UI immediately
      queryClient.setQueryData(['products'], (old: any) => ({
        ...old,
        data: old.data.map((p: any) =>
          p.id === id ? { ...p, ...data } : p
        ),
      }))

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Revert on error
      if (context?.previousData) {
        queryClient.setQueryData(['products'], context.previousData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return mutation
}
```

### Dependent Queries

```typescript
export function useProductWithInventory(productId: string) {
  const productQuery = useQuery({
    queryKey: ['product', productId],
    queryFn: () => apiClient.getProduct(productId),
    enabled: !!productId,
  })

  const inventoryQuery = useQuery({
    queryKey: ['inventory', productId],
    queryFn: () => apiClient.getProductInventory(productId),
    enabled: !!productQuery.data, // Only run after product is loaded
  })

  return {
    product: computed(() => productQuery.data?.data),
    inventory: computed(() => inventoryQuery.data?.data),
    isLoading: computed(() =>
      productQuery.isPending.value || inventoryQuery.isPending.value
    ),
    isError: computed(() =>
      productQuery.isError.value || inventoryQuery.isError.value
    ),
  }
}
```

---

## Testing with Vue Query

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useQuery } from '@tanstack/vue-query'
import { useProducts } from '@/composables/useProducts'

describe('useProducts', () => {
  beforeEach(() => {
    // Clear query cache before each test
    queryClient.clear()
  })

  it('should fetch products', async () => {
    const { products, isLoading } = useProducts()

    expect(isLoading.value).toBe(true)

    // Wait for query to complete
    await waitFor(() => {
      expect(isLoading.value).toBe(false)
    })

    expect(products.value.length).toBeGreaterThan(0)
  })

  it('should handle errors', async () => {
    vi.spyOn(apiClient, 'getProducts').mockRejectedValue(
      new Error('API Error')
    )

    const { error, isError } = useProducts()

    await waitFor(() => {
      expect(isError.value).toBe(true)
    })

    expect(error.value?.message).toBe('API Error')
  })
})
```

---

## Migration Checklist

- [ ] Install Vue Query
- [ ] Create query client
- [ ] Setup Vue Query plugin in main.ts
- [ ] Create auth composables
- [ ] Update LoginPage
- [ ] Create product composables
- [ ] Update ProductsListPage
- [ ] Create inventory composables
- [ ] Update InventoryListPage
- [ ] Create order composables
- [ ] Update OrderListPage
- [ ] Create user composables
- [ ] Update UsersManagementPage
- [ ] Add error handling UI
- [ ] Add loading states
- [ ] Test all pages
- [ ] Remove old Pinia stores (optional)
- [ ] Add DevTools (optional)
- [ ] Performance testing
- [ ] Documentation

---

## Performance Tips

1. **Use staleTime wisely**
   - Short for frequently changing data (1-2 minutes)
   - Long for stable data (5-10 minutes)

2. **Use gcTime appropriately**
   - Keep data in memory longer than staleTime
   - Prevents refetch when user navigates back

3. **Implement pagination**
   - Don't load all data at once
   - Use page-based or cursor-based pagination

4. **Use infinite queries for "load more"**
   - Better UX than pagination
   - Automatic request deduplication

5. **Implement optimistic updates**
   - Instant UI feedback
   - Better perceived performance

6. **Use DevTools for debugging**
   - Visualize query state
   - Monitor cache behavior
   - Debug mutations

---

## Troubleshooting

### Issue: Queries not updating
**Solution**: Check `staleTime` and `gcTime` settings

### Issue: Too many API calls
**Solution**: Implement request deduplication with proper query keys

### Issue: Mutations not refetching
**Solution**: Use `invalidateQueries` in `onSuccess`

### Issue: Memory leaks
**Solution**: Ensure queries are properly cleaned up with `gcTime`

---

## Summary

Vue Query will significantly improve your application by:
- Reducing code complexity
- Improving performance
- Better error handling
- Automatic caching
- Request deduplication
- Better developer experience

**Estimated implementation time**: 1-2 weeks for full migration

**Recommended approach**: Gradual migration starting with auth, then products, then other resources.

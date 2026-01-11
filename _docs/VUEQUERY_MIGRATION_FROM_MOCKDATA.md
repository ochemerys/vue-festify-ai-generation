# Vue Query Migration from Mock Data

## Overview

This guide shows you how to implement Vue Query when you currently have mock data embedded directly in your pages.

---

## Current State: Mock Data in Pages

### Example: ProductsListPage.vue (Current)

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

// Mock data embedded in component
const mockProducts = [
  { id: '1', name: 'Product 1', price: 99.99, category: 'Electronics' },
  { id: '2', name: 'Product 2', price: 149.99, category: 'Electronics' },
  { id: '3', name: 'Product 3', price: 199.99, category: 'Furniture' },
]

const products = ref(mockProducts)
const isLoading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const pageSize = ref(10)

const totalPages = computed(() => Math.ceil(mockProducts.length / pageSize.value))

const handleCreate = (data: any) => {
  // Mock create
  products.value.unshift({
    id: Date.now().toString(),
    ...data,
  })
}

const handleDelete = (id: string) => {
  // Mock delete
  products.value = products.value.filter(p => p.id !== id)
}
</script>

<template>
  <div class="products-page">
    <h1>Products</h1>
    
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="products-list">
      <div v-for="product in products" :key="product.id" class="product-card">
        <h3>{{ product.name }}</h3>
        <p>Price: ${{ product.price }}</p>
        <button @click="handleDelete(product.id)">Delete</button>
      </div>
    </div>
  </div>
</template>
```

**Issues**:
- ❌ Mock data hardcoded in component
- ❌ No real API calls
- ❌ No caching
- ❌ No request deduplication
- ❌ Manual state management
- ❌ Not scalable

---

## Step-by-Step Migration to Vue Query

### Step 1: Setup Vue Query (5 minutes)

#### 1.1 Install Vue Query
```bash
cd inventory-management/apps/frontend
npm install @tanstack/vue-query
```

#### 1.2 Create Query Client
Create `src/lib/queryClient.ts`:

```typescript
import { QueryClient } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

#### 1.3 Setup Plugin in main.ts
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

---

### Step 2: Create Composable with Mock Data (15 minutes)

Create `src/composables/useProducts.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'
import { apiClient } from '@/services/api'
import type { Product } from '@/services/api'

// Mock data - will be replaced with API calls later
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'PROD-001',
    name: 'Product 1',
    description: 'Description 1',
    category: 'Electronics',
    supplier: 'Supplier A',
    price: 99.99,
    cost: 50.00,
    reorderLevel: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    sku: 'PROD-002',
    name: 'Product 2',
    description: 'Description 2',
    category: 'Electronics',
    supplier: 'Supplier B',
    price: 149.99,
    cost: 75.00,
    reorderLevel: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    sku: 'PROD-003',
    name: 'Product 3',
    description: 'Description 3',
    category: 'Furniture',
    supplier: 'Supplier C',
    price: 199.99,
    cost: 100.00,
    reorderLevel: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

/**
 * Mock API function - simulates API call with delay
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

  const newProduct: Product = {
    id: Date.now().toString(),
    sku: data.sku || `PROD-${Date.now()}`,
    name: data.name,
    description: data.description,
    category: data.category,
    supplier: data.supplier,
    price: data.price,
    cost: data.cost,
    reorderLevel: data.reorderLevel,
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
    products: computed(() => query.data?.data || []),
    pagination: computed(() => query.data?.pagination),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Fetch single product
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
    product: computed(() => query.data?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}

/**
 * Create product
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
 * Update product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await new Promise(resolve => setTimeout(resolve, 300))

      const product = MOCK_PRODUCTS.find(p => p.id === id)
      if (product) {
        Object.assign(product, data)
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
 * Delete product
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
```

---

### Step 3: Update Component to Use Vue Query (15 minutes)

Update `src/pages/ProductsListPage.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/composables/useProducts'

const page = ref(1)
const pageSize = ref(10)

const { products, pagination, isLoading, error } = useProducts(page, pageSize)
const { createProduct, isLoading: isCreating } = useCreateProduct()
const { updateProduct, isLoading: isUpdating } = useUpdateProduct()
const { deleteProduct, isLoading: isDeleting } = useDeleteProduct()

const handleCreate = (data: any) => {
  createProduct(data, {
    onSuccess: () => {
      // Show success message
      console.log('Product created successfully')
    },
    onError: (error) => {
      // Show error message
      console.error('Failed to create product:', error)
    },
  })
}

const handleUpdate = (id: string, data: any) => {
  updateProduct(
    { id, data },
    {
      onSuccess: () => {
        console.log('Product updated successfully')
      },
      onError: (error) => {
        console.error('Failed to update product:', error)
      },
    }
  )
}

const handleDelete = (id: string) => {
  if (confirm('Are you sure you want to delete this product?')) {
    deleteProduct(id, {
      onSuccess: () => {
        console.log('Product deleted successfully')
      },
      onError: (error) => {
        console.error('Failed to delete product:', error)
      },
    })
  }
}

const goToPage = (newPage: number) => {
  page.value = newPage
}
</script>

<template>
  <div class="products-page">
    <h1>Products</h1>

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
        <p>Category: {{ product.category }}</p>
        <div class="actions">
          <button @click="handleUpdate(product.id, { name: 'Updated' })">
            Edit
          </button>
          <button @click="handleDelete(product.id)" :disabled="isDeleting">
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button @click="goToPage(page - 1)" :disabled="page === 1">
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

.actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
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

## Migration Path: From Mock to Real API

### Phase 1: Setup Vue Query with Mock Data (Current)

```typescript
// src/composables/useProducts.ts
async function mockGetProducts(params) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  return { success: true, data: MOCK_PRODUCTS, ... }
}

export function useProducts(page, pageSize) {
  return useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: () => mockGetProducts({ page: page.value, pageSize: pageSize.value }),
  })
}
```

### Phase 2: Switch to Real API (Later)

```typescript
// src/composables/useProducts.ts
export function useProducts(page, pageSize) {
  return useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: () =>
      apiClient.getProducts({
        page: page.value,
        pageSize: pageSize.value,
      }),
  })
}
```

**That's it!** Just change the `queryFn` - everything else stays the same!

---

## Complete Example: All Composables with Mock Data

### Auth Composable

Create `src/composables/useAuth.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Mock users
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
  },
]

async function mockLogin(email: string, password: string) {
  await new Promise(resolve => setTimeout(resolve, 500))

  const user = MOCK_USERS.find(u => u.email === email)
  if (!user) {
    throw new Error('User not found')
  }

  return {
    success: true,
    data: {
      accessToken: `mock-token-${user.id}`,
      tokenType: 'Bearer',
      expiresIn: 86400,
      user,
    },
  }
}

export function useLogin() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      mockLogin(email, password),
    onSuccess: () => {
      queryClient.clear()
    },
  })

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}

export function useLogout() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { success: true }
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
  }
}
```

### Inventory Composable

Create `src/composables/useInventory.ts`:

```typescript
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
    currentQuantity: 50,
    reservedQuantity: 10,
    availableQuantity: 40,
  },
]

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
    inventory: computed(() => query.data?.data || []),
    pagination: computed(() => query.data?.pagination),
    isLoading: query.isPending,
    error: query.error,
  }
}

export function useAdjustInventory() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: {
      productId: string
      quantity: number
      type: string
      reason: string
    }) => {
      await new Promise(resolve => setTimeout(resolve, 300))

      const inventory = MOCK_INVENTORY.find(
        i => i.productId === data.productId
      )
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
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', productId] })
    },
  })

  return {
    adjustInventory: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
```

### Order Composable

Create `src/composables/useOrders.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'

// Mock orders data
const MOCK_ORDERS = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    status: 'PENDING',
    total: 299.97,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    status: 'COMPLETED',
    total: 149.99,
    createdAt: new Date().toISOString(),
  },
]

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
    orders: computed(() => query.data?.data || []),
    pagination: computed(() => query.data?.pagination),
    isLoading: query.isPending,
    error: query.error,
  }
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 300))

      const newOrder = {
        id: Date.now().toString(),
        orderNumber: `ORD-${Date.now()}`,
        status: 'PENDING',
        total: data.total,
        createdAt: new Date().toISOString(),
      }

      MOCK_ORDERS.unshift(newOrder)
      return { success: true, data: newOrder }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  return {
    createOrder: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
```

---

## Switching from Mock to Real API

### Step 1: Update Composable

When backend is ready, simply change the `queryFn`:

```typescript
// BEFORE (Mock)
export function useProducts(page = ref(1), pageSize = ref(10)) {
  return useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: () => mockGetProducts({ page: page.value, pageSize: pageSize.value }),
  })
}

// AFTER (Real API)
export function useProducts(page = ref(1), pageSize = ref(10)) {
  return useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: () =>
      apiClient.getProducts({
        page: page.value,
        pageSize: pageSize.value,
      }),
  })
}
```

### Step 2: Update Mutations

```typescript
// BEFORE (Mock)
export function useCreateProduct() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => mockCreateProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return { createProduct: mutation.mutate, ... }
}

// AFTER (Real API)
export function useCreateProduct() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return { createProduct: mutation.mutate, ... }
}
```

**That's it!** Components don't need to change at all!

---

## Benefits of This Approach

### ✅ Immediate Benefits
- Vue Query structure in place
- Automatic caching
- Request deduplication
- Better state management
- Easier testing

### ✅ Easy Migration
- Just change `queryFn`
- No component changes needed
- Gradual migration possible
- Can test with mock data first

### ✅ Better Development
- Simulate API delays
- Test error scenarios
- Test loading states
- Test pagination

---

## Testing with Mock Data

### Test Loading State

```typescript
// Mock data with delay
async function mockGetProducts(params) {
  await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
  return { success: true, data: MOCK_PRODUCTS, ... }
}

// Component shows loading state for 2 seconds
```

### Test Error State

```typescript
// Mock error
async function mockGetProducts(params) {
  throw new Error('Failed to fetch products')
}

// Component shows error state
```

### Test Pagination

```typescript
// Mock pagination
async function mockGetProducts(params) {
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

// Test pagination works correctly
```

---

## Implementation Timeline

### Day 1: Setup Vue Query (2 hours)
- [ ] Install Vue Query
- [ ] Create query client
- [ ] Setup plugin in main.ts
- [ ] Create first composable with mock data

### Day 2: Create All Composables (4 hours)
- [ ] Auth composable
- [ ] Products composable
- [ ] Inventory composable
- [ ] Orders composable
- [ ] Users composable

### Day 3: Update Components (4 hours)
- [ ] Update LoginPage
- [ ] Update ProductsListPage
- [ ] Update InventoryListPage
- [ ] Update OrderListPage
- [ ] Update other pages

### Day 4: Testing & Polish (2 hours)
- [ ] Test all pages
- [ ] Test loading states
- [ ] Test error states
- [ ] Test pagination

### Day 5: Switch to Real API (2 hours)
- [ ] Update composables to use apiClient
- [ ] Test with real backend
- [ ] Fix any issues
- [ ] Deploy

**Total: 14 hours over 5 days**

---

## Checklist

### Setup
- [ ] Install Vue Query
- [ ] Create query client
- [ ] Setup plugin in main.ts

### Create Composables
- [ ] Auth composable with mock data
- [ ] Products composable with mock data
- [ ] Inventory composable with mock data
- [ ] Orders composable with mock data
- [ ] Users composable with mock data

### Update Components
- [ ] LoginPage uses useLogin
- [ ] ProductsListPage uses useProducts
- [ ] InventoryListPage uses useInventory
- [ ] OrderListPage uses useOrders
- [ ] UsersManagementPage uses useUsers

### Testing
- [ ] Test loading states
- [ ] Test error states
- [ ] Test pagination
- [ ] Test CRUD operations

### Migration to Real API
- [ ] Update useProducts queryFn
- [ ] Update useInventory queryFn
- [ ] Update useOrders queryFn
- [ ] Update useUsers queryFn
- [ ] Update useLogin mutationFn
- [ ] Test with real backend

---

## Key Advantages of This Approach

### 1. **No Breaking Changes**
- Components work immediately
- No need to wait for backend
- Can develop frontend independently

### 2. **Easy Testing**
- Test with mock data first
- Simulate delays and errors
- Verify UI behavior

### 3. **Smooth Migration**
- Just change queryFn
- No component changes
- Can migrate gradually

### 4. **Better Structure**
- Vue Query best practices
- Reusable composables
- Consistent patterns

### 5. **Future-Proof**
- Ready for real API
- Easy to switch
- No refactoring needed

---

## Example: Complete Flow

### 1. Initial Setup (Day 1)
```typescript
// src/composables/useProducts.ts
async function mockGetProducts(params) {
  await new Promise(resolve => setTimeout(resolve, 500))
  return { success: true, data: MOCK_PRODUCTS, ... }
}

export function useProducts(page, pageSize) {
  return useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: () => mockGetProducts({ page: page.value, pageSize: pageSize.value }),
  })
}
```

### 2. Component Update (Day 2)
```vue
<script setup>
const { products, isLoading, error } = useProducts(page, pageSize)
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <div v-else>
    <div v-for="product in products" :key="product.id">
      {{ product.name }}
    </div>
  </div>
</template>
```

### 3. Switch to Real API (Day 5)
```typescript
// src/composables/useProducts.ts
export function useProducts(page, pageSize) {
  return useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: () =>
      apiClient.getProducts({
        page: page.value,
        pageSize: pageSize.value,
      }),
  })
}
```

**Component doesn't change!** ✅

---

## Summary

### Current State
- ❌ Mock data in components
- ❌ No caching
- ❌ Manual state management
- ❌ Not scalable

### After Vue Query with Mock Data
- ✅ Vue Query structure
- ✅ Automatic caching
- ✅ Automatic state management
- ✅ Easy to test
- ✅ Easy to migrate

### After Switching to Real API
- ✅ Real data from backend
- ✅ All Vue Query benefits
- ✅ No component changes
- ✅ Production ready

---

## Next Steps

1. **Install Vue Query** (5 min)
   ```bash
   npm install @tanstack/vue-query
   ```

2. **Create query client** (10 min)
   - Create `src/lib/queryClient.ts`

3. **Setup plugin** (5 min)
   - Update `src/main.ts`

4. **Create first composable** (30 min)
   - Create `src/composables/useProducts.ts` with mock data

5. **Update first component** (30 min)
   - Update `src/pages/ProductsListPage.vue`

6. **Test** (30 min)
   - Verify loading, error, and pagination states

7. **Repeat for other resources** (2-3 hours)
   - Create other composables
   - Update other components

8. **Switch to real API** (1-2 hours)
   - Update queryFn in composables
   - Test with real backend

---

**You can start implementing Vue Query today with mock data!** 🚀

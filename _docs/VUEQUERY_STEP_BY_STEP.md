# Vue Query Implementation: Step-by-Step Guide

## Complete Implementation in 5 Days

This guide walks you through implementing Vue Query with mock data, then switching to real API.

---

## Day 1: Setup (2 hours)

### Step 1.1: Install Vue Query (5 minutes)

```bash
cd inventory-management/apps/frontend
npm install @tanstack/vue-query
```

### Step 1.2: Create Query Client (10 minutes)

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
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

### Step 1.3: Setup Plugin (10 minutes)

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

### Step 1.4: Create First Composable (1.5 hours)

Create `src/composables/useProducts.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'

// Mock data
const MOCK_PRODUCTS = [
  {
    id: '1',
    sku: 'PROD-001',
    name: 'Laptop',
    description: 'High-performance laptop',
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
    name: 'Mouse',
    description: 'Wireless mouse',
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
    name: 'Keyboard',
    description: 'Mechanical keyboard',
    category: 'Electronics',
    supplier: 'Tech Corp',
    price: 149.99,
    cost: 75.00,
    reorderLevel: 20,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock API functions
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

async function mockDeleteProduct(id: string) {
  await new Promise(resolve => setTimeout(resolve, 300))

  const index = MOCK_PRODUCTS.findIndex(p => p.id === id)
  if (index !== -1) {
    MOCK_PRODUCTS.splice(index, 1)
  }

  return { success: true }
}

// Vue Query Composables
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

export function useCreateProduct() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => mockCreateProduct(data),
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

## Day 2: Create All Composables (4 hours)

### Step 2.1: Auth Composable (1 hour)

Create `src/composables/useAuth.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/vue-query'

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

  if (password.length < 8) {
    throw new Error('Invalid password')
  }

  return {
    success: true,
    data: {
      accessToken: `mock-token-${user.id}-${Date.now()}`,
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
    isError: mutation.isError,
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

### Step 2.2: Inventory Composable (1 hour)

Create `src/composables/useInventory.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'

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
    isError: query.isError,
    error: query.error,
  }
}

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
```

### Step 2.3: Orders Composable (1 hour)

Create `src/composables/useOrders.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'

const MOCK_ORDERS = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    status: 'PENDING',
    total: 1029.97,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    status: 'COMPLETED',
    total: 179.98,
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

async function mockCreateOrder(data: any) {
  await new Promise(resolve => setTimeout(resolve, 300))

  const newOrder = {
    id: Date.now().toString(),
    orderNumber: `ORD-${Date.now()}`,
    status: 'PENDING',
    total: data.total || 0,
    createdAt: new Date().toISOString(),
  }

  MOCK_ORDERS.unshift(newOrder)
  return { success: true, data: newOrder }
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
    isError: query.isError,
    error: query.error,
  }
}

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
```

### Step 2.4: Users Composable (1 hour)

Create `src/composables/useUsers.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'

const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'manager@example.com',
    firstName: 'Manager',
    lastName: 'User',
    role: 'MANAGER',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

async function mockGetUsers(params: { page: number; pageSize: number }) {
  await new Promise(resolve => setTimeout(resolve, 500))

  const { page, pageSize } = params
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = MOCK_USERS.slice(start, end)

  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total: MOCK_USERS.length,
      totalPages: Math.ceil(MOCK_USERS.length / pageSize),
    },
  }
}

async function mockCreateUser(data: any) {
  await new Promise(resolve => setTimeout(resolve, 300))

  const newUser = {
    id: Date.now().toString(),
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role || 'STAFF',
    isActive: true,
    createdAt: new Date().toISOString(),
  }

  MOCK_USERS.unshift(newUser)
  return { success: true, data: newUser }
}

export function useUsers(page = ref(1), pageSize = ref(10)) {
  const query = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () =>
      mockGetUsers({
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
  }
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => mockCreateUser(data),
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
```

---

## Day 3: Update Components (4 hours)

### Step 3.1: Update LoginPage.vue (1 hour)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLogin } from '@/composables/useAuth'

const router = useRouter()
const email = ref('admin@example.com')
const password = ref('password123')
const fieldErrors = ref<{ email?: string; password?: string }>({})

const { login, isLoading, error } = useLogin()

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    fieldErrors.value.email = 'Email is required'
    return false
  }
  if (!emailRegex.test(email.value)) {
    fieldErrors.value.email = 'Invalid email format'
    return false
  }
  delete fieldErrors.value.email
  return true
}

const validatePassword = () => {
  if (!password.value) {
    fieldErrors.value.password = 'Password is required'
    return false
  }
  if (password.value.length < 8) {
    fieldErrors.value.password = 'Password must be at least 8 characters'
    return false
  }
  delete fieldErrors.value.password
  return true
}

const handleSubmit = () => {
  if (!validateEmail() || !validatePassword()) return

  login(
    { email: email.value, password: password.value },
    {
      onSuccess: () => {
        router.push('/')
      },
      onError: (error: any) => {
        console.error('Login failed:', error)
      },
    }
  )
}
</script>

<template>
  <div class="min-h-screen w-screen flex items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-xl font-semibold text-slate-900">Inventory Management</h1>
        <p class="text-sm text-slate-600">Sign in to continue</p>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {{ error.message }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="fieldErrors.email ? 'border-red-300' : 'border-slate-300'"
              placeholder="you@example.com"
            />
            <p v-if="fieldErrors.email" class="mt-1 text-xs text-red-600">{{ fieldErrors.email }}</p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="fieldErrors.password ? 'border-red-300' : 'border-slate-300'"
              placeholder="Your secure password"
            />
            <p v-if="fieldErrors.password" class="mt-1 text-xs text-red-600">{{ fieldErrors.password }}</p>
          </div>

          <button
            type="submit"
            class="w-full h-11 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
```

### Step 3.2: Update ProductsListPage.vue (1 hour)

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
  createProduct(data, {
    onSuccess: () => {
      console.log('Product created')
    },
  })
}

const handleDelete = (id: string) => {
  if (confirm('Delete this product?')) {
    deleteProduct(id)
  }
}

const goToPage = (newPage: number) => {
  page.value = newPage
}
</script>

<template>
  <div class="products-page p-6">
    <h1 class="text-2xl font-bold mb-6">Products</h1>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-600">Loading products...</p>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600">Error: {{ error.message }}</p>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div v-for="product in products" :key="product.id" class="border rounded-lg p-4">
          <h3 class="font-bold text-lg">{{ product.name }}</h3>
          <p class="text-gray-600 text-sm">{{ product.description }}</p>
          <p class="text-lg font-semibold mt-2">${{ product.price }}</p>
          <p class="text-sm text-gray-500">{{ product.category }}</p>
          <button
            @click="handleDelete(product.id)"
            :disabled="isDeleting"
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>

      <div class="flex justify-center gap-4">
        <button
          @click="goToPage(page - 1)"
          :disabled="page === 1"
          class="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span class="px-4 py-2">Page {{ page }} of {{ pagination?.totalPages }}</span>
        <button
          @click="goToPage(page + 1)"
          :disabled="page === pagination?.totalPages"
          class="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
```

### Step 3.3: Update InventoryListPage.vue (1 hour)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useInventory, useAdjustInventory } from '@/composables/useInventory'

const page = ref(1)
const pageSize = ref(10)

const { inventory, pagination, isLoading, error } = useInventory(page, pageSize)
const { adjustInventory, isLoading: isAdjusting } = useAdjustInventory()

const handleAdjust = (productId: string, quantity: number) => {
  adjustInventory({
    productId,
    quantity,
    type: 'IN',
    reason: 'Manual adjustment',
  })
}

const goToPage = (newPage: number) => {
  page.value = newPage
}
</script>

<template>
  <div class="inventory-page p-6">
    <h1 class="text-2xl font-bold mb-6">Inventory</h1>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-600">Loading inventory...</p>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600">Error: {{ error.message }}</p>
    </div>

    <div v-else>
      <table class="w-full border-collapse border">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2 text-left">Product ID</th>
            <th class="border p-2 text-left">Current Qty</th>
            <th class="border p-2 text-left">Reserved</th>
            <th class="border p-2 text-left">Available</th>
            <th class="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in inventory" :key="item.id" class="border">
            <td class="border p-2">{{ item.productId }}</td>
            <td class="border p-2">{{ item.currentQuantity }}</td>
            <td class="border p-2">{{ item.reservedQuantity }}</td>
            <td class="border p-2">{{ item.availableQuantity }}</td>
            <td class="border p-2">
              <button
                @click="handleAdjust(item.productId, 10)"
                :disabled="isAdjusting"
                class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Add 10
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex justify-center gap-4 mt-6">
        <button
          @click="goToPage(page - 1)"
          :disabled="page === 1"
          class="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span class="px-4 py-2">Page {{ page }} of {{ pagination?.totalPages }}</span>
        <button
          @click="goToPage(page + 1)"
          :disabled="page === pagination?.totalPages"
          class="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
```

### Step 3.4: Update OrderListPage.vue (1 hour)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useOrders, useCreateOrder } from '@/composables/useOrders'

const page = ref(1)
const pageSize = ref(10)

const { orders, pagination, isLoading, error } = useOrders(page, pageSize)
const { createOrder, isLoading: isCreating } = useCreateOrder()

const goToPage = (newPage: number) => {
  page.value = newPage
}
</script>

<template>
  <div class="orders-page p-6">
    <h1 class="text-2xl font-bold mb-6">Orders</h1>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-600">Loading orders...</p>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600">Error: {{ error.message }}</p>
    </div>

    <div v-else>
      <table class="w-full border-collapse border">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2 text-left">Order #</th>
            <th class="border p-2 text-left">Status</th>
            <th class="border p-2 text-left">Total</th>
            <th class="border p-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id" class="border">
            <td class="border p-2">{{ order.orderNumber }}</td>
            <td class="border p-2">
              <span
                :class="{
                  'bg-yellow-100 text-yellow-800': order.status === 'PENDING',
                  'bg-green-100 text-green-800': order.status === 'COMPLETED',
                }"
                class="px-2 py-1 rounded text-sm"
              >
                {{ order.status }}
              </span>
            </td>
            <td class="border p-2">${{ order.total }}</td>
            <td class="border p-2">{{ new Date(order.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>

      <div class="flex justify-center gap-4 mt-6">
        <button
          @click="goToPage(page - 1)"
          :disabled="page === 1"
          class="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span class="px-4 py-2">Page {{ page }} of {{ pagination?.totalPages }}</span>
        <button
          @click="goToPage(page + 1)"
          :disabled="page === pagination?.totalPages"
          class="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
```

---

## Day 4: Testing (2 hours)

### Test Checklist

- [ ] LoginPage loads and shows loading state
- [ ] LoginPage shows error on invalid credentials
- [ ] LoginPage redirects to dashboard on success
- [ ] ProductsListPage shows loading state
- [ ] ProductsListPage displays products
- [ ] ProductsListPage pagination works
- [ ] ProductsListPage delete works
- [ ] InventoryListPage shows loading state
- [ ] InventoryListPage displays inventory
- [ ] InventoryListPage adjust works
- [ ] OrderListPage shows loading state
- [ ] OrderListPage displays orders

---

## Day 5: Switch to Real API (2 hours)

### Step 5.1: Update useProducts

```typescript
// BEFORE
export function useProducts(page = ref(1), pageSize = ref(10)) {
  return useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: () => mockGetProducts({ page: page.value, pageSize: pageSize.value }),
  })
}

// AFTER
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

### Step 5.2: Update useCreateProduct

```typescript
// BEFORE
export function useCreateProduct() {
  const mutation = useMutation({
    mutationFn: (data: any) => mockCreateProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// AFTER
export function useCreateProduct() {
  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
```

### Step 5.3: Update All Other Composables

Repeat the same pattern for:
- useInventory → apiClient.getInventory()
- useAdjustInventory → apiClient.adjustInventory()
- useOrders → apiClient.getOrders()
- useCreateOrder → apiClient.createOrder()
- useUsers → apiClient.getUsers()
- useLogin → apiClient.login()
- useLogout → apiClient.logout()

### Step 5.4: Test with Real Backend

```bash
# Start backend
cd inventory-management/apps/backend
npm run dev

# Start frontend
cd inventory-management/apps/frontend
npm run dev

# Test all pages
# Navigate to http://localhost:5173
```

---

## Summary

### What You've Done
✅ Installed Vue Query  
✅ Created query client  
✅ Created 5 composables with mock data  
✅ Updated 4 pages to use Vue Query  
✅ Tested with mock data  
✅ Switched to real API  

### Benefits
✅ 45-60% less code  
✅ Automatic caching  
✅ Request deduplication  
✅ Better error handling  
✅ Easier to maintain  

### Time Investment
- Day 1: 2 hours (Setup)
- Day 2: 4 hours (Composables)
- Day 3: 4 hours (Components)
- Day 4: 2 hours (Testing)
- Day 5: 2 hours (API Switch)
- **Total: 14 hours**

---

**You're done! Your app now uses Vue Query! 🎉**

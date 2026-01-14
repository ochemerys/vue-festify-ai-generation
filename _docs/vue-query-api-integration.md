# Vue Query API Integration

## Overview

This document describes the migration from mock data to real backend API integration using Vue Query (TanStack Query) in the frontend application.

## Date
Completed: 2024

---

## Changes Summary

All frontend composables have been updated to use the real backend API through the `apiClient` service instead of mock data.

### Updated Files

1. ✅ `apps/frontend/src/composables/useProducts.ts`
2. ✅ `apps/frontend/src/composables/useInventory.ts`
3. ✅ `apps/frontend/src/composables/useOrders.ts`
4. ✅ `apps/frontend/src/composables/useUsers.ts`
5. ✅ `apps/frontend/src/composables/useAuth.ts`
6. ✅ `apps/frontend/src/composables/useReports.ts` (NEW)

---

## API Integration Details

### 1. Products (`useProducts.ts`)

#### Queries
- **`useProducts(page, pageSize, filters)`** - Fetch paginated products with filters
  - Supports: category, supplier, price range, search
  - Stale time: 5 minutes
  
- **`useProduct(id)`** - Fetch single product by ID
  - Stale time: 5 minutes
  
- **`useProductBySku(sku)`** - Fetch product by SKU
  - Stale time: 5 minutes

#### Mutations
- **`useCreateProduct()`** - Create new product
  - Invalidates: `['products']`
  
- **`useUpdateProduct()`** - Update existing product
  - Invalidates: `['products']`, `['product', id]`
  
- **`useDeactivateProduct()`** - Deactivate product
  - Invalidates: `['products']`, `['product', id]`
  
- **`useDeleteProduct()`** - Delete product
  - Invalidates: `['products']`

#### Usage Example
```typescript
import { useProducts, useCreateProduct } from '@/composables/useProducts'
import { ref } from 'vue'

// Fetch products
const page = ref(1)
const pageSize = ref(10)
const filters = ref({ category: 'Electronics' })

const { products, pagination, isLoading, error } = useProducts(page, pageSize, filters)

// Create product
const { createProduct, isLoading: isCreating } = useCreateProduct()

createProduct({
  sku: 'PROD-001',
  name: 'New Product',
  category: 'Electronics',
  supplier: 'Tech Corp',
  price: 99.99,
  reorderLevel: 10
})
```

---

### 2. Inventory (`useInventory.ts`)

#### Queries
- **`useInventory(page, pageSize)`** - Fetch paginated inventory levels
  - Stale time: 2 minutes (inventory changes frequently)
  
- **`useProductInventory(productId)`** - Fetch inventory for specific product
  - Stale time: 2 minutes

#### Mutations
- **`useAdjustInventory()`** - Adjust inventory levels
  - Invalidates: `['inventory']`, `['inventory', 'product', productId]`, `['products']`

#### Usage Example
```typescript
import { useInventory, useAdjustInventory } from '@/composables/useInventory'

const { inventory, isLoading } = useInventory()

const { adjustInventory } = useAdjustInventory()

adjustInventory({
  productId: '123',
  quantity: 50,
  type: 'IN',
  reason: 'Restock from supplier',
  reference: 'PO-1001'
})
```

---

### 3. Orders (`useOrders.ts`)

#### Queries
- **`useOrders(page, pageSize)`** - Fetch paginated orders
  - Stale time: 3 minutes
  
- **`useOrder(id)`** - Fetch single order
  - Stale time: 3 minutes
  
- **`usePurchaseOrders(page, pageSize)`** - Fetch paginated purchase orders
  - Stale time: 3 minutes
  
- **`usePurchaseOrder(id)`** - Fetch single purchase order
  - Stale time: 3 minutes

#### Mutations
- **`useCreateOrder()`** - Create new order
  - Invalidates: `['orders']`, `['inventory']`
  
- **`useUpdateOrder()`** - Update order
  - Invalidates: `['orders']`, `['order', id]`, `['inventory']`
  
- **`useCreatePurchaseOrder()`** - Create purchase order
  - Invalidates: `['purchase-orders']`
  
- **`useUpdatePurchaseOrder()`** - Update purchase order
  - Invalidates: `['purchase-orders']`, `['purchase-order', id]`, `['inventory']`

#### Usage Example
```typescript
import { useOrders, useCreateOrder } from '@/composables/useOrders'

const { orders, pagination, isLoading } = useOrders()

const { createOrder } = useCreateOrder()

createOrder({
  customerName: 'Acme Corp',
  customerEmail: 'orders@acme.com',
  items: [
    { productId: '123', quantity: 10, unitPrice: 99.99 }
  ]
})
```

---

### 4. Users (`useUsers.ts`)

#### Queries
- **`useUsers(page, pageSize)`** - Fetch paginated users
  - Stale time: 5 minutes
  
- **`useUser(id)`** - Fetch single user
  - Stale time: 5 minutes

#### Mutations
- **`useCreateUser()`** - Create new user
  - Invalidates: `['users']`
  
- **`useUpdateUser()`** - Update user
  - Invalidates: `['users']`, `['user', id]`
  
- **`useDeactivateUser()`** - Deactivate user
  - Invalidates: `['users']`, `['user', id]`
  
- **`useReactivateUser()`** - Reactivate user
  - Invalidates: `['users']`, `['user', id]`

#### Usage Example
```typescript
import { useUsers, useCreateUser } from '@/composables/useUsers'

const { users, isLoading } = useUsers()

const { createUser } = useCreateUser()

createUser({
  email: 'newuser@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'STAFF'
})
```

---

### 5. Authentication (`useAuth.ts`)

#### Queries
- **`usePermissions()`** - Fetch user permissions
  - Stale time: 10 minutes
  - No retry on unauthorized

#### Mutations
- **`useLogin()`** - Login user
  - Clears all queries on success
  
- **`useLogout()`** - Logout user
  - Clears all queries on success/error
  
- **`useRefreshToken()`** - Refresh access token

#### Utilities
- **`useIsAuthenticated()`** - Check authentication status
  - Returns: `{ isAuthenticated, token, isExpired }`

#### Usage Example
```typescript
import { useLogin, useLogout, useIsAuthenticated } from '@/composables/useAuth'

// Login
const { login, isLoading } = useLogin()
login({ email: 'admin@example.com', password: 'password123' })

// Check auth status
const { isAuthenticated, isExpired } = useIsAuthenticated()

// Logout
const { logout } = useLogout()
logout()
```

---

### 6. Reports (`useReports.ts`) - NEW

#### Queries
- **`useReports(filters)`** - Fetch reports with filters
  - Stale time: 5 minutes
  
- **`useSalesReport(startDate, endDate)`** - Fetch sales report
  - Stale time: 5 minutes
  
- **`useInventoryReport()`** - Fetch inventory report
  - Stale time: 2 minutes
  
- **`useLowStockReport()`** - Fetch low stock report
  - Stale time: 2 minutes

#### Usage Example
```typescript
import { useSalesReport, useLowStockReport } from '@/composables/useReports'
import { ref } from 'vue'

const startDate = ref('2024-01-01')
const endDate = ref('2024-12-31')

const { salesReport, isLoading } = useSalesReport(startDate, endDate)
const { lowStockReport } = useLowStockReport()
```

---

## Key Features

### 1. Reactive Parameters
All composables accept reactive refs for parameters, enabling automatic refetching when parameters change:

```typescript
const page = ref(1)
const { products } = useProducts(page)

// Changing page will automatically refetch
page.value = 2
```

### 2. Optimistic Updates
Mutations automatically invalidate related queries to keep data fresh:

```typescript
// Creating a product invalidates the products list
const { createProduct } = useCreateProduct()
createProduct(newProduct) // Products list will refetch automatically
```

### 3. Error Handling
All composables expose error states:

```typescript
const { products, isError, error } = useProducts()

if (isError) {
  console.error('Failed to fetch products:', error)
}
```

### 4. Loading States
Track loading states for better UX:

```typescript
const { products, isLoading } = useProducts()

if (isLoading) {
  // Show loading spinner
}
```

### 5. Async Mutations
Mutations provide both callback and async versions:

```typescript
const { createProduct, createProductAsync } = useCreateProduct()

// Callback version
createProduct(data)

// Async version (for await)
try {
  const result = await createProductAsync(data)
  console.log('Created:', result)
} catch (error) {
  console.error('Failed:', error)
}
```

---

## Cache Configuration

### Stale Times
- **Products**: 5 minutes
- **Inventory**: 2 minutes (changes frequently)
- **Orders**: 3 minutes
- **Users**: 5 minutes
- **Permissions**: 10 minutes
- **Reports**: 2-5 minutes (depending on type)

### Query Keys Structure
```typescript
['products']                          // All products
['products', page, pageSize, filters] // Paginated products
['product', id]                       // Single product
['product', 'sku', sku]              // Product by SKU

['inventory']                         // All inventory
['inventory', page, pageSize]        // Paginated inventory
['inventory', 'product', productId]  // Product inventory

['orders']                           // All orders
['order', id]                        // Single order
['purchase-orders']                  // All purchase orders
['purchase-order', id]               // Single purchase order

['users']                            // All users
['user', id]                         // Single user

['permissions']                      // User permissions

['reports', filters]                 // Reports with filters
['reports', 'sales', start, end]    // Sales report
['reports', 'inventory']            // Inventory report
['reports', 'low-stock']            // Low stock report
```

---

## Migration Checklist

- [x] Remove all mock data from composables
- [x] Update all queries to use `apiClient` methods
- [x] Update all mutations to use `apiClient` methods
- [x] Add proper query key structures
- [x] Configure appropriate stale times
- [x] Add query invalidation on mutations
- [x] Support reactive parameters
- [x] Add error handling
- [x] Add loading states
- [x] Add async mutation variants
- [x] Document all composables
- [x] Create reports composable

---

## Testing

### Manual Testing Steps

1. **Start backend server**
   ```bash
   pnpm --filter backend dev
   ```

2. **Start frontend dev server**
   ```bash
   pnpm --filter frontend dev
   ```

3. **Test each feature**
   - Login/Logout
   - View products list
   - Create/Update/Delete products
   - View inventory
   - Adjust inventory
   - Create/View orders
   - View reports

### Expected Behavior

- Data should load from backend API
- Loading states should display during requests
- Errors should be handled gracefully
- Cache should prevent unnecessary refetches
- Mutations should update cache automatically

---

## Troubleshooting

### Issue: "Network request failed"
**Solution**: Ensure backend server is running on `http://localhost:3000`

### Issue: "Unauthorized" errors
**Solution**: Login first using `useLogin()` composable

### Issue: Data not updating after mutation
**Solution**: Check that query invalidation is configured correctly in mutation's `onSuccess`

### Issue: Stale data showing
**Solution**: Adjust `staleTime` in query configuration or manually call `refetch()`

---

## Next Steps

1. ✅ Implement error boundaries in components
2. ✅ Add retry logic for failed requests
3. ✅ Implement optimistic updates for better UX
4. ✅ Add request cancellation for navigation
5. ✅ Implement infinite scroll for large lists
6. ✅ Add prefetching for anticipated navigation

---

## References

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Vue Query Guide](https://tanstack.com/query/latest/docs/vue/overview)
- [API Client Service](../inventory-management/apps/frontend/src/services/api.ts)

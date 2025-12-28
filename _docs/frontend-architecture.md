# Vue 3 Inventory Manager - TDD-First Architecture

**Version:** 1.0.0  
**Last Updated:** 2024  
**Philosophy:** Contract-First, Test-Driven Development

---

## 1. Requirement Traceability & Page Definition

### Primary Views

| Route Path | Responsibility | Data Dependencies | Auth Required |
|------------|---------------|-------------------|---------------|
| `/` | Dashboard overview with key metrics and alerts | `useInventoryStore`, `useOrderStore`, `useDashboardMetrics` | Yes |
| `/products` | Product catalog listing with search/filter | `useProductStore`, `useProductFilters` | Yes |
| `/products/new` | Create new product form | `useProductStore`, `useProductForm` | Yes |
| `/products/:id` | View/edit single product details | `useProductStore`, `useInventoryStore` | Yes |
| `/inventory` | Inventory levels overview with low-stock alerts | `useInventoryStore`, `useInventoryFilters` | Yes |
| `/inventory/:productId/transactions` | Transaction history for a product | `useInventoryStore`, `useTransactionHistory` | Yes |
| `/inventory/adjust` | Manual inventory adjustment form | `useInventoryStore`, `useStockValidation` | Yes |
| `/orders` | Customer orders listing | `useOrderStore`, `useOrderFilters` | Yes |
| `/orders/:id` | Order details and fulfillment | `useOrderStore`, `useInventoryStore` | Yes |
| `/purchase-orders` | Purchase orders from suppliers | `usePurchaseOrderStore`, `usePOFilters` | Yes |
| `/purchase-orders/new` | Create purchase order | `usePurchaseOrderStore`, `useProductStore` | Yes |
| `/purchase-orders/:id/receive` | Goods receipt processing | `usePurchaseOrderStore`, `useInventoryStore` | Yes |
| `/reports` | Analytics and reporting dashboard | `useReportStore`, `useDateRangeFilter` | Yes |
| `/login` | User authentication | `useAuthStore` | No |

---

## 2. Component Contract Design

### 2.1 Layout Components

#### `AppLayout.vue`

**Responsibility:** Main application shell with navigation and header

**Props:**
```typescript
interface AppLayoutProps {
  // No props - reads from auth store
}
```

**Slots:**
```typescript
{
  default: void // Main content area
}
```

**Emits:** None

**Expose:** None

---

#### `AppHeader.vue`

**Responsibility:** Top navigation bar with user menu and notifications

**Props:**
```typescript
interface AppHeaderProps {
  userName: string
  notificationCount?: number
}
```

**Emits:**
```typescript
{
  'logout': void
  'navigate-to-profile': void
}
```

**Slots:**
```typescript
{
  actions?: void // Additional header actions
}
```

**Expose:** None

---

#### `AppSidebar.vue`

**Responsibility:** Main navigation menu

**Props:**
```typescript
interface AppSidebarProps {
  currentRoute: string
}
```

**Emits:**
```typescript
{
  'navigate': { path: string }
}
```

**Slots:** None

**Expose:** None

---

### 2.2 Product Components

#### `ProductTable.vue`

**Responsibility:** Display paginated product list with sorting

**Props:**
```typescript
interface ProductTableProps {
  products: Product[]
  loading?: boolean
  sortBy?: 'name' | 'sku' | 'price' | 'category'
  sortOrder?: 'asc' | 'desc'
}
```

**Emits:**
```typescript
{
  'edit': { productId: string }
  'delete': { productId: string }
  'view-inventory': { productId: string }
  'sort-change': { field: string, order: 'asc' | 'desc' }
}
```

**Slots:**
```typescript
{
  'empty-state'?: void
  'actions'?: { product: Product }
}
```

**Expose:** None

---

#### `ProductForm.vue`

**Responsibility:** Create/edit product with validation

**Props:**
```typescript
interface ProductFormProps {
  product?: Product // Undefined for create mode
  mode: 'create' | 'edit'
  loading?: boolean
}
```

**Emits:**
```typescript
{
  'submit': CreateProductRequest | UpdateProductRequest
  'cancel': void
}
```

**Slots:** None

**Expose:**
```typescript
{
  validate: () => Promise<boolean>
  reset: () => void
}
```

---

#### `ProductCard.vue`

**Responsibility:** Compact product display for grid views

**Props:**
```typescript
interface ProductCardProps {
  product: Product
  showInventory?: boolean
  inventoryLevel?: InventoryLevel
}
```

**Emits:**
```typescript
{
  'click': { productId: string }
  'quick-edit': { productId: string }
}
```

**Slots:**
```typescript
{
  'badge'?: void
}
```

**Expose:** None

---

#### `ProductFilters.vue`

**Responsibility:** Filter controls for product search

**Props:**
```typescript
interface ProductFiltersProps {
  filters: ProductFilters
  categories: string[]
  suppliers: string[]
}
```

**Emits:**
```typescript
{
  'update:filters': ProductFilters
  'reset': void
}
```

**Slots:** None

**Expose:** None

---

### 2.3 Inventory Components

#### `InventoryTable.vue`

**Responsibility:** Display inventory levels with stock status indicators

**Props:**
```typescript
interface InventoryTableProps {
  items: Array<{
    product: Product
    level: InventoryLevel
  }>
  loading?: boolean
  highlightLowStock?: boolean
}
```

**Emits:**
```typescript
{
  'adjust': { productId: string }
  'view-history': { productId: string }
  'reorder': { productId: string }
}
```

**Slots:**
```typescript
{
  'empty-state'?: void
}
```

**Expose:** None

---

#### `StockAdjustmentForm.vue`

**Responsibility:** Manual inventory adjustment with reason tracking

**Props:**
```typescript
interface StockAdjustmentFormProps {
  productId: string
  currentQuantity: number
  productName: string
}
```

**Emits:**
```typescript
{
  'submit': InventoryAdjustmentRequest
  'cancel': void
}
```

**Slots:** None

**Expose:**
```typescript
{
  validate: () => Promise<boolean>
}
```

---

#### `TransactionHistoryList.vue`

**Responsibility:** Display transaction log with filtering

**Props:**
```typescript
interface TransactionHistoryListProps {
  transactions: InventoryTransaction[]
  loading?: boolean
  productName?: string
}
```

**Emits:**
```typescript
{
  'load-more': void
}
```

**Slots:**
```typescript
{
  'empty-state'?: void
}
```

**Expose:** None

---

#### `LowStockAlert.vue`

**Responsibility:** Alert banner for low stock items

**Props:**
```typescript
interface LowStockAlertProps {
  alerts: LowStockAlert[]
  dismissible?: boolean
}
```

**Emits:**
```typescript
{
  'dismiss': { productId: string }
  'create-po': { productId: string }
  'view-product': { productId: string }
}
```

**Slots:** None

**Expose:** None

---

#### `StockLevelBadge.vue`

**Responsibility:** Visual indicator of stock status

**Props:**
```typescript
interface StockLevelBadgeProps {
  currentQuantity: number
  reorderLevel: number
  size?: 'sm' | 'md' | 'lg'
}
```

**Emits:** None

**Slots:** None

**Expose:** None

---

### 2.4 Order Components

#### `OrderTable.vue`

**Responsibility:** Display customer orders with status

**Props:**
```typescript
interface OrderTableProps {
  orders: Order[]
  loading?: boolean
}
```

**Emits:**
```typescript
{
  'view': { orderId: string }
  'fulfill': { orderId: string }
  'cancel': { orderId: string }
}
```

**Slots:**
```typescript
{
  'empty-state'?: void
}
```

**Expose:** None

---

#### `OrderDetailsCard.vue`

**Responsibility:** Display order details with line items

**Props:**
```typescript
interface OrderDetailsCardProps {
  order: Order
  editable?: boolean
}
```

**Emits:**
```typescript
{
  'update-status': { orderId: string, status: OrderStatus }
  'edit': { orderId: string }
}
```

**Slots:**
```typescript
{
  'actions'?: void
}
```

**Expose:** None

---

### 2.5 Purchase Order Components

#### `PurchaseOrderForm.vue`

**Responsibility:** Create purchase order with line items

**Props:**
```typescript
interface PurchaseOrderFormProps {
  products: Product[]
  mode: 'create' | 'edit'
  purchaseOrder?: PurchaseOrder
}
```

**Emits:**
```typescript
{
  'submit': CreatePurchaseOrderRequest
  'cancel': void
}
```

**Slots:** None

**Expose:**
```typescript
{
  validate: () => Promise<boolean>
  addLineItem: (productId: string) => void
  removeLineItem: (index: number) => void
}
```

---

#### `GoodsReceiptForm.vue`

**Responsibility:** Process incoming goods against PO

**Props:**
```typescript
interface GoodsReceiptFormProps {
  purchaseOrder: PurchaseOrder
}
```

**Emits:**
```typescript
{
  'submit': GoodsReceiptRequest
  'cancel': void
}
```

**Slots:** None

**Expose:**
```typescript
{
  validate: () => Promise<boolean>
}
```

---

### 2.6 Shared/UI Components

#### `DataTable.vue`

**Responsibility:** Generic table with sorting, pagination

**Props:**
```typescript
interface DataTableProps<T> {
  columns: Array<{
    key: keyof T
    label: string
    sortable?: boolean
    width?: string
  }>
  data: T[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
  }
}
```

**Emits:**
```typescript
{
  'sort': { column: string, order: 'asc' | 'desc' }
  'page-change': { page: number }
  'row-click': { row: T, index: number }
}
```

**Slots:**
```typescript
{
  [key: `cell-${string}`]?: { row: T, value: any }
  'empty-state'?: void
}
```

**Expose:** None

---

#### `Modal.vue`

**Responsibility:** Accessible modal dialog

**Props:**
```typescript
interface ModalProps {
  open: boolean
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
}
```

**Emits:**
```typescript
{
  'close': void
  'confirm': void
}
```

**Slots:**
```typescript
{
  default: void
  footer?: void
}
```

**Expose:**
```typescript
{
  focus: () => void
}
```

---

#### `FormField.vue`

**Responsibility:** Form input wrapper with label and error

**Props:**
```typescript
interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  helpText?: string
  fieldId: string
}
```

**Emits:** None

**Slots:**
```typescript
{
  default: void // Input element
}
```

**Expose:** None

---

#### `LoadingSpinner.vue`

**Responsibility:** Loading indicator

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}
```

**Emits:** None

**Slots:** None

**Expose:** None

---

#### `EmptyState.vue`

**Responsibility:** Empty state placeholder

**Props:**
```typescript
interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
}
```

**Emits:**
```typescript
{
  'action': void
}
```

**Slots:**
```typescript
{
  icon?: void
}
```

**Expose:** None

---

## 3. State & Boundary Mapping

### 3.1 Global State (Pinia Stores)

#### `useAuthStore`

**Responsibility:** Authentication state and user session

**State:**
```typescript
{
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}
```

**Actions:**
```typescript
{
  login(credentials: { email: string, password: string }): Promise<void>
  logout(): Promise<void>
  refreshToken(): Promise<void>
  checkAuth(): Promise<boolean>
}
```

**Getters:**
```typescript
{
  userName: string | null
  userRole: string | null
}
```

---

#### `useProductStore`

**Responsibility:** Product catalog cache and CRUD operations

**State:**
```typescript
{
  products: Map<string, Product>
  list: string[] // Product IDs in current view
  filters: ProductFilters
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  loading: boolean
  error: string | null
}
```

**Actions:**
```typescript
{
  fetchProducts(filters?: ProductFilters): Promise<void>
  fetchProductById(id: string): Promise<Product>
  createProduct(data: CreateProductRequest): Promise<Product>
  updateProduct(id: string, data: UpdateProductRequest): Promise<Product>
  deleteProduct(id: string): Promise<void>
  setFilters(filters: ProductFilters): void
  clearCache(): void
}
```

**Getters:**
```typescript
{
  productList: Product[]
  productById: (id: string) => Product | undefined
  categories: string[]
  suppliers: string[]
  hasProducts: boolean
}
```

---

#### `useInventoryStore`

**Responsibility:** Inventory levels and transaction management

**State:**
```typescript
{
  levels: Map<string, InventoryLevel> // Keyed by productId
  transactions: Map<string, InventoryTransaction[]> // Keyed by productId
  lowStockAlerts: LowStockAlert[]
  loading: boolean
  error: string | null
}
```

**Actions:**
```typescript
{
  fetchInventoryLevels(): Promise<void>
  fetchLevelByProductId(productId: string): Promise<InventoryLevel>
  fetchTransactionHistory(productId: string): Promise<void>
  createTransaction(data: CreateTransactionRequest): Promise<void>
  adjustInventory(data: InventoryAdjustmentRequest): Promise<void>
  fetchLowStockAlerts(): Promise<void>
}
```

**Getters:**
```typescript
{
  levelByProductId: (id: string) => InventoryLevel | undefined
  transactionsByProductId: (id: string) => InventoryTransaction[]
  lowStockCount: number
  criticalStockItems: LowStockAlert[]
}
```

---

#### `useOrderStore`

**Responsibility:** Customer order management

**State:**
```typescript
{
  orders: Map<string, Order>
  list: string[]
  filters: OrderFilters
  pagination: PaginationState
  loading: boolean
  error: string | null
}
```

**Actions:**
```typescript
{
  fetchOrders(filters?: OrderFilters): Promise<void>
  fetchOrderById(id: string): Promise<Order>
  createOrder(data: CreateOrderRequest): Promise<Order>
  updateOrderStatus(id: string, status: OrderStatus): Promise<void>
  cancelOrder(id: string): Promise<void>
}
```

**Getters:**
```typescript
{
  orderList: Order[]
  orderById: (id: string) => Order | undefined
  pendingOrders: Order[]
  orderSummary: OrderSummary
}
```

---

#### `usePurchaseOrderStore`

**Responsibility:** Purchase order and goods receipt management

**State:**
```typescript
{
  purchaseOrders: Map<string, PurchaseOrder>
  list: string[]
  filters: PurchaseOrderFilters
  pagination: PaginationState
  loading: boolean
  error: string | null
}
```

**Actions:**
```typescript
{
  fetchPurchaseOrders(filters?: PurchaseOrderFilters): Promise<void>
  fetchPOById(id: string): Promise<PurchaseOrder>
  createPO(data: CreatePurchaseOrderRequest): Promise<PurchaseOrder>
  updatePOStatus(id: string, status: POStatus): Promise<void>
  receiveGoods(id: string, data: GoodsReceiptRequest): Promise<void>
}
```

**Getters:**
```typescript
{
  poList: PurchaseOrder[]
  poById: (id: string) => PurchaseOrder | undefined
  pendingPOs: PurchaseOrder[]
}
```

---

### 3.2 Shared Logic (Composables)

#### `useProductFilters()`

**Responsibility:** Product filtering logic with URL sync

**Returns:**
```typescript
{
  filters: Ref<ProductFilters>
  updateFilter: (key: keyof ProductFilters, value: any) => void
  resetFilters: () => void
  applyFilters: () => void
  isFiltered: ComputedRef<boolean>
}
```

**Dependencies:** `useRoute`, `useRouter`

---

#### `useInventoryFilters()`

**Responsibility:** Inventory filtering with low-stock toggle

**Returns:**
```typescript
{
  filters: Ref<InventoryFilters>
  showLowStockOnly: Ref<boolean>
  updateFilter: (key: string, value: any) => void
  resetFilters: () => void
  filteredItems: ComputedRef<InventoryLevel[]>
}
```

**Dependencies:** `useInventoryStore`

---

#### `useStockValidation()`

**Responsibility:** Stock level validation rules

**Returns:**
```typescript
{
  validateQuantity: (quantity: number) => { valid: boolean, error?: string }
  validateAdjustment: (current: number, adjustment: number) => { valid: boolean, error?: string }
  isLowStock: (current: number, reorder: number) => boolean
  isCriticalStock: (current: number, reorder: number) => boolean
}
```

**Dependencies:** None

---

#### `useFormValidation<T>(schema: ZodSchema<T>)`

**Responsibility:** Generic form validation with Zod

**Returns:**
```typescript
{
  errors: Ref<Record<string, string>>
  validate: (data: T) => Promise<boolean>
  validateField: (field: keyof T, value: any) => void
  clearErrors: () => void
  hasErrors: ComputedRef<boolean>
}
```

**Dependencies:** `zod`

---

#### `usePagination()`

**Responsibility:** Pagination state management

**Returns:**
```typescript
{
  page: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
  totalPages: ComputedRef<number>
  hasNext: ComputedRef<boolean>
  hasPrev: ComputedRef<boolean>
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
}
```

**Dependencies:** None

---

#### `useApiClient()`

**Responsibility:** HTTP client with error handling

**Returns:**
```typescript
{
  get: <T>(url: string, config?: RequestConfig) => Promise<T>
  post: <T>(url: string, data: any, config?: RequestConfig) => Promise<T>
  put: <T>(url: string, data: any, config?: RequestConfig) => Promise<T>
  delete: <T>(url: string, config?: RequestConfig) => Promise<T>
  loading: Ref<boolean>
  error: Ref<ApiError | null>
}
```

**Dependencies:** `useAuthStore`

---

#### `useToast()`

**Responsibility:** Toast notification management

**Returns:**
```typescript
{
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}
```

**Dependencies:** None (uses event bus or global state)

---

#### `useDashboardMetrics()`

**Responsibility:** Aggregate dashboard statistics

**Returns:**
```typescript
{
  metrics: ComputedRef<{
    totalProducts: number
    lowStockCount: number
    pendingOrders: number
    totalInventoryValue: number
  }>
  loading: Ref<boolean>
  refresh: () => Promise<void>
}
```

**Dependencies:** `useProductStore`, `useInventoryStore`, `useOrderStore`

---

### 3.3 Local Component State

**Examples:**
- Form field values (before submission)
- Modal open/close state
- Dropdown expanded state
- Table row selection
- Temporary UI flags (e.g., `showPassword`)

**Rule:** Local state should NOT be shared across routes or components. Use stores or composables for shared state.

---

## 4. TDD Strategy (Test Plan)

### 4.1 Component Tests (Vue Testing Library)

| Component | Behavior to Verify | Trigger | Expected Outcome | Accessibility Check |
|-----------|-------------------|---------|------------------|---------------------|
| `ProductTable` | Shows empty state | Empty `products` prop | Renders "No products found" message | `getByRole('status')` or `getByText` |
| `ProductTable` | Renders product rows | Non-empty `products` prop | Renders table with product data | `getByRole('table')`, `getAllByRole('row')` |
| `ProductTable` | Emits edit event | Click edit button | Emits `edit` with productId | `getByRole('button', { name: /edit/i })` |
| `ProductTable` | Sorts by column | Click column header | Emits `sort-change` with field and order | `getByRole('button', { name: /sort by name/i })` |
| `ProductForm` | Shows validation errors | Submit with empty required fields | Displays error messages | `getByRole('alert')` or `getByText(/required/i)` |
| `ProductForm` | Emits submit event | Fill form and submit | Emits `submit` with form data | `getByRole('button', { name: /save/i })` |
| `ProductForm` | Populates in edit mode | Pass `product` prop | Form fields pre-filled | `getByLabelText('Product Name')` has value |
| `ProductFilters` | Updates filter state | Change filter input | Emits `update:filters` | `getByLabelText('Category')` |
| `ProductFilters` | Resets filters | Click reset button | Emits `reset` event | `getByRole('button', { name: /reset/i })` |
| `InventoryTable` | Highlights low stock | Item with `currentQuantity < reorderLevel` | Row has warning indicator | `getByRole('status', { name: /low stock/i })` |
| `InventoryTable` | Shows stock levels | Pass inventory items | Displays quantity values | `getByText(/\d+ units/i)` |
| `StockAdjustmentForm` | Validates quantity | Enter negative number | Shows validation error | `getByRole('alert')` |
| `StockAdjustmentForm` | Requires reason | Submit without reason | Shows "Reason required" error | `getByLabelText('Reason')` with `aria-invalid` |
| `LowStockAlert` | Displays alert count | Pass multiple alerts | Shows count badge | `getByText(/\d+ items low/i)` |
| `LowStockAlert` | Dismisses alert | Click dismiss button | Emits `dismiss` with productId | `getByRole('button', { name: /dismiss/i })` |
| `OrderTable` | Shows order status | Pass orders with different statuses | Renders status badges | `getAllByRole('status')` |
| `OrderDetailsCard` | Displays line items | Pass order with items | Renders item list | `getByRole('list')` |
| `Modal` | Opens when prop is true | Set `open` to true | Modal is visible | `getByRole('dialog')` |
| `Modal` | Closes on backdrop click | Click outside modal | Emits `close` event | `getByRole('dialog')` parent click |
| `Modal` | Traps focus | Open modal | Focus stays within modal | Tab navigation test |
| `FormField` | Associates label with input | Render with label | Label `for` matches input `id` | `getByLabelText('Field Name')` |
| `FormField` | Shows error message | Pass `error` prop | Displays error with `aria-describedby` | `getByRole('textbox')` has `aria-describedby` |
| `DataTable` | Paginates data | Click next page | Emits `page-change` | `getByRole('button', { name: /next page/i })` |
| `EmptyState` | Shows action button | Pass `actionLabel` prop | Renders button | `getByRole('button', { name: actionLabel })` |

---

### 4.2 Composable Tests (Vitest)

| Composable | Behavior to Verify | Setup | Expected Outcome |
|------------|-------------------|-------|------------------|
| `useProductFilters` | Initializes with defaults | Call composable | Returns default filter values |
| `useProductFilters` | Updates single filter | Call `updateFilter('category', 'Electronics')` | `filters.value.category` equals 'Electronics' |
| `useProductFilters` | Resets all filters | Call `resetFilters()` | All filters return to defaults |
| `useProductFilters` | Syncs with URL params | Mock route with query params | Filters match URL params |
| `useStockValidation` | Validates positive quantity | Call `validateQuantity(10)` | Returns `{ valid: true }` |
| `useStockValidation` | Rejects negative quantity | Call `validateQuantity(-5)` | Returns `{ valid: false, error: '...' }` |
| `useStockValidation` | Detects low stock | Call `isLowStock(5, 10)` | Returns `true` |
| `useStockValidation` | Detects critical stock | Call `isCriticalStock(2, 10)` | Returns `true` |
| `useFormValidation` | Validates with Zod schema | Pass valid data | Returns `true`, no errors |
| `useFormValidation` | Catches validation errors | Pass invalid data | Returns `false`, populates `errors` |
| `useFormValidation` | Validates single field | Call `validateField('email', 'invalid')` | Sets error for 'email' field |
| `usePagination` | Calculates total pages | Set `total` to 100, `pageSize` to 10 | `totalPages` equals 10 |
| `usePagination` | Navigates to next page | Call `nextPage()` | `page` increments by 1 |
| `usePagination` | Disables next on last page | Set `page` to last page | `hasNext` is `false` |
| `useApiClient` | Adds auth header | Mock auth token | Request includes `Authorization` header |
| `useApiClient` | Handles 401 errors | Mock 401 response | Triggers logout action |
| `useApiClient` | Sets loading state | Call `get()` | `loading` is `true` during request |
| `useDashboardMetrics` | Aggregates store data | Mock store values | Returns correct metric calculations |

---

### 4.3 Store Tests (Vitest + Pinia Testing)

| Store | Behavior to Verify | Action/Mutation | Expected Outcome |
|-------|-------------------|-----------------|------------------|
| `useProductStore` | Fetches products | Call `fetchProducts()` | Populates `products` map and `list` |
| `useProductStore` | Caches product by ID | Call `fetchProductById('123')` | Adds to `products` map |
| `useProductStore` | Creates product | Call `createProduct(data)` | Adds new product to store |
| `useProductStore` | Updates product | Call `updateProduct('123', data)` | Updates product in map |
| `useProductStore` | Deletes product | Call `deleteProduct('123')` | Removes from map and list |
| `useProductStore` | Filters products | Call `setFilters({ category: 'X' })` | Updates `filters` state |
| `useProductStore` | Returns categories | Access `categories` getter | Returns unique category list |
| `useInventoryStore` | Fetches inventory levels | Call `fetchInventoryLevels()` | Populates `levels` map |
| `useInventoryStore` | Adjusts inventory | Call `adjustInventory(data)` | Updates level and creates transaction |
| `useInventoryStore` | Fetches low stock alerts | Call `fetchLowStockAlerts()` | Populates `lowStockAlerts` |
| `useInventoryStore` | Calculates critical stock | Access `criticalStockItems` getter | Returns items below threshold |
| `useAuthStore` | Logs in user | Call `login(credentials)` | Sets `user` and `token` |
| `useAuthStore` | Logs out user | Call `logout()` | Clears `user` and `token` |
| `useAuthStore` | Checks authentication | Call `checkAuth()` | Returns `true` if token valid |
| `useOrderStore` | Fetches orders | Call `fetchOrders()` | Populates `orders` map |
| `useOrderStore` | Updates order status | Call `updateOrderStatus('123', 'FULFILLED')` | Updates order in map |
| `usePurchaseOrderStore` | Creates PO | Call `createPO(data)` | Adds new PO to store |
| `usePurchaseOrderStore` | Receives goods | Call `receiveGoods('123', data)` | Updates PO status and inventory |

---

### 4.4 Integration Tests (E2E-style with MSW)

| Scenario | Steps | Expected Outcome |
|----------|-------|------------------|
| Product CRUD flow | Navigate to products → Create → Edit → Delete | Product lifecycle completes successfully |
| Inventory adjustment | Navigate to inventory → Select product → Adjust quantity | Inventory level updates, transaction recorded |
| Low stock alert | Create product with low stock → View dashboard | Alert appears on dashboard |
| Order fulfillment | Create order → View order → Fulfill | Order status changes, inventory decrements |
| Purchase order receipt | Create PO → Receive goods | Inventory increments, PO status updates |
| Filter persistence | Apply filters → Navigate away → Return | Filters persist via URL params |

---

## 5. Implementation Output

### 5.A. Route Map

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { requiresAuth: false, title: 'Login' }
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
        meta: { title: 'Dashboard', breadcrumb: 'Home' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/pages/ProductListPage.vue'),
        meta: { title: 'Products', breadcrumb: 'Products' }
      },
      {
        path: 'products/new',
        name: 'ProductCreate',
        component: () => import('@/pages/ProductFormPage.vue'),
        meta: { title: 'New Product', breadcrumb: 'New Product' }
      },
      {
        path: 'products/:id',
        name: 'ProductDetail',
        component: () => import('@/pages/ProductDetailPage.vue'),
        meta: { title: 'Product Details', breadcrumb: 'Details' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/pages/InventoryListPage.vue'),
        meta: { title: 'Inventory', breadcrumb: 'Inventory' }
      },
      {
        path: 'inventory/:productId/transactions',
        name: 'TransactionHistory',
        component: () => import('@/pages/TransactionHistoryPage.vue'),
        meta: { title: 'Transaction History', breadcrumb: 'History' }
      },
      {
        path: 'inventory/adjust',
        name: 'InventoryAdjust',
        component: () => import('@/pages/InventoryAdjustPage.vue'),
        meta: { title: 'Adjust Inventory', breadcrumb: 'Adjust' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/pages/OrderListPage.vue'),
        meta: { title: 'Orders', breadcrumb: 'Orders' }
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/pages/OrderDetailPage.vue'),
        meta: { title: 'Order Details', breadcrumb: 'Details' }
      },
      {
        path: 'purchase-orders',
        name: 'PurchaseOrders',
        component: () => import('@/pages/PurchaseOrderListPage.vue'),
        meta: { title: 'Purchase Orders', breadcrumb: 'Purchase Orders' }
      },
      {
        path: 'purchase-orders/new',
        name: 'PurchaseOrderCreate',
        component: () => import('@/pages/PurchaseOrderFormPage.vue'),
        meta: { title: 'New Purchase Order', breadcrumb: 'New PO' }
      },
      {
        path: 'purchase-orders/:id/receive',
        name: 'GoodsReceipt',
        component: () => import('@/pages/GoodsReceiptPage.vue'),
        meta: { title: 'Receive Goods', breadcrumb: 'Receive' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/pages/ReportsPage.vue'),
        meta: { title: 'Reports', breadcrumb: 'Reports' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
```

---

### 5.B. Component Hierarchy

```
App.vue
├── LoginPage.vue (Standalone)
└── AppLayout.vue (Container)
    ├── AppHeader.vue (Presentational)
    │   └── UserMenu.vue (Presentational)
    ├── AppSidebar.vue (Presentational)
    │   └── NavItem.vue (Presentational)
    └── RouterView (Page Container)
        ├── DashboardPage.vue (Container)
        │   ├── MetricCard.vue (Presentational)
        │   ├── LowStockAlert.vue (Presentational)
        │   └── RecentOrdersList.vue (Presentational)
        ├── ProductListPage.vue (Container)
        │   ├── ProductFilters.vue (Presentational)
        │   ├── ProductTable.vue (Presentational)
        │   │   └── ProductRow.vue (Presentational)
        │   └── Pagination.vue (Presentational)
        ├── ProductFormPage.vue (Container)
        │   └── ProductForm.vue (Presentational)
        │       └── FormField.vue (Presentational)
        ├── ProductDetailPage.vue (Container)
        │   ├── ProductCard.vue (Presentational)
        │   ├── StockLevelBadge.vue (Presentational)
        │   └── TransactionHistoryList.vue (Presentational)
        ├── InventoryListPage.vue (Container)
        │   ├── InventoryFilters.vue (Presentational)
        │   └── InventoryTable.vue (Presentational)
        │       └── InventoryRow.vue (Presentational)
        ├── InventoryAdjustPage.vue (Container)
        │   └── StockAdjustmentForm.vue (Presentational)
        ├── TransactionHistoryPage.vue (Container)
        │   └── TransactionHistoryList.vue (Presentational)
        ├── OrderListPage.vue (Container)
        │   ├── OrderFilters.vue (Presentational)
        │   └── OrderTable.vue (Presentational)
        ├── OrderDetailPage.vue (Container)
        │   └── OrderDetailsCard.vue (Presentational)
        │       └── OrderItemRow.vue (Presentational)
        ├── PurchaseOrderListPage.vue (Container)
        │   └── PurchaseOrderTable.vue (Presentational)
        ├── PurchaseOrderFormPage.vue (Container)
        │   └── PurchaseOrderForm.vue (Presentational)
        │       └── POLineItemRow.vue (Presentational)
        ├── GoodsReceiptPage.vue (Container)
        │   └── GoodsReceiptForm.vue (Presentational)
        └── ReportsPage.vue (Container)
            ├── DateRangeFilter.vue (Presentational)
            └── ReportChart.vue (Presentational)

Shared Components (Used across pages):
├── Modal.vue
├── DataTable.vue
├── FormField.vue
├── LoadingSpinner.vue
├── EmptyState.vue
├── ConfirmDialog.vue
└── Toast.vue
```

**Legend:**
- **Container Components:** Manage state, fetch data, handle business logic
- **Presentational Components:** Receive props, emit events, pure UI

---

### 5.C. Type-Safe Contracts

```typescript
// src/types/index.ts

// Re-export from contracts package
export type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
  InventoryLevel,
  InventoryTransaction,
  InventoryAdjustmentRequest,
  CreateTransactionRequest,
  LowStockAlert,
  Order,
  OrderItem,
  OrderStatus,
  CreateOrderRequest,
  PurchaseOrder,
  PurchaseOrderItem,
  POStatus,
  CreatePurchaseOrderRequest,
  GoodsReceiptRequest
} from '@inventory/contracts'

// Frontend-specific types

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
  createdAt: Date
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface SortState {
  field: string
  order: 'asc' | 'desc'
}

export interface InventoryFilters {
  search?: string
  lowStockOnly?: boolean
  category?: string
  page?: number
  pageSize?: number
}

export interface OrderFilters {
  status?: OrderStatus
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  pageSize?: number
}

export interface PurchaseOrderFilters {
  status?: POStatus
  supplier?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export interface DashboardMetrics {
  totalProducts: number
  lowStockCount: number
  criticalStockCount: number
  pendingOrders: number
  pendingPOs: number
  totalInventoryValue: number
  recentTransactions: InventoryTransaction[]
}

export interface TableColumn<T = any> {
  key: keyof T | string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface BreadcrumbItem {
  label: string
  path?: string
}

// Form state types
export interface ProductFormState extends Omit<CreateProductRequest, 'reorderLevel'> {
  reorderLevel: number
}

export interface StockAdjustmentFormState {
  productId: string
  newQuantity: number
  reason: string
  notes?: string
}

// API response wrappers (if not using contracts directly)
export interface ApiRequestConfig {
  headers?: Record<string, string>
  params?: Record<string, any>
  signal?: AbortSignal
}
```

---

### 5.D. Unit & Component Test Skeletons

#### Composable Test Example: `useStockValidation.test.ts`

```typescript
// src/composables/__tests__/useStockValidation.test.ts
import { describe, it, expect } from 'vitest'
import { useStockValidation } from '../useStockValidation'

describe('useStockValidation', () => {
  it('should validate positive quantity', () => {
    const { validateQuantity } = useStockValidation()
    const result = validateQuantity(10)
    
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should reject negative quantity', () => {
    const { validateQuantity } = useStockValidation()
    const result = validateQuantity(-5)
    
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.error).toContain('positive')
  })

  it('should reject zero quantity', () => {
    const { validateQuantity } = useStockValidation()
    const result = validateQuantity(0)
    
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should detect low stock when current is below reorder level', () => {
    const { isLowStock } = useStockValidation()
    
    expect(isLowStock(5, 10)).toBe(true)
    expect(isLowStock(10, 10)).toBe(false)
    expect(isLowStock(15, 10)).toBe(false)
  })

  it('should detect critical stock at 50% of reorder level', () => {
    const { isCriticalStock } = useStockValidation()
    
    expect(isCriticalStock(4, 10)).toBe(true)
    expect(isCriticalStock(5, 10)).toBe(false)
    expect(isCriticalStock(10, 10)).toBe(false)
  })

  it('should validate adjustment does not result in negative stock', () => {
    const { validateAdjustment } = useStockValidation()
    
    const validResult = validateAdjustment(10, -5)
    expect(validResult.valid).toBe(true)
    
    const invalidResult = validateAdjustment(10, -15)
    expect(invalidResult.valid).toBe(false)
    expect(invalidResult.error).toContain('negative')
  })

  it('should allow adjustment to zero', () => {
    const { validateAdjustment } = useStockValidation()
    const result = validateAdjustment(10, -10)
    
    expect(result.valid).toBe(true)
  })
})
```

---

#### Component Test Example: `ProductTable.test.ts`

```typescript
// src/components/__tests__/ProductTable.test.ts
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import ProductTable from '../ProductTable.vue'
import type { Product } from '@inventory/contracts'

const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'PROD-001',
    name: 'Test Product 1',
    description: 'Description 1',
    category: 'Electronics',
    price: 99.99,
    cost: 50.00,
    reorderLevel: 10,
    supplier: 'Supplier A',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    sku: 'PROD-002',
    name: 'Test Product 2',
    description: 'Description 2',
    category: 'Furniture',
    price: 199.99,
    cost: 100.00,
    reorderLevel: 5,
    supplier: 'Supplier B',
    isActive: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
]

describe('ProductTable', () => {
  it('should render table with product data', () => {
    render(ProductTable, {
      props: { products: mockProducts }
    })

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()

    // Check for product names
    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.getByText('Test Product 2')).toBeInTheDocument()

    // Check for SKUs
    expect(screen.getByText('PROD-001')).toBeInTheDocument()
    expect(screen.getByText('PROD-002')).toBeInTheDocument()
  })

  it('should show empty state when no products', () => {
    render(ProductTable, {
      props: { products: [] }
    })

    expect(screen.getByText(/no products found/i)).toBeInTheDocument()
  })

  it('should emit edit event when edit button clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(ProductTable, {
      props: { products: mockProducts }
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])

    expect(emitted()).toHaveProperty('edit')
    expect(emitted().edit[0]).toEqual([{ productId: '1' }])
  })

  it('should emit delete event when delete button clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(ProductTable, {
      props: { products: mockProducts }
    })

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])

    expect(emitted()).toHaveProperty('delete')
    expect(emitted().delete[0]).toEqual([{ productId: '1' }])
  })

  it('should emit sort-change when column header clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(ProductTable, {
      props: { products: mockProducts, sortBy: 'name', sortOrder: 'asc' }
    })

    const nameHeader = screen.getByRole('button', { name: /sort by name/i })
    await user.click(nameHeader)

    expect(emitted()).toHaveProperty('sort-change')
    expect(emitted()['sort-change'][0]).toEqual([{ field: 'name', order: 'desc' }])
  })

  it('should show loading state', () => {
    render(ProductTable, {
      props: { products: [], loading: true }
    })

    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('should have accessible table structure', () => {
    render(ProductTable, {
      props: { products: mockProducts }
    })

    const table = screen.getByRole('table')
    expect(table).toHaveAccessibleName() // Should have aria-label or caption

    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(1) // Header + data rows

    const columnHeaders = screen.getAllByRole('columnheader')
    expect(columnHeaders.length).toBeGreaterThan(0)
  })

  it('should render custom empty state slot', () => {
    render(ProductTable, {
      props: { products: [] },
      slots: {
        'empty-state': '<div>Custom empty message</div>'
      }
    })

    expect(screen.getByText('Custom empty message')).toBeInTheDocument()
  })
})
```

---

#### Store Test Example: `productStore.test.ts`

```typescript
// src/stores/__tests__/productStore.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductStore } from '../productStore'
import type { Product, CreateProductRequest } from '@inventory/contracts'

// Mock API client
vi.mock('@/composables/useApiClient', () => ({
  useApiClient: () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  })
}))

const mockProduct: Product = {
  id: '1',
  sku: 'PROD-001',
  name: 'Test Product',
  description: 'Test Description',
  category: 'Electronics',
  price: 99.99,
  cost: 50.00,
  reorderLevel: 10,
  supplier: 'Test Supplier',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

describe('useProductStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty state', () => {
    const store = useProductStore()

    expect(store.products.size).toBe(0)
    expect(store.list).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should fetch and cache products', async () => {
    const store = useProductStore()
    const mockApi = vi.mocked(useApiClient())
    mockApi.get.mockResolvedValue({
      success: true,
      data: [mockProduct],
      total: 1
    })

    await store.fetchProducts()

    expect(store.products.size).toBe(1)
    expect(store.products.get('1')).toEqual(mockProduct)
    expect(store.list).toEqual(['1'])
  })

  it('should fetch product by ID', async () => {
    const store = useProductStore()
    const mockApi = vi.mocked(useApiClient())
    mockApi.get.mockResolvedValue({
      success: true,
      data: mockProduct
    })

    const product = await store.fetchProductById('1')

    expect(product).toEqual(mockProduct)
    expect(store.products.get('1')).toEqual(mockProduct)
  })

  it('should create new product', async () => {
    const store = useProductStore()
    const mockApi = vi.mocked(useApiClient())
    const newProductData: CreateProductRequest = {
      sku: 'PROD-002',
      name: 'New Product',
      category: 'Electronics',
      price: 149.99,
      cost: 75.00,
      reorderLevel: 5,
      supplier: 'Supplier B'
    }

    const createdProduct = { ...mockProduct, id: '2', ...newProductData }
    mockApi.post.mockResolvedValue({
      success: true,
      data: createdProduct
    })

    const result = await store.createProduct(newProductData)

    expect(result).toEqual(createdProduct)
    expect(store.products.get('2')).toEqual(createdProduct)
  })

  it('should update existing product', async () => {
    const store = useProductStore()
    store.products.set('1', mockProduct)

    const mockApi = vi.mocked(useApiClient())
    const updatedProduct = { ...mockProduct, name: 'Updated Name' }
    mockApi.put.mockResolvedValue({
      success: true,
      data: updatedProduct
    })

    const result = await store.updateProduct('1', { name: 'Updated Name' })

    expect(result.name).toBe('Updated Name')
    expect(store.products.get('1')?.name).toBe('Updated Name')
  })

  it('should delete product', async () => {
    const store = useProductStore()
    store.products.set('1', mockProduct)
    store.list = ['1']

    const mockApi = vi.mocked(useApiClient())
    mockApi.delete.mockResolvedValue({ success: true })

    await store.deleteProduct('1')

    expect(store.products.has('1')).toBe(false)
    expect(store.list).not.toContain('1')
  })

  it('should return unique categories from products', () => {
    const store = useProductStore()
    store.products.set('1', { ...mockProduct, category: 'Electronics' })
    store.products.set('2', { ...mockProduct, id: '2', category: 'Furniture' })
    store.products.set('3', { ...mockProduct, id: '3', category: 'Electronics' })

    expect(store.categories).toEqual(['Electronics', 'Furniture'])
  })

  it('should return unique suppliers from products', () => {
    const store = useProductStore()
    store.products.set('1', { ...mockProduct, supplier: 'Supplier A' })
    store.products.set('2', { ...mockProduct, id: '2', supplier: 'Supplier B' })
    store.products.set('3', { ...mockProduct, id: '3', supplier: 'Supplier A' })

    expect(store.suppliers).toEqual(['Supplier A', 'Supplier B'])
  })

  it('should handle API errors', async () => {
    const store = useProductStore()
    const mockApi = vi.mocked(useApiClient())
    mockApi.get.mockRejectedValue(new Error('Network error'))

    await expect(store.fetchProducts()).rejects.toThrow('Network error')
    expect(store.error).toBe('Network error')
  })

  it('should set loading state during fetch', async () => {
    const store = useProductStore()
    const mockApi = vi.mocked(useApiClient())
    
    let loadingDuringFetch = false
    mockApi.get.mockImplementation(async () => {
      loadingDuringFetch = store.loading
      return { success: true, data: [], total: 0 }
    })

    await store.fetchProducts()

    expect(loadingDuringFetch).toBe(true)
    expect(store.loading).toBe(false)
  })
})
```

---

### 5.E. Open Questions & Guardrails

#### Domain Assumptions (Flagged for Clarification)

1. **SKU Uniqueness:** Assuming SKU is unique across all products. Is this enforced at the database level?

2. **Units of Measure:** The current schema doesn't specify units (e.g., "pieces", "kg", "liters"). Should this be added to the Product model?

3. **Multi-Warehouse Support:** The InventoryLevel schema doesn't include a warehouse/location field. Is this a single-warehouse system, or should we add location tracking?

4. **Barcode/UPC:** Not present in the Product schema. Is barcode scanning required for inventory operations?

5. **Price History:** Should we track historical price changes, or is the current price sufficient?

6. **Supplier Management:** Supplier is currently a string field. Should this be a separate entity with contact info, lead times, etc.?

7. **Tax Handling:** No tax fields in Order or Product. Is tax calculation required?

8. **Currency:** Assuming single currency. Is multi-currency support needed?

9. **User Permissions:** The User type includes a role field, but permission granularity isn't defined. What actions are restricted by role?

10. **Inventory Reservations:** The InventoryLevel includes `reservedQuantity`, but there's no schema for reservation records. How are reservations created and released?

---

#### Prop Drilling Risks & Store Alternatives

| Scenario | Prop Drilling Risk | Recommended Solution |
|----------|-------------------|----------------------|
| Passing `currentUser` through multiple layout components | High - 3+ levels deep | Use `useAuthStore()` directly in components |
| Passing `products` array to nested table components | Medium - 2 levels | Acceptable for presentational components |
| Passing `inventoryLevels` to product cards in grid | High - Requires joining data | Use `useInventoryStore()` with computed getter |
| Passing filter state through filter components | Low - Single level | Props are appropriate |
| Passing toast notifications to all components | High - Global concern | Use `useToast()` composable with event bus |
| Passing loading state to nested forms | Medium - 2 levels | Consider using store or composable |

---

#### Accessibility Guardrails

1. **Keyboard Navigation:** All interactive elements must be keyboard accessible (Tab, Enter, Escape).

2. **Screen Reader Support:** Use semantic HTML (`<table>`, `<form>`, `<button>`) and ARIA labels where needed.

3. **Focus Management:** Modals must trap focus and return focus on close.

4. **Error Announcements:** Form errors must be announced to screen readers using `role="alert"` or `aria-live`.

5. **Color Contrast:** Stock status indicators must not rely solely on color (use icons/text).

6. **Loading States:** Loading indicators must have `role="status"` and descriptive labels.

---

#### Performance Considerations

1. **Virtual Scrolling:** For tables with >100 rows, implement virtual scrolling (e.g., `vue-virtual-scroller`).

2. **Debounced Search:** Filter inputs should debounce API calls (300ms recommended).

3. **Pagination:** Default page size should be 25-50 items to balance UX and performance.

4. **Caching Strategy:** Store should cache products for 5 minutes before refetching.

5. **Optimistic Updates:** Form submissions should optimistically update UI before API confirmation.

---

## 6. Next Steps for Developers

### Phase 1: Setup & Infrastructure (Week 1)

1. Install dependencies:
   ```bash
   pnpm add pinia vue-router zod
   pnpm add -D @testing-library/vue @testing-library/user-event vitest jsdom
   ```

2. Create directory structure:
   ```
   src/
   ├── components/
   ├── composables/
   ├── layouts/
   ├── pages/
   ├── stores/
   ├── router/
   ├── types/
   └── utils/
   ```

3. Set up Vitest configuration for component testing.

4. Create base composables: `useApiClient`, `useToast`, `useFormValidation`.

---

### Phase 2: Core Stores (Week 2)

1. Implement `useAuthStore` with tests.
2. Implement `useProductStore` with tests.
3. Implement `useInventoryStore` with tests.
4. Set up MSW for API mocking in tests.

---

### Phase 3: Shared Components (Week 3)

1. Build and test `DataTable`, `Modal`, `FormField`.
2. Build and test `LoadingSpinner`, `EmptyState`.
3. Create Storybook stories for visual testing (optional).

---

### Phase 4: Product Module (Week 4)

1. Implement `ProductTable`, `ProductForm`, `ProductFilters` with tests.
2. Implement `ProductListPage`, `ProductFormPage`, `ProductDetailPage`.
3. Write integration tests for product CRUD flow.

---

### Phase 5: Inventory Module (Week 5)

1. Implement `InventoryTable`, `StockAdjustmentForm`, `LowStockAlert` with tests.
2. Implement `InventoryListPage`, `InventoryAdjustPage`, `TransactionHistoryPage`.
3. Write integration tests for inventory adjustment flow.

---

### Phase 6: Orders & Purchase Orders (Week 6-7)

1. Implement order components and pages with tests.
2. Implement purchase order components and pages with tests.
3. Write integration tests for order fulfillment and goods receipt flows.

---

### Phase 7: Dashboard & Reports (Week 8)

1. Implement `useDashboardMetrics` composable.
2. Build dashboard page with metric cards and alerts.
3. Implement basic reporting page.

---

### Phase 8: Polish & E2E (Week 9-10)

1. Add loading states and error handling throughout.
2. Implement toast notifications.
3. Write E2E tests for critical user journeys.
4. Accessibility audit and fixes.

---

## Success Criteria Checklist

- [ ] All component contracts are defined with TypeScript interfaces
- [ ] Test plan covers all critical user interactions
- [ ] Composables are tested in isolation
- [ ] Stores are tested with Pinia testing utilities
- [ ] Components use `getByRole` and `getByLabelText` for accessibility
- [ ] No business logic exists in component templates
- [ ] All forms have validation with error messages
- [ ] Loading and error states are handled consistently
- [ ] API calls use placeholder URLs (`VITE_API_URL`)
- [ ] No Tailwind classes are generated (structure only)
- [ ] Prop drilling is minimized using stores/composables
- [ ] All interactive elements are keyboard accessible

---

**End of Architecture Document**

This document serves as the canonical reference for implementing the Vue 3 Inventory Manager frontend using a TDD-first approach. Developers should write failing tests based on the contracts and test plan before implementing components.

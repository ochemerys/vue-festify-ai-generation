# Vue 3 Inventory Manager - Complete Architecture Guide

**Version:** 2.0.0  
**Last Updated:** 2024  
**Philosophy:** Contract-First, Test-Driven Development (BDD-TDD)

This is the canonical architecture document for the Inventory Management System frontend. All other documentation files reference this guide.

---

## Table of Contents

1. [System Role & Constraints](#system-role--constraints)
2. [Requirement Traceability](#requirement-traceability)
3. [Component Contract Design](#component-contract-design)
4. [State & Boundary Mapping](#state--boundary-mapping)
5. [TDD Strategy](#tdd-strategy)
6. [Implementation Output](#implementation-output)
7. [Non-Negotiable Rules](#non-negotiable-rules)
8. [Success Criteria](#success-criteria)

---

## System Role & Constraints

### Senior Frontend Architect Role

You are a **Senior Frontend Architect** and **Test-Lead** specialized in Vue 3, TypeScript, and the "Testing Library" philosophy. Your goal is to design a robust, scalable Inventory Manager frontend using a **Contract-First, TDD approach**.

### Architectural Constraints

- **Composition API:** Use strictly `<script setup lang="ts">`.
- **Logic Isolation:** Business logic must reside in **Composables** or **Pinia Stores**, never in the component's template logic.
- **Tailwind Policy:** Do **not** generate utility classes yet. Focus on the **DOM structure and accessibility (ARIA)**.
- **State Management:** Pinia for global/cached data; Composables for reusable local logic.
- **No Prop Drilling:** Use stores and composables to avoid passing props through multiple levels.
- **Type Safety:** All props, emits, and state must be fully typed with TypeScript.
- **Accessibility First:** All components must be keyboard navigable and screen reader compatible.

---

## Requirement Traceability

### Primary Views & Routes

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

### Dashboard Page Specification

The main dashboard provides users with a high-level overview of their inventory management system and quick access to primary actions. It serves as the central hub for monitoring business operations.

**Key Metrics to Display:**
- Total Products
- Total Orders
- Pending Orders
- Low Stock Alerts
- Monthly Revenue
- Today's Orders
- Out of Stock
- Overdue Orders

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Inventory Management System      [🔔] [👤] [⋮]      │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  [Dashboard] │  Metrics Grid (4x2)                          │
│  [Products]  │  Recent Orders Table                         │
│  [Inventory] │  Low Stock Alerts                            │
│  [Orders]    │  Quick Actions Panel                         │
│  [Reports]   │                                              │
│  [Settings]  │                                              │
│              │                                              │
│  [Logout]    ��                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**Responsive Breakpoints:**
- **Desktop (>1024px)**: 4-column metrics grid, full sidebar
- **Tablet (768px-1024px)**: 2-column metrics grid, collapsible sidebar
- **Mobile (<768px)**: 1-column metrics grid, drawer sidebar

---

## Component Contract Design

### Layout Components

#### `AppLayout.vue` (Container)

**Responsibility:** Main application shell managing sidebar state and responsive behavior

**Props:**
```typescript
interface AppLayoutProps {
  // No props - reads from auth store
}
```

**Emits:**
```typescript
{
  // No emits - internal state management
}
```

**Slots:**
```typescript
{
  default: void // Main content area (RouterView)
}
```

**State Management:**
```typescript
{
  sidebarOpen: Ref<boolean> // Mobile sidebar visibility
  sidebarCollapsed: Ref<boolean> // Desktop sidebar collapse state
}
```

**Key Features:**
- Manages sidebar open/close state
- Persists collapse preference to localStorage
- Handles responsive breakpoint changes
- Provides sidebar state to child components via provide/inject

---

#### `AppHeader.vue` (Presentational)

**Responsibility:** Top navigation bar with branding and user controls

**Props:**
```typescript
interface AppHeaderProps {
  userName: string
  notificationCount?: number
  onSidebarToggle?: () => void
}
```

**Emits:**
```typescript
{
  'sidebar-toggle': void
  'logout': void
  'navigate-to-profile': void
  'view-notifications': void
}
```

**Slots:**
```typescript
{
  logo?: void // Custom logo slot
  actions?: void // Additional header actions
}
```

**Accessibility:**
- `role="banner"` on header element
- `aria-label="Application header"`
- All buttons have `aria-label` attributes
- Notification count announced to screen readers

---

#### `AppSidebar.vue` (Presentational)

**Responsibility:** Left navigation menu with route links

**Props:**
```typescript
interface AppSidebarProps {
  currentRoute: string
  isCollapsed?: boolean
  isOpen?: boolean // Mobile drawer state
}
```

**Emits:**
```typescript
{
  'navigate': { path: string }
  'close': void // Mobile drawer close
}
```

**Navigation Items:**
```typescript
interface NavItem {
  label: string
  icon: string // Icon name or component
  path: string
  badge?: number // For notifications/alerts
  children?: NavItem[] // For nested menus (future)
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/' },
  { label: 'Products', icon: 'package', path: '/products' },
  { label: 'Inventory', icon: 'inventory', path: '/inventory' },
  { label: 'Orders', icon: 'shopping-cart', path: '/orders' },
  { label: 'Purchase Orders', icon: 'inbox', path: '/purchase-orders' },
  { label: 'Reports', icon: 'chart', path: '/reports' },
  { label: 'Settings', icon: 'settings', path: '/settings' }
]
```

**Accessibility:**
- `role="navigation"` on nav element
- `aria-label="Main navigation"`
- Active link has `aria-current="page"`
- Collapse/expand button has `aria-expanded` attribute
- Tooltips on collapsed icons with `aria-label`

---

### Dashboard Page Components

#### `DashboardPage.vue` (Container)

**Responsibility:** Main dashboard page - fetches metrics and orchestrates child components

**Props:**
```typescript
interface DashboardPageProps {
  // No props - reads from stores
}
```

**Data Dependencies:**
```typescript
{
  useAuthStore: // Current user info
  useProductStore: // Product count
  useInventoryStore: // Low stock alerts
  useOrderStore: // Order metrics
  useDashboardMetrics: // Aggregated metrics
}
```

**Local State:**
```typescript
{
  loading: Ref<boolean>
  error: Ref<string | null>
  metrics: ComputedRef<DashboardMetrics>
  recentOrders: Ref<Order[]>
}
```

**Lifecycle:**
1. On mount: Fetch all metrics in parallel
2. Set loading state during fetch
3. Handle errors with retry option
4. Display metrics or error state
5. Refresh on user action

---

#### `MetricsGrid.vue` (Container)

**Responsibility:** Render 4x2 grid of metric cards with responsive layout

**Props:**
```typescript
interface MetricsGridProps {
  metrics: DashboardMetrics
  loading?: boolean
}
```

**Emits:**
```typescript
{
  'metric-click': { metricKey: string }
}
```

**Responsive Behavior:**
- Desktop (>1024px): 4 columns
- Tablet (768px-1024px): 2 columns
- Mobile (<768px): 1 column

**Accessibility:**
- `role="region"` with `aria-labelledby="metrics-heading"`
- Metric cards are keyboard focusable
- Loading state announced with `aria-live="polite"`

---

#### `MetricCard.vue` (Presentational)

**Responsibility:** Display single metric with value, trend, and click action

**Props:**
```typescript
interface MetricCardProps {
  title: string
  value: number | string
  unit?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    period: string // e.g., "vs last month"
  }
  icon?: string
  loading?: boolean
  clickable?: boolean
}
```

**Emits:**
```typescript
{
  'click': void
}
```

**States:**
- **Loading**: Skeleton loader animation
- **Normal**: Display value with trend indicator
- **Hover**: Show additional details or highlight
- **Focus**: Keyboard focus indicator

**Accessibility:**
- `role="button"` if clickable
- `aria-label` with full metric description
- Trend direction announced (e.g., "up 12%")
- Loading state announced with `aria-busy="true"`

---

#### `LowStockAlert.vue` (Presentational)

**Responsibility:** Display banner with low stock items

**Props:**
```typescript
interface LowStockAlertProps {
  alerts: LowStockAlert[]
  dismissible?: boolean
  loading?: boolean
}

interface LowStockAlert {
  productId: string
  productName: string
  currentStock: number
  reorderLevel: number
  sku?: string
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

**States:**
- **Empty**: No alerts message
- **Loading**: Skeleton loader
- **Normal**: List of alerts with actions
- **Dismissed**: Alert removed from view

**Accessibility:**
- `role="alert"` for urgent alerts
- `aria-live="polite"` for non-urgent updates
- Dismiss button has `aria-label="Dismiss alert for {productName}"`

---

#### `RecentOrdersSection.vue` (Container)

**Responsibility:** Fetch and display recent orders

**Props:**
```typescript
interface RecentOrdersSectionProps {
  limit?: number // Default: 5
}
```

**Emits:**
```typescript
{
  'view-order': { orderId: string }
  'refresh': void
}
```

**Data Dependencies:**
```typescript
{
  useOrderStore: // Fetch recent orders
}
```

---

#### `OrderTable.vue` (Presentational)

**Responsibility:** Display orders in table format

**Props:**
```typescript
interface OrderTableProps {
  orders: Order[]
  loading?: boolean
  columns?: TableColumn[]
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  createdAt: string
}

interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
}
```

**Emits:**
```typescript
{
  'row-click': { orderId: string }
  'sort': { column: string, direction: 'asc' | 'desc' }
}
```

**Accessibility:**
- Semantic `<table>` with `<thead>`, `<tbody>`, `<th>`
- `scope="col"` on header cells
- Status badges have `aria-label` with full status text
- Sortable columns have `aria-sort` attribute

---

#### `QuickActionsPanel.vue` (Presentational)

**Responsibility:** Display quick action buttons

**Props:**
```typescript
interface QuickActionsPanelProps {
  actions?: QuickAction[]
}

interface QuickAction {
  label: string
  icon: string
  action: () => void | Promise<void>
  badge?: number
  disabled?: boolean
}
```

**Emits:**
```typescript
{
  'action-click': { actionLabel: string }
}
```

**Default Actions:**
```typescript
const defaultActions: QuickAction[] = [
  { label: 'Create New Order', icon: 'plus', action: () => router.push('/orders/new') },
  { label: 'Add New Product', icon: 'plus', action: () => router.push('/products/new') },
  { label: 'View Low Stock Alerts', icon: 'alert', action: () => router.push('/inventory?filter=low-stock') },
  { label: 'Generate Report', icon: 'chart', action: () => router.push('/reports') }
]
```

**Accessibility:**
- All buttons have descriptive `aria-label` attributes
- Disabled buttons have `aria-disabled="true"`
- Badge count announced to screen readers

---

### Product Components

#### `ProductTable.vue` (Presentational)

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

---

#### `ProductForm.vue` (Presentational)

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

**Expose:**
```typescript
{
  validate: () => Promise<boolean>
  reset: () => void
}
```

---

### Inventory Components

#### `InventoryTable.vue` (Presentational)

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

---

#### `StockAdjustmentForm.vue` (Presentational)

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

---

#### `LowStockAlert.vue` (Presentational)

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

---

### Shared/UI Components

#### `DataTable.vue` (Generic)

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

---

#### `Modal.vue` (Accessible)

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

---

#### `FormField.vue` (Wrapper)

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

**Slots:**
```typescript
{
  default: void // Input element
}
```

---

#### `LoadingSpinner.vue` (Indicator)

**Responsibility:** Loading indicator

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}
```

---

#### `EmptyState.vue` (Placeholder)

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

---

## State & Boundary Mapping

### Global State (Pinia Stores)

#### `useAuthStore`

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

---

#### `useProductStore`

**State:**
```typescript
{
  products: Map<string, Product>
  list: string[] // Product IDs in current view
  filters: ProductFilters
  pagination: { page: number, pageSize: number, total: number }
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

---

#### `useInventoryStore`

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

---

#### `useOrderStore`

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

---

### Shared Logic (Composables)

#### `useDashboardMetrics()`

**Responsibility:** Aggregate metrics from multiple stores

**Returns:**
```typescript
{
  metrics: ComputedRef<{
    totalProducts: number
    totalOrders: number
    pendingOrders: number
    lowStockCount: number
    monthlyRevenue: number
    todayOrders: number
    outOfStock: number
    overdueOrders: number
  }>
  loading: Ref<boolean>
  error: Ref<string | null>
  refresh: () => Promise<void>
}
```

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

---

### Local Component State

**Examples:**
- Form field values (before submission)
- Modal open/close state
- Dropdown expanded state
- Table row selection
- Temporary UI flags (e.g., `showPassword`)

**Rule:** Local state should NOT be shared across routes or components. Use stores or composables for shared state.

---

## TDD Strategy

### Test Plan by Component

| Component | Behavior to Verify | Trigger | Expected Outcome |
|-----------|-------------------|---------|------------------|
| **AppLayout** | Sidebar opens on mobile | Hamburger click | Sidebar drawer visible |
| **AppLayout** | Sidebar persists state | Collapse sidebar, reload | Sidebar remains collapsed |
| **AppHeader** | Displays user name | Component mount | User name visible in header |
| **AppHeader** | Emits logout event | Logout button click | `logout` event emitted |
| **AppSidebar** | Highlights active route | Navigate to `/products` | Products link has active class |
| **DashboardPage** | Loads metrics on mount | Component mount | Metrics displayed |
| **DashboardPage** | Shows loading state | During fetch | Skeleton loaders visible |
| **DashboardPage** | Shows error state | API fails | Error message with retry button |
| **MetricsGrid** | Renders 4 columns on desktop | Desktop viewport | 4 cards per row |
| **MetricsGrid** | Renders 2 columns on tablet | Tablet viewport | 2 cards per row |
| **MetricsGrid** | Renders 1 column on mobile | Mobile viewport | 1 card per row |
| **MetricCard** | Displays value and unit | Props provided | Value and unit visible |
| **MetricCard** | Shows trend indicator | Trend prop provided | Trend direction and value shown |
| **MetricCard** | Emits click event | Card clicked | `click` event emitted |
| **MetricCard** | Shows skeleton on loading | `loading=true` | Skeleton animation visible |
| **LowStockAlert** | Displays alert list | Alerts provided | All alerts visible |
| **LowStockAlert** | Emits dismiss event | Dismiss button clicked | `dismiss` event emitted |
| **LowStockAlert** | Shows empty state | Empty alerts array | "No alerts" message |
| **RecentOrdersSection** | Fetches orders on mount | Component mount | Orders displayed |
| **OrderTable** | Renders order rows | Orders provided | All orders visible |
| **OrderTable** | Sorts on column click | Column header clicked | Orders sorted by column |
| **OrderTable** | Emits row-click event | Row clicked | `row-click` event emitted |
| **QuickActionsPanel** | Renders action buttons | Actions provided | All buttons visible |
| **QuickActionsPanel** | Executes action on click | Button clicked | Action function called |

---

### Test Implementation Examples

See the detailed test examples in the `_docs/frontend-architecture.md` file for:
- Composable tests (Vitest)
- Component tests (Vue Testing Library)
- Store tests (Pinia Testing)
- Integration tests (E2E-style with MSW)

---

## Implementation Output

### Route Map

```typescript
// src/router/index.ts
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
      // ... other routes
    ]
  }
]
```

---

### Component Hierarchy

```
App.vue
├── LoginPage.vue (Standalone)
└── AppLayout.vue (Container)
    ├── AppHeader.vue (Presentational)
    ├── AppSidebar.vue (Presentational)
    └── RouterView (Page Container)
        ├── DashboardPage.vue (Container)
        │   ├── MetricsGrid.vue (Container)
        │   │   └── MetricCard.vue (Presentational - 8x)
        │   ├── LowStockAlert.vue (Presentational)
        │   ├── RecentOrdersSection.vue (Container)
        │   │   └── OrderTable.vue (Presentational)
        │   └── QuickActionsPanel.vue (Presentational)
        ├── ProductListPage.vue (Container)
        │   ├── ProductFilters.vue (Presentational)
        │   ├── ProductTable.vue (Presentational)
        │   └── Pagination.vue (Presentational)
        ├── InventoryListPage.vue (Container)
        │   ├── InventoryFilters.vue (Presentational)
        │   └── InventoryTable.vue (Presentational)
        └── ... other pages
```

---

### Type-Safe Contracts

```typescript
// src/types/index.ts

export interface DashboardMetrics {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  lowStockCount: number
  monthlyRevenue: number
  todayOrders: number
  outOfStock: number
  overdueOrders: number
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  sku: string
  price: number
  quantity: number
  reorderLevel: number
  createdAt: string
  updatedAt: string
}

export interface InventoryLevel {
  productId: string
  productName: string
  currentStock: number
  reorderLevel: number
  sku?: string
  lastUpdated: string
}

export interface LowStockAlert {
  productId: string
  productName: string
  currentStock: number
  reorderLevel: number
  sku?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'user'
  avatar?: string
}

export interface NavItem {
  label: string
  icon: string
  path: string
  badge?: number
  children?: NavItem[]
}

export interface QuickAction {
  label: string
  icon: string
  action: () => void | Promise<void>
  badge?: number
  disabled?: boolean
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

export interface Trend {
  value: number
  direction: 'up' | 'down' | 'neutral'
  period: string
}
```

---

## Non-Negotiable Rules

1. **Stop** if you are tempted to guess an API endpoint URL. Use a placeholder like `VITE_API_URL`.
2. **Strictly omit** Tailwind styling (except for `hidden` or `block` layout logic).
3. **No Hallucinations:** If the domain context doesn't specify a field, flag it as an assumption.
4. **Composition API Only:** Use `<script setup lang="ts">` exclusively.
5. **No Template Logic:** Business logic must be in composables or stores.
6. **Accessibility First:** All components must be keyboard navigable and screen reader compatible.
7. **Type Safety:** All props, emits, and state must be fully typed.
8. **Test-Driven:** Write tests before or alongside implementation.
9. **No Prop Drilling:** Use stores and composables to avoid passing props through multiple levels.
10. **Semantic HTML:** Use proper HTML elements (`<table>`, `<form>`, `<button>`, etc.).

---

## Success Criteria

✅ A developer can take the **Contracts** and **Test Plan** and begin writing failing tests immediately.

✅ All components follow the **Container/Presentational** pattern.

✅ No prop drilling - state is managed via stores and composables.

✅ All components are **fully typed** with TypeScript interfaces.

✅ All components are **keyboard accessible** and **screen reader compatible**.

✅ Tests use `screen.getByRole()` and `screen.getByLabelText()` to enforce accessibility.

✅ No Tailwind utility classes in component templates (except layout logic).

✅ All API endpoints use environment variable placeholders.

✅ Component hierarchy matches the design specification.

✅ Responsive behavior matches the breakpoint specifications.

✅ All interactive elements have proper ARIA labels.

✅ Loading and error states are handled consistently.

✅ Form validation provides clear error messages.

---

## Implementation Checklist

### Phase 1: Core Layout (Week 1)

- [ ] Create `AppLayout.vue` with sidebar state management
- [ ] Create `AppHeader.vue` with logo, notifications, user menu
- [ ] Create `AppSidebar.vue` with navigation items
- [ ] Implement responsive breakpoints and sidebar collapse
- [ ] Add localStorage persistence for sidebar state
- [ ] Test keyboard navigation and accessibility

### Phase 2: Dashboard Metrics (Week 2)

- [ ] Create `DashboardPage.vue` container
- [ ] Create `MetricsGrid.vue` with responsive layout
- [ ] Create `MetricCard.vue` with loading skeleton
- [ ] Implement `useDashboardMetrics()` composable
- [ ] Add metric click handlers for navigation
- [ ] Write component tests with Vue Testing Library

### Phase 3: Alerts & Recent Activity (Week 3)

- [ ] Create `LowStockAlert.vue` component
- [ ] Create `RecentOrdersSection.vue` container
- [ ] Create `OrderTable.vue` presentational component
- [ ] Integrate with `useOrderStore` for recent orders
- [ ] Add dismiss functionality for alerts
- [ ] Add "Create PO" quick action from alerts
- [ ] Write integration tests

### Phase 4: Quick Actions & Polish (Week 4)

- [ ] Create `QuickActionsPanel.vue`
- [ ] Implement quick action handlers
- [ ] Add loading states and error handling
- [ ] Implement refresh functionality
- [ ] Add toast notifications for actions
- [ ] Performance optimization and code splitting
- [ ] Accessibility audit and fixes
- [ ] Cross-browser testing

### Phase 5: Mobile Optimization (Week 5)

- [ ] Test responsive design on actual devices
- [ ] Optimize touch interactions
- [ ] Implement mobile-specific sidebar drawer
- [ ] Test performance on slow networks
- [ ] Optimize images and bundle size
- [ ] Add PWA support (optional)

---

## Related Documentation

- **`ai-prompts/frontend/bdd-tdd-frontend-architecture.md`** - Original TDD-first architecture guide
- **`ai-prompts/frontend/frontend-design/generate-dashboard-components.md`** - Dashboard-specific component generation prompt
- **`_docs/frontend-architecture.md`** - Detailed architecture with test examples
- **`testing-guide.md`** - Testing best practices and patterns
- **`monorepo-implementation-guide.md`** - Monorepo structure and setup

---

**This document is the canonical reference for all frontend development. All other documentation should reference this guide.**

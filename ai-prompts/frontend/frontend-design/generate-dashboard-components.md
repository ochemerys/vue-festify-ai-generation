# AI Prompt: Generate Dashboard Components & Pages (BDD-TDD Approach)

## System Role

You are a **Senior Frontend Architect** and **Test-Lead** specialized in Vue 3, TypeScript, and the "Testing Library" philosophy. Your task is to generate **production-ready dashboard components and pages** for the Inventory Management System using a **Contract-First, TDD approach**.

This prompt extends the `bdd-tdd-frontend-architecture.md` guidelines and applies them specifically to the **Main Dashboard** design specification (`pages/main-page.design.md`).

---

## Context & Design Reference

### Main Dashboard Purpose

The main dashboard provides users with a high-level overview of their inventory management system and quick access to primary actions. It serves as the central hub for monitoring business operations and accessing key functionality.

### Key Metrics to Display

- **Total Products**: Active product count
- **Total Orders**: All-time order count
- **Pending Orders**: Orders awaiting fulfillment
- **Low Stock Alerts**: Products below reorder level
- **Monthly Revenue**: Current month sales total
- **Today's Orders**: Orders created today
- **Out of Stock**: Products with zero inventory
- **Overdue Orders**: Orders past delivery date

### Layout Structure

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
│  [Logout]    │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### Responsive Breakpoints

- **Desktop (>1024px)**: 4-column metrics grid, full sidebar
- **Tablet (768px-1024px)**: 2-column metrics grid, collapsible sidebar
- **Mobile (<768px)**: 1-column metrics grid, drawer sidebar

---

## 1. Requirement Traceability & Page Definition

### Primary Page: Dashboard

| Aspect | Details |
|--------|---------|
| **Route Path** | `/` (root) or `/dashboard` |
| **Responsibility** | Central hub for system overview, metrics display, and quick navigation |
| **Data Dependencies** | `useProductStore`, `useOrderStore`, `useInventoryStore`, `useDashboardMetrics` |
| **User Roles** | All authenticated users |
| **Performance Target** | LCP < 2.5s, FID < 100ms |

### Secondary Pages/Sections

| Page | Route | Responsibility |
|------|-------|-----------------|
| **Layout Shell** | N/A | Manages sidebar state, header, responsive behavior |
| **Metrics Grid** | N/A | Renders 4x2 responsive grid of metric cards |
| **Recent Orders** | N/A | Displays last 5 orders with status |
| **Low Stock Alerts** | N/A | Shows products below reorder level |
| **Quick Actions** | N/A | Provides shortcuts to common tasks |

---

## 2. Component Contract Design (The "No-Markup" Rule)

### Layout Components

#### `AppLayout.vue` (Container)

**Responsibility**: Main application shell managing sidebar state and responsive behavior

**Props**:
```typescript
interface AppLayoutProps {
  // No props - reads from auth store
}
```

**Emits**:
```typescript
{
  // No emits - internal state management
}
```

**Slots**:
```typescript
{
  default: void // Main content area (RouterView)
}
```

**Expose**:
```typescript
{
  // No exposed methods
}
```

**State Management**:
```typescript
{
  sidebarOpen: Ref<boolean> // Mobile sidebar visibility
  sidebarCollapsed: Ref<boolean> // Desktop sidebar collapse state
}
```

**Key Features**:
- Manages sidebar open/close state
- Persists collapse preference to localStorage
- Handles responsive breakpoint changes
- Provides sidebar state to child components via provide/inject
- Emits sidebar state changes for analytics

---

#### `AppHeader.vue` (Presentational)

**Responsibility**: Top navigation bar with branding and user controls

**Props**:
```typescript
interface AppHeaderProps {
  userName: string
  notificationCount?: number
  onSidebarToggle?: () => void
}
```

**Emits**:
```typescript
{
  'sidebar-toggle': void
  'logout': void
  'navigate-to-profile': void
  'view-notifications': void
}
```

**Slots**:
```typescript
{
  logo?: void // Custom logo slot
  actions?: void // Additional header actions
}
```

**Accessibility**:
- `role="banner"` on header element
- `aria-label="Application header"`
- All buttons have `aria-label` attributes
- Notification count announced to screen readers

---

#### `AppSidebar.vue` (Presentational)

**Responsibility**: Left navigation menu with route links

**Props**:
```typescript
interface AppSidebarProps {
  currentRoute: string
  isCollapsed?: boolean
  isOpen?: boolean // Mobile drawer state
}
```

**Emits**:
```typescript
{
  'navigate': { path: string }
  'close': void // Mobile drawer close
}
```

**Navigation Items**:
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

**Accessibility**:
- `role="navigation"` on nav element
- `aria-label="Main navigation"`
- Active link has `aria-current="page"`
- Collapse/expand button has `aria-expanded` attribute
- Tooltips on collapsed icons with `aria-label`

---

### Dashboard Page Components

#### `DashboardPage.vue` (Container)

**Responsibility**: Main dashboard page - fetches metrics and orchestrates child components

**Props**:
```typescript
interface DashboardPageProps {
  // No props - reads from stores
}
```

**Emits**:
```typescript
{
  // No emits - internal orchestration
}
```

**Data Dependencies**:
```typescript
{
  useAuthStore: // Current user info
  useProductStore: // Product count
  useInventoryStore: // Low stock alerts
  useOrderStore: // Order metrics
  useDashboardMetrics: // Aggregated metrics
}
```

**Local State**:
```typescript
{
  loading: Ref<boolean>
  error: Ref<string | null>
  metrics: ComputedRef<DashboardMetrics>
  recentOrders: Ref<Order[]>
}
```

**Lifecycle**:
1. On mount: Fetch all metrics in parallel
2. Set loading state during fetch
3. Handle errors with retry option
4. Display metrics or error state
5. Refresh on user action

---

#### `MetricsGrid.vue` (Container)

**Responsibility**: Render 4x2 grid of metric cards with responsive layout

**Props**:
```typescript
interface MetricsGridProps {
  metrics: DashboardMetrics
  loading?: boolean
}
```

**Emits**:
```typescript
{
  'metric-click': { metricKey: string }
}
```

**Responsive Behavior**:
- Desktop (>1024px): 4 columns
- Tablet (768px-1024px): 2 columns
- Mobile (<768px): 1 column

**Accessibility**:
- `role="region"` with `aria-labelledby="metrics-heading"`
- Metric cards are keyboard focusable
- Loading state announced with `aria-live="polite"`

---

#### `MetricCard.vue` (Presentational)

**Responsibility**: Display single metric with value, trend, and click action

**Props**:
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

**Emits**:
```typescript
{
  'click': void
}
```

**States**:
- **Loading**: Skeleton loader animation
- **Normal**: Display value with trend indicator
- **Hover**: Show additional details or highlight
- **Focus**: Keyboard focus indicator

**Accessibility**:
- `role="button"` if clickable
- `aria-label` with full metric description
- Trend direction announced (e.g., "up 12%")
- Loading state announced with `aria-busy="true"`

---

#### `LowStockAlert.vue` (Presentational)

**Responsibility**: Display banner with low stock items

**Props**:
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

**Emits**:
```typescript
{
  'dismiss': { productId: string }
  'create-po': { productId: string }
  'view-product': { productId: string }
}
```

**States**:
- **Empty**: No alerts message
- **Loading**: Skeleton loader
- **Normal**: List of alerts with actions
- **Dismissed**: Alert removed from view

**Accessibility**:
- `role="alert"` for urgent alerts
- `aria-live="polite"` for non-urgent updates
- Dismiss button has `aria-label="Dismiss alert for {productName}"`

---

#### `RecentOrdersSection.vue` (Container)

**Responsibility**: Fetch and display recent orders

**Props**:
```typescript
interface RecentOrdersSectionProps {
  limit?: number // Default: 5
}
```

**Emits**:
```typescript
{
  'view-order': { orderId: string }
  'refresh': void
}
```

**Data Dependencies**:
```typescript
{
  useOrderStore: // Fetch recent orders
}
```

**Local State**:
```typescript
{
  orders: Ref<Order[]>
  loading: Ref<boolean>
  error: Ref<string | null>
}
```

---

#### `OrderTable.vue` (Presentational)

**Responsibility**: Display orders in table format

**Props**:
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

**Emits**:
```typescript
{
  'row-click': { orderId: string }
  'sort': { column: string, direction: 'asc' | 'desc' }
}
```

**Accessibility**:
- Semantic `<table>` with `<thead>`, `<tbody>`, `<th>`
- `scope="col"` on header cells
- Status badges have `aria-label` with full status text
- Sortable columns have `aria-sort` attribute

---

#### `QuickActionsPanel.vue` (Presentational)

**Responsibility**: Display quick action buttons

**Props**:
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

**Emits**:
```typescript
{
  'action-click': { actionLabel: string }
}
```

**Default Actions**:
```typescript
const defaultActions: QuickAction[] = [
  { label: 'Create New Order', icon: 'plus', action: () => router.push('/orders/new') },
  { label: 'Add New Product', icon: 'plus', action: () => router.push('/products/new') },
  { label: 'View Low Stock Alerts', icon: 'alert', action: () => router.push('/inventory?filter=low-stock') },
  { label: 'Generate Report', icon: 'chart', action: () => router.push('/reports') }
]
```

**Accessibility**:
- All buttons have descriptive `aria-label` attributes
- Disabled buttons have `aria-disabled="true"`
- Badge count announced to screen readers

---

## 3. State & Boundary Mapping

### Global State (Pinia Stores)

```typescript
// useAuthStore
{
  currentUser: User
  isAuthenticated: boolean
  logout: () => Promise<void>
}

// useProductStore
{
  productList: Product[]
  totalProducts: number
  fetchProducts: () => Promise<void>
  getProductById: (id: string) => Product | null
}

// useOrderStore
{
  orders: Order[]
  recentOrders: Order[]
  pendingOrders: Order[]
  fetchOrders: () => Promise<void>
  fetchRecentOrders: (limit: number) => Promise<void>
}

// useInventoryStore
{
  inventoryLevels: InventoryLevel[]
  lowStockItems: InventoryLevel[]
  lowStockCount: number
  fetchInventoryLevels: () => Promise<void>
  getLowStockAlerts: () => LowStockAlert[]
}
```

### Shared Logic (Composables)

```typescript
// useDashboardMetrics()
{
  metrics: ComputedRef<DashboardMetrics>
  loading: Ref<boolean>
  error: Ref<string | null>
  refresh: () => Promise<void>
}

// useResponsive()
{
  isMobile: ComputedRef<boolean>
  isTablet: ComputedRef<boolean>
  isDesktop: ComputedRef<boolean>
  breakpoint: ComputedRef<'mobile' | 'tablet' | 'desktop'>
}

// useSidebarState()
{
  isOpen: Ref<boolean>
  isCollapsed: Ref<boolean>
  toggle: () => void
  collapse: () => void
  expand: () => void
}
```

### Local Component State

```typescript
// DashboardPage
{
  loading: Ref<boolean>
  error: Ref<string | null>
}

// AppLayout
{
  sidebarOpen: Ref<boolean>
  sidebarCollapsed: Ref<boolean>
}

// MetricCard
{
  isHovered: Ref<boolean>
}
```

---

## 4. TDD Strategy (Mandatory Step)

### Test Plan by Component

| Component | Behavior to Verify | Trigger | Expected Outcome |
|-----------|-------------------|---------|------------------|
| **AppLayout** | Sidebar opens on mobile | Hamburger click | Sidebar drawer visible |
| **AppLayout** | Sidebar persists state | Collapse sidebar, reload | Sidebar remains collapsed |
| **AppHeader** | Displays user name | Component mount | User name visible in header |
| **AppHeader** | Emits logout event | Logout button click | `logout` event emitted |
| **AppSidebar** | Highlights active route | Navigate to `/products` | Products link has active class |
| **AppSidebar** | Emits navigate event | Click nav item | `navigate` event with path |
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

### Test Implementation Examples

#### Example 1: MetricCard Component Test

```typescript
// MetricCard.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@vue/test-utils'
import MetricCard from '@/components/MetricCard.vue'

describe('MetricCard', () => {
  it('renders metric value and title', () => {
    render(MetricCard, {
      props: {
        title: 'Total Products',
        value: 1247,
        unit: 'items'
      }
    })

    expect(screen.getByText('Total Products')).toBeInTheDocument()
    expect(screen.getByText('1247')).toBeInTheDocument()
    expect(screen.getByText('items')).toBeInTheDocument()
  })

  it('displays trend indicator when provided', () => {
    render(MetricCard, {
      props: {
        title: 'Total Products',
        value: 1247,
        trend: {
          value: 12,
          direction: 'up',
          period: 'vs last month'
        }
      }
    })

    expect(screen.getByText(/\+12%/)).toBeInTheDocument()
    expect(screen.getByText('vs last month')).toBeInTheDocument()
  })

  it('shows skeleton loader when loading', () => {
    render(MetricCard, {
      props: {
        title: 'Total Products',
        value: 0,
        loading: true
      }
    })

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
  })

  it('emits click event when clicked', async () => {
    const { emitted } = render(MetricCard, {
      props: {
        title: 'Total Products',
        value: 1247,
        clickable: true
      }
    })

    await screen.getByRole('button').click()
    expect(emitted('click')).toBeTruthy()
  })

  it('has accessible label describing metric', () => {
    render(MetricCard, {
      props: {
        title: 'Total Products',
        value: 1247,
        unit: 'items'
      }
    })

    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Total Products'))
  })
})
```

#### Example 2: DashboardPage Container Test

```typescript
// DashboardPage.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@vue/test-utils'
import DashboardPage from '@/pages/DashboardPage.vue'
import { useDashboardMetrics } from '@/composables/useDashboardMetrics'

vi.mock('@/composables/useDashboardMetrics')

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays loading state on mount', () => {
    vi.mocked(useDashboardMetrics).mockReturnValue({
      metrics: computed(() => ({})),
      loading: ref(true),
      error: ref(null),
      refresh: vi.fn()
    })

    render(DashboardPage)

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
  })

  it('displays metrics after loading', async () => {
    const mockMetrics = {
      totalProducts: 1247,
      totalOrders: 3421,
      pendingOrders: 23,
      lowStockCount: 8
    }

    vi.mocked(useDashboardMetrics).mockReturnValue({
      metrics: computed(() => mockMetrics),
      loading: ref(false),
      error: ref(null),
      refresh: vi.fn()
    })

    render(DashboardPage)

    await waitFor(() => {
      expect(screen.getByText('1247')).toBeInTheDocument()
      expect(screen.getByText('3421')).toBeInTheDocument()
    })
  })

  it('displays error state with retry button', async () => {
    const mockRefresh = vi.fn()
    vi.mocked(useDashboardMetrics).mockReturnValue({
      metrics: computed(() => ({})),
      loading: ref(false),
      error: ref('Failed to load metrics'),
      refresh: mockRefresh
    })

    render(DashboardPage)

    expect(screen.getByText('Failed to load metrics')).toBeInTheDocument()
    
    const retryButton = screen.getByRole('button', { name: /retry/i })
    await retryButton.click()
    
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('renders metrics grid with correct metrics', async () => {
    const mockMetrics = {
      totalProducts: 1247,
      totalOrders: 3421,
      pendingOrders: 23,
      lowStockCount: 8,
      monthlyRevenue: 45231,
      todayOrders: 12,
      outOfStock: 3,
      overdueOrders: 0
    }

    vi.mocked(useDashboardMetrics).mockReturnValue({
      metrics: computed(() => mockMetrics),
      loading: ref(false),
      error: ref(null),
      refresh: vi.fn()
    })

    render(DashboardPage)

    await waitFor(() => {
      expect(screen.getByText('Total Products')).toBeInTheDocument()
      expect(screen.getByText('Total Orders')).toBeInTheDocument()
      expect(screen.getByText('Pending Orders')).toBeInTheDocument()
    })
  })
})
```

#### Example 3: useDashboardMetrics Composable Test

```typescript
// useDashboardMetrics.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDashboardMetrics } from '@/composables/useDashboardMetrics'
import { useProductStore } from '@/stores/product'
import { useOrderStore } from '@/stores/order'
import { useInventoryStore } from '@/stores/inventory'

vi.mock('@/stores/product')
vi.mock('@/stores/order')
vi.mock('@/stores/inventory')

describe('useDashboardMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('aggregates metrics from multiple stores', () => {
    vi.mocked(useProductStore).mockReturnValue({
      productList: [{ id: '1' }, { id: '2' }],
      fetchProducts: vi.fn()
    } as any)

    vi.mocked(useOrderStore).mockReturnValue({
      orders: [{ id: '1' }, { id: '2' }, { id: '3' }],
      pendingOrders: [{ id: '1' }],
      fetchOrders: vi.fn()
    } as any)

    vi.mocked(useInventoryStore).mockReturnValue({
      lowStockCount: 8,
      fetchInventoryLevels: vi.fn()
    } as any)

    const { metrics } = useDashboardMetrics()

    expect(metrics.value.totalProducts).toBe(2)
    expect(metrics.value.totalOrders).toBe(3)
    expect(metrics.value.pendingOrders).toBe(1)
    expect(metrics.value.lowStockCount).toBe(8)
  })

  it('sets loading state during fetch', async () => {
    const mockFetch = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))

    vi.mocked(useProductStore).mockReturnValue({
      productList: [],
      fetchProducts: mockFetch
    } as any)

    vi.mocked(useOrderStore).mockReturnValue({
      orders: [],
      pendingOrders: [],
      fetchOrders: vi.fn()
    } as any)

    vi.mocked(useInventoryStore).mockReturnValue({
      lowStockCount: 0,
      fetchInventoryLevels: vi.fn()
    } as any)

    const { loading, refresh } = useDashboardMetrics()

    expect(loading.value).toBe(false)

    const refreshPromise = refresh()
    expect(loading.value).toBe(true)

    await refreshPromise
    expect(loading.value).toBe(false)
  })

  it('handles fetch errors gracefully', async () => {
    const mockError = new Error('Network error')

    vi.mocked(useProductStore).mockReturnValue({
      productList: [],
      fetchProducts: vi.fn().mockRejectedValue(mockError)
    } as any)

    vi.mocked(useOrderStore).mockReturnValue({
      orders: [],
      pendingOrders: [],
      fetchOrders: vi.fn()
    } as any)

    vi.mocked(useInventoryStore).mockReturnValue({
      lowStockCount: 0,
      fetchInventoryLevels: vi.fn()
    } as any)

    const { error, refresh } = useDashboardMetrics()

    await refresh()

    expect(error.value).toBe('Network error')
  })
})
```

---

## 5. Implementation Output (Strict Structure)

### A. Route Map

```typescript
// router/index.ts
const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardPage,
        meta: {
          title: 'Dashboard',
          breadcrumb: [{ label: 'Dashboard', path: '/' }]
        }
      },
      {
        path: 'products',
        name: 'Products',
        component: ProductsPage,
        meta: {
          title: 'Products',
          breadcrumb: [
            { label: 'Dashboard', path: '/' },
            { label: 'Products', path: '/products' }
          ]
        }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: InventoryPage,
        meta: {
          title: 'Inventory',
          breadcrumb: [
            { label: 'Dashboard', path: '/' },
            { label: 'Inventory', path: '/inventory' }
          ]
        }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: OrdersPage,
        meta: {
          title: 'Orders',
          breadcrumb: [
            { label: 'Dashboard', path: '/' },
            { label: 'Orders', path: '/orders' }
          ]
        }
      },
      {
        path: 'purchase-orders',
        name: 'PurchaseOrders',
        component: PurchaseOrdersPage,
        meta: {
          title: 'Purchase Orders',
          breadcrumb: [
            { label: 'Dashboard', path: '/' },
            { label: 'Purchase Orders', path: '/purchase-orders' }
          ]
        }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: ReportsPage,
        meta: {
          title: 'Reports',
          breadcrumb: [
            { label: 'Dashboard', path: '/' },
            { label: 'Reports', path: '/reports' }
          ]
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsPage,
        meta: {
          title: 'Settings',
          breadcrumb: [
            { label: 'Dashboard', path: '/' },
            { label: 'Settings', path: '/settings' }
          ]
        }
      }
    ]
  }
]
```

### B. Component Hierarchy

```
App.vue
└── AppLayout.vue (Container - manages sidebar state)
    ├── AppHeader.vue (Presentational)
    │   ├── Logo
    │   ├── NotificationBell
    │   └── UserMenu
    ├── AppSidebar.vue (Presentational)
    │   ├── NavItem (Presentational - repeated 7x)
    │   └── LogoutButton
    └── RouterView
        └── DashboardPage.vue (Container - fetches metrics)
            ├── MetricsGrid.vue (Container)
            │   └── MetricCard.vue (Presentational - repeated 8x)
            ├── LowStockAlert.vue (Presentational)
            ├── RecentOrdersSection.vue (Container)
            │   └── OrderTable.vue (Presentational)
            └── QuickActionsPanel.vue (Presentational)
```

### C. Type-Safe Contracts (TypeScript)

```typescript
// types/dashboard.ts

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

### D. Unit & Component Test Skeletons

See Section 4 (TDD Strategy) for complete test examples.

### E. Open Questions & Guardrails

#### Missing Domain Details

1. **Revenue Calculation**: How is "Monthly Revenue" calculated? Is it from orders, invoices, or a separate revenue table?
2. **Stock Units**: Are there multiple units of measure per product (e.g., kg, lbs, units)?
3. **Warehouse Support**: Does the system support multiple warehouses? Should metrics be warehouse-specific?
4. **Real-time Updates**: Should metrics update in real-time via WebSocket, or is periodic polling acceptable?
5. **Permissions**: Should certain metrics be hidden based on user role?
6. **Date Ranges**: Are "Monthly Revenue" and "Today's Orders" based on calendar dates or rolling periods?
7. **Overdue Definition**: How is "Overdue" defined? Days past delivery date?
8. **Low Stock Threshold**: Is the reorder level configurable per product or global?

#### Prop Drilling Risks

| Risk | Solution |
|------|----------|
| Passing `metrics` through multiple levels | Use `useDashboardMetrics()` composable in each component |
| Passing `currentRoute` to sidebar | Use `useRoute()` composable directly in AppSidebar |
| Passing `userName` to header | Use `useAuthStore()` directly in AppHeader |
| Passing `orders` through sections | Use `useOrderStore()` directly in RecentOrdersSection |

#### API Endpoint Placeholders

```typescript
// Use environment variables for all API endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/products`,
  ORDERS: `${API_BASE_URL}/orders`,
  INVENTORY: `${API_BASE_URL}/inventory`,
  METRICS: `${API_BASE_URL}/dashboard/metrics`,
  RECENT_ORDERS: `${API_BASE_URL}/orders?limit=5&sort=-createdAt`,
  LOW_STOCK: `${API_BASE_URL}/inventory/low-stock`
}
```

---

## Non-Negotiable Rules

1. **Stop** if you are tempted to guess an API endpoint URL. Use a placeholder like `VITE_API_URL`.
2. **Strictly omit** Tailwind styling (except for `hidden` or `block` layout logic).
3. **No Hallucinations**: If the domain context doesn't specify a field, flag it as an assumption.
4. **Composition API Only**: Use `<script setup lang="ts">` exclusively.
5. **No Template Logic**: Business logic must be in composables or stores.
6. **Accessibility First**: All components must be keyboard navigable and screen reader compatible.
7. **Type Safety**: All props, emits, and state must be fully typed.
8. **Test-Driven**: Write tests before or alongside implementation.

---

## Success Criteria

✅ A developer can take the **Contracts (Section 2)** and **Test Plan (Section 4)** and begin writing failing tests immediately.

✅ All components follow the **Container/Presentational** pattern.

✅ No prop drilling - state is managed via stores and composables.

✅ All components are **fully typed** with TypeScript interfaces.

✅ All components are **keyboard accessible** and **screen reader compatible**.

✅ Tests use `screen.getByRole()` and `screen.getByLabelText()` to enforce accessibility.

✅ No Tailwind utility classes in component templates (except layout logic).

✅ All API endpoints use environment variable placeholders.

✅ Component hierarchy matches the design specification.

✅ Responsive behavior matches the breakpoint specifications.

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

## Next Steps

1. **Review Contracts**: Validate component contracts with stakeholders
2. **Write Tests**: Implement test skeletons from Section 4
3. **Implement Components**: Build components following the contracts
4. **Accessibility Testing**: Validate keyboard navigation and screen reader support
5. **Performance Testing**: Measure LCP, FID, and bundle size
6. **Cross-browser Testing**: Test on Chrome, Firefox, Safari, Edge
7. **Mobile Testing**: Test on actual mobile devices
8. **Documentation**: Update Storybook and component documentation

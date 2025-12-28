# Main Dashboard Design Specification

## 1️⃣ Purpose

The main dashboard provides users with a high-level overview of their inventory management system and quick access to primary actions. It serves as the central hub for monitoring business operations and accessing key functionality.

---

## 2️⃣ User Actions

### Primary Actions

- **View Dashboard Metrics**: Access key performance indicators
- **Navigate to Orders**: View and manage customer orders
- **Navigate to Products**: Browse and manage product catalog
- **Navigate to Inventory**: Monitor stock levels and alerts
- **Create New Order**: Quick access to order creation
- **View Reports**: Access analytics and reports

### Secondary Actions

- **User Profile**: Access account settings
- **System Settings**: Configure system preferences
- **Logout**: End user session

---

## 3️⃣ Data Requirements

### Dashboard Metrics

- **Total Products**: Active product count
- **Total Orders**: All-time order count
- **Pending Orders**: Orders awaiting fulfillment
- **Low Stock Alerts**: Products below reorder level
- **Monthly Revenue**: Current month sales total
- **Top Products**: Best-selling items

### Recent Activity

- **Recent Orders**: Last 5 orders with status
- **Recent Transactions**: Latest inventory movements
- **System Alerts**: Important notifications

### Quick Stats

- **Today's Orders**: Orders created today
- **Out of Stock**: Products with zero inventory
- **Overdue Orders**: Orders past delivery date

---

## 4️⃣ UI States

### Loading State

- Skeleton loaders for metric cards
- Spinning indicators for data tables
- Placeholder content during API calls

### Normal State

- Complete dashboard with all metrics
- Interactive elements and navigation
- Real-time data updates (where applicable)

### Empty State

- No orders: Call-to-action to create first order
- No products: Prompt to add products
- No alerts: Confirmation message

### Error State

- Network error: Retry button and offline message
- Data loading failure: Error message with refresh option
- Permission denied: Access restriction message

---

## 5️⃣ Layout & Components

### Application Shell Layout

The application uses a **left-side navigation menu** with a top header bar, following modern SPA patterns and the frontend architecture guidelines.

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Inventory Management System      [Notifications] [Profile] │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  [Dashboard] │                                              │
│  [Products]  │                                              │
│  [Inventory] │         Main Content Area                    │
│  [Orders]    │         (Dashboard Metrics & Data)           │
│  [Reports]   │                                              │
│  [Settings]  │                                              │
│              │                                              │
│  [Logout]    │                                              │
│              │                                              │
└──────────────┴────────────────────────────────────────────��─┘
```

### Header Section

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Inventory Management System  [🔔] [👤 Profile] [⋮]  │
└─────────────────────────────────────────────────────────────┘
```

**Header Components:**
- **Logo/Brand:** Left-aligned application logo and name
- **Notifications:** Bell icon with unread count badge
- **User Profile:** Current user name/avatar with dropdown menu
- **Menu Toggle:** Hamburger menu for mobile (collapses sidebar)

### Sidebar Navigation

```
┌──────────────────────┐
│ [≡] Navigation       │
├──────────────────────┤
│ 📊 Dashboard         │
│ 📦 Products          │
│ 📋 Inventory         │
│ 🛒 Orders            │
│ 📥 Purchase Orders   │
│ 📈 Reports           │
│ ⚙️  Settings         │
├──────────────────────┤
│ 🚪 Logout            │
└──────────────────────���
```

**Sidebar Features:**
- **Collapsible:** Collapses to icon-only view on smaller screens
- **Active State:** Highlights current route
- **Icons:** Visual indicators for each section
- **Responsive:** Converts to bottom navigation on mobile (<768px)
- **Accessibility:** Semantic nav structure with ARIA labels

### Metrics Grid (4x2)

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Total Products  │ Total Orders    │ Pending Orders  │ Low Stock Items │
│     1,247       │     3,421       │      23         │       8         │
│ [+12% vs last]  │ [+8% vs last]   │ [-5% vs last]   │ [+2 vs last]    │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Monthly Revenue │ Today's Orders  │ Out of Stock    │ Overdue Orders  │
│   $45,231       │      12         │       3         │       0         │
│ [+15% vs last]  │ [+3 vs yesterday]│ [-1 vs last]   │ [No overdue]    │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Content Sections

#### Recent Orders Table

```
┌───────────────────────────────────────────────────────────────┐
│ Recent Orders                                                 │
├───────────────────────────────────────────────────────────────┤
│ Order #     │ Customer    │ Status     │ Total    │ Date      │
├─────────────┼─────────────┼────────────┼──────────┼───────────┤
│ ORD-2024-001│ John Doe    │ Shipped    │ $299.99  │ 2024-01-15│
│ ORD-2024-002│ Jane Smith  │ Pending    │ $149.50  │ 2024-01-14│
│ ...         │ ...         │ ...        │ ...      │ ...       │
└───────────────────────────────────────────────────────────────┘
```

#### Quick Actions Panel

```
┌─────────────────────────────┐
│ Quick Actions               │
├─────────────────────────────┤
│ [+] Create New Order        │
│ [+] Add New Product         │
│ [⚠] View Low Stock Alerts   │
│ [📊] Generate Report        │
└─────────────────────────────┘
```

---

## 6️⃣ Responsive Design

### Desktop (>1024px)

- **Sidebar:** Full width (240px) with text labels and icons
- **Header:** Full width with logo, notifications, and profile
- **Content:** Full 4-column metrics grid
- **Layout:** Side-by-side content sections
- **Sidebar State:** Always visible, collapsible to icon-only (80px)

```
┌─────────────────────────────────────────────────���───────┐
│ [Logo] System                    [🔔] [👤] [⋮]         │
├──────────────┬────────────────────────────────────────┤
│ 📊 Dashboard │ Metrics Grid (4 columns)                │
│ 📦 Products  │ ┌──────┬──────┬──────┬──────┐           │
│ 📋 Inventory │ │ Card │ Card │ Card │ Card │           │
│ 🛒 Orders    │ └──────┴──────┴──────┴──────┘           │
│ 📥 PO        │ Recent Orders Table                     │
│ 📈 Reports   │ ┌──────────────────────────────────┐   │
│ ⚙️  Settings │ │ Order │ Customer │ Status │ Date │   │
│              │ └──────────────────────────────────┘   │
│ 🚪 Logout    │                                        │
└──────────────┴────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

- **Sidebar:** Collapsible (icon-only by default, 80px)
- **Header:** Full width with hamburger menu toggle
- **Content:** 2-column metrics grid
- **Layout:** Stacked content sections
- **Sidebar Toggle:** Hamburger icon in header expands sidebar

```
┌──────────────────────────────────────────────────────┐
│ [≡] [Logo] System            [🔔] [👤] [⋮]         │
├──────────────────────────────────────────────────────┤
│ Metrics Grid (2 columns)                             │
│ ┌──────────────┬──────────────┐                      │
│ │ Card         │ Card         │                      │
│ ├──────────────┼──────────────┤                      │
│ │ Card         │ Card         │                      │
│ └──────────────┴──────────────┘                      │
│ Recent Orders Table (Full Width)                     │
│ ┌────────────────────────────────────────────────┐  │
│ │ Order │ Customer │ Status │ Total │ Date       │  │
│ └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Mobile (<768px)

- **Sidebar:** Hidden by default, accessible via hamburger menu
- **Header:** Compact with hamburger menu, notifications, profile
- **Content:** Single column metrics stack
- **Layout:** Card-based layout with full-width sections
- **Navigation:** Drawer/modal sidebar or bottom navigation option

```
┌──────────────────────────────┐
│ [≡] [Logo]  [🔔] [👤] [⋮]  │
├──────────────────────────────┤
│ Metrics (Single Column)       │
│ ┌──────────────────────────┐ │
│ │ Card                     │ │
│ ├──────────────────────────┤ │
│ │ Card                     │ │
│ ├──────────────────────────┤ │
│ │ Card                     │ │
│ ├──────────────────────────┤ │
│ │ Card                     │ │
│ └──────────────────────────┘ │
│ Recent Orders (Full Width)   │
│ ┌──────────────────────────┐ │
│ │ Order Card               │ │
│ ├──────────────────────────┤ │
│ │ Order Card               │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘

Sidebar (Drawer/Modal):
┌──────────────────┐
│ [✕] Navigation   │
├──────────────────┤
│ 📊 Dashboard     │
│ 📦 Products      │
│ 📋 Inventory     │
│ 🛒 Orders        │
│ 📥 PO            │
│ 📈 Reports       │
│ ⚙️  Settings     │
├──────────────────┤
│ 🚪 Logout        │
└──────────────────┘
```

### Breakpoints & Sidebar Behavior

| Breakpoint | Sidebar Width | Sidebar State | Toggle | Content Adjustment |
|-----------|---------------|---------------|--------|-------------------|
| Desktop (>1024px) | 240px (full) or 80px (collapsed) | Persistent | Manual collapse button | Margin-left adjustment |
| Tablet (768px-1024px) | 80px (icon-only) | Collapsible | Hamburger menu | Margin-left adjustment |
| Mobile (<768px) | 100% (drawer) | Hidden | Hamburger menu | Full width, drawer overlay |

### Sidebar Collapse Animation

- **Transition:** Smooth 300ms width transition
- **Icon Visibility:** Icons always visible, labels fade on collapse
- **Tooltip:** Show full label on hover when collapsed
- **State Persistence:** Remember user's collapse preference in localStorage

---

## 7️⃣ Interaction Patterns

### Metric Cards

- **Hover**: Show trend indicators and additional details
- **Click**: Navigate to detailed view or filtered list
- **Loading**: Skeleton animation during data fetch

### Data Tables

- **Sort**: Click column headers to sort
- **Filter**: Quick filters for status, date ranges
- **Pagination**: Navigate through large datasets
- **Row Actions**: View details, edit, delete options

### Navigation

- **Active State**: Highlight current section
- **Breadcrumb**: Show navigation path
- **Search**: Global search across all entities

---

## 8️⃣ Accessibility

### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys for table navigation
- Escape to close modals

### Screen Reader Support

- Semantic HTML structure
- ARIA labels for complex widgets
- Alt text for icons and images
- Focus indicators for keyboard users

### Color & Contrast

- WCAG AA compliance for color contrast
- Color-blind friendly color schemes
- High contrast mode support

---

## 9️⃣ Performance Considerations

### Data Loading

- Lazy load non-critical data
- Cache frequently accessed data
- Progressive loading for large datasets

### Real-time Updates

- WebSocket connections for live data
- Optimistic updates for user actions
- Background refresh for metrics

### Bundle Optimization

- Code splitting for route-based loading
- Image optimization and lazy loading
- Minimal initial bundle size

---

## 🔟 Technical Constraints

- **Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS utility classes
- **State**: Pinia for global state management
- **API**: RESTful endpoints with Zod validation
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile First**: Responsive design with touch support

---

## 1️⃣1️⃣ Component Architecture & Implementation

### Component Hierarchy

Following the frontend architecture guidelines, the dashboard uses a **Container/Presentational** component pattern:

```
App.vue
└── AppLayout.vue (Container - manages sidebar state)
    ├── AppHeader.vue (Presentational)
    │   ├── Logo
    │   ├── NotificationBell
    │   └── UserMenu
    ├── AppSidebar.vue (Presentational)
    │   ├── NavItem (Presentational - repeated)
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

### Layout Component Contracts

#### `AppLayout.vue` (Container)

**Responsibility:** Main application shell managing sidebar state and responsive behavior

**Props:**
```typescript
interface AppLayoutProps {
  // No props - reads from auth store
}
```

**State:**
```typescript
{
  sidebarOpen: boolean // Sidebar visibility on mobile
  sidebarCollapsed: boolean // Sidebar collapse state on desktop
}
```

**Slots:**
```typescript
{
  default: void // Main content area (RouterView)
}
```

**Features:**
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

---

### Dashboard Page Components

#### `DashboardPage.vue` (Container)

**Responsibility:** Main dashboard page - fetches metrics and orchestrates child components

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
  loading: boolean
  error: string | null
  metrics: DashboardMetrics
  recentOrders: Order[]
}
```

**Lifecycle:**
1. On mount: Fetch all metrics in parallel
2. Set loading state during fetch
3. Handle errors with retry option
4. Display metrics or error state

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
- **Loading:** Skeleton loader animation
- **Normal:** Display value with trend indicator
- **Hover:** Show additional details or highlight

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

#### `RecentOrdersSection.vue` (Container)

**Responsibility:** Fetch and display recent orders

**Props:**
```typescript
interface RecentOrdersSectionProps {
  limit?: number // Default: 5
}
```

**Data Dependencies:**
```typescript
{
  useOrderStore: // Fetch recent orders
}
```

---

#### `QuickActionsPanel.vue` (Presentational)

**Responsibility:** Display quick action buttons

**Props:**
```typescript
interface QuickActionsPanelProps {
  actions?: QuickAction[]
}
```

**Default Actions:**
```typescript
interface QuickAction {
  label: string
  icon: string
  action: () => void
  badge?: number
}

const defaultActions: QuickAction[] = [
  { label: 'Create New Order', icon: 'plus', action: () => router.push('/orders/new') },
  { label: 'Add New Product', icon: 'plus', action: () => router.push('/products/new') },
  { label: 'View Low Stock Alerts', icon: 'alert', action: () => router.push('/inventory?filter=low-stock') },
  { label: 'Generate Report', icon: 'chart', action: () => router.push('/reports') }
]
```

---

### State Management

#### `useDashboardMetrics()` Composable

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

**Implementation:**
```typescript
export function useDashboardMetrics() {
  const productStore = useProductStore()
  const inventoryStore = useInventoryStore()
  const orderStore = useOrderStore()
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  const metrics = computed(() => ({
    totalProducts: productStore.productList.length,
    lowStockCount: inventoryStore.lowStockCount,
    pendingOrders: orderStore.pendingOrders.length,
    // ... other metrics
  }))

  const refresh = async () => {
    loading.value = true
    try {
      await Promise.all([
        productStore.fetchProducts(),
        inventoryStore.fetchInventoryLevels(),
        orderStore.fetchOrders()
      ])
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load metrics'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => refresh())

  return { metrics, loading, error, refresh }
}
```

---

### Accessibility Implementation

#### Semantic Structure

```html
<div class="app-layout">
  <header role="banner" aria-label="Application header">
    <!-- Header content -->
  </header>
  
  <nav role="navigation" aria-label="Main navigation">
    <!-- Sidebar content -->
  </nav>
  
  <main role="main" aria-label="Dashboard content">
    <section aria-labelledby="metrics-heading">
      <h1 id="metrics-heading">Key Metrics</h1>
      <!-- Metrics grid -->
    </section>
    
    <section aria-labelledby="alerts-heading">
      <h2 id="alerts-heading">Low Stock Alerts</h2>
      <!-- Alerts -->
    </section>
    
    <section aria-labelledby="orders-heading">
      <h2 id="orders-heading">Recent Orders</h2>
      <!-- Orders table -->
    </section>
  </main>
</div>
```

#### Keyboard Navigation

- **Tab:** Navigate through header, sidebar, and main content
- **Enter/Space:** Activate buttons and links
- **Escape:** Close mobile sidebar drawer
- **Arrow Keys:** Navigate within tables (if implemented)

#### Screen Reader Support

- All icons have `aria-label` or are wrapped in labeled elements
- Metric cards have descriptive labels
- Tables have proper `<thead>`, `<tbody>`, `<th>` structure
- Loading states announced with `role="status"` and `aria-live="polite"`
- Error messages announced with `role="alert"`

---

## 📋 Implementation Checklist

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

## 🎯 Success Criteria

- ✅ Sidebar navigation works on all breakpoints
- ✅ Metrics load and display correctly
- ✅ All components are keyboard accessible
- ✅ Screen reader announces all content properly
- ✅ Mobile sidebar drawer opens/closes smoothly
- ✅ Sidebar collapse state persists across sessions
- ✅ All metrics are clickable and navigate correctly
- ✅ Loading states show skeleton loaders
- ✅ Error states show retry buttons
- ✅ No prop drilling - uses stores/composables
- ✅ Component tests cover all user interactions
- ✅ Performance metrics meet targets (LCP <2.5s, FID <100ms)

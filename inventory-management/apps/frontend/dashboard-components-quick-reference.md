# Quick Reference - Dashboard Components

## Component Imports

```typescript
// Layout
import AppLayout from '@/components/layout/AppLayout.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'

// Dashboard
import DashboardPage from '@/pages/DashboardPage.vue'
import MetricsGrid from '@/components/dashboard/MetricsGrid.vue'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import RecentOrders from '@/components/dashboard/RecentOrders.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
```

---

## Basic Usage

### AppLayout (Main Shell)
```vue
<template>
  <AppLayout>
    <DashboardPage />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
</script>
```

### AppHeader (Top Bar)
```vue
<template>
  <AppHeader
    :user="{ name: 'John Doe', email: 'john@example.com' }"
    :notification-count="3"
    @toggle-sidebar="handleToggleSidebar"
    @logout="handleLogout"
    @navigate-to-profile="navigateToProfile"
  />
</template>

<script setup lang="ts">
const handleToggleSidebar = () => {
  console.log('Toggle sidebar')
}

const handleLogout = () => {
  console.log('User logged out')
}

const navigateToProfile = () => {
  console.log('Navigate to profile')
}
</script>
```

### AppSidebar (Navigation)
```vue
<template>
  <AppSidebar
    :navigation="navigationItems"
    :is-collapsed="sidebarCollapsed"
    :is-mobile-open="isMobileSidebarOpen"
    @update:is-collapsed="handleCollapse"
    @close-mobile="closeMobileSidebar"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NavItem } from '@/types/dashboard'

const navigationItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { id: 'products', label: 'Products', icon: 'Package', path: '/products' },
  { id: 'inventory', label: 'Inventory', icon: 'Boxes', path: '/inventory' },
  { id: 'orders', label: 'Orders', icon: 'ShoppingCart', path: '/orders' },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: 'Truck', path: '/purchase-orders' },
  { id: 'reports', label: 'Reports', icon: 'BarChart3', path: '/reports' }
]

const sidebarCollapsed = ref(false)
const isMobileSidebarOpen = ref(false)

const handleCollapse = (collapsed: boolean) => {
  sidebarCollapsed.value = collapsed
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}
</script>
```

### MetricsGrid (Metrics Display)
```vue
<template>
  <MetricsGrid
    :metrics="metrics"
    :loading="isLoading"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Metric } from '@/types/dashboard'

const isLoading = ref(false)
const metrics = ref<Metric[]>([
  {
    id: 'total-products',
    label: 'Total Products',
    value: 1247,
    trend: 12,
    trendDirection: 'up',
    isUrgent: false
  },
  {
    id: 'low-stock-alerts',
    label: 'Low Stock Alerts',
    value: 23,
    trend: 5,
    trendDirection: 'up',
    isUrgent: true
  },
  // ... more metrics
])
</script>
```

### MetricCard (Single Metric)
```vue
<template>
  <MetricCard
    label="Low Stock Alerts"
    value="23"
    :trend="5"
    trend-direction="up"
    :is-urgent="true"
    :loading="false"
  />
</template>

<script setup lang="ts">
import MetricCard from '@/components/dashboard/MetricCard.vue'
</script>
```

### RecentOrders (Orders Table)
```vue
<template>
  <RecentOrders
    :orders="recentOrders"
    :loading="isLoading"
    @view-order="handleViewOrder"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Order } from '@/types/dashboard'

const isLoading = ref(false)
const recentOrders = ref<Order[]>([
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: 'Acme Corp',
    status: 'fulfilled',
    total: 2450.00,
    date: '2024-01-15'
  },
  // ... more orders
])

const handleViewOrder = (orderId: string) => {
  console.log('View order:', orderId)
}
</script>
```

### QuickActions (Action Buttons)
```vue
<template>
  <QuickActions
    :actions="quickActions"
    @execute="handleQuickAction"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { QuickAction } from '@/types/dashboard'

const quickActions = ref<QuickAction[]>([
  {
    id: 'create-po',
    label: 'Create Purchase Order',
    icon: 'Plus',
    description: 'Create a new purchase order'
  },
  {
    id: 'adjust-inventory',
    label: 'Adjust Inventory',
    icon: 'Edit',
    description: 'Adjust stock levels'
  },
  // ... more actions
])

const handleQuickAction = (actionId: string) => {
  console.log('Quick action:', actionId)
  switch (actionId) {
    case 'create-po':
      // Navigate to PO creation
      break
    case 'adjust-inventory':
      // Navigate to inventory adjustment
      break
    // ... handle other actions
  }
}
</script>
```

---

## Responsive Behavior

### Desktop (>1280px)
```
┌─────────────────────────────────────────────────────┐
│                    AppHeader                         │
├──────────┬──────────────────────────┬────────────────┤
│          │                          │                │
│ Sidebar  │   Main Content           │ Quick Actions  │
│ (240px)  │   (Full Width)           │ (Fixed Right)  │
│          │                          │                │
└──────────┴──────────────────────────┴────────────────┘
```

### Laptop (1024-1280px)
```
┌─────────────────────────────────────────────────────┐
│                    AppHeader                         │
├──────────┬──────────────────────────────────────��───┤
│          │                                          │
│ Sidebar  │   Main Content                           │
│ (240px)  │   (Quick Actions at Top)                 │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### Tablet (768-1024px)
```
┌─────────────────────────────────────────────────────┐
│                    AppHeader                         │
├──┬────────────────────────────────────────────────┤
│  │                                                │
│  │   Main Content                                │
│  │   (Sidebar Collapsed to Icons)                │
│  │                                                │
└──┴────────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌─────────────────────────────────────────────────────┐
│                    AppHeader                         │
│                  (Hamburger Menu)                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Main Content                                      │
│   (Sidebar Hidden, Accessible via Drawer)          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Styling Examples

### Urgent Card (Red Border)
```vue
<MetricCard
  label="Low Stock Alerts"
  value="23"
  :is-urgent="true"
/>
```
Result: Red left border (4px), subtle shadow

### Trend Indicator
```vue
<MetricCard
  label="Total Products"
  value="1247"
  :trend="12"
  trend-direction="up"
/>
```
Result: Green "↑ 12%" indicator

### Loading State
```vue
<MetricCard
  label="Total Products"
  value="—"
  :loading="true"
/>
```
Result: Skeleton with pulse animation

### Status Badge Colors
```
Fulfilled:  Green (#10b981)
Processing: Blue (#3b82f6)
Pending:    Yellow (#f59e0b)
Cancelled:  Red (#ef4444)
```

---

## Accessibility Features

### Keyboard Navigation
```
Tab         → Move to next interactive element
Shift+Tab   → Move to previous interactive element
Enter       → Activate button/link
Escape      → Close dropdown/modal
```

### Screen Reader Support
```
aria-label="Main navigation"
aria-current="page"
aria-expanded="true/false"
role="alert"
role="status"
role="table"
```

### Focus Management
```
- Visible focus outline (2px blue)
- Logical tab order
- Focus trap in modals (future)
- Focus restoration on close
```

---

## Type Definitions

### Metric Type
```typescript
interface Metric {
  id: string
  label: string
  value: number | string
  trend?: number
  trendDirection?: 'up' | 'down' | 'neutral'
  isUrgent?: boolean
  loading?: boolean
}
```

### Order Type
```typescript
interface Order {
  id: string
  orderNumber: string
  customer: string
  status: 'pending' | 'processing' | 'fulfilled' | 'cancelled'
  total: number
  date: string
}
```

### NavItem Type
```typescript
interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
}
```

### QuickAction Type
```typescript
interface QuickAction {
  id: string
  label: string
  icon: string
  description?: string
}
```

---

## Common Patterns

### Loading State
```vue
<template>
  <div v-if="isLoading" class="space-y-4">
    <MetricCard v-for="i in 8" :key="i" :loading="true" />
  </div>
  <MetricsGrid v-else :metrics="metrics" />
</template>

<script setup lang="ts">
const isLoading = ref(true)

onMounted(async () => {
  await fetchData()
  isLoading.value = false
})
</script>
```

### Error Handling
```vue
<template>
  <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
    <p class="text-red-800">{{ error }}</p>
    <button @click="retry" class="text-red-600 hover:text-red-700">
      Try again
    </button>
  </div>
  <MetricsGrid v-else :metrics="metrics" />
</template>

<script setup lang="ts">
const error = ref<string | null>(null)

const fetchData = async () => {
  try {
    // Fetch data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
  }
}

const retry = () => {
  error.value = null
  fetchData()
}
</script>
```

### Event Handling
```vue
<template>
  <RecentOrders
    :orders="orders"
    @view-order="handleViewOrder"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleViewOrder = (orderId: string) => {
  router.push(`/orders/${orderId}`)
}
</script>
```

---

## Tailwind CSS Classes

### Responsive Utilities
```
sm:  640px   (tablet)
md:  768px   (tablet)
lg:  1024px  (laptop)
xl:  1280px  (desktop)
2xl: 1536px  (large desktop)
```

### Common Classes
```
Grid:       grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
Spacing:    gap-4 p-6 m-4
Colors:     bg-white text-slate-900 border-slate-200
Shadows:    shadow-sm shadow-md shadow-lg
Rounded:    rounded-lg rounded-xl
Transitions: transition-all duration-200
```

---

## Testing Checklist

- [ ] Component renders without errors
- [ ] Props are passed correctly
- [ ] Events are emitted on user interaction
- [ ] Loading state displays skeleton
- [ ] Error state displays message
- [ ] Responsive layout works at all breakpoints
- [ ] Keyboard navigation works
- [ ] Screen reader announces content
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators are visible

---

## Performance Tips

1. **Use v-if for conditional rendering** (not v-show for heavy components)
2. **Memoize computed properties** with `computed()`
3. **Debounce search inputs** (300ms)
4. **Lazy load routes** with `defineAsyncComponent()`
5. **Use virtual scrolling** for large lists
6. **Optimize images** with proper formats
7. **Minimize re-renders** with proper key binding
8. **Use production build** for deployment

---

## Debugging Tips

### Vue DevTools
1. Install Vue DevTools browser extension
2. Open DevTools (F12)
3. Go to Vue tab
4. Inspect component tree
5. Check props and state

### Console Logging
```typescript
console.log('Component mounted')
console.log('Props:', props)
console.log('State:', state.value)
```

### Accessibility Audit
1. Install axe DevTools
2. Run scan
3. Review violations
4. Fix issues
5. Re-run scan

---

## Useful Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Preview build
pnpm preview

# Lint
pnpm lint

# Format
pnpm format

# Test
pnpm test:unit
pnpm test:e2e

# Type check
pnpm type-check
```

---

## File Locations

| Component | Path |
|-----------|------|
| AppLayout | `src/components/layout/AppLayout.vue` |
| AppHeader | `src/components/AppHeader.vue` |
| AppSidebar | `src/components/layout/AppSidebar.vue` |
| DashboardPage | `src/pages/DashboardPage.vue` |
| MetricsGrid | `src/components/dashboard/MetricsGrid.vue` |
| MetricCard | `src/components/dashboard/MetricCard.vue` |
| RecentOrders | `src/components/dashboard/RecentOrders.vue` |
| QuickActions | `src/components/dashboard/QuickActions.vue` |
| Types | `src/types/dashboard.ts` |

---

## Documentation Links

- [COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md) - Detailed component documentation
- [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) - Implementation phases
- [DASHBOARD_COMPONENTS_SUMMARY.md](../DASHBOARD_COMPONENTS_SUMMARY.md) - Project summary

---

**Last Updated:** January 2024  
**Version:** 1.0.0

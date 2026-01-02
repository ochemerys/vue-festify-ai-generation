# Inventory Management Dashboard - Components Guide

## Overview

This guide documents the production-ready Vue 3 components for the Inventory Management Dashboard. All components follow strict Container/Presentational pattern with TypeScript, Tailwind CSS, and WCAG AA accessibility compliance.

---

## Component Hierarchy

```
AppLayout.vue (Container)
├── AppHeader.vue (Presentational)
├── AppSidebar.vue (Presentational)
└── DashboardPage.vue (Container)
    ├── MetricsGrid.vue (Presentational)
    │   └── MetricCard.vue (Presentational)
    ├── RecentOrders.vue (Presentational)
    └── QuickActions.vue (Presentational)
```

---

## Core Components

### 1. AppLayout.vue

**Type:** Container Component  
**Location:** `src/components/layout/AppLayout.vue`

#### Responsibility
Main application shell managing responsive layout with breakpoint-aware sidebar behavior.

#### Props
None (reads from route and auth store)

#### Emits
None

#### Responsive Behavior
- **Desktop (>1280px):** Fixed sidebar (240px) + main content + quick actions rail
- **Laptop (1024-1280px):** Fixed sidebar + main content (quick actions move to top)
- **Tablet (768-1024px):** Collapsed sidebar (80px icons only)
- **Mobile (<768px):** Hidden sidebar (accessible via hamburger drawer)

#### Key Features
- Window resize listener for responsive breakpoints
- Mobile sidebar drawer with overlay
- Smooth transitions between breakpoints
- Semantic HTML with proper ARIA labels

#### Usage
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

#### Accessibility Features
- `aria-label="Main navigation"` on sidebar
- `aria-expanded` on hamburger button reflects mobile state
- Focus management for mobile drawer
- Semantic `<header>`, `<aside>`, `<main>` elements

---

### 2. AppHeader.vue

**Type:** Presentational Component  
**Location:** `src/components/AppHeader.vue`

#### Props
```typescript
interface Props {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  notificationCount?: number
}
```

#### Emits
```typescript
{
  'toggle-sidebar': void
  'logout': void
  'navigate-to-profile': void
}
```

#### Features
- Hamburger menu for mobile (triggers sidebar toggle)
- Notification bell with count badge
- User profile dropdown menu
- Responsive design (hamburger hidden on desktop)

#### Usage
```vue
<AppHeader
  :user="{ name: 'John Doe', email: 'john@example.com' }"
  :notification-count="3"
  @toggle-sidebar="handleToggleSidebar"
  @logout="handleLogout"
  @navigate-to-profile="navigateToProfile"
/>
```

#### Accessibility Features
- `aria-expanded` on dropdown buttons
- `aria-label` on icon buttons
- Semantic button elements
- Focus management for dropdowns
- Click-outside detection to close menus

---

### 3. AppSidebar.vue

**Type:** Presentational Component  
**Location:** `src/components/layout/AppSidebar.vue`

#### Props
```typescript
interface Props {
  navigation: NavItem[]
  isCollapsed?: boolean
  isMobileOpen?: boolean
}

interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
}
```

#### Emits
```typescript
{
  'update:isCollapsed': boolean
  'close-mobile': void
}
```

#### Features
- Active route highlighting with `aria-current="page"`
- Badge support for notifications
- Icon-only mode on tablet
- Smooth transitions
- Tooltip on hover (collapsed state)

#### Usage
```vue
<AppSidebar
  :navigation="navigationItems"
  :is-collapsed="sidebarCollapsed"
  :is-mobile-open="isMobileSidebarOpen"
  @update:is-collapsed="handleCollapse"
  @close-mobile="closeMobileSidebar"
/>
```

#### Accessibility Features
- Semantic `<nav>` with `aria-label`
- Active link marked with `aria-current="page"`
- Close button with `aria-label`
- Keyboard navigation support
- Custom scrollbar styling

---

### 4. DashboardPage.vue

**Type:** Container Component  
**Location:** `src/pages/DashboardPage.vue`

#### Responsibility
Orchestrates data fetching from stores and manages dashboard state.

#### Props
None

#### Emits
None (communicates via store mutations)

#### Data Flow
1. Component mounts → fetch metrics from stores
2. Stores return data → update local state
3. Render presentational components with data
4. User interacts → emit events or navigate

#### Key Features
- Fetches dashboard metrics on mount
- Manages loading and error states
- Displays low stock and overdue order alerts
- Responsive grid layout

#### Usage
```vue
<template>
  <AppLayout>
    <DashboardPage />
  </AppLayout>
</template>
```

#### Alert System
- **Low Stock Alerts:** Amber border, links to inventory filter
- **Overdue Orders:** Red border, links to orders filter
- Both use `role="alert"` for accessibility

---

### 5. MetricsGrid.vue

**Type:** Presentational Component  
**Location:** `src/components/dashboard/MetricsGrid.vue`

#### Props
```typescript
interface Props {
  metrics: Metric[]
  loading?: boolean
}

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

#### Features
- 4x2 responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
- Skeleton loading state
- Distinguishes urgent vs info cards

#### Usage
```vue
<MetricsGrid
  :metrics="metrics"
  :loading="isLoading"
/>
```

#### Responsive Breakpoints
- **Mobile (<640px):** 1 column
- **Tablet (640-1024px):** 2 columns
- **Desktop (>1024px):** 4 columns

---

### 6. MetricCard.vue

**Type:** Presentational Component  
**Location:** `src/components/dashboard/MetricCard.vue`

#### Props
```typescript
interface Props {
  label: string
  value: string | number
  trend?: number
  trendDirection?: 'up' | 'down' | 'neutral'
  isUrgent?: boolean
  loading?: boolean
}
```

#### Features
- Displays metric value with label
- Shows trend direction and percentage
- Distinguishes urgent cards with red left border
- Skeleton loading state with pulse animation

#### Visual Styling
- **Urgent Cards:** Red left border (4px), used for Low Stock and Overdue
- **Info Cards:** Subtle gray border
- **Trend Colors:**
  - Up: Green (#16a34a)
  - Down: Red (#dc2626)
  - Neutral: Gray (#4b5563)

#### Usage
```vue
<MetricCard
  label="Low Stock Alerts"
  value="23"
  :trend="5"
  trend-direction="up"
  :is-urgent="true"
  :loading="false"
/>
```

#### Accessibility Features
- Semantic `<article>` element
- `aria-label` includes trend information
- Proper color contrast (WCAG AA)
- Skeleton loading with `aria-busy` (implicit)

---

### 7. RecentOrders.vue

**Type:** Presentational Component  
**Location:** `src/components/dashboard/RecentOrders.vue`

#### Props
```typescript
interface Props {
  orders: Order[]
  loading?: boolean
}

interface Order {
  id: string
  orderNumber: string
  customer: string
  status: 'pending' | 'processing' | 'fulfilled' | 'cancelled'
  total: number
  date: string
}
```

#### Emits
```typescript
{
  'view-order': string // orderId
}
```

#### Features
- Semantic table with proper headers
- Status badges with color coding
- Skeleton loading state
- Clickable rows for navigation
- Responsive table design

#### Status Badge Colors
- **Fulfilled:** Green (#10b981)
- **Processing:** Blue (#3b82f6)
- **Pending:** Yellow (#f59e0b)
- **Cancelled:** Red (#ef4444)

#### Usage
```vue
<RecentOrders
  :orders="recentOrders"
  :loading="isLoading"
  @view-order="handleViewOrder"
/>
```

#### Accessibility Features
- Semantic `<table>` with `<thead>` and `<tbody>`
- `scope="col"` on table headers
- Status badges with `aria-label`
- `role="status"` on empty state
- Proper table structure for screen readers

---

### 8. QuickActions.vue

**Type:** Presentational Component  
**Location:** `src/components/dashboard/QuickActions.vue`

#### Props
```typescript
interface Props {
  actions: Action[]
}

interface Action {
  id: string
  label: string
  icon: string
  description?: string
}
```

#### Emits
```typescript
{
  'execute': string // actionId
}
```

#### Features
- Vertical stack of action buttons
- Icon + label + description
- Hover effects with color transitions
- Responsive design

#### Usage
```vue
<QuickActions
  :actions="quickActions"
  @execute="handleQuickAction"
/>
```

#### Accessibility Features
- Semantic button elements
- `aria-label` for each action
- Focus-visible outline (2px blue)
- Proper color contrast

---

## Styling & Design System

### Color Palette
```
Primary: Blue (#3b82f6)
Success: Green (#10b981)
Warning: Amber (#f59e0b)
Danger: Red (#ef4444)
Neutral: Slate (#64748b)

Backgrounds:
- Page: Slate-50 (#f8fafc)
- Card: White (#ffffff)
- Hover: Slate-50 (#f8fafc)

Text:
- Primary: Slate-900 (#0f172a)
- Secondary: Slate-600 (#475569)
- Tertiary: Slate-500 (#64748b)
```

### Spacing
- **Gap:** 4px (0.25rem) to 32px (2rem)
- **Padding:** 4px to 32px
- **Margin:** 4px to 32px

### Typography
- **Headings:** Font-weight 600-700, size 18px-32px
- **Body:** Font-weight 400-500, size 14px-16px
- **Labels:** Font-weight 500-600, size 12px-14px

### Shadows
- **sm:** 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- **md:** 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- **lg:** 0 10px 15px -3px rgba(0, 0, 0, 0.1)

### Transitions
- **Duration:** 200ms-300ms
- **Timing:** cubic-bezier(0.4, 0, 0.2, 1)
- **Properties:** all, background-color, border-color, color, opacity

---

## Accessibility Compliance

### WCAG AA Standards
All components meet WCAG AA accessibility standards:

1. **Semantic HTML**
   - Proper heading hierarchy (h1 → h6)
   - Semantic elements: `<nav>`, `<main>`, `<article>`, `<table>`, `<button>`
   - Form labels with `<label>` elements

2. **ARIA Labels**
   - `aria-label` on icon buttons
   - `aria-expanded` on dropdown buttons
   - `aria-current="page"` on active navigation links
   - `aria-hidden="true"` on decorative icons

3. **Color Contrast**
   - Text: 4.5:1 ratio (normal text)
   - UI Components: 3:1 ratio
   - No information conveyed by color alone

4. **Focus Management**
   - Visible focus indicators (2px outline)
   - Logical tab order
   - Focus trap in modals (future)

5. **Keyboard Navigation**
   - All interactive elements keyboard accessible
   - Tab, Enter, Escape support
   - Arrow keys for navigation (future)

6. **Screen Reader Support**
   - Proper table structure
   - Status announcements with `role="alert"`
   - Loading states with `aria-busy`
   - Empty states with `role="status"`

---

## Loading States

### Skeleton Loading
All components support skeleton loading with pulse animation:

```vue
<MetricCard
  label="Total Products"
  value="1247"
  :loading="true"
/>
```

Skeleton elements:
- Match exact dimensions of content
- Use `animate-pulse` class
- Prevent layout shift

### Loading Indicators
- Spinner for full-page loads
- Skeleton for component-level loads
- Progress bar for long operations (future)

---

## Error Handling

### Error Display
Components display errors with:
- Alert role for screen readers
- Clear error message
- Retry button
- Appropriate color (red/danger)

### Error States
```vue
<div
  v-if="error"
  class="bg-red-50 border border-red-200 rounded-lg p-4"
  role="alert"
>
  <p class="text-red-800">{{ error }}</p>
  <button @click="retry" class="text-red-600 hover:text-red-700">
    Try again
  </button>
</div>
```

---

## Responsive Design

### Breakpoints
- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md, lg)
- **Laptop:** 1024px - 1280px (xl)
- **Desktop:** > 1280px (2xl)

### Mobile-First Approach
All components use mobile-first CSS with responsive utilities:

```vue
<!-- 1 col on mobile, 2 on tablet, 4 on desktop -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

---

## Performance Considerations

### Optimization Strategies
1. **Virtual Scrolling:** For tables with >100 rows
2. **Debounced Search:** 300ms debounce on filter inputs
3. **Pagination:** Default 25-50 items per page
4. **Caching:** 5-minute cache for store data
5. **Lazy Loading:** Route-based code splitting

### Bundle Size
- AppLayout: ~2.5 KB (gzipped)
- Dashboard components: ~8 KB (gzipped)
- Total: ~10.5 KB (gzipped)

---

## Testing

### Component Tests
All components have unit tests using Vue Testing Library:

```bash
npm run test:unit
```

### Test Coverage
- Component rendering
- Props validation
- Event emissions
- Accessibility (a11y)
- Responsive behavior
- Loading states
- Error states

### Example Test
```typescript
describe('MetricCard', () => {
  it('should render metric value', () => {
    const { getByText } = render(MetricCard, {
      props: { label: 'Total Products', value: '1247' }
    })
    expect(getByText('1247')).toBeInTheDocument()
  })

  it('should show loading skeleton', () => {
    const { container } = render(MetricCard, {
      props: { loading: true }
    })
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
```

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Latest versions

---

## Future Enhancements

1. **Dark Mode:** Add dark theme support
2. **Animations:** Add page transition animations
3. **Modals:** Implement accessible modal dialogs
4. **Forms:** Add form validation components
5. **Charts:** Add data visualization components
6. **Notifications:** Add toast notification system
7. **Internationalization:** Add i18n support
8. **Theming:** Add customizable color themes

---

## Troubleshooting

### Common Issues

**Sidebar not responsive**
- Check window resize listener is attached
- Verify Tailwind CSS is properly configured
- Clear browser cache

**Icons not displaying**
- Ensure `lucide-vue-next` is installed
- Check icon names match component map
- Verify icon imports

**Accessibility warnings**
- Run axe DevTools browser extension
- Check console for a11y warnings
- Verify ARIA labels are present

**Styling issues**
- Verify Tailwind CSS is in `tailwind.config.ts`
- Check for CSS conflicts
- Use `!important` sparingly

---

## Contributing

When adding new components:

1. Follow Container/Presentational pattern
2. Add TypeScript interfaces for props/emits
3. Include ARIA labels and semantic HTML
4. Add unit tests with >80% coverage
5. Document in this guide
6. Test on mobile, tablet, desktop
7. Run accessibility audit

---

## Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)

---

**Last Updated:** January 2024  
**Version:** 1.0.0

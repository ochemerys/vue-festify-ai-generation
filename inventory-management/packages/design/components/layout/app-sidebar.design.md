# AppSidebar Component Design Specification

## 1️⃣ Purpose

The AppSidebar component provides the main navigation menu for the Inventory Management System. It displays navigation items with icons, manages active state highlighting, supports collapse/expand animations, and adapts to different screen sizes. This component enables users to navigate between different sections of the application.

---

## 2️⃣ User Actions

### Primary Actions

- **Navigate**: Click navigation item to go to page
- **View Active State**: See current page highlighted
- **Collapse Sidebar**: Click collapse button to minimize sidebar
- **Expand Sidebar**: Click expand button to maximize sidebar
- **View Badges**: See notification badges on items
- **Logout**: Click logout button to end session

### Secondary Actions

- **Hover**: See tooltip on collapsed items
- **Keyboard Navigation**: Navigate with arrow keys
- **Nested Navigation**: Access sub-items (future)

### Keyboard Shortcuts

- **Tab**: Navigate through navigation items
- **Arrow Keys**: Navigate up/down through items
- **Enter**: Activate selected item

---

## 3️⃣ Data Requirements

### Navigation Data

```typescript
interface NavItem {
  id: string
  label: string
  icon: string // Icon name or component
  path: string // Route path
  badge?: number // Notification badge
  children?: NavItem[] // Nested items (future)
  requiresAuth?: boolean
  roles?: string[] // Required roles
}

interface SidebarState {
  currentRoute: string
  isCollapsed: boolean
  isOpen: boolean // Mobile drawer state
  navItems: NavItem[]
}
```

### Navigation Items

```typescript
const navItems: NavItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: 'dashboard', 
    path: '/' 
  },
  { 
    id: 'products', 
    label: 'Products', 
    icon: 'package', 
    path: '/products' 
  },
  { 
    id: 'inventory', 
    label: 'Inventory', 
    icon: 'inventory', 
    path: '/inventory',
    badge: 5 // Low stock items
  },
  { 
    id: 'orders', 
    label: 'Orders', 
    icon: 'shopping-cart', 
    path: '/orders',
    badge: 3 // Pending orders
  },
  { 
    id: 'purchase-orders', 
    label: 'Purchase Orders', 
    icon: 'inbox', 
    path: '/purchase-orders' 
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: 'chart', 
    path: '/reports' 
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: 'settings', 
    path: '/settings' 
  }
]
```

### Data Sources

- **Config**: Navigation items configuration
- **Route**: Current route for active state
- **Store**: Notification badges
- **Auth**: User roles for permission checking

---

## 4️⃣ UI States

### Normal State (Full Width)

```
┌──────────────────────┐
│ [≡] Navigation       │
├──────────────────────┤
│ 📊 Dashboard         │
│ 📦 Products          │
│ 📋 Inventory      [5]│
│ 🛒 Orders         [3]│
│ 📥 Purchase Orders   │
│ 📈 Reports           │
│ ⚙️  Settings         │
├──────────────────────┤
│ 🚪 Logout            │
└──────────────────────┘
```

### Collapsed State (Icon Only)

```
┌──┐
│📊│
│📦│
│📋│ [5]
│🛒│ [3]
│📥│
│📈│
│⚙️ │
├──┤
│🚪│
└──┘
```

### Active State

```
┌──────────────────────┐
│ [≡] Navigation       │
├──────────────────────┤
│ 📊 Dashboard         │
│ 📦 Products          │
│ 📋 Inventory      [5]│ ← Active (highlighted)
│ 🛒 Orders         [3]│
│ 📥 Purchase Orders   │
│ 📈 Reports           │
│ ⚙️  Settings         │
├──────────────────────┤
│ 🚪 Logout            │
└──────────────────────┘
```

### Mobile Drawer State

```
┌──────────────────────┐
│ [✕] Navigation       │
├──────────────────────┤
│ 📊 Dashboard         │
│ 📦 Products          │
│ 📋 Inventory      [5]│
│ 🛒 Orders         [3]│
│ 📥 Purchase Orders   │
│ 📈 Reports           │
│ ⚙️  Settings         │
├──────────────────────┤
│ 🚪 Logout            │
└──────────────────────┘
```

---

## 5️⃣ Layout & Components

### Sidebar Layout

```
AppSidebar.vue
├── Header Section
│   ├── Collapse Button
│   └── Title (if not collapsed)
├── Navigation List
│   └── NavItem.vue (repeated)
│       ├── Icon
│       ├── Label (if not collapsed)
│       └── Badge (if present)
├─��� Spacer (flex-grow)
└── Footer Section
    └── Logout Button
```

### Component Breakdown

```
┌──────────────────────┐
│ [≡] Navigation       │ ← Header
├──────────────────────┤
│ [NavItem]            │
│ [NavItem]            │
│ [NavItem]            │
│ [NavItem]            │ ← Navigation Items
│ [NavItem]            │
│ [NavItem]            │
│ [NavItem]            │
├──────────────────────┤ ← Spacer
│ [Logout Button]      │ ← Footer
└──────────────────────┘
```

### Spacing & Sizing

- **Sidebar Width (Full)**: 240px
- **Sidebar Width (Collapsed)**: 80px
- **Item Height**: 48px
- **Icon Size**: 24x24px
- **Padding**: 12px horizontal, 8px vertical
- **Gap Between Items**: 4px
- **Transition Duration**: 300ms

---

## 6️⃣ Responsive Design

### Desktop (>1024px)

- **Width**: 240px (full) or 80px (collapsed)
- **Position**: Fixed left side
- **Behavior**: Persistent, collapsible
- **Drawer**: Not used
- **Tooltip**: Show on hover when collapsed

```
┌─────────────��────────┐
│ [≡] Navigation       │
├──────────────────────┤
│ 📊 Dashboard         │
│ 📦 Products          │
│ 📋 Inventory      [5]│
│ 🛒 Orders         [3]│
│ 📥 Purchase Orders   │
│ 📈 Reports           │
│ ⚙️  Settings         │
├──────────────────────┤
│ 🚪 Logout            │
└──────────────────────┘
```

### Tablet (768px - 1024px)

- **Width**: 80px (default)
- **Position**: Fixed left side
- **Behavior**: Collapsible, expandable on click
- **Drawer**: Not used
- **Tooltip**: Show on hover

```
┌──┐
│📊│
│📦│
│📋│ [5]
│🛒│ [3]
│📥│
│📈│
│⚙️ │
├──┤
│🚪│
└──┘
```

### Mobile (<768px)

- **Width**: 100% (max 280px)
- **Position**: Overlay drawer
- **Behavior**: Hidden by default, toggle with hamburger
- **Drawer**: Slide in from left
- **Backdrop**: Semi-transparent overlay

```
┌──────────────────────┐
│ [✕] Navigation       │
├──────────────────────┤
│ 📊 Dashboard         │
│ 📦 Products          │
│ 📋 Inventory      [5]│
│ 🛒 Orders         [3]│
│ 📥 Purchase Orders   │
│ 📈 Reports           │
│ ⚙️  Settings         │
├──────────────────────┤
│ 🚪 Logout            │
└──────────────────────┘
```

---

## 7️⃣ Interaction Patterns

### Navigation Item Click

- **Action**: Navigate to page
- **Visual**: Highlight active item
- **Mobile**: Close drawer after navigation
- **Keyboard**: Tab to item, Enter to navigate

### Collapse/Expand

- **Desktop**: Click collapse button to toggle
- **Animation**: Smooth 300ms width transition
- **Labels**: Fade out on collapse
- **Tooltip**: Show on hover when collapsed

### Badge Display

- **Show**: Display badge number if > 0
- **Position**: Top-right of icon
- **Color**: Red background with white text
- **Update**: Real-time updates from store

### Hover Effects

- **Desktop**: Highlight item on hover
- **Mobile**: No hover (touch-friendly)
- **Tooltip**: Show full label when collapsed

### Active State

- **Highlight**: Different background color
- **Icon**: Brighter color
- **Indicator**: Left border or background

---

## 8️⃣ Accessibility

### Keyboard Navigation

- **Tab**: Navigate through navigation items
- **Shift+Tab**: Navigate backwards
- **Enter/Space**: Activate item
- **Arrow Keys**: Navigate up/down through items
- **Home**: Go to first item
- **End**: Go to last item

### Screen Reader Support

```html
<nav role="navigation" aria-label="Main navigation" aria-expanded="true/false">
  <div class="sidebar-header">
    <button 
      aria-label="Toggle sidebar" 
      aria-pressed="false"
    >
      ≡
    </button>
    <span aria-hidden="true">Navigation</span>
  </div>
  
  <ul role="menubar">
    <li role="none">
      <a 
        href="/dashboard" 
        role="menuitem"
        aria-current="page"
      >
        <span aria-hidden="true">📊</span>
        <span>Dashboard</span>
      </a>
    </li>
    <!-- More items -->
  </ul>
  
  <button aria-label="Logout">
    <span aria-hidden="true">🚪</span>
    <span>Logout</span>
  </button>
</nav>
```

### Color Contrast

- **Text on Background**: WCAG AA (4.5:1 minimum)
- **Active State**: Sufficient contrast
- **Badge**: Sufficient contrast

### Focus Indicators

- **Visible Focus Ring**: 2px solid blue (#3B82F6)
- **Focus Offset**: 2px from element
- **High Contrast Mode**: Thicker border (3px)

---

## 9️⃣ Performance Considerations

### Data Loading

- **Lazy Load**: Load navigation items on mount
- **Caching**: Cache navigation items
- **Badges**: Update badges in real-time

### Optimization

- **Memoize**: Memoize active state
- **Avoid Re-renders**: Use computed properties
- **Debounce**: Debounce collapse/expand
- **Code Splitting**: Lazy load page components

---

## 🔟 Technical Constraints

- **Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS utility classes
- **State Management**: Pinia for stores
- **Routing**: Vue Router for navigation
- **Icons**: SVG or icon library
- **Browser Support**: Modern browsers
- **Accessibility**: WCAG 2.1 Level AA compliance

---

## 1️⃣1️⃣ Component Architecture & Implementation

### Component Contracts

#### `AppSidebar.vue` (Presentational)

**Responsibility:** Display navigation menu with items and logout button

**Props:**
```typescript
interface AppSidebarProps {
  currentRoute: string
  isCollapsed?: boolean
  isOpen?: boolean // Mobile drawer state
  navItems?: NavItem[]
}
```

**Emits:**
```typescript
{
  'navigate': { path: string }
  'close': void // Mobile drawer close
  'toggle-collapse': void
}
```

**State:**
```typescript
{
  navItems: NavItem[]
  activeItem: string
}
```

---

### Composables

#### `useSidebarNavigation()` Composable

**Responsibility:** Manage sidebar navigation state

**Returns:**
```typescript
{
  navItems: Ref<NavItem[]>
  activeItem: ComputedRef<string>
  
  isItemActive(path: string): boolean
  navigateTo(path: string): void
  handleLogout(): void
}
```

---

## 📋 Implementation Checklist

### Phase 1: Basic Sidebar (Week 1)

- [ ] Create `AppSidebar.vue` component
- [ ] Create `NavItem.vue` component
- [ ] Add navigation items
- [ ] Add logout button
- [ ] Implement active state
- [ ] Write unit tests

### Phase 2: Collapse/Expand (Week 2)

- [ ] Implement collapse button
- [ ] Add width transition
- [ ] Add label fade animation
- [ ] Add tooltip on hover
- [ ] Write tests

### Phase 3: Mobile Drawer (Week 3)

- [ ] Implement mobile drawer
- [ ] Add slide animation
- [ ] Add close button
- [ ] Add backdrop
- [ ] Write tests

### Phase 4: Accessibility & Polish (Week 4)

- [ ] Implement keyboard navigation
- [ ] Add ARIA labels and roles
- [ ] Test with screen readers
- [ ] Add focus management
- [ ] Final testing

---

## 🎯 Success Criteria

- ✅ Navigation items display correctly
- ✅ Active item is highlighted
- ✅ Collapse/expand works smoothly
- ✅ Mobile drawer opens/closes
- ✅ Badges display correctly
- ✅ All keyboard navigation works
- ✅ Screen reader announces all content
- ✅ Color contrast meets WCAG AA
- ✅ Responsive on all breakpoints
- ✅ No console errors or warnings

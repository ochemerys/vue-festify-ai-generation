# AppLayout Component Design Specification

## 1️⃣ Purpose

The AppLayout component serves as the main application shell, providing the foundational structure for the entire Inventory Management System. It manages the sidebar navigation state, responsive layout behavior, and coordinates between the header, sidebar, and main content area. This component ensures consistent layout across all pages and handles responsive behavior for different screen sizes.

---

## 2️⃣ User Actions

### Primary Actions

- **View Application**: Display main application layout
- **Toggle Sidebar**: Open/close sidebar on mobile
- **Collapse Sidebar**: Collapse sidebar to icon-only view on desktop
- **Navigate**: Use sidebar to navigate between pages
- **Access User Menu**: Open user profile menu from header
- **View Notifications**: Access notification bell

### Secondary Actions

- **Persist Sidebar State**: Remember sidebar collapse preference
- **Adjust Layout**: Responsive layout adjustment on screen resize
- **Manage Focus**: Handle focus management for accessibility

### Keyboard Shortcuts

- **Escape**: Close mobile sidebar drawer
- **Tab**: Navigate through layout elements

---

## 3️⃣ Data Requirements

### Layout State

```typescript
interface LayoutState {
  sidebarOpen: boolean // Mobile sidebar visibility
  sidebarCollapsed: boolean // Desktop sidebar collapse state
  user: User | null // Current user info
  notifications: Notification[]
  notificationCount: number
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'user'
}

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: Date
  read: boolean
}
```

### Data Sources

- **Store**: `useAuthStore` for user info
- **Store**: `useNotificationStore` for notifications
- **LocalStorage**: Sidebar collapse preference
- **Route**: Current route for active navigation

---

## 4️⃣ UI States

### Normal State (Desktop)

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] System              [🔔] [👤] [⋮]              │
├──────────────┬────────────────────���─────────────────────┤
│              │                                          │
│ [Dashboard]  │                                          │
│ [Products]   │         Main Content Area                │
│ [Inventory]  │         (RouterView)                     │
│ [Orders]     │                                          │
│ [Reports]    │                                          │
│              │                                          │
│ [Logout]     │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### Collapsed State (Desktop)

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] System              [🔔] [👤] [⋮]              │
├──┬────────────────────────────────────────────────────┤
│📊│                                                    │
│📦│         Main Content Area                         │
│📋│         (RouterView)                              │
│🛒│                                                    │
│📈│                                                    │
│⚙️ │                                                    │
│🚪│                                                    │
└──┴────────────────────────────────────────────────────┘
```

### Mobile State (Drawer)

```
┌──────────────────────────────────────────────────────────┐
│ [≡] [Logo] System            [🔔] [👤] [⋮]            │
├──────────────────────────────────────────────────────────┤
│ Main Content Area                                        │
│ (RouterView)                                             │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘

Sidebar Drawer (Overlay):
┌──────────────────────┐
│ [✕] Navigation       │
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
└──────────────────────┘
```

---

## 5️⃣ Layout & Components

### Component Hierarchy

```
AppLayout.vue (Container)
├── AppHeader.vue (Presentational)
│   ├── Logo
│   ├── NotificationBell
│   └── UserMenu.vue
├── AppSidebar.vue (Presentational)
│   ├── NavItem.vue (repeated)
│   └── LogoutButton
├── RouterView (Main Content)
│   └── Page Components
└── Modals (Conditional)
    ├── Notifications
    └── User Menu
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ AppHeader (height: 64px)                                │
├──────────────┬──────────────────────────────────────────┤
│ AppSidebar   │ Main Content (RouterView)                │
│ (width:      │                                          │
│  240px or    │                                          │
│  80px)       │                                          │
│              │                                          │
│              │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### Spacing & Sizing

- **Header Height**: 64px
- **Sidebar Width (Full)**: 240px
- **Sidebar Width (Collapsed)**: 80px
- **Mobile Sidebar Width**: 100% (max 280px)
- **Main Content Margin**: Adjusts based on sidebar state
- **Transition Duration**: 300ms

---

## 6️⃣ Responsive Design

### Desktop (>1024px)

- **Sidebar**: Always visible, 240px width
- **Sidebar Toggle**: Manual collapse button
- **Header**: Full width
- **Main Content**: Adjusts margin-left based on sidebar state
- **Behavior**: Sidebar persists across navigation

```
┌─────────────────────────────────────────────────────────┐
│ Header (64px)                                           │
├──────────────┬──────────────────────────────────────────┤
│ Sidebar      │ Main Content                             │
│ 240px        │ (calc(100% - 240px))                     │
│ (or 80px)    │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

- **Sidebar**: Collapsed to 80px by default
- **Sidebar Toggle**: Hamburger menu in header
- **Header**: Full width
- **Main Content**: Adjusts margin-left
- **Behavior**: Sidebar can be expanded on click

```
┌──────────────────────────────────────────────────────────┐
│ [≡] Header (64px)                                       │
├──┬────────────────────────────────────────────────────┤
│📊│ Main Content                                       │
│📦│ (calc(100% - 80px))                               │
│📋│                                                    │
│🛒│                                                    │
│📈│                                                    │
└──┴────────────────────────────────────────────────────┘
```

### Mobile (<768px)

- **Sidebar**: Hidden by default, drawer overlay
- **Sidebar Toggle**: Hamburger menu in header
- **Header**: Full width with hamburger
- **Main Content**: Full width
- **Behavior**: Sidebar slides in from left as overlay

```
┌───────────────────────────────────────────���──────────────┐
│ [≡] Header (64px)                                       │
├──────────────────────────────────────────────────────────┤
│ Main Content (100%)                                      │
│                                                          │
│                                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘

Sidebar Drawer (Overlay):
┌──────────────────────┐
│ [✕] Navigation       │
├──────────────────────┤
│ Navigation Items     │
└──────────────────────┘
```

### Breakpoint Behaviors

| Breakpoint | Sidebar Width | Sidebar State | Toggle | Content Adjustment |
|-----------|---------------|---------------|--------|-------------------|
| Desktop (>1024px) | 240px (full) or 80px (collapsed) | Persistent | Manual button | Margin-left adjustment |
| Tablet (768px-1024px) | 80px (default) | Collapsible | Hamburger menu | Margin-left adjustment |
| Mobile (<768px) | 100% (drawer) | Hidden | Hamburger menu | Full width, drawer overlay |

---

## 7️⃣ Interaction Patterns

### Sidebar Toggle

- **Desktop**: Click collapse button to toggle between 240px and 80px
- **Tablet/Mobile**: Click hamburger menu to open/close drawer
- **Animation**: Smooth 300ms width transition
- **Persistence**: Save state to localStorage

### Sidebar Drawer (Mobile)

- **Open**: Click hamburger menu or swipe from left
- **Close**: Click X button, click outside, or press Escape
- **Animation**: Slide in from left (300ms)
- **Backdrop**: Semi-transparent overlay

### Navigation

- **Click Item**: Navigate to page
- **Active State**: Highlight current page
- **Breadcrumb**: Show navigation path (optional)

### Header Interactions

- **Logo Click**: Navigate to dashboard
- **Notification Bell**: Show notification panel
- **User Menu**: Show profile dropdown
- **Hamburger Menu**: Toggle sidebar (mobile/tablet)

---

## 8️⃣ Accessibility

### Keyboard Navigation

- **Tab**: Navigate through header, sidebar, and main content
- **Shift+Tab**: Navigate backwards
- **Enter/Space**: Activate buttons and links
- **Escape**: Close mobile sidebar drawer
- **Arrow Keys**: Navigate within sidebar (if implemented)

### Screen Reader Support

```html
<div class="app-layout">
  <header role="banner" aria-label="Application header">
    <!-- Header content -->
  </header>
  
  <nav role="navigation" aria-label="Main navigation" aria-expanded="true/false">
    <!-- Sidebar content -->
  </nav>
  
  <main role="main" aria-label="Main content">
    <!-- RouterView -->
  </main>
</div>
```

### Focus Management

- **Focus Trap**: Trap focus in mobile sidebar drawer
- **Focus Return**: Return focus to hamburger menu when drawer closes
- **Focus Visible**: Visible focus indicators on all interactive elements

### ARIA Labels

- **Sidebar**: `aria-label="Main navigation"`, `aria-expanded="true/false"`
- **Hamburger Menu**: `aria-label="Toggle navigation"`, `aria-pressed="true/false"`
- **Header**: `role="banner"`, `aria-label="Application header"`
- **Main Content**: `role="main"`, `aria-label="Main content"`

### Color Contrast

- **Text on Background**: WCAG AA (4.5:1 minimum)
- **Sidebar Borders**: WCAG AA (3:1 minimum)
- **Active State**: Sufficient contrast

---

## 9️⃣ Performance Considerations

### Data Loading

- **Lazy Load**: Load user info on mount
- **Lazy Load**: Load notifications on demand
- **Caching**: Cache user info for session
- **Caching**: Cache sidebar state in localStorage

### State Management

- **Sidebar State**: Store in localStorage for persistence
- **User Info**: Store in Pinia auth store
- **Notifications**: Store in Pinia notification store
- **Route**: Use Vue Router for current route

### Optimization

- **Avoid Re-renders**: Use computed properties for sidebar state
- **Memoize**: Memoize sidebar width calculations
- **Debounce**: Debounce window resize events
- **Code Splitting**: Lazy load page components

---

## 🔟 Technical Constraints

- **Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS utility classes
- **State Management**: Pinia for stores
- **Routing**: Vue Router for navigation
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile First**: Responsive design with touch support

---

## 1️⃣1️⃣ Component Architecture & Implementation

### Component Contracts

#### `AppLayout.vue` (Container)

**Responsibility:** Main application shell managing sidebar state and responsive behavior

**Props:**
```typescript
interface AppLayoutProps {
  // No props - reads from stores
}
```

**State:**
```typescript
{
  sidebarOpen: boolean // Mobile sidebar visibility
  sidebarCollapsed: boolean // Desktop sidebar collapse state
  windowWidth: number // Current window width
}
```

**Slots:**
```typescript
{
  default: void // Main content area (RouterView)
}
```

**Emits:**
```typescript
{
  // No emits - manages internal state
}
```

**Composables Used:**
```typescript
{
  useAuthStore: // Current user info
  useNotificationStore: // Notifications
  useRouter: // Navigation
  useRoute: // Current route
  useWindowSize: // Window resize events
}
```

**Methods:**
```typescript
{
  toggleSidebar(): void // Toggle sidebar on desktop
  openSidebar(): void // Open sidebar on mobile
  closeSidebar(): void // Close sidebar on mobile
  handleWindowResize(): void // Handle responsive behavior
  handleEscape(): void // Close sidebar on Escape key
  handleBackdropClick(): void // Close sidebar on backdrop click
}
```

**Lifecycle:**
```typescript
{
  onMounted(): void // Load sidebar state from localStorage
  onUnmounted(): void // Clean up event listeners
  watch(windowWidth): void // Handle responsive behavior
}
```

---

### Composables

#### `useLayoutState()` Composable

**Responsibility:** Manage layout state and persistence

**Returns:**
```typescript
{
  sidebarOpen: Ref<boolean>
  sidebarCollapsed: Ref<boolean>
  windowWidth: Ref<number>
  isMobile: ComputedRef<boolean>
  isTablet: ComputedRef<boolean>
  isDesktop: ComputedRef<boolean>
  
  toggleSidebar(): void
  openSidebar(): void
  closeSidebar(): void
  setSidebarCollapsed(collapsed: boolean): void
  saveSidebarState(): void
  loadSidebarState(): void
}
```

**Implementation:**
```typescript
export function useLayoutState() {
  const sidebarOpen = ref(false)
  const sidebarCollapsed = ref(false)
  const windowWidth = ref(window.innerWidth)

  const isMobile = computed(() => windowWidth.value < 768)
  const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024)
  const isDesktop = computed(() => windowWidth.value >= 1024)

  const toggleSidebar = () => {
    if (isDesktop.value) {
      sidebarCollapsed.value = !sidebarCollapsed.value
      saveSidebarState()
    } else {
      sidebarOpen.value = !sidebarOpen.value
    }
  }

  const openSidebar = () => {
    sidebarOpen.value = true
  }

  const closeSidebar = () => {
    sidebarOpen.value = false
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
    saveSidebarState()
  }

  const saveSidebarState = () => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed.value))
  }

  const loadSidebarState = () => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved) {
      sidebarCollapsed.value = JSON.parse(saved)
    }
  }

  const handleWindowResize = () => {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => {
    loadSidebarState()
    window.addEventListener('resize', handleWindowResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleWindowResize)
  })

  return {
    sidebarOpen,
    sidebarCollapsed,
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    setSidebarCollapsed,
    saveSidebarState,
    loadSidebarState
  }
}
```

---

### State Management

#### `useLayoutStore` (Pinia)

**State:**
```typescript
{
  sidebarCollapsed: boolean
  sidebarOpen: boolean
}
```

**Actions:**
```typescript
{
  toggleSidebar(): void
  openSidebar(): void
  closeSidebar(): void
  setSidebarCollapsed(collapsed: boolean): void
}
```

**Getters:**
```typescript
{
  isSidebarOpen: boolean
  isSidebarCollapsed: boolean
}
```

---

## 📋 Implementation Checklist

### Phase 1: Core Layout (Week 1)

- [ ] Create `AppLayout.vue` component
- [ ] Create `useLayoutState()` composable
- [ ] Implement sidebar state management
- [ ] Implement responsive breakpoints
- [ ] Add localStorage persistence
- [ ] Write unit tests

### Phase 2: Header Integration (Week 2)

- [ ] Create `AppHeader.vue` component
- [ ] Integrate header with layout
- [ ] Implement hamburger menu toggle
- [ ] Add notification bell
- [ ] Add user menu
- [ ] Write integration tests

### Phase 3: Sidebar Integration (Week 3)

- [ ] Create `AppSidebar.vue` component
- [ ] Create `NavItem.vue` component
- [ ] Integrate sidebar with layout
- [ ] Implement navigation items
- [ ] Add active state highlighting
- [ ] Write tests

### Phase 4: Responsive Behavior (Week 4)

- [ ] Implement mobile drawer
- [ ] Implement tablet collapse
- [ ] Add window resize handling
- [ ] Test on actual devices
- [ ] Optimize animations
- [ ] Performance testing

### Phase 5: Accessibility & Polish (Week 5)

- [ ] Implement keyboard navigation
- [ ] Add ARIA labels and roles
- [ ] Test with screen readers
- [ ] Add focus management
- [ ] Implement focus trap for drawer
- [ ] Final accessibility audit

---

## 🎯 Success Criteria

- ✅ Layout renders correctly on all breakpoints
- ✅ Sidebar toggle works on desktop
- ✅ Mobile drawer opens/closes smoothly
- ✅ Sidebar state persists across sessions
- ✅ Responsive behavior works correctly
- ✅ All keyboard navigation works
- ✅ Screen reader announces all content
- ✅ Color contrast meets WCAG AA
- ✅ Animations are smooth (60fps)
- ✅ No console errors or warnings
- ✅ Performance metrics meet targets (LCP <2.5s)
- ✅ Mobile drawer has focus trap
- ✅ Focus returns correctly after drawer close
- ✅ Hamburger menu is accessible
- ✅ Navigation items are keyboard accessible

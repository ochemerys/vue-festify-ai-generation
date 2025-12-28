# AppHeader Component Design Specification

## 1️⃣ Purpose

The AppHeader component provides the top navigation bar for the Inventory Management System. It displays the application logo/branding, notification bell with badge, user profile menu, and hamburger menu toggle for mobile navigation. This component serves as the primary entry point for user interactions with system-level features.

---

## 2️⃣ User Actions

### Primary Actions

- **View Logo**: Display application branding
- **View Notifications**: Click notification bell to see alerts
- **Access User Menu**: Click user profile to open menu
- **Toggle Sidebar**: Click hamburger menu to open/close sidebar (mobile)
- **Navigate to Dashboard**: Click logo to go to dashboard

### Secondary Actions

- **Mark Notifications as Read**: Click notification to mark as read
- **Clear Notifications**: Clear all notifications
- **Access Profile**: Navigate to user profile
- **Access Settings**: Navigate to settings
- **Logout**: End user session

### Keyboard Shortcuts

- **Tab**: Navigate through header elements
- **Enter**: Activate buttons and links
- **Escape**: Close dropdowns

---

## 3️⃣ Data Requirements

### Header Data

```typescript
interface HeaderData {
  logo: string // Logo URL or SVG
  appName: string // Application name
  user: User | null // Current user
  notificationCount: number // Unread notifications
  notifications: Notification[]
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
  action?: {
    label: string
    url: string
  }
}
```

### Data Sources

- **Store**: `useAuthStore` for user info
- **Store**: `useNotificationStore` for notifications
- **Config**: Application name and logo
- **Route**: Current route for active state

---

## 4️⃣ UI States

### Normal State

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Inventory Management System  [🔔] [👤] [⋮]     │
└────────────────────────────────────────────���────────────┘
```

### With Notifications

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Inventory Management System  [🔔3] [👤] [⋮]    │
└─────────────────────────────────────────────────────────┘
```

### Notification Panel Open

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] System                       [🔔3] [👤] [⋮]    │
├─────────────────────────────────────────────────────────┤
│ Notifications                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✓ Low stock alert for Widget A                      │ │
│ │ 2 minutes ago                                       │ │
│ │                                                     │ │
│ │ ⚠ Order #ORD-2024-001 shipped                       │ │
│ │ 1 hour ago                                          │ │
│ │                                                     │ │
│ │ ℹ System maintenance scheduled                      │ │
│ │ 3 hours ago                                         │ │
│ │                                                     │ │
│ │ [Mark All as Read] [Clear All]                      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### User Menu Open

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] System                       [🔔] [👤] [⋮]     │
├─────────────────────────────────────────────────────────┤
│                                    ┌──────────────────┐ │
│                                    │ John Doe         │ │
│                                    │ john@example.com │ │
│                                    ├──────────────────┤ │
│                                    │ 👤 Profile       │ │
│                                    │ ⚙️  Settings     │ │
│                                    ├──────────────────┤ │
│                                    │ 🚪 Logout        │ │
│                                    └──────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Mobile State

```
┌──────────────────────────────────────────────────────────┐
│ [≡] [Logo] System            [🔔] [👤] [⋮]            │
└──────────────────────────────────────────────────────────┘
```

---

## 5️⃣ Layout & Components

### Header Layout

```
AppHeader.vue
├── Logo Section
│   ├── Logo Image/SVG
│   └── Application Name
├── Spacer (flex-grow)
├── Actions Section
│   ├── Notification Bell
│   │   ├── Bell Icon
│   │   └── Badge (if count > 0)
│   ├── User Avatar
│   │   └── Avatar Image
│   └── Menu Toggle (mobile)
│       └── Hamburger Icon
├── Notification Panel (Conditional)
│   ├── Notification List
│   ├── Mark All as Read
│   └── Clear All
└── User Menu (Conditional)
    ├── User Info
    ├── Profile Link
    ├── Settings Link
    └── Logout Button
```

### Component Breakdown

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] App Name    [Spacer]    [🔔] [👤] [≡]         │
└─────────────────────────────────────────────────────────┘
```

### Spacing & Sizing

- **Header Height**: 64px
- **Logo Size**: 32x32px
- **Icon Size**: 24x24px
- **Badge Size**: 20x20px
- **Padding**: 12px horizontal, 8px vertical
- **Gap Between Items**: 16px

---

## 6️⃣ Responsive Design

### Desktop (>1024px)

- **Layout**: Full header with all elements
- **Logo**: Visible with text
- **Hamburger**: Hidden
- **Notification Bell**: Visible
- **User Menu**: Visible
- **Dropdown Position**: Right-aligned

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] App Name                 [🔔] [👤] [⋮]        │
└─────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

- **Layout**: Compact header
- **Logo**: Visible with text
- **Hamburger**: Visible
- **Notification Bell**: Visible
- **User Menu**: Visible
- **Dropdown Position**: Right-aligned

```
┌────────────────────────────────────────────────────��─────┐
│ [≡] [Logo] App Name         [🔔] [👤] [⋮]            │
└──────────────────────────────────────────────────────────┘
```

### Mobile (<768px)

- **Layout**: Minimal header
- **Logo**: Icon only or small text
- **Hamburger**: Visible and prominent
- **Notification Bell**: Visible
- **User Menu**: Visible
- **Dropdown Position**: Right-aligned, adjusted for screen

```
┌──────────────────────────────────────────────────────────┐
│ [≡] [Logo]              [🔔] [👤] [⋮]                │
└──────────────────────────────────────────────────────────┘
```

---

## 7️⃣ Interaction Patterns

### Logo Click

- **Action**: Navigate to dashboard
- **Keyboard**: Tab to logo, Enter to navigate
- **Visual**: Hover effect (slight color change)

### Notification Bell

- **Click**: Toggle notification panel
- **Badge**: Show unread count (if > 0)
- **Hover**: Show tooltip "Notifications"
- **Keyboard**: Tab to bell, Enter to toggle

### Notification Panel

- **Open**: Slide down from header
- **Close**: Click outside, press Escape, or click bell again
- **Scroll**: Scrollable if many notifications
- **Actions**: Mark as read, clear all
- **Animation**: Smooth 200ms transition

### User Menu

- **Click**: Toggle user menu dropdown
- **Hover**: Highlight menu items
- **Keyboard**: Tab to menu, Enter to open, Arrow keys to navigate
- **Close**: Click outside, press Escape, or click avatar again
- **Animation**: Smooth 200ms transition

### Hamburger Menu (Mobile)

- **Click**: Toggle sidebar
- **Icon**: Change to X when sidebar open
- **Keyboard**: Tab to menu, Enter to toggle
- **Accessibility**: `aria-pressed` attribute

---

## 8️⃣ Accessibility

### Keyboard Navigation

- **Tab**: Navigate through logo, notification bell, user avatar, hamburger menu
- **Shift+Tab**: Navigate backwards
- **Enter/Space**: Activate buttons
- **Escape**: Close dropdowns
- **Arrow Keys**: Navigate dropdown items

### Screen Reader Support

```html
<header role="banner" aria-label="Application header">
  <a href="/" aria-label="Go to dashboard">
    <img src="logo.svg" alt="Application logo" />
    <span>Inventory Management System</span>
  </a>
  
  <button 
    aria-label="Notifications" 
    aria-pressed="false"
    aria-haspopup="true"
  >
    🔔
    <span aria-label="3 unread notifications">3</span>
  </button>
  
  <button 
    aria-label="User menu" 
    aria-pressed="false"
    aria-haspopup="true"
  >
    <img src="avatar.jpg" alt="User avatar" />
  </button>
  
  <button 
    aria-label="Toggle navigation" 
    aria-pressed="false"
    aria-controls="sidebar"
  >
    ≡
  </button>
  
  <nav 
    role="navigation" 
    aria-label="Notifications"
    aria-hidden="true"
  >
    <!-- Notification items -->
  </nav>
  
  <nav 
    role="navigation" 
    aria-label="User menu"
    aria-hidden="true"
  >
    <!-- User menu items -->
  </nav>
</header>
```

### Color Contrast

- **Text on Background**: WCAG AA (4.5:1 minimum)
- **Icons**: WCAG AA (3:1 minimum)
- **Badge**: Sufficient contrast with background

### Focus Indicators

- **Visible Focus Ring**: 2px solid blue (#3B82F6)
- **Focus Offset**: 2px from element
- **High Contrast Mode**: Thicker border (3px)

---

## 9️⃣ Performance Considerations

### Data Loading

- **Lazy Load**: Load notifications on demand
- **Caching**: Cache user info for session
- **Polling**: Poll for new notifications (optional)
- **WebSocket**: Real-time notifications (optional)

### Optimization

- **Memoize**: Memoize notification count
- **Debounce**: Debounce notification updates
- **Avoid Re-renders**: Use computed properties
- **Code Splitting**: Lazy load dropdown components

### Bundle Size

- **Icons**: Use SVG or icon font
- **Images**: Optimize avatar images
- **CSS**: Minimize CSS for header

---

## 🔟 Technical Constraints

- **Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS utility classes
- **State Management**: Pinia for stores
- **Icons**: SVG or icon library
- **Browser Support**: Modern browsers
- **Accessibility**: WCAG 2.1 Level AA compliance

---

## 1️⃣1️⃣ Component Architecture & Implementation

### Component Contracts

#### `AppHeader.vue` (Presentational)

**Responsibility:** Display header with logo, notifications, and user menu

**Props:**
```typescript
interface AppHeaderProps {
  userName: string
  userAvatar?: string
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

**State:**
```typescript
{
  notificationPanelOpen: boolean
  userMenuOpen: boolean
  notifications: Notification[]
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

### Composables

#### `useHeaderState()` Composable

**Responsibility:** Manage header dropdown states

**Returns:**
```typescript
{
  notificationPanelOpen: Ref<boolean>
  userMenuOpen: Ref<boolean>
  
  toggleNotificationPanel(): void
  closeNotificationPanel(): void
  toggleUserMenu(): void
  closeUserMenu(): void
  closeAllDropdowns(): void
}
```

---

## 📋 Implementation Checklist

### Phase 1: Basic Header (Week 1)

- [ ] Create `AppHeader.vue` component
- [ ] Add logo and app name
- [ ] Add notification bell
- [ ] Add user avatar
- [ ] Add hamburger menu (mobile)
- [ ] Write unit tests

### Phase 2: Dropdowns (Week 2)

- [ ] Create notification panel
- [ ] Create user menu dropdown
- [ ] Implement open/close logic
- [ ] Add click-outside handling
- [ ] Add keyboard support
- [ ] Write tests

### Phase 3: Notifications (Week 3)

- [ ] Integrate with notification store
- [ ] Display notification list
- [ ] Add mark as read functionality
- [ ] Add clear all functionality
- [ ] Add notification badge
- [ ] Write integration tests

### Phase 4: Accessibility & Polish (Week 4)

- [ ] Implement keyboard navigation
- [ ] Add ARIA labels and roles
- [ ] Test with screen readers
- [ ] Add focus management
- [ ] Optimize animations
- [ ] Final testing

---

## 🎯 Success Criteria

- ✅ Header renders correctly
- ✅ Logo is clickable and navigates to dashboard
- ✅ Notification bell shows badge with count
- ✅ Notification panel opens/closes correctly
- ✅ User menu opens/closes correctly
- ✅ Hamburger menu toggles sidebar
- ✅ All keyboard navigation works
- ✅ Screen reader announces all content
- ✅ Color contrast meets WCAG AA
- ✅ Dropdowns close on Escape key
- ✅ Dropdowns close on click outside
- ✅ Focus management works correctly
- ✅ Responsive on all breakpoints
- ✅ No console errors or warnings

# UserMenu Component Design Specification

## 1️⃣ Purpose

The UserMenu component provides a dropdown menu for user profile actions. It displays the current user's information, provides links to profile and settings pages, and includes a logout button. This component is typically triggered from the AppHeader and manages its own open/close state with keyboard and click-outside support.

---

## 2️⃣ User Actions

### Primary Actions

- **View User Info**: Display current user name and email
- **Navigate to Profile**: Click profile link to view/edit profile
- **Navigate to Settings**: Click settings link to access settings
- **Logout**: Click logout button to end session

### Secondary Actions

- **Close Menu**: Click outside or press Escape
- **Keyboard Navigation**: Navigate with arrow keys

### Keyboard Shortcuts

- **Tab**: Navigate through menu items
- **Arrow Keys**: Navigate up/down
- **Enter**: Activate selected item
- **Escape**: Close menu

---

## 3️⃣ Data Requirements

### User Data

```typescript
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'user'
}

interface MenuState {
  user: User | null
  isOpen: boolean
}
```

### Data Sources

- **Store**: `useAuthStore` for user info
- **Props**: User data passed from parent

---

## 4️⃣ UI States

### Closed State

```
[👤]
```

### Open State

```
┌──────────────────────┐
│ John Doe             │
│ john@example.com     │
├──────────────────────┤
│ 👤 Profile           │
│ ⚙️  Settings         │
├──────────────────────┤
│ 🚪 Logout            │
└──────────────────────┘
```

### Hover State

```
┌──────────────────────┐
│ John Doe             │
│ john@example.com     │
├──────────────────────┤
│ 👤 Profile           │ ← Highlighted
│ ⚙️  Settings         │
├──────────────────────┤
│ 🚪 Logout            │
└──────────────────────┘
```

---

## 5️⃣ Layout & Components

### Menu Layout

```
UserMenu.vue
├── User Info Section
│   ├── Avatar Image
│   ├── User Name
│   └── User Email
├── Divider
├── Menu Items
│   ├── Profile Link
│   └── Settings Link
├── Divider
└── Logout Button
```

### Component Breakdown

```
┌──────────────────────┐
│ [Avatar] John Doe    │
│ john@example.com     │
├──────────────────────┤
│ 👤 Profile           │
│ ⚙️  Settings         │
├──────────────────────┤
│ 🚪 Logout            │
└──────────────────────┘
```

### Spacing & Sizing

- **Menu Width**: 240px
- **Item Height**: 40px
- **Avatar Size**: 32x32px
- **Padding**: 12px
- **Gap Between Items**: 4px
- **Border Radius**: 8px

---

## 6️⃣ Responsive Design

### Desktop (>1024px)

- **Position**: Absolute, top-right of header
- **Width**: 240px
- **Animation**: Fade in/out
- **Backdrop**: None

```
┌──────────────────────┐
│ John Doe             │
│ john@example.com     │
├──────────────────────┤
│ �� Profile           │
│ ⚙️  Settings         │
├──────────────────────┤
│ 🚪 Logout            │
└──────────────────────┘
```

### Tablet (768px - 1024px)

- **Position**: Absolute, top-right of header
- **Width**: 220px
- **Animation**: Fade in/out
- **Backdrop**: None

```
┌────────────────────┐
│ John Doe           │
│ john@example.com   │
├────────────────────┤
│ 👤 Profile         │
│ ⚙️  Settings       │
├────────────────────┤
│ 🚪 Logout          │
└────────────────────┘
```

### Mobile (<768px)

- **Position**: Absolute, top-right of header
- **Width**: 200px (or full width - 16px)
- **Animation**: Fade in/out
- **Backdrop**: Semi-transparent overlay

```
┌──────────────────┐
│ John Doe         │
│ john@example.com │
├──────────────────┤
│ 👤 Profile       │
│ ⚙️  Settings     │
├──────────────────┤
│ 🚪 Logout        │
└─────────────��────┘
```

---

## 7️⃣ Interaction Patterns

### Menu Open/Close

- **Open**: Click user avatar or button
- **Close**: Click outside, press Escape, or click menu item
- **Animation**: Smooth fade in/out (200ms)
- **Backdrop**: Click backdrop to close (mobile)

### Menu Item Hover

- **Highlight**: Background color change
- **Cursor**: Pointer cursor
- **Animation**: Smooth transition (100ms)

### Menu Item Click

- **Action**: Navigate to page or logout
- **Close**: Close menu after click
- **Navigation**: Use Vue Router for navigation

### Keyboard Navigation

- **Tab**: Navigate through menu items
- **Arrow Keys**: Navigate up/down
- **Enter**: Activate selected item
- **Escape**: Close menu

---

## 8️⃣ Accessibility

### Keyboard Navigation

- **Tab**: Navigate through menu items
- **Shift+Tab**: Navigate backwards
- **Enter/Space**: Activate item
- **Arrow Keys**: Navigate up/down
- **Home**: Go to first item
- **End**: Go to last item
- **Escape**: Close menu

### Screen Reader Support

```html
<div 
  role="menu" 
  aria-label="User menu"
  aria-hidden="false"
>
  <div class="user-info">
    <img src="avatar.jpg" alt="User avatar" />
    <div>
      <div>John Doe</div>
      <div>john@example.com</div>
    </div>
  </div>
  
  <a 
    href="/profile" 
    role="menuitem"
  >
    <span aria-hidden="true">👤</span>
    <span>Profile</span>
  </a>
  
  <a 
    href="/settings" 
    role="menuitem"
  >
    <span aria-hidden="true">⚙️</span>
    <span>Settings</span>
  </a>
  
  <button 
    role="menuitem"
    aria-label="Logout"
  >
    <span aria-hidden="true">🚪</span>
    <span>Logout</span>
  </button>
</div>
```

### Color Contrast

- **Text on Background**: WCAG AA (4.5:1 minimum)
- **Hover State**: Sufficient contrast

### Focus Indicators

- **Visible Focus Ring**: 2px solid blue (#3B82F6)
- **Focus Offset**: 2px from element

---

## 9️⃣ Performance Considerations

### Data Loading

- **Lazy Load**: Load user info on demand
- **Caching**: Cache user info for session
- **No API Calls**: Use store data

### Optimization

- **Memoize**: Memoize user info
- **Avoid Re-renders**: Use computed properties
- **Code Splitting**: Lazy load menu component

---

## 🔟 Technical Constraints

- **Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS utility classes
- **State Management**: Pinia for stores
- **Routing**: Vue Router for navigation
- **Browser Support**: Modern browsers
- **Accessibility**: WCAG 2.1 Level AA compliance

---

## 1️⃣1️⃣ Component Architecture & Implementation

### Component Contracts

#### `UserMenu.vue` (Presentational)

**Responsibility:** Display user profile dropdown menu

**Props:**
```typescript
interface UserMenuProps {
  userName: string
  userEmail: string
  userAvatar?: string
  open?: boolean
}
```

**Emits:**
```typescript
{
  'logout': void
  'navigate-to-profile': void
  'navigate-to-settings': void
  'close': void
}
```

**State:**
```typescript
{
  isOpen: boolean
  highlightedIndex: number
}
```

---

## 📋 Implementation Checklist

### Phase 1: Basic Menu (Week 1)

- [ ] Create `UserMenu.vue` component
- [ ] Add user info display
- [ ] Add menu items
- [ ] Add logout button
- [ ] Write unit tests

### Phase 2: Interactions (Week 2)

- [ ] Implement open/close logic
- [ ] Add click-outside handling
- [ ] Add keyboard navigation
- [ ] Add hover effects
- [ ] Write tests

### Phase 3: Accessibility & Polish (Week 3)

- [ ] Implement keyboard navigation
- [ ] Add ARIA labels and roles
- [ ] Test with screen readers
- [ ] Add focus management
- [ ] Final testing

---

## 🎯 Success Criteria

- ✅ Menu displays user info correctly
- ✅ Menu opens/closes correctly
- ✅ Menu items navigate correctly
- ✅ Logout button works
- ✅ Click-outside closes menu
- ✅ Escape key closes menu
- ✅ All keyboard navigation works
- ✅ Screen reader announces all content
- �� Color contrast meets WCAG AA
- ✅ No console errors or warnings

# NavItem Component Design Specification

## 1️⃣ Purpose

The NavItem component represents an individual navigation item in the AppSidebar. It displays an icon, label, optional badge, and manages active state highlighting. This component handles navigation, keyboard focus, and hover effects while maintaining accessibility standards.

---

## 2️⃣ User Actions

### Primary Actions

- **Navigate**: Click item to navigate to page
- **View Active State**: See current page highlighted
- **View Badge**: See notification badge if present
- **Hover**: See hover effect on desktop

### Secondary Actions

- **Keyboard Navigation**: Navigate with arrow keys
- **Keyboard Activation**: Press Enter to navigate

### Keyboard Shortcuts

- **Tab**: Navigate to item
- **Enter/Space**: Activate item
- **Arrow Keys**: Navigate between items

---

## 3️⃣ Data Requirements

### Navigation Item Data

```typescript
interface NavItem {
  id: string
  label: string
  icon: string // Icon name or component
  path: string // Route path
  badge?: number // Notification badge
  active?: boolean // Active state
  disabled?: boolean // Disabled state
  children?: NavItem[] // Nested items (future)
}
```

### Data Sources

- **Props**: Navigation item data
- **Route**: Current route for active state
- **Store**: Badge count from store

---

## 4️⃣ UI States

### Normal State

```
┌──────────────────────┐
│ 📊 Dashboard         │
└──────────────────────┘
```

### Active State

```
┌──────────────────────┐
│ 📊 Dashboard         │ ← Highlighted
└──────────────────────┘
```

### With Badge

```
┌──────────────────────┐
│ 📋 Inventory      [5]│
└──────────────────────┘
```

### Hover State

```
┌──────────────────────┐
│ 📊 Dashboard         │ ← Highlighted
└──────────────────────┘
```

### Collapsed State

```
┌──┐
│📊│
└──┘
```

### Collapsed with Badge

```
┌──┐
│📋│ [5]
└──┘
```

### Disabled State

```
┌──────────────────────┐
│ 📊 Dashboard (gray)  │
└──────────────────────┘
```

---

## 5️⃣ Layout & Components

### Item Layout

```
NavItem.vue
├── Icon
├── Label (if not collapsed)
└── Badge (if present)
```

### Component Breakdown

```
┌──────────────────────┐
│ [Icon] Label    [5]  │
└──────────────────────┘
```

### Spacing & Sizing

- **Item Height**: 48px
- **Icon Size**: 24x24px
- **Label Font Size**: 14px
- **Badge Size**: 20x20px
- **Padding**: 12px horizontal, 8px vertical
- **Gap Between Icon and Label**: 12px
- **Border Radius**: 6px

---

## 6️⃣ Responsive Design

### Desktop (>1024px)

- **Width**: Full sidebar width (240px)
- **Display**: Icon + Label + Badge
- **Tooltip**: None
- **Hover**: Highlight background

```
┌──────────────────────┐
│ 📊 Dashboard         │
└──────────────────────┘
```

### Tablet (768px - 1024px)

- **Width**: Full sidebar width (80px)
- **Display**: Icon + Badge only
- **Tooltip**: Show label on hover
- **Hover**: Highlight background

```
┌──┐
│📊│
└──┘
```

### Mobile (<768px)

- **Width**: Full sidebar width (100%)
- **Display**: Icon + Label + Badge
- **Tooltip**: None
- **Hover**: Highlight background (touch-friendly)

```
┌──────────────────────┐
│ 📊 Dashboard         │
└──────────────────────┘
```

---

## 7️⃣ Interaction Patterns

### Click Navigation

- **Action**: Navigate to page
- **Visual**: Highlight active item
- **Keyboard**: Tab to item, Enter to navigate
- **Mobile**: Close sidebar after navigation

### Hover Effects

- **Desktop**: Highlight background on hover
- **Mobile**: No hover (touch-friendly)
- **Animation**: Smooth transition (100ms)

### Badge Display

- **Show**: Display badge number if > 0
- **Position**: Top-right of icon
- **Color**: Red background with white text
- **Update**: Real-time updates from store

### Active State

- **Highlight**: Different background color
- **Icon**: Brighter color
- **Indicator**: Left border or background

### Tooltip (Collapsed)

- **Show**: On hover when collapsed
- **Content**: Full label
- **Position**: Right of icon
- **Animation**: Fade in/out (200ms)

---

## 8️⃣ Accessibility

### Keyboard Navigation

- **Tab**: Navigate to item
- **Shift+Tab**: Navigate backwards
- **Enter/Space**: Activate item
- **Arrow Keys**: Navigate up/down between items

### Screen Reader Support

```html
<a 
  href="/dashboard" 
  role="menuitem"
  aria-current="page"
  aria-label="Dashboard"
>
  <span aria-hidden="true">📊</span>
  <span>Dashboard</span>
  <span aria-label="5 items">5</span>
</a>
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

- **Lazy Load**: Load item data on demand
- **Caching**: Cache item data
- **Badges**: Update badges in real-time

### Optimization

- **Memoize**: Memoize active state
- **Avoid Re-renders**: Use computed properties
- **Code Splitting**: Lazy load page components

---

## 🔟 Technical Constraints

- **Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS utility classes
- **Routing**: Vue Router for navigation
- **Icons**: SVG or icon library
- **Browser Support**: Modern browsers
- **Accessibility**: WCAG 2.1 Level AA compliance

---

## 1️⃣1️⃣ Component Architecture & Implementation

### Component Contracts

#### `NavItem.vue` (Presentational)

**Responsibility:** Display individual navigation item

**Props:**
```typescript
interface NavItemProps {
  label: string
  icon: string
  path: string
  active?: boolean
  badge?: number
  disabled?: boolean
  collapsed?: boolean
}
```

**Emits:**
```typescript
{
  'navigate': { path: string }
}
```

**State:**
```typescript
{
  isHovered: boolean
  isFocused: boolean
}
```

---

## 📋 Implementation Checklist

### Phase 1: Basic Item (Week 1)

- [ ] Create `NavItem.vue` component
- [ ] Add icon and label
- [ ] Add badge display
- [ ] Implement active state
- [ ] Write unit tests

### Phase 2: Interactions (Week 2)

- [ ] Implement click navigation
- [ ] Add hover effects
- [ ] Add focus state
- [ ] Write tests

### Phase 3: Responsive & Accessibility (Week 3)

- [ ] Implement collapsed state
- [ ] Add tooltip on hover
- [ ] Implement keyboard navigation
- [ ] Add ARIA labels and roles
- [ ] Test with screen readers
- [ ] Final testing

---

## 🎯 Success Criteria

- ✅ Item displays correctly
- ✅ Icon and label display
- ✅ Badge displays correctly
- ✅ Active state highlights
- ✅ Click navigates to page
- ✅ Hover effect works
- ✅ Collapsed state works
- ✅ Tooltip shows on hover (collapsed)
- ✅ All keyboard navigation works
- ✅ Screen reader announces all content
- ✅ Color contrast meets WCAG AA
- ✅ No console errors or warnings

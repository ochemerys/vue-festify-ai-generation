# Toast Component Design Specification

## 1️⃣ Purpose

The Toast component provides non-intrusive notifications for user feedback. It displays temporary messages with different types (success, error, warning, info) and auto-dismisses after a configurable duration. This component is used throughout the application for feedback on user actions.

---

## 2️⃣ User Actions

### Primary Actions

- **View Toast**: See notification message
- **Close Toast**: Click close button to dismiss
- **Wait for Auto-dismiss**: Wait for notification to disappear

### Secondary Actions

- **Read Message**: Understand notification content
- **Click Action**: Perform action from toast (if provided)

---

## 3️⃣ Data Requirements

### Toast Data

```typescript
interface ToastData {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number // Auto-dismiss duration in ms
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'top-center' | 'bottom-center'
  action?: {
    label: string
    callback: () => void
  }
}
```

---

## 4️⃣ UI States

### Success Toast

```
┌──────────────────────────────────┐
│ ✓ Product created successfully   │ [✕]
└──────────────────────────────────┘
```

### Error Toast

```
┌──────────────────────────────────┐
│ ✗ Failed to save product         │ [✕]
└──────────────────────────────────┘
```

### Warning Toast

```
┌──────────────────────────────────┐
│ ⚠ Low stock alert                │ [✕]
└──────────────────────────────────┘
```

### Info Toast

```
┌──────────────────────────────────┐
│ ℹ System maintenance scheduled   │ [✕]
└──────────────────────────────────┘
```

### With Action

```
┌────────────────────────────────��─┐
│ ✓ Product created successfully   │ [Undo] [✕]
└──────────────────────────────────┘
```

---

## 5️⃣ Layout & Components

### Toast Layout

```
Toast.vue
├── Icon
├── Message
├── Action Button (if provided)
└── Close Button
```

### Component Breakdown

```
┌──────────────────────────────────┐
│ [Icon] Message          [Action] [✕]
└──────────────────────────────────┘
```

### Spacing & Sizing

- **Toast Width**: 400px
- **Toast Height**: 56px
- **Icon Size**: 20x20px
- **Padding**: 16px
- **Gap Between Elements**: 12px
- **Border Radius**: 6px
- **Z-Index**: 1000+

---

## 6️⃣ Responsive Design

### Desktop (>1024px)

- **Width**: 400px
- **Position**: Fixed, top-right (default)
- **Margin**: 16px from edge
- **Animation**: Slide in from right

```
                    ┌──────────────────────────────────┐
                    │ ✓ Product created successfully   │
                    └──────��───────────────────────────┘
```

### Tablet (768px - 1024px)

- **Width**: 90% max 400px
- **Position**: Fixed, top-right
- **Margin**: 12px from edge
- **Animation**: Slide in from right

```
                ┌──────────────────────────────┐
                │ ✓ Product created            │
                └──────────────────────────────┘
```

### Mobile (<768px)

- **Width**: 90% with 16px padding
- **Position**: Fixed, top or bottom
- **Margin**: 12px from edge
- **Animation**: Slide in from top/bottom

```
┌──────────────────────────────┐
│ ✓ Product created            │
└──────────────────────────────┘
```

---

## 7️⃣ Interaction Patterns

### Auto-dismiss

- **Duration**: 3-5 seconds (configurable)
- **Animation**: Fade out (200ms)
- **Progress**: Optional progress bar

### Close Button

- **Click**: Dismiss toast immediately
- **Keyboard**: Tab to button, Enter to dismiss
- **Visual**: Hover effect

### Action Button

- **Click**: Execute action and dismiss
- **Keyboard**: Tab to button, Enter to activate
- **Visual**: Hover effect

### Multiple Toasts

- **Stack**: Stack multiple toasts vertically
- **Position**: Maintain position for each
- **Animation**: Stagger animations

---

## 8️⃣ Accessibility

### Keyboard Navigation

- **Tab**: Navigate to close/action buttons
- **Shift+Tab**: Navigate backwards
- **Enter/Space**: Activate button

### Screen Reader Support

```html
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true"
  class="toast"
>
  <span aria-hidden="true" class="icon">✓</span>
  <span class="message">Product created successfully</span>
  <button aria-label="Close notification">✕</button>
</div>
```

### Color Contrast

- **Success**: Green (#16A34A) on white (4.5:1)
- **Error**: Red (#DC2626) on white (5.2:1)
- **Warning**: Orange (#EA580C) on white (4.5:1)
- **Info**: Blue (#2563EB) on white (4.5:1)

---

## 9️⃣ Performance Considerations

### Animation

- **GPU Acceleration**: Use transform for animations
- **Debounce**: Debounce toast creation
- **Cleanup**: Remove dismissed toasts from DOM

### Optimization

- **Lazy Render**: Only render visible toasts
- **Code Splitting**: Lazy load toast component

---

## 🔟 Technical Constraints

- **Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS utility classes
- **Animation**: CSS animations or Vue transitions
- **Browser Support**: Modern browsers
- **Accessibility**: WCAG 2.1 Level AA compliance

---

## 1️⃣1️⃣ Component Architecture & Implementation

### Component Contracts

#### `Toast.vue` (Shared)

**Responsibility:** Display toast notification

**Props:**
```typescript
interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: string
  action?: {
    label: string
    callback: () => void
  }
}
```

**Emits:**
```typescript
{
  'close': void
  'action': void
}
```

---

### Composable

#### `useToast()` Composable

**Responsibility:** Manage toast notifications

**Returns:**
```typescript
{
  toasts: Ref<Toast[]>
  
  showToast(message: string, type: string, duration?: number): void
  showSuccess(message: string, duration?: number): void
  showError(message: string, duration?: number): void
  showWarning(message: string, duration?: number): void
  showInfo(message: string, duration?: number): void
  dismissToast(id: string): void
  clearAll(): void
}
```

---

## 📋 Implementation Checklist

### Phase 1: Basic Toast (Week 1)

- [ ] Create `Toast.vue` component
- [ ] Add message display
- [ ] Add type styling (success, error, warning, info)
- [ ] Add close button
- [ ] Write unit tests

### Phase 2: Auto-dismiss & Actions (Week 2)

- [ ] Implement auto-dismiss
- [ ] Add action button support
- [ ] Create `useToast()` composable
- [ ] Write tests

### Phase 3: Accessibility & Polish (Week 3)

- [ ] Implement keyboard navigation
- [ ] Add ARIA labels and roles
- [ ] Test with screen readers
- [ ] Optimize animations
- [ ] Final testing

---

## 🎯 Success Criteria

- ✅ Toast displays correctly
- ✅ Toast auto-dismisses after duration
- ✅ Close button works
- ✅ Action button works
- ✅ Multiple toasts stack correctly
- ✅ All keyboard navigation works
- ✅ Screen reader announces all content
- ✅ Color contrast meets WCAG AA
- ✅ Responsive on all breakpoints
- ✅ No console errors or warnings

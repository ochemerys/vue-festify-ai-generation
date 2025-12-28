# FormField Component Design Specification

## 1️⃣ Purpose

The FormField component provides a reusable wrapper for form inputs with integrated label, error message, help text, and validation state display. It ensures consistent form styling and accessibility across the application while reducing code duplication in form components.

---

## 2️⃣ User Actions

### Primary Actions

- **Enter Value**: Type into input field
- **View Label**: See field label
- **View Error**: See validation error message
- **View Help**: See help text
- **Focus Field**: Click or tab to field

### Secondary Actions

- **Clear Field**: Clear input value
- **Toggle Password**: Show/hide password (if applicable)

### Keyboard Shortcuts

- **Tab**: Navigate to field
- **Enter**: Submit form (if applicable)
- **Escape**: Clear field (optional)

---

## 3️⃣ Data Requirements

### Field Data

```typescript
interface FormFieldData {
  label: string
  type: string // 'text', 'email', 'password', 'number', 'textarea', 'select'
  value: any
  error?: string
  help?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  minLength?: number
  pattern?: string
}
```

### Data Sources

- **Props**: Field configuration
- **Slots**: Input element

---

## 4️⃣ UI States

### Normal State

```
┌─────────────────────────────────────┐
│ Email Address *                     │
│ [_____________________________]     │
│ Enter your email address            │
└─────────────────────────────────────┘
```

### Focused State

```
┌─────────────────────────────────────┐
│ Email Address *                     │
│ [_____________________________]     │ ← Blue border
│ Enter your email address            │
└─────────────────────────────────────┘
```

### Error State

```
┌───────────────────────��─────────────┐
│ Email Address *                     │
│ [_____________________________]     │ ← Red border
│ ✗ Invalid email format              │ ← Error message
└─────────────────────────────────────┘
```

### Success State

```
┌─────────────────────────────────────┐
│ Email Address *                     │
│ [_____________________________]     │ ← Green border
│ ✓ Email is valid                    │ ← Success message
└─────────────────────────────────────┘
```

### Disabled State

```
┌─────────────────────────────────────┐
│ Email Address                       │
│ [_____________________________]     │ ← Gray, disabled
│ Enter your email address            │
└─────────────────────────────────────┘
```

---

## 5️⃣ Layout & Components

### Field Layout

```
FormField.vue
├── Label
│   ├── Label Text
│   └── Required Indicator (if required)
��── Input Container
│   ├── Input Element
│   └── Validation Icon (if error/success)
├── Error Message (if error)
└── Help Text (if provided)
```

### Component Breakdown

```
┌─────────────────────────────────────┐
│ Label Text *                        │ ← Label
│ [_____________________________]     │ ← Input
│ ✗ Error message                     │ ← Error
│ Help text goes here                 │ ← Help
└─────────────────────────────────────┘
```

### Spacing & Sizing

- **Label Font Size**: 14px
- **Input Height**: 40px
- **Input Padding**: 12px
- **Border Radius**: 6px
- **Gap Between Elements**: 8px
- **Error Font Size**: 12px
- **Help Font Size**: 12px

---

## 6️⃣ Responsive Design

### Desktop (>1024px)

- **Width**: Full width or specified width
- **Layout**: Vertical (label above input)
- **Input**: Full width

```
┌─────────────────────────────────────┐
│ Label Text *                        │
│ [_____________________________]     │
│ Help text                           │
└─────────────────────────────────────┘
```

### Tablet (768px - 1024px)

- **Width**: Full width or specified width
- **Layout**: Vertical (label above input)
- **Input**: Full width

```
┌──────────────────────────┐
│ Label Text *             │
│ [__________________]     │
│ Help text                │
└──────────────────────────┘
```

### Mobile (<768px)

- **Width**: 100%
- **Layout**: Vertical (label above input)
- **Input**: Full width
- **Touch Targets**: Minimum 44px height

```
┌──────────────────────┐
│ Label Text *         │
│ [________________]   │
│ Help text            │
└──────────────────────┘
```

---

## 7️⃣ Interaction Patterns

### Focus

- **Border**: Blue border on focus
- **Shadow**: Subtle shadow on focus
- **Animation**: Smooth transition (100ms)

### Error Display

- **Border**: Red border on error
- **Icon**: Red X icon
- **Message**: Red error text
- **Animation**: Shake animation (optional)

### Success Display

- **Border**: Green border on success
- **Icon**: Green checkmark icon
- **Message**: Green success text

### Input Interaction

- **Type**: Real-time validation feedback
- **Blur**: Validate on blur
- **Change**: Update parent on change

---

## 8️⃣ Accessibility

### Keyboard Navigation

- **Tab**: Navigate to field
- **Shift+Tab**: Navigate backwards
- **Enter**: Submit form (if applicable)
- **Arrow Keys**: Navigate options (if select)

### Screen Reader Support

```html
<div class="form-field">
  <label for="email">
    Email Address
    <span aria-label="required">*</span>
  </label>
  
  <input 
    id="email" 
    type="email" 
    aria-required="true"
    aria-describedby="email-error email-help"
  />
  
  <span id="email-error" role="alert" class="error">
    Invalid email format
  </span>
  
  <span id="email-help" class="help">
    Enter your email address
  </span>
</div>
```

### Color Contrast

- **Label**: WCAG AA (4.5:1 minimum)
- **Input Border**: WCAG AA (3:1 minimum)
- **Error Text**: Red (#DC2626) on white (5.2:1)
- **Success Text**: Green (#16A34A) on white (4.5:1)

### Focus Indicators

- **Visible Focus Ring**: 2px solid blue (#3B82F6)
- **Focus Offset**: 2px from element
- **High Contrast Mode**: Thicker border (3px)

---

## 9️⃣ Performance Considerations

### Rendering

- **Lazy Render**: Only render visible fields
- **Memoization**: Memoize field state
- **Debounce**: Debounce validation

### Optimization

- **Avoid Re-renders**: Use computed properties
- **Code Splitting**: Lazy load field types

---

## 🔟 Technical Constraints

- **Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS utility classes
- **Validation**: Zod or Vee-Validate
- **Browser Support**: Modern browsers
- **Accessibility**: WCAG 2.1 Level AA compliance

---

## 1️⃣1️⃣ Component Architecture & Implementation

### Component Contracts

#### `FormField.vue` (Presentational)

**Responsibility:** Wrapper for form inputs with label and validation

**Props:**
```typescript
interface FormFieldProps {
  label: string
  type?: string
  value?: any
  error?: string
  help?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  minLength?: number
}
```

**Emits:**
```typescript
{
  'update:modelValue': (value: any) => void
  'blur': void
  'focus': void
}
```

**Slots:**
```typescript
{
  default: void // Input element
  error?: void // Custom error slot
  help?: void // Custom help slot
}
```

---

## 📋 Implementation Checklist

### Phase 1: Basic Field (Week 1)

- [ ] Create `FormField.vue` component
- [ ] Add label display
- [ ] Add input slot
- [ ] Add error message display
- [ ] Add help text display
- [ ] Write unit tests

### Phase 2: Validation (Week 2)

- [ ] Add error state styling
- [ ] Add success state styling
- [ ] Add validation icons
- [ ] Add required indicator
- [ ] Write tests

### Phase 3: Accessibility & Polish (Week 3)

- [ ] Implement keyboard navigation
- [ ] Add ARIA labels and roles
- [ ] Test with screen readers
- [ ] Add focus management
- [ ] Final testing

---

## 🎯 Success Criteria

- ✅ Field renders correctly
- ✅ Label displays correctly
- ✅ Input slot works
- ✅ Error message displays
- ✅ Help text displays
- ✅ Required indicator shows
- ✅ Error state styling works
- ✅ Success state styling works
- ✅ All keyboard navigation works
- ✅ Screen reader announces all content
- ✅ Color contrast meets WCAG AA
- ✅ Responsive on all breakpoints
- ✅ No console errors or warnings

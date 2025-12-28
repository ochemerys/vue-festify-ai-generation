# Inventory Adjust Page Design Specification

## 1️⃣ Purpose

The Inventory Adjust Page provides a dedicated interface for manually adjusting product inventory quantities. It handles stock corrections, damage adjustments, and other inventory modifications with comprehensive tracking and audit trails. This page ensures accurate inventory records and maintains data integrity.

---

## 2️⃣ User Actions

### Primary Actions

- **Select Product**: Choose product to adjust
- **View Current Quantity**: Display current stock level
- **Enter New Quantity**: Input adjusted quantity
- **Select Reason**: Choose adjustment reason
- **Add Notes**: Optional notes for adjustment
- **Confirm Adjustment**: Submit adjustment
- **Cancel**: Discard changes

### Secondary Actions

- **View History**: See previous adjustments
- **Adjust Another**: Quick adjust another product
- **Print Receipt**: Print adjustment receipt

### Keyboard Shortcuts

- **Ctrl+S**: Submit adjustment
- **Escape**: Cancel and go back
- **Tab**: Navigate between fields

---

## 3️⃣ Data Requirements

### Adjustment Form Data

```typescript
interface StockAdjustmentData {
  productId: string
  currentQuantity: number
  newQuantity: number
  quantityChange: number
  reason: 'damage' | 'loss' | 'recount' | 'return' | 'correction' | 'other'
  notes?: string
  adjustedBy: string
  adjustedAt: Date
}
```

### Adjustment Reasons

```typescript
const adjustmentReasons = [
  { value: 'damage', label: 'Damaged Goods' },
  { value: 'loss', label: 'Lost/Stolen' },
  { value: 'recount', label: 'Physical Recount' },
  { value: 'return', label: 'Customer Return' },
  { value: 'correction', label: 'System Correction' },
  { value: 'other', label: 'Other' }
]
```

### Data Sources

- **API Endpoints**:
  - `GET /api/products` (product search)
  - `GET /api/products/:id` (product details)
  - `POST /api/inventory/adjust` (submit adjustment)
- **Store**: `useInventoryStore` for adjustment data

---

## 4️⃣ UI States

### Initial State

```
┌─────────────────────────────────────────────────────────┐
│ Adjust Inventory                                        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Select Product *                                    │ │
│ │ [Search or select product...] [▼]                   │ │
│ │                                                     │ │
│ │ Current Quantity                                    │ │
│ │ [Not selected]                                      │ │
│ │                                                     │ │
│ │ New Quantity *                                      │ │
│ │ [_____________________________]                     │ │
│ │                                                     │ │
│ │ Adjustment Reason *                                 │ │
│ │ [Select reason...] [▼]                              │ │
│ │                                                     │ │
│ │ Notes                                               │ │
│ │ [_____________________________]                     │ │
│ │ [_____________________________]                     │ │
│ │                                                     │ │
│ │ [Cancel] [Confirm Adjustment]                       │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Product Selected State

```
┌─────────────────────────────────────────────────────────┐
│ Adjust Inventory                                        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Select Product *                                    │ │
│ │ [Widget A (WID-001)] [✕]                            │ │
│ │                                                     │ │
│ │ Current Quantity                                    │ │
│ │ 150 units                                           │ │
│ │                                                     │ │
│ │ New Quantity *                                      │ │
│ │ [150_____________________________]                  │ │
│ │ Change: 0 units                                     │ │
│ │                                                     │ │
│ │ Adjustment Reason *                                 │ │
│ │ [Select reason...] [▼]                              │ │
│ │                                                     │ │
│ │ Notes                                               │ │
│ │ [_____________________________]                     │ │
│ │ [_____________________________]                     │ │
│ │                                                     │ │
│ │ [Cancel] [Confirm Adjustment]                       │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Confirmation State

```
┌─────────────────────────────────────────────────────────┐
│ Confirm Adjustment                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Product: Widget A (WID-001)                             │
│ Current Quantity: 150 units                             │
│ New Quantity: 145 units                                 │
│ Change: -5 units                                        │
│ Reason: Damaged Goods                                   │
│ Notes: Water damage from warehouse incident             │
│                                                         │
│ Are you sure you want to adjust the inventory?          │
│                                                         │
│ [Cancel] [Confirm]                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Success State

```
┌─────────────────────────────────────────────────────────┐
│ ✓ Inventory Adjusted Successfully!                      │
│                                                         │
│ Product: Widget A (WID-001)                             │
│ Previous Quantity: 150 units                            │
│ New Quantity: 145 units                                 │
│ Change: -5 units                                        │
│                                                         │
│ [View Product] [Adjust Another] [Go Back]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5️⃣ Layout & Components

### Form Layout

```
InventoryAdjustPage.vue
├── Page Header
│   ├── Title
│   └── Breadcrumb
├── Form Container
│   ├── Product Selection Section
│   │   ├── Product Search/Select
│   │   └── Current Quantity Display
│   ├── Adjustment Section
│   │   ├── New Quantity Input
│   │   ├── Change Display
│   │   ├── Reason Select
│   │   └── Notes Textarea
│   └── Form Actions
│       ├── Cancel Button
│       └── Confirm Button
├── Confirmation Modal (Conditional)
│   ├── Summary
│   ├── Confirm Button
│   └── Cancel Button
└── Success Modal (Conditional)
    ├── Success Message
    ├── Adjustment Summary
    └── Action Buttons
```

### Two-Column Layout (Desktop)

```
┌──────────────────────────────────────────────────────────┐
│ Adjust Inventory                                         │
├──────────────────────────────────────────────────────────┤
│ ┌─���──────────────────────┬────────────────────────────┐  │
│ │ Select Product *       │ Current Quantity           │  │
│ │ [Search...] [▼]        │ 150 units                  │  │
│ │                        │                            │  │
│ │ New Quantity *         │ Change                     │  │
│ │ [150_____________]     │ 0 units                    │  │
│ │                        │                            │  │
│ │ Adjustment Reason *    │ Notes                      │  │
│ │ [Select...] [▼]        │ [_____________________]    │  │
│ │                        │ [_____________________]    │  │
│ │                        │                            │  │
│ │ [Cancel] [Confirm]     │                            │  │
│ │                        │                            │  │
│ └────────────────────────┴────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Spacing & Sizing

- **Form Padding**: 32px
- **Section Spacing**: 24px
- **Field Spacing**: 16px
- **Column Gap**: 20px
- **Input Height**: 40px
- **Button Height**: 44px
- **Max Width**: 600px

---

## 6️⃣ Responsive Design

### Desktop (>1024px)

- **Layout**: Two-column form
- **Width**: 600px max width, centered
- **Sections**: Grouped logically
- **Buttons**: Side by side

### Tablet (768px - 1024px)

- **Layout**: Single column
- **Width**: 90% max 500px
- **Sections**: Stacked vertically
- **Buttons**: Full width stacked

### Mobile (<768px)

- **Layout**: Single column, full width
- **Width**: 100% with 16px padding
- **Sections**: Stacked vertically
- **Buttons**: Full width stacked

---

## 7️⃣ Interaction Patterns

### Product Selection

- **Search**: Type to search products
- **Dropdown**: Click to open product list
- **Select**: Click product to select
- **Clear**: Click X to clear selection
- **Auto-Fill**: Auto-fill current quantity when product selected

### Quantity Input

- **Focus**: Blue border, shadow effect
- **Typing**: Real-time calculation of change
- **Validation**: Validate non-negative number
- **Display Change**: Show quantity change in real-time

### Reason Selection

- **Click**: Open dropdown menu
- **Hover**: Highlight option
- **Select**: Close dropdown, show selected reason
- **Keyboard**: Arrow keys to navigate, Enter to select

### Form Submission

1. User selects product
2. User enters new quantity
3. User selects reason
4. User optionally adds notes
5. User clicks Confirm
6. Show confirmation modal
7. User confirms adjustment
8. Submit to API
9. Show success message

---

## 8️⃣ Accessibility

### Keyboard Navigation

- **Tab**: Navigate through all form fields
- **Shift+Tab**: Navigate backwards
- **Enter**: Submit form or open dropdown
- **Space**: Toggle dropdown
- **Arrow Keys**: Navigate dropdown options
- **Escape**: Close dropdown or cancel form

### Screen Reader Support

```html
<form aria-label="Inventory adjustment form">
  <fieldset>
    <legend>Adjustment Information</legend>
    
    <div>
      <label for="product">Select Product <span aria-label="required">*</span></label>
      <input 
        id="product" 
        type="text" 
        aria-required="true"
        aria-describedby="product-error"
        aria-autocomplete="list"
      />
      <span id="product-error" role="alert"></span>
    </div>
    
    <div>
      <label for="current">Current Quantity</label>
      <output id="current">150 units</output>
    </div>
    
    <div>
      <label for="new">New Quantity <span aria-label="required">*</span></label>
      <input 
        id="new" 
        type="number" 
        aria-required="true"
        aria-describedby="new-error change-display"
      />
      <span id="change-display" role="status">Change: 0 units</span>
      <span id="new-error" role="alert"></span>
    </div>
    
    <div>
      <label for="reason">Reason <span aria-label="required">*</span></label>
      <select 
        id="reason" 
        aria-required="true"
        aria-describedby="reason-error"
      >
        <option value="">Select reason</option>
      </select>
      <span id="reason-error" role="alert"></span>
    </div>
    
    <div>
      <label for="notes">Notes</label>
      <textarea id="notes" aria-describedby="notes-help"></textarea>
      <span id="notes-help">Optional notes about this adjustment</span>
    </div>
  </fieldset>
  
  <button type="submit" aria-busy="false">Confirm Adjustment</button>
  <button type="button">Cancel</button>
</form>
```

### Color Contrast

- **Labels**: WCAG AA (4.5:1 minimum)
- **Input Borders**: WCAG AA (3:1 minimum)
- **Error Messages**: Red (#DC2626) on white (5.2:1)

### Focus Indicators

- **Visible Focus Ring**: 2px solid blue (#3B82F6)
- **Focus Offset**: 2px from element

---

## 9️⃣ Performance Considerations

### Data Loading

- **Lazy Load**: Load products on demand
- **Debounce**: Debounce product search (300ms)
- **Caching**: Cache product list

### API Optimization

- **Single Request**: One API call to adjust inventory
- **Timeout**: 10-second timeout
- **Retry Logic**: Automatic retry on network failure
- **Error Handling**: Graceful degradation

---

## 🔟 Technical Constraints

- **Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS utility classes
- **State Management**: Pinia for inventory store
- **Form Validation**: Zod or Vee-Validate
- **API**: RESTful endpoints
- **Browser Support**: Modern browsers
- **Accessibility**: WCAG 2.1 Level AA compliance

---

## 1️⃣1️⃣ Component Architecture & Implementation

### Component Contracts

#### `InventoryAdjustPage.vue` (Container)

**Responsibility:** Manage inventory adjustment form and submission

**Props:**
```typescript
interface InventoryAdjustPageProps {
  productId?: string // Pre-select product
}
```

**State:**
```typescript
{
  selectedProduct: Product | null
  newQuantity: number
  reason: string
  notes: string
  loading: boolean
  error: string | null
  submitting: boolean
}
```

---

### Composables

#### `useInventoryAdjustment()` Composable

**Responsibility:** Handle adjustment form state and submission

**Returns:**
```typescript
{
  selectedProduct: Ref<Product | null>
  newQuantity: Ref<number>
  reason: Ref<string>
  notes: Ref<string>
  loading: Ref<boolean>
  error: Ref<string | null>
  
  selectProduct(product: Product): void
  calculateChange(): number
  validateForm(): boolean
  submitAdjustment(): Promise<void>
  resetForm(): void
}
```

---

## 📋 Implementation Checklist

### Phase 1: Form Structure (Week 1)

- [ ] Create `InventoryAdjustPage.vue` component
- [ ] Create `StockAdjustmentForm.vue` component
- [ ] Implement form layout
- [ ] Add form fields
- [ ] Write unit tests

### Phase 2: Product Selection (Week 2)

- [ ] Implement product search
- [ ] Add product dropdown
- [ ] Auto-fill current quantity
- [ ] Add product selection validation
- [ ] Write tests

### Phase 3: Adjustment Logic (Week 3)

- [ ] Implement quantity input
- [ ] Calculate change in real-time
- [ ] Add reason selection
- [ ] Add notes field
- [ ] Write tests

### Phase 4: Submission & Confirmation (Week 4)

- [ ] Implement confirmation modal
- [ ] Integrate with API
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success message
- [ ] Write integration tests

### Phase 5: Polish & Accessibility (Week 5)

- [ ] Implement accessibility
- [ ] Test on mobile
- [ ] Optimize performance
- [ ] Add keyboard shortcuts
- [ ] Final testing

---

## 🎯 Success Criteria

- ✅ Product search works correctly
- ✅ Current quantity displays correctly
- ✅ Quantity change calculates in real-time
- ✅ Form validates all required fields
- ✅ Confirmation modal displays correctly
- ✅ Adjustment submits to API
- ✅ Success message displays
- ✅ All keyboard navigation works
- ✅ Screen reader announces all content
- ✅ Color contrast meets WCAG AA
- ✅ Responsive on all breakpoints

# Inventory List Page Design Specification

## 1️⃣ Purpose

The Inventory List Page provides a comprehensive view of all inventory levels across the product catalog. It enables users to monitor stock quantities, identify low-stock items, and manage inventory adjustments. This page serves as the primary interface for inventory monitoring and control.

---

## 2️⃣ User Actions

### Primary Actions

- **View Inventory Levels**: Browse all product stock quantities
- **Filter by Stock Status**: Filter by in-stock, low-stock, out-of-stock
- **Search Products**: Find products by name or SKU
- **Adjust Stock**: Manually adjust inventory quantities
- **View History**: See transaction history for product
- **Create Purchase Order**: Order more stock
- **Reorder Products**: Quick reorder for low-stock items

### Secondary Actions

- **Export Inventory**: Export inventory list to CSV
- **Print Report**: Print inventory report
- **Set Reorder Levels**: Configure low-stock thresholds
- **Bulk Adjust**: Adjust multiple products at once

### Keyboard Shortcuts

- **Ctrl+F**: Focus search field
- **Ctrl+A**: Adjust stock for selected product
- **Ctrl+E**: Export inventory

---

## 3️⃣ Data Requirements

### Inventory Data

```typescript
interface InventoryItem {
  id: string
  productId: string
  productName: string
  sku: string
  category: string
  currentQuantity: number
  reorderLevel: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  lastRestockDate?: Date
  supplier: string
  price: number
}
```

### List Response

```typescript
interface InventoryListResponse {
  data: InventoryItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  summary: {
    totalItems: number
    inStockCount: number
    lowStockCount: number
    outOfStockCount: number
  }
}
```

### Filter Options

```typescript
interface InventoryFilters {
  search?: string
  category?: string
  status?: 'in-stock' | 'low-stock' | 'out-of-stock'
  supplier?: string
  lowStockOnly?: boolean
}
```

---

## 4️⃣ UI States

### Loading State

```
┌─────────────────────────────────────────────────────────┐
│ [Search...] [Filters ▼] [Adjust] [Export]              │
├──────────────────��──────────────────────────────────────┤
│ ⟳ Loading inventory...                                  │
│                                                         │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓ │ │
│ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓ │ │
│ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓ │ │
│ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Normal State

```
┌────────────────────────────────────────���────────────────┐
│ Inventory Levels                                        │
│ In Stock: 1,200 | Low Stock: 45 | Out of Stock: 8      │
├─────────────────────────────────────────────────────────┤
│ [Search...] [Filters ▼] [Adjust] [Export]              │
├─────────────────────────────────────────────────────────┤
│ Product Name    │ SKU      │ Current │ Reorder │ Status │
├─────────────────┼──────────┼─────────┼─────────┼────────┤
│ Widget A        │ WID-001  │ 150     │ 50      │ ✓ OK   │
│ Widget B        │ WID-002  │ 45      │ 50      │ ⚠ Low  │
│ Gadget X        │ GAD-001  │ 8       │ 50      │ ⚠ Low  │
│ Component Y     │ COM-001  │ 0       │ 50      ��� ✗ Out  │
│ Part Z          │ PAR-001  │ 200     │ 50      │ ✓ OK   │
├─────────────────┴──────────┴─────────┴─────────┴────────┤
│ Showing 1-5 of 1,247 products                           │
│ [< Previous] [1] [2] [3] ... [249] [Next >]             │
└─────────────────────────────────────────────────────────┘
```

### Empty State

```
┌─────────────────────────────────────────────────────────┐
│ [Search...] [Filters ▼] [Adjust] [Export]              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              📦 No Inventory Items Found                │
│                                                         │
│         No products match your filters.                 │
│                                                         │
│         [Clear Filters] [Add Products]                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5️⃣ Layout & Components

### Page Layout

```
InventoryListPage.vue
├── Header Section
│   ├── Page Title
│   └── Summary Stats
├── Filter & Search Section
│   ├── Search Input
│   ├── Filter Dropdown
│   ├── Status Filter
│   └── Reset Button
├── Inventory Table
│   ├── Table Header
│   ├── Table Body
│   │   └── InventoryRow (repeated)
│   └── Table Footer
│       └── Pagination
└── Modals (Conditional)
    ├── Stock Adjustment
    └── Bulk Actions
```

### Summary Stats

```
┌─────────────────────────────────────────────────────────┐
│ Inventory Levels                                        │
│ ┌──────────────┬──────────────┬──────────────┐          │
│ │ In Stock     │ Low Stock    │ Out of Stock │          │
│ │ 1,200        │ 45           │ 8            │          │
│ └──────────────┴──────────────┴──────────────┘          │
└─────────────────────────────────────────────────────────┘
```

---

## 6️⃣ Responsive Design

### Desktop (>1024px)

- **Layout**: Full table with all columns
- **Columns**: Product, SKU, Current, Reorder, Status, Actions
- **Summary**: Visible at top
- **Filters**: Horizontal filter bar

### Tablet (768px - 1024px)

- **Layout**: Simplified table
- **Columns**: Product, Current, Status, Actions
- **Summary**: Visible at top
- **Filters**: Dropdown filter menu

### Mobile (<768px)

- **Layout**: Card-based list view
- **Summary**: Visible at top
- **Filters**: Stacked filter inputs
- **Cards**: Show product, current stock, status

---

## 7️⃣ Interaction Patterns

### Search & Filter

- **Search**: Real-time search (debounced 300ms)
- **Status Filter**: Quick filter for stock status
- **Low Stock Toggle**: Show only low-stock items
- **Clear Filters**: Reset all filters

### Table Interactions

- **Row Click**: Navigate to product detail
- **Adjust Button**: Open stock adjustment modal
- **History Link**: View transaction history
- **Reorder Button**: Create purchase order

### Stock Adjustment

- **Click Adjust**: Open modal with current quantity
- **Enter New Quantity**: Input new stock level
- **Add Reason**: Select adjustment reason
- **Add Notes**: Optional notes field
- **Confirm**: Submit adjustment

---

## 8️⃣ Accessibility

### Keyboard Navigation

- **Tab**: Navigate through search, filters, table
- **Shift+Tab**: Navigate backwards
- **Enter**: Activate buttons, open modals
- **Space**: Toggle filters
- **Arrow Keys**: Navigate table rows

### Screen Reader Support

```html
<main aria-label="Inventory levels">
  <h1>Inventory Levels</h1>
  
  <section aria-label="Inventory summary">
    <dl>
      <dt>In Stock</dt>
      <dd>1,200</dd>
      <dt>Low Stock</dt>
      <dd>45</dd>
      <dt>Out of Stock</dt>
      <dd>8</dd>
    </dl>
  </section>
  
  <table role="grid" aria-label="Inventory table">
    <thead>
      <tr>
        <th scope="col">Product Name</th>
        <th scope="col">Current Quantity</th>
        <th scope="col">Reorder Level</th>
        <th scope="col">Status</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Product Name</td>
        <td>150</td>
        <td>50</td>
        <td role="status">In Stock</td>
        <td>
          <button aria-label="Adjust stock for Product Name">Adjust</button>
        </td>
      </tr>
    </tbody>
  </table>
</main>
```

### Color Contrast

- **Status Badges**: Color + text/icon for meaning
- **Text on Background**: WCAG AA (4.5:1 minimum)

---

## 9️⃣ Performance Considerations

### Data Loading

- **Pagination**: Load 10-25 items per page
- **Lazy Load**: Load product images on scroll
- **Caching**: Cache inventory list for 2 minutes
- **Virtual Scrolling**: For large lists (1000+ items)

### Search & Filter

- **Debounce**: Debounce search input (300ms)
- **Server-Side**: Perform filtering on server
- **Pagination**: Reset to page 1 on filter change

### API Optimization

- **Query Parameters**: Use efficient query strings
- **Pagination**: Limit results per request
- **Caching**: Cache summary stats

---

## 🔟 Technical Constraints

- **Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS utility classes
- **State Management**: Pinia for inventory store
- **API**: RESTful endpoints with pagination
- **Browser Support**: Modern browsers
- **Accessibility**: WCAG 2.1 Level AA compliance

---

## 1️⃣1️⃣ Component Architecture & Implementation

### Component Contracts

#### `InventoryListPage.vue` (Container)

**Responsibility:** Manage inventory list state and filtering

**Props:**
```typescript
interface InventoryListPageProps {
  initialFilters?: InventoryFilters
  pageSize?: number // Default: 10
}
```

**State:**
```typescript
{
  items: InventoryItem[]
  filters: InventoryFilters
  page: number
  pageSize: number
  total: number
  loading: boolean
  error: string | null
  summary: InventorySummary
}
```

---

## 📋 Implementation Checklist

### Phase 1: Core Table (Week 1)

- [ ] Create `InventoryListPage.vue` component
- [ ] Create `InventoryTable.vue` component
- [ ] Create `InventoryRow.vue` component
- [ ] Implement table rendering
- [ ] Add summary stats
- [ ] Write unit tests

### Phase 2: Search & Filter (Week 2)

- [ ] Create `InventoryFilters.vue` component
- [ ] Implement search functionality
- [ ] Add status filter
- [ ] Add low-stock toggle
- [ ] Write integration tests

### Phase 3: Actions (Week 3)

- [ ] Add adjust stock button
- [ ] Add reorder button
- [ ] Add view history link
- [ ] Implement modals
- [ ] Write tests

### Phase 4: Polish & Optimization (Week 4)

- [ ] Optimize performance
- [ ] Implement accessibility
- [ ] Test on mobile
- [ ] Add export functionality
- [ ] Final testing

---

## 🎯 Success Criteria

- ✅ Inventory items load and display
- �� Summary stats display correctly
- ✅ Search filters items in real-time
- ✅ Status filter works correctly
- ✅ Pagination navigates correctly
- ✅ Adjust stock button opens modal
- ✅ All keyboard navigation works
- ✅ Screen reader announces all content
- ✅ Color contrast meets WCAG AA
- ✅ Responsive on all breakpoints

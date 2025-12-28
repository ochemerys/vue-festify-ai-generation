# Product List Page Design Specification

## 1️⃣ Purpose

The Product List Page displays a comprehensive catalog of all products in the inventory system. It provides users with powerful search, filter, and sorting capabilities to quickly find products, manage inventory, and perform bulk operations. This page serves as the primary interface for product management and discovery.

---

## 2️⃣ User Actions

### Primary Actions

- **View Products**: Browse all products in table format
- **Search Products**: Find products by name, SKU, or category
- **Filter Products**: Filter by category, supplier, price range, stock status
- **Sort Products**: Sort by name, price, stock quantity, date added
- **Create Product**: Add new product to catalog
- **Edit Product**: Modify existing product details
- **Delete Product**: Remove product from catalog
- **View Details**: Navigate to product detail page

### Secondary Actions

- **Bulk Select**: Select multiple products
- **Bulk Delete**: Delete multiple products at once
- **Bulk Update**: Update multiple products (status, category, etc.)
- **Export Products**: Export product list to CSV/Excel
- **Import Products**: Bulk import products from file
- **Reset Filters**: Clear all active filters
- **Pagination**: Navigate through product pages

### Keyboard Shortcuts

- **Ctrl+N**: Create new product
- **Ctrl+F**: Focus search field
- **Ctrl+A**: Select all products
- **Delete**: Delete selected products
- **Enter**: Open selected product

---

## 3️⃣ Data Requirements

### Product Data

```typescript
interface Product {
  id: string
  name: string
  sku: string
  category: string
  supplier: string
  price: number
  cost: number
  quantity: number
  reorderLevel: number
  status: 'active' | 'inactive' | 'discontinued'
  image?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}
```

### List Response

```typescript
interface ProductListResponse {
  data: Product[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
```

### Filter Options

```typescript
interface ProductFilters {
  search?: string
  category?: string
  supplier?: string
  priceMin?: number
  priceMax?: number
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock'
  status?: 'active' | 'inactive' | 'discontinued'
}
```

### Sort Options

```typescript
interface SortOptions {
  field: 'name' | 'price' | 'quantity' | 'createdAt'
  direction: 'asc' | 'desc'
}
```

### Data Sources

- **API Endpoint**: `GET /api/products` with query parameters
- **Store**: `useProductStore` for product list and filters
- **Cache**: Implement pagination caching

---

## 4️⃣ UI States

### Loading State

```
┌─────────────────────────────────────────────────────────┐
│ [Search...] [Filters ▼] [+ Create] [Export]            │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⟳ Loading products...                              │ │
│ │                                                     │ │
│ │ ┌──────────┬──────────┬──────────┬──────────┐      │ │
│ │ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │      │ │
│ │ ├──────────┼──────────┼──────────┼──────────┤      │ │
│ │ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │      │ │
│ │ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │ ▓▓▓▓▓▓▓▓ │      │ │
│ │ └──────────┴──────────┴──────────┴──────────┘      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Skeleton loaders for table rows
- Spinner animation
- Disabled interactions
- "Loading products..." message

### Normal State

```
┌─────────────────────────────────────────────────────────┐
│ [Search...] [Filters ▼] [+ Create] [Export]            │
├─────────────────────────────────────────────────────────┤
│ ☐ │ Product Name    │ SKU      │ Price  │ Stock │ ...  │
├────┼─────────────────┼──────────┼────────┼───────┼──────┤
│ ☐ │ Widget A        │ WID-001  │ $29.99 │ 150   │ ✎ ✕  │
│ ☐ │ Widget B        │ WID-002  │ $39.99 │ 45    │ ✎ ✕  │
│ ☐ │ Gadget X        │ GAD-001  │ $99.99 │ 8     │ ✎ ✕  │
│ ☐ │ Component Y     │ COM-001  │ $15.99 │ 0     │ ✎ ✕  │
│ ☐ │ Part Z          │ PAR-001  │ $49.99 │ 200   │ ✎ ✕  │
├────┴─────────────────┴──────────┴────────┴───────┴──────┤
│ Showing 1-5 of 1,247 products                           │
│ [< Previous] [1] [2] [3] ... [249] [Next >]             │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Full product table with data
- Sortable column headers
- Row selection checkboxes
- Action buttons (edit, delete)
- Pagination controls

### Empty State

```
┌─────────────────────────────────────────────────────────┐
│ [Search...] [Filters ▼] [+ Create] [Export]            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    📦 No Products Found                 │
│                                                         │
│              No products match your filters.            │
│                                                         │
│              [Clear Filters] [+ Create Product]         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Empty state icon
- Helpful message
- Action buttons
- Clear filters option

### Error State

```
┌─────────────────���───────────────────────────────────────┐
│ [Search...] [Filters ▼] [+ Create] [Export]            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⚠ Failed to load products                             │
│  Error: Network connection failed                       │
│                                                         │
│  [Retry] [Go Back]                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Error icon and message
- Retry button
- Back navigation
- Error details

---

## 5️⃣ Layout & Components

### Page Layout

```
ProductListPage.vue
├── Header Section
│   ├── Page Title
│   └── Action Buttons
├── Filter & Search Section
│   ├── Search Input
│   ├── Filter Dropdown
│   ├── Sort Dropdown
│   └── Reset Button
├── Product Table
│   ├── Table Header
│   │   ├── Select All Checkbox
│   │   └── Column Headers (sortable)
│   ├── Table Body
│   │   └── ProductRow (repeated)
│   │       ├── Checkbox
│   │       ├── Product Info
│   │       ├── Price
│   │       ├── Stock
│   │       └── Actions
│   └── Table Footer
│       └── Pagination
└── Modals (Conditional)
    ├── Delete Confirmation
    └── Bulk Actions
```

### Component Breakdown

```
┌─────────────────────────────────────────────────────────┐
│ Product Catalog                    [+ Create] [Export]  │
├─────────────────────────────────────────────────────────┤
│ [Search...] [Category ▼] [Supplier ▼] [Price ▼] [✕]   │
├─────────────────────────────────────────────────────────┤
│ ☐ │ Product Name    │ SKU      │ Price  │ Stock │ ...  │
├────┼─────────────────┼──────────┼────────┼───────┼──────┤
│ ☐ │ Product Row 1   │ ...      │ ...    │ ...   │ ...  │
│ ☐ │ Product Row 2   │ ...      │ ...    │ ...   │ ...  │
│ ☐ │ Product Row 3   │ ...      │ ...    │ ...   │ ...  │
├────┴─────────────────┴──────────┴────────┴───────┴──────┤
│ Showing 1-10 of 1,247 products                          │
│ [< Previous] [1] [2] [3] ... [125] [Next >]             │
└─────────────────────────────────────────────────────────┘
```

### Spacing & Sizing

- **Page Padding**: 24px
- **Section Spacing**: 20px
- **Table Row Height**: 56px
- **Column Widths**: Responsive, minimum 100px
- **Button Height**: 40px
- **Input Height**: 40px

---

## 6️⃣ Responsive Design

### Desktop (>1024px)

- **Layout**: Full table with all columns visible
- **Columns**: Name, SKU, Category, Price, Cost, Stock, Status, Actions
- **Sidebar**: Visible with full navigation
- **Filters**: Horizontal filter bar
- **Pagination**: Full pagination controls

```
┌─────��────────────────────────────────────────────────────┐
│ [Search] [Filters] [+ Create] [Export]                  │
├──────────────────────────────────────────────────────────┤
│ ☐ │ Name │ SKU │ Category │ Price │ Stock │ Status │ ... │
├────┼──────┼─────┼──────────┼───────┼───────┼────────┼─────┤
│ ☐ │ ...  │ ... │ ...      │ ...   │ ...   │ ...    │ ... │
└──────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

- **Layout**: Simplified table with essential columns
- **Columns**: Name, SKU, Price, Stock, Actions
- **Sidebar**: Collapsed to icons
- **Filters**: Dropdown filter menu
- **Pagination**: Simplified pagination

```
┌────────────────────────────────────────────────────┐
│ [Search] [Filters ��] [+ Create]                   │
├──────��─────────────────────────────────────────────┤
│ ☐ │ Name │ SKU │ Price │ Stock │ Actions         │
├────┼──────┼─────┼───────┼───────┼─────────────────┤
│ ☐ │ ...  │ ... │ ...   │ ...   │ [✎] [✕]        │
└────────────────────────────────────────────────────┘
```

### Mobile (<768px)

- **Layout**: Card-based list view
- **Columns**: Name, Price, Stock (in card)
- **Sidebar**: Hidden, drawer navigation
- **Filters**: Stacked filter inputs
- **Pagination**: Previous/Next buttons only

```
┌──────────────────────────────┐
│ [Search...] [Filters ▼]      │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ Widget A                 │ │
│ │ SKU: WID-001             │ │
│ │ Price: $29.99 Stock: 150 │ │
│ │ [View] [Edit] [Delete]   │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Widget B                 │ │
│ │ SKU: WID-002             │ │
│ │ Price: $39.99 Stock: 45  │ │
│ │ [View] [Edit] [Delete]   │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ [< Previous] [1/125] [Next >]│
└──────────────────────────────┘
```

---

## 7️⃣ Interaction Patterns

### Search & Filter

- **Search**: Real-time search as user types (debounced 300ms)
- **Filter**: Click filter button to open dropdown
- **Multi-Select**: Hold Ctrl/Cmd to select multiple filter values
- **Clear**: Click X to clear individual filters
- **Reset**: Click "Reset Filters" to clear all

### Table Interactions

- **Sort**: Click column header to sort ascending/descending
- **Select Row**: Click checkbox to select/deselect
- **Select All**: Click header checkbox to select all visible rows
- **Row Hover**: Highlight row and show action buttons
- **Row Click**: Navigate to product detail page
- **Action Buttons**: Edit or delete product

### Pagination

- **Page Numbers**: Click to jump to page
- **Previous/Next**: Navigate between pages
- **Page Size**: Dropdown to change items per page
- **Jump to Page**: Input field to jump to specific page

### Bulk Actions

- **Select Multiple**: Check multiple rows
- **Bulk Delete**: Delete all selected products
- **Bulk Update**: Update status/category for selected products
- **Confirmation**: Show confirmation dialog before bulk delete

---

## 8️⃣ Accessibility

### Keyboard Navigation

- **Tab**: Navigate through search, filters, table, pagination
- **Shift+Tab**: Navigate backwards
- **Enter**: Activate buttons, open dropdowns
- **Space**: Toggle checkboxes
- **Arrow Keys**: Navigate table rows (if implemented)
- **Escape**: Close dropdowns, cancel actions

### Screen Reader Support

```html
<main aria-label="Product list">
  <h1>Product Catalog</h1>
  
  <section aria-label="Search and filters">
    <input aria-label="Search products" />
    <button aria-label="Open filters">Filters</button>
  </section>
  
  <table role="grid" aria-label="Product list table">
    <thead>
      <tr>
        <th scope="col">
          <input type="checkbox" aria-label="Select all products" />
        </th>
        <th scope="col">
          <button aria-sort="ascending">Product Name</button>
        </th>
        <!-- More headers -->
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <input type="checkbox" aria-label="Select product" />
        </td>
        <td>Product Name</td>
        <!-- More cells -->
      </tr>
    </tbody>
  </table>
  
  <nav aria-label="Pagination">
    <button aria-label="Previous page">Previous</button>
    <span aria-current="page">Page 1 of 125</span>
    <button aria-label="Next page">Next</button>
  </nav>
</main>
```

### Color Contrast

- **Text on Background**: WCAG AA (4.5:1 minimum)
- **Table Borders**: WCAG AA (3:1 minimum)
- **Status Badges**: Color + text/icon for meaning
- **Action Icons**: WCAG AA (3:1 minimum)

### Focus Indicators

- **Visible Focus Ring**: 2px solid blue (#3B82F6)
- **Focus Offset**: 2px from element
- **High Contrast Mode**: Thicker border (3px)

---

## 9️⃣ Performance Considerations

### Data Loading

- **Pagination**: Load 10-25 items per page
- **Lazy Load**: Load product images on scroll
- **Virtual Scrolling**: For large lists (1000+ items)
- **Caching**: Cache product list for 5 minutes

### Search & Filter

- **Debounce**: Debounce search input (300ms)
- **Server-Side**: Perform filtering on server
- **Pagination**: Reset to page 1 on filter change
- **Incremental Search**: Show results as user types

### API Optimization

- **Query Parameters**: Use efficient query strings
- **Pagination**: Limit results per request
- **Sorting**: Sort on server, not client
- **Caching**: Cache filter options (categories, suppliers)

### Bundle Optimization

- **Code Splitting**: Lazy load product detail page
- **Image Optimization**: Use WebP with fallback
- **Tree Shaking**: Remove unused utilities
- **Minification**: Minify CSS and JavaScript

---

## 🔟 Technical Constraints

- **Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS utility classes
- **State Management**: Pinia for product store
- **API**: RESTful endpoints with pagination
- **Table Library**: Optional (DataTable.vue or native)
- **Browser Support**: Modern browsers
- **Accessibility**: WCAG 2.1 Level AA compliance

---

## 1️⃣1️⃣ Component Architecture & Implementation

### Component Contracts

#### `ProductListPage.vue` (Container)

**Responsibility:** Manage product list state, filtering, and pagination

**Props:**
```typescript
interface ProductListPageProps {
  initialFilters?: ProductFilters
  pageSize?: number // Default: 10
}
```

**State:**
```typescript
{
  products: Product[]
  filters: ProductFilters
  sort: SortOptions
  page: number
  pageSize: number
  total: number
  loading: boolean
  error: string | null
  selectedProducts: Set<string>
}
```

**Composables Used:**
```typescript
{
  useProductStore: // Product data
  useRouter: // Navigation
  useRoute: // Route parameters
  useDebounce: // Search debouncing
}
```

---

### Composables

#### `useProductList()` Composable

**Responsibility:** Handle product list fetching and filtering

**Returns:**
```typescript
{
  products: Ref<Product[]>
  filters: Ref<ProductFilters>
  sort: Ref<SortOptions>
  page: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
  loading: Ref<boolean>
  error: Ref<string | null>
  
  fetchProducts(): Promise<void>
  setFilter(key: string, value: any): void
  clearFilters(): void
  setSort(field: string, direction: 'asc' | 'desc'): void
  setPage(page: number): void
  setPageSize(size: number): void
}
```

---

## 📋 Implementation Checklist

### Phase 1: Core Table (Week 1)

- [ ] Create `ProductListPage.vue` component
- [ ] Create `ProductTable.vue` component
- [ ] Create `ProductRow.vue` component
- [ ] Implement table rendering with sample data
- [ ] Add column headers with sorting
- [ ] Add row selection checkboxes
- [ ] Write unit tests

### Phase 2: Search & Filter (Week 2)

- [ ] Create `ProductFilters.vue` component
- [ ] Implement search functionality
- [ ] Add filter dropdowns
- [ ] Implement filter logic
- [ ] Add reset filters button
- [ ] Write integration tests

### Phase 3: Pagination (Week 3)

- [ ] Create `Pagination.vue` component
- [ ] Implement pagination logic
- [ ] Add page size selector
- [ ] Add jump to page input
- [ ] Test pagination with API

### Phase 4: Actions & UX (Week 4)

- [ ] Add create product button
- [ ] Add edit product action
- [ ] Add delete product action
- [ ] Add bulk delete functionality
- [ ] Add export functionality
- [ ] Add loading states
- [ ] Add error handling

### Phase 5: Polish & Optimization (Week 5)

- [ ] Optimize performance
- [ ] Add keyboard shortcuts
- [ ] Implement accessibility
- [ ] Test on mobile
- [ ] Optimize images
- [ ] Add PWA support
- [ ] Final testing

---

## 🎯 Success Criteria

- ✅ Products load and display in table
- ✅ Search filters products in real-time
- ✅ Sorting works on all columns
- ✅ Pagination navigates correctly
- ✅ Row selection works with checkboxes
- ✅ Bulk delete removes multiple products
- ✅ Create product button navigates to form
- ✅ Edit product button opens detail page
- ✅ All keyboard navigation works
- ✅ Screen reader announces all content
- ✅ Color contrast meets WCAG AA
- ✅ Responsive on all breakpoints
- ✅ Performance metrics meet targets
- ✅ No console errors or warnings

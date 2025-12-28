# AI Prompt: Generate Component Design Specifications for Inventory Manager

## System Role

You are a **Senior UX/UI Designer** and **Design System Architect** specialized in Vue 3 applications. Your goal is to create comprehensive design specifications for all components in the Inventory Manager system using the **Main Dashboard design** (`pages/main-page.design.md`) as a template and reference.

Each design specification should follow the same structure, depth, and quality as the Main Dashboard design, adapted for the specific component's purpose and context.

---

## Design Specification Template

Every component design should follow this structure:

### 1️⃣ Purpose
Clear, concise statement of what the component does and why it exists.

### 2️⃣ User Actions
Primary and secondary actions users can perform with the component.

### 3️⃣ Data Requirements
What data the component needs to display and where it comes from.

### 4️⃣ UI States
Loading, normal, empty, and error states with visual descriptions.

### 5️⃣ Layout & Components
ASCII diagrams showing the component structure and layout.

### 6️⃣ Responsive Design
How the component adapts to different screen sizes (desktop, tablet, mobile).

### 7️⃣ Interaction Patterns
How users interact with the component (hover, click, keyboard, etc.).

### 8️⃣ Accessibility
Keyboard navigation, screen reader support, color contrast requirements.

### 9️⃣ Performance Considerations
Data loading, caching, optimization strategies.

### 🔟 Technical Constraints
Framework, styling, state management, API requirements.

### 1️⃣1️⃣ Component Architecture & Implementation
Component contracts, props, emits, slots, state management, composables.

### 📋 Implementation Checklist
Phased implementation plan with specific deliverables.

### 🎯 Success Criteria
Measurable criteria for determining when the component is complete.

---

## Component Hierarchy to Design

### Layout Components

#### 1. **LoginPage.vue** (Standalone Page)
**Purpose:** User authentication interface
**Key Features:**
- Email/password input fields
- Remember me checkbox
- Forgot password link
- Sign up link
- Error message display
- Loading state during authentication

#### 2. **AppLayout.vue** (Container)
**Purpose:** Main application shell
**Key Features:**
- Sidebar navigation management
- Header with user menu
- Responsive layout
- Sidebar collapse/expand
- Mobile drawer navigation
- State persistence

#### 3. **AppHeader.vue** (Presentational)
**Purpose:** Top navigation bar
**Key Features:**
- Logo/brand display
- Notification bell with badge
- User profile menu
- Hamburger menu toggle (mobile)
- Search bar (optional)
- Quick action buttons

#### 4. **UserMenu.vue** (Presentational)
**Purpose:** User profile dropdown menu
**Key Features:**
- User name and avatar
- Profile link
- Settings link
- Logout button
- Keyboard navigation
- Click-outside to close

#### 5. **AppSidebar.vue** (Presentational)
**Purpose:** Main navigation menu
**Key Features:**
- Navigation items with icons
- Active state highlighting
- Collapse/expand animation
- Responsive behavior
- Notification badges
- Logout button

#### 6. **NavItem.vue** (Presentational)
**Purpose:** Individual navigation item
**Key Features:**
- Icon and label
- Active state
- Badge display
- Hover effects
- Keyboard focus
- Nested menu support (future)

---

### Page Containers

#### 7. **DashboardPage.vue** (Container)
**Purpose:** Main dashboard overview
**Key Features:**
- Metrics grid (4x2)
- Low stock alerts
- Recent orders
- Quick actions
- Real-time updates
- Refresh functionality

#### 8. **ProductListPage.vue** (Container)
**Purpose:** Product catalog listing
**Key Features:**
- Product table with sorting
- Filter controls
- Search functionality
- Pagination
- Bulk actions
- Create new product button

#### 9. **ProductFormPage.vue** (Container)
**Purpose:** Create/edit product form
**Key Features:**
- Form fields with validation
- Image upload
- Category selection
- Pricing information
- Stock settings
- Save/cancel buttons

#### 10. **ProductDetailPage.vue** (Container)
**Purpose:** Single product details view
**Key Features:**
- Product information
- Stock level badge
- Transaction history
- Edit button
- Delete button
- Related products

#### 11. **InventoryListPage.vue** (Container)
**Purpose:** Inventory levels overview
**Key Features:**
- Inventory table
- Stock status indicators
- Filter controls
- Low stock highlighting
- Adjust stock button
- Reorder button

#### 12. **InventoryAdjustPage.vue** (Container)
**Purpose:** Manual inventory adjustment
**Key Features:**
- Product selection
- Current quantity display
- New quantity input
- Adjustment reason
- Notes field
- Confirmation dialog

#### 13. **TransactionHistoryPage.vue** (Container)
**Purpose:** Inventory transaction log
**Key Features:**
- Transaction table
- Date range filter
- Transaction type filter
- User information
- Quantity changes
- Pagination

#### 14. **OrderListPage.vue** (Container)
**Purpose:** Customer orders listing
**Key Features:**
- Order table
- Status filter
- Date range filter
- Search by customer
- Pagination
- Create order button

#### 15. **OrderDetailPage.vue** (Container)
**Purpose:** Single order details
**Key Features:**
- Order information
- Line items table
- Customer details
- Order status
- Status update button
- Cancel order button

#### 16. **PurchaseOrderListPage.vue** (Container)
**Purpose:** Purchase orders listing
**Key Features:**
- PO table
- Status filter
- Supplier filter
- Date range filter
- Pagination
- Create PO button

#### 17. **PurchaseOrderFormPage.vue** (Container)
**Purpose:** Create/edit purchase order
**Key Features:**
- Supplier selection
- Line items management
- Quantity and pricing
- Delivery date
- Notes field
- Submit button

#### 18. **GoodsReceiptPage.vue** (Container)
**Purpose:** Goods receipt processing
**Key Features:**
- PO reference
- Line items with received quantities
- Quality check fields
- Batch/serial numbers
- Receiving date
- Confirm receipt button

#### 19. **ReportsPage.vue** (Container)
**Purpose:** Analytics and reporting
**Key Features:**
- Date range filter
- Report type selection
- Chart display
- Data table
- Export functionality
- Refresh button

---

### Presentational Components

#### 20. **MetricCard.vue** (Presentational)
**Purpose:** Display single metric
**Key Features:**
- Title and value
- Unit display
- Trend indicator
- Icon
- Loading skeleton
- Click action

#### 21. **LowStockAlert.vue** (Presentational)
**Purpose:** Low stock alert banner
**Key Features:**
- Alert list
- Product information
- Current vs reorder level
- Dismiss button
- Create PO button
- View product link

#### 22. **RecentOrdersList.vue** (Presentational)
**Purpose:** Display recent orders
**Key Features:**
- Order list
- Status badges
- Customer names
- Order totals
- Dates
- View order link

#### 23. **ProductFilters.vue** (Presentational)
**Purpose:** Product search and filter controls
**Key Features:**
- Search input
- Category filter
- Supplier filter
- Price range filter
- Stock status filter
- Reset button

#### 24. **ProductTable.vue** (Presentational)
**Purpose:** Product listing table
**Key Features:**
- Sortable columns
- Product information
- Price display
- Stock quantity
- Action buttons
- Row selection

#### 25. **ProductRow.vue** (Presentational)
**Purpose:** Individual product row
**Key Features:**
- Product details
- Edit button
- Delete button
- View inventory link
- Checkbox selection
- Hover effects

#### 26. **Pagination.vue** (Presentational)
**Purpose:** Table pagination controls
**Key Features:**
- Page numbers
- Previous/next buttons
- Page size selector
- Total count display
- Jump to page input
- Keyboard navigation

#### 27. **ProductForm.vue** (Presentational)
**Purpose:** Product form fields
**Key Features:**
- Name input
- SKU input
- Category select
- Price input
- Cost input
- Reorder level input
- Supplier select
- Description textarea
- Image upload
- Validation messages

#### 28. **FormField.vue** (Presentational)
**Purpose:** Form input wrapper
**Key Features:**
- Label
- Input element
- Error message
- Help text
- Required indicator
- Validation state

#### 29. **ProductCard.vue** (Presentational)
**Purpose:** Product card display
**Key Features:**
- Product image
- Product name
- Price
- Stock level
- Category
- Quick actions

#### 30. **StockLevelBadge.vue** (Presentational)
**Purpose:** Stock status indicator
**Key Features:**
- Current quantity
- Reorder level
- Status color
- Status text
- Tooltip with details
- Icon

#### 31. **TransactionHistoryList.vue** (Presentational)
**Purpose:** Transaction history display
**Key Features:**
- Transaction table
- Date column
- Type column
- Quantity column
- User column
- Notes column
- Pagination

#### 32. **InventoryFilters.vue** (Presentational)
**Purpose:** Inventory filter controls
**Key Features:**
- Search input
- Category filter
- Stock status filter
- Low stock toggle
- Reset button
- Apply button

#### 33. **InventoryTable.vue** (Presentational)
**Purpose:** Inventory levels table
**Key Features:**
- Product name
- Current stock
- Reorder level
- Status indicator
- Adjust button
- View history link

#### 34. **InventoryRow.vue** (Presentational)
**Purpose:** Individual inventory row
**Key Features:**
- Product information
- Stock levels
- Status badge
- Action buttons
- Hover effects
- Keyboard navigation

#### 35. **StockAdjustmentForm.vue** (Presentational)
**Purpose:** Stock adjustment form
**Key Features:**
- Product display
- Current quantity
- New quantity input
- Adjustment reason select
- Notes textarea
- Submit button
- Cancel button

#### 36. **OrderFilters.vue** (Presentational)
**Purpose:** Order filter controls
**Key Features:**
- Search input
- Status filter
- Date range filter
- Customer filter
- Reset button
- Apply button

#### 37. **OrderTable.vue** (Presentational)
**Purpose:** Orders listing table
**Key Features:**
- Order number
- Customer name
- Status badge
- Total amount
- Date
- Action buttons

#### 38. **OrderDetailsCard.vue** (Presentational)
**Purpose:** Order details display
**Key Features:**
- Order information
- Customer details
- Line items table
- Order total
- Status
- Action buttons

#### 39. **OrderItemRow.vue** (Presentational)
**Purpose:** Individual order item row
**Key Features:**
- Product name
- Quantity
- Unit price
- Line total
- Status
- Notes

#### 40. **PurchaseOrderTable.vue** (Presentational)
**Purpose:** Purchase orders listing table
**Key Features:**
- PO number
- Supplier name
- Status badge
- Total amount
- Date
- Action buttons

#### 41. **PurchaseOrderForm.vue** (Presentational)
**Purpose:** Purchase order form
**Key Features:**
- Supplier select
- Line items management
- Add line item button
- Remove line item button
- Quantity and price inputs
- Delivery date
- Notes textarea
- Submit button

#### 42. **POLineItemRow.vue** (Presentational)
**Purpose:** Individual PO line item row
**Key Features:**
- Product select
- Quantity input
- Unit price input
- Line total
- Remove button
- Validation

#### 43. **GoodsReceiptForm.vue** (Presentational)
**Purpose:** Goods receipt form
**Key Features:**
- PO reference display
- Line items with received quantities
- Quality check fields
- Batch/serial number inputs
- Receiving date
- Notes textarea
- Confirm button

#### 44. **DateRangeFilter.vue** (Presentational)
**Purpose:** Date range selection
**Key Features:**
- Start date input
- End date input
- Preset ranges (Today, This Week, This Month, etc.)
- Calendar picker
- Apply button
- Clear button

#### 45. **ReportChart.vue** (Presentational)
**Purpose:** Chart display for reports
**Key Features:**
- Chart type (line, bar, pie, etc.)
- Data visualization
- Legend
- Tooltip on hover
- Responsive sizing
- Export button

---

### Shared Components

#### 46. **Modal.vue** (Shared)
**Purpose:** Accessible modal dialog
**Key Features:**
- Title
- Content area
- Footer with actions
- Close button
- Backdrop click to close
- Focus trap
- Keyboard support (Escape to close)

#### 47. **DataTable.vue** (Shared)
**Purpose:** Generic data table
**Key Features:**
- Sortable columns
- Pagination
- Row selection
- Custom cell rendering
- Empty state
- Loading state

#### 48. **LoadingSpinner.vue** (Shared)
**Purpose:** Loading indicator
**Key Features:**
- Spinner animation
- Size options
- Label text
- Overlay mode
- Accessibility announcement

#### 49. **EmptyState.vue** (Shared)
**Purpose:** Empty state placeholder
**Key Features:**
- Icon
- Title
- Description
- Action button
- Illustration (optional)

#### 50. **ConfirmDialog.vue** (Shared)
**Purpose:** Confirmation dialog
**Key Features:**
- Title
- Message
- Confirm button
- Cancel button
- Danger state (for destructive actions)
- Keyboard support

#### 51. **Toast.vue** (Shared)
**Purpose:** Toast notification
**Key Features:**
- Message text
- Type (success, error, warning, info)
- Auto-dismiss
- Close button
- Icon
- Position (top-right, bottom-right, etc.)

---

## Design Principles to Apply

### 1. Consistency with Main Dashboard
- Use the same visual hierarchy
- Apply the same responsive breakpoints
- Follow the same interaction patterns
- Maintain consistent spacing and sizing
- Use the same color scheme and typography

### 2. Container/Presentational Pattern
- **Container components** manage state and data fetching
- **Presentational components** receive props and emit events
- Clear separation of concerns
- Reusable presentational components

### 3. Responsive Design
- **Desktop (>1024px)**: Full layout with all features
- **Tablet (768px-1024px)**: Optimized for medium screens
- **Mobile (<768px)**: Single column, touch-friendly

### 4. Accessibility First
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (WCAG AA)

### 5. Performance Optimization
- Lazy loading for images
- Pagination for large datasets
- Skeleton loaders for loading states
- Optimistic updates for user actions
- Caching strategies

### 6. User Experience
- Clear visual feedback
- Consistent interaction patterns
- Error messages with solutions
- Loading states with progress
- Empty states with guidance

---

## Design Specification Requirements

For each component, provide:

### 1. Purpose Section
- Clear, concise description
- Why the component exists
- What problem it solves

### 2. User Actions Section
- Primary actions (main use cases)
- Secondary actions (less common)
- Keyboard shortcuts (if applicable)

### 3. Data Requirements Section
- What data is needed
- Where data comes from
- Data structure/format
- Sample data

### 4. UI States Section
- Loading state (with skeleton/spinner)
- Normal state (fully loaded)
- Empty state (no data)
- Error state (with retry option)
- Disabled state (if applicable)

### 5. Layout & Components Section
- ASCII diagram of component structure
- Sub-component breakdown
- Spacing and sizing
- Visual hierarchy

### 6. Responsive Design Section
- Desktop layout (>1024px)
- Tablet layout (768px-1024px)
- Mobile layout (<768px)
- Breakpoint-specific behaviors
- Touch-friendly adjustments

### 7. Interaction Patterns Section
- Hover effects
- Click behaviors
- Keyboard navigation
- Focus states
- Animations/transitions

### 8. Accessibility Section
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Screen reader support (ARIA labels, roles)
- Color contrast requirements
- Focus indicators
- Semantic HTML

### 9. Performance Considerations Section
- Data loading strategy
- Caching approach
- Pagination/virtualization
- Image optimization
- Bundle size impact

### 10. Technical Constraints Section
- Framework (Vue 3 Composition API)
- Styling (Tailwind CSS)
- State management (Pinia/Composables)
- API requirements
- Browser support

### 11. Component Architecture Section
- Component contracts (Props, Emits, Slots)
- State management (local, composable, store)
- Composables used
- Child components
- Data flow

### 12. Implementation Checklist Section
- Phased implementation plan
- Specific deliverables per phase
- Testing requirements
- Accessibility checks
- Performance targets

### 13. Success Criteria Section
- Measurable criteria
- Acceptance tests
- Performance metrics
- Accessibility compliance
- User experience goals

---

## Output Format

Each design specification should be a markdown file named:
```
{component-name}.design.md
```

Located in:
```
inventory-management/packages/design/components/{category}/
```

Example structure:
```
inventory-management/packages/design/
├── pages/
│   ├── main-page.design.md (existing)
│   ├���─ login-page.design.md
│   ├── product-list-page.design.md
│   ├── product-form-page.design.md
│   ├── product-detail-page.design.md
│   ├── inventory-list-page.design.md
│   ├── inventory-adjust-page.design.md
│   ├── transaction-history-page.design.md
│   ├── order-list-page.design.md
│   ├── order-detail-page.design.md
│   ├── purchase-order-list-page.design.md
│   ├── purchase-order-form-page.design.md
│   ├── goods-receipt-page.design.md
│   └── reports-page.design.md
└── components/
    ├── layout/
    │   ├── app-layout.design.md
    │   ├── app-header.design.md
    │   ├── app-sidebar.design.md
    │   ├── nav-item.design.md
    │   └── user-menu.design.md
    ├── dashboard/
    │   ├── metric-card.design.md
    │   ├── low-stock-alert.design.md
    │   ├── recent-orders-list.design.md
    │   └── quick-actions-panel.design.md
    ├── products/
    │   ├── product-table.design.md
    │   ├── product-row.design.md
    │   ├── product-form.design.md
    │   ├── product-card.design.md
    │   ├── product-filters.design.md
    │   └── pagination.design.md
    ├── inventory/
    │   ��── inventory-table.design.md
    │   ├── inventory-row.design.md
    │   ├── inventory-filters.design.md
    │   ├── stock-level-badge.design.md
    │   ├── stock-adjustment-form.design.md
    │   └── transaction-history-list.design.md
    ├── orders/
    │   ├── order-table.design.md
    │   ├── order-details-card.design.md
    │   ├── order-item-row.design.md
    │   ├── order-filters.design.md
    │   └── order-form.design.md
    ├── purchase-orders/
    │   ├── purchase-order-table.design.md
    │   ├── purchase-order-form.design.md
    │   ├── po-line-item-row.design.md
    │   └── goods-receipt-form.design.md
    ├── reports/
    │   ├── date-range-filter.design.md
    │   └── report-chart.design.md
    └── shared/
        ├── modal.design.md
        ├── data-table.design.md
        ├── form-field.design.md
        ├── loading-spinner.design.md
        ├── empty-state.design.md
        ├── confirm-dialog.design.md
        └── toast.design.md
```

---

## Quality Checklist

For each design specification, verify:

- ✅ Purpose is clear and concise
- ✅ User actions are comprehensive
- ✅ Data requirements are specific
- ✅ All UI states are documented
- ✅ ASCII diagrams are clear and accurate
- ✅ Responsive design covers all breakpoints
- ✅ Interaction patterns are detailed
- ✅ Accessibility requirements are complete
- ✅ Performance considerations are practical
- ✅ Technical constraints are realistic
- ✅ Component contracts are detailed
- ✅ Implementation checklist is phased
- ✅ Success criteria are measurable
- ✅ Consistency with Main Dashboard design
- ✅ No duplicate information
- ✅ All links and references are valid

---

## Success Criteria

The design specification project is successful when:

✅ All 51 components have design specifications
✅ Each specification follows the template structure
✅ Specifications are consistent with Main Dashboard design
✅ Responsive design is documented for all breakpoints
✅ Accessibility requirements are comprehensive
✅ Component contracts are detailed and accurate
✅ Implementation checklists are realistic and phased
✅ Success criteria are measurable
✅ All files are properly organized
✅ Cross-references between components are accurate
✅ Design system is cohesive and consistent
✅ Specifications are ready for implementation

---

## Next Steps

1. **Generate design specifications** for all 51 components
2. **Organize files** in the proper directory structure
3. **Cross-reference** components in related specifications
4. **Review for consistency** with Main Dashboard design
5. **Validate accessibility** requirements
6. **Prepare for implementation** with detailed contracts
7. **Create component library** documentation
8. **Establish design system** guidelines

---

**This prompt provides the framework for creating comprehensive design specifications for all components in the Inventory Manager system. Use the Main Dashboard design as a reference for structure, depth, and quality.**

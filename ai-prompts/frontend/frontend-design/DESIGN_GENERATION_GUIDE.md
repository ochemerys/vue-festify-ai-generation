# Design Generation Guide

## Overview

This guide explains how to use the design generation prompts to create comprehensive design specifications for all components in the Inventory Manager system.

## Available Design Prompts

### 1. **generate-dashboard-components.md**
**Purpose:** Generate design specifications for dashboard-specific components
**Scope:** Dashboard page and its child components
**Components:** MetricCard, MetricsGrid, DashboardPage, LowStockAlert, RecentOrdersSection, OrderTable, QuickActionsPanel

**When to use:** When designing the main dashboard and its metrics display

### 2. **generate-all-component-designs.md** (NEW)
**Purpose:** Generate design specifications for ALL components in the system
**Scope:** Complete component hierarchy (51 components)
**Components:** All layout, page, presentational, and shared components

**When to use:** When creating a comprehensive design system for the entire application

---

## Component Hierarchy Overview

The system is organized into the following categories:

### Layout Components (6)
- LoginPage.vue
- AppLayout.vue
- AppHeader.vue
- UserMenu.vue
- AppSidebar.vue
- NavItem.vue

### Page Containers (13)
- DashboardPage.vue
- ProductListPage.vue
- ProductFormPage.vue
- ProductDetailPage.vue
- InventoryListPage.vue
- InventoryAdjustPage.vue
- TransactionHistoryPage.vue
- OrderListPage.vue
- OrderDetailPage.vue
- PurchaseOrderListPage.vue
- PurchaseOrderFormPage.vue
- GoodsReceiptPage.vue
- ReportsPage.vue

### Presentational Components (26)
**Dashboard:** MetricCard, LowStockAlert, RecentOrdersList
**Products:** ProductFilters, ProductTable, ProductRow, ProductForm, FormField, ProductCard, Pagination
**Inventory:** InventoryFilters, InventoryTable, InventoryRow, StockLevelBadge, StockAdjustmentForm, TransactionHistoryList
**Orders:** OrderFilters, OrderTable, OrderDetailsCard, OrderItemRow
**Purchase Orders:** PurchaseOrderTable, PurchaseOrderForm, POLineItemRow, GoodsReceiptForm
**Reports:** DateRangeFilter, ReportChart

### Shared Components (6)
- Modal.vue
- DataTable.vue
- FormField.vue
- LoadingSpinner.vue
- EmptyState.vue
- ConfirmDialog.vue
- Toast.vue

---

## Design Specification Template

Each design specification follows this 13-section structure:

1. **Purpose** - What the component does
2. **User Actions** - Primary and secondary actions
3. **Data Requirements** - What data is needed
4. **UI States** - Loading, normal, empty, error states
5. **Layout & Components** - ASCII diagrams and structure
6. **Responsive Design** - Desktop, tablet, mobile layouts
7. **Interaction Patterns** - Hover, click, keyboard behaviors
8. **Accessibility** - Keyboard navigation, screen reader support
9. **Performance Considerations** - Loading, caching, optimization
10. **Technical Constraints** - Framework, styling, state management
11. **Component Architecture** - Contracts, props, emits, slots
12. **Implementation Checklist** - Phased implementation plan
13. **Success Criteria** - Measurable completion criteria

---

## How to Use the Prompts

### Step 1: Choose the Right Prompt

**For dashboard components only:**
```
Use: generate-dashboard-components.md
```

**For all components in the system:**
```
Use: generate-all-component-designs.md
```

### Step 2: Provide Context

Include:
- Component name
- Component type (Container, Presentational, Shared)
- Parent components
- Child components
- Related components
- Specific requirements

### Step 3: Reference the Main Dashboard

The Main Dashboard design (`pages/main-page.design.md`) serves as the template for:
- Structure and organization
- Level of detail
- Visual hierarchy
- Responsive design approach
- Accessibility standards
- Performance considerations

### Step 4: Generate Specifications

The AI will generate comprehensive design specifications following the template structure.

### Step 5: Organize and Review

- Save specifications in the proper directory structure
- Review for consistency with Main Dashboard design
- Verify all sections are complete
- Check cross-references between components
- Validate accessibility requirements

---

## Directory Structure

Design specifications should be organized as follows:

```
inventory-management/packages/design/
├── pages/
│   ├── main-page.design.md (existing template)
│   ├── login-page.design.md
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
    │   ├── inventory-table.design.md
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

## Design Principles

All design specifications should follow these principles:

### 1. Consistency
- Use the same visual hierarchy as Main Dashboard
- Apply the same responsive breakpoints
- Follow the same interaction patterns
- Maintain consistent spacing and sizing

### 2. Container/Presentational Pattern
- Container components manage state and data
- Presentational components receive props and emit events
- Clear separation of concerns
- Reusable presentational components

### 3. Responsive Design
- Desktop (>1024px): Full layout with all features
- Tablet (768px-1024px): Optimized for medium screens
- Mobile (<768px): Single column, touch-friendly

### 4. Accessibility First
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- WCAG AA color contrast compliance

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

## Implementation Workflow

### Phase 1: Layout Components (Week 1)
1. LoginPage.vue
2. AppLayout.vue
3. AppHeader.vue
4. UserMenu.vue
5. AppSidebar.vue
6. NavItem.vue

### Phase 2: Dashboard Components (Week 2)
1. DashboardPage.vue
2. MetricCard.vue
3. LowStockAlert.vue
4. RecentOrdersList.vue
5. QuickActionsPanel.vue

### Phase 3: Product Components (Week 3)
1. ProductListPage.vue
2. ProductFormPage.vue
3. ProductDetailPage.vue
4. ProductTable.vue
5. ProductForm.vue
6. ProductCard.vue
7. ProductFilters.vue

### Phase 4: Inventory Components (Week 4)
1. InventoryListPage.vue
2. InventoryAdjustPage.vue
3. TransactionHistoryPage.vue
4. InventoryTable.vue
5. StockAdjustmentForm.vue
6. TransactionHistoryList.vue

### Phase 5: Order Components (Week 5)
1. OrderListPage.vue
2. OrderDetailPage.vue
3. OrderTable.vue
4. OrderDetailsCard.vue

### Phase 6: Purchase Order Components (Week 6)
1. PurchaseOrderListPage.vue
2. PurchaseOrderFormPage.vue
3. GoodsReceiptPage.vue
4. PurchaseOrderTable.vue
5. PurchaseOrderForm.vue
6. GoodsReceiptForm.vue

### Phase 7: Report Components (Week 7)
1. ReportsPage.vue
2. DateRangeFilter.vue
3. ReportChart.vue

### Phase 8: Shared Components (Week 8)
1. Modal.vue
2. DataTable.vue
3. FormField.vue
4. LoadingSpinner.vue
5. EmptyState.vue
6. ConfirmDialog.vue
7. Toast.vue

---

## Cross-Component References

When designing components, reference related components:

**ProductTable.vue** references:
- ProductRow.vue (child)
- ProductFilters.vue (sibling)
- Pagination.vue (sibling)
- Modal.vue (shared)

**OrderTable.vue** references:
- OrderItemRow.vue (child)
- OrderFilters.vue (sibling)
- Pagination.vue (sibling)
- Modal.vue (shared)

**InventoryTable.vue** references:
- InventoryRow.vue (child)
- InventoryFilters.vue (sibling)
- Pagination.vue (sibling)
- Modal.vue (shared)

---

## Success Metrics

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

## Resources

- **Main Dashboard Design:** `inventory-management/packages/design/pages/main-page.design.md`
- **Architecture Guide:** `ARCHITECTURE.md`
- **Component Contracts:** `ARCHITECTURE.md` (Section 3)
- **Testing Guide:** `testing-guide.md`
- **Implementation Guide:** `_docs/frontend-architecture.md`

---

**Use these design generation prompts to create a comprehensive, consistent design system for the Inventory Manager application.**

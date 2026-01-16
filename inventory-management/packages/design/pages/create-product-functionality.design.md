# Create Product Functionality - Design Specification

## 📋 Overview

This document specifies the **Create Product** functionality for the Inventory Management System. When a product is created, it is **defined** in the system with **zero quantity on hand**. No inventory movement occurs at this stage - the product exists as a catalog entry only. To add stock, users must perform a separate inventory adjustment operation.

---

## 🎯 Business Context

### Product Lifecycle States

1. **Defined** - Product exists in catalog with quantity = 0 (this functionality)
2. **In Stock** - Product has quantity > 0 (requires inventory adjustment)
3. **Low Stock** - Product quantity ≤ reorder level
4. **Out of Stock** - Product quantity = 0 but previously had stock
5. **Inactive** - Product is deactivated

### Key Principles

- **Product Definition ≠ Inventory**: Creating a product does NOT add inventory
- **Zero Initial Quantity**: All new products start with quantity = 0
- **No Inventory Movement**: No transaction records are created during product creation
- **Catalog Entry Only**: Product is available for future inventory operations
- **Separation of Concerns**: Product management is separate from inventory management

---

## 🔄 User Flow

### Primary Flow: Create New Product

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Create Product" button                      │
│    └─> Opens Product Form Page                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User fills in required fields:                           │
│    • SKU (unique identifier)                                │
│    • Product Name                                           │
│    • Category                                               │
│    • Supplier                                               │
│    • Price (selling price)                                  │
│    • Cost (purchase cost)                                   │
│    • Reorder Level                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User optionally adds:                                    │
│    • Description                                            │
│    • Product Image                                          │
│    • Additional metadata                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. User clicks "Save Product"                               │
│    └─> Client-side validation runs                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. System validates and creates product:                    │
│    • Validates all required fields                          │
│    • Checks SKU uniqueness                                  │
│    • Creates product with quantity = 0                      │
│    • Sets status = "active"                                 │
│    • Sets createdAt/updatedAt timestamps                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Success Response:                                        │
│    • Product created with ID                                │
│    • Quantity on hand = 0                                   │
│    • No inventory movement records                          │
│    • Product appears in catalog as "defined"                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. User redirected to:                                      │
│    • Product Detail Page (view created product)             │
│    • OR Product List Page (see product in catalog)          │
│    • Success notification displayed                         │
└─────────────────────────────────────────────────────────────┘
```

### Alternative Flow: Add Inventory After Creation

```
┌────────────────────────────────────────────────────────���────┐
│ Product Created (Quantity = 0)                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ User wants to add stock:                                    │
│ 1. Navigate to Inventory Adjustment page                    │
│ 2. Select the product                                       │
│ 3. Choose "Stock In" operation                              │
│ 4. Enter quantity to add                                    │
│ 5. Provide reason (e.g., "Initial Stock")                   │
│ 6. Submit adjustment                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Result:                                                     │
│ • Product quantity updated                                  │
│ • Inventory movement record created                         │
│ • Product status changes from "defined" to "in stock"       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Model

### Product Creation Request

```typescript
interface CreateProductRequest {
  // Required Fields
  sku: string              // Unique identifier (e.g., "PROD-001")
  name: string             // Product name (e.g., "Wireless Mouse")
  category: string         // Product category (e.g., "Electronics")
  supplier: string         // Primary supplier name
  price: number            // Selling price (must be > 0)
  cost: number             // Purchase cost (must be > 0)
  reorderLevel: number     // Low stock threshold (default: 10)
  
  // Optional Fields
  description?: string     // Product description (max 1000 chars)
  image?: File | string    // Product image
  tags?: string[]          // Product tags for search
}
```

### Product Entity (After Creation)

```typescript
interface Product {
  id: string               // System-generated CUID
  sku: string              // User-provided unique SKU
  name: string             // Product name
  description: string | null
  category: string
  supplier: string
  price: number            // Selling price
  cost: number             // Purchase cost
  reorderLevel: number     // Default: 10
  
  // Inventory Status (NOT set during creation)
  quantity: 0              // ALWAYS 0 for new products
  
  // System Fields
  isActive: boolean        // Default: true
  createdAt: Date          // Auto-generated
  updatedAt: Date          // Auto-generated
}
```

### Important: What is NOT Created

```typescript
// ❌ NO Inventory Movement Record
interface InventoryMovement {
  // This is NOT created during product creation
  // Only created during inventory adjustments
}

// ❌ NO Initial Stock
// quantity remains 0 until inventory adjustment
```

---

## 🎨 UI Components

### 1. Create Product Button (ProductsListPage.vue)

**Location:** Top-right of Products List Page header

**Visual Design:**
```
┌──────────────────────────────────────────────────────────┐
│ Product Catalog                                          │
│                                                          │
│ [Export] [+ Create Product]  ← Primary action button    │
└──────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Button Style:** Primary (blue background)
- **Icon:** Plus icon (lucide-vue-next)
- **Text:** "Create Product"
- **Size:** Medium (px-4 py-2)
- **Hover State:** Darker blue background
- **Click Action:** Navigate to `/products/create`

### 2. Product Form Page

**Route:** `/products/create`

**Layout Structure:**
```
┌────────────────────────────────────────────────────────────┐
│ ← Back to Products                                         │
│                                                            │
│ Create New Product                                         │
│ Define a new product in your catalog                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ┌────────────────��───────────────────────────────────────┐ │
│ │ Product Information                                    │ │
│ │                                                        │ │
│ │ Product Name *                                         │ │
│ │ [_________________________________]                    │ │
│ │                                                        │ │
│ │ SKU *                          Category *              │ │
│ │ [______________]               [Select Category ▼]    │ │
│ │ Must be unique                                         │ │
│ │                                                        │ │
│ │ Description                                            │ │
│ │ [_________________________________]                    │ │
│ │ [_________________________________]                    │ │
│ │                                                        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌───────────────��────────────────────────────────────────┐ │
│ │ Pricing Information                                    │ │
│ │                                                        │ │
│ │ Selling Price *                Cost *                  │ │
│ │ [$______________]              [$______________]       │ │
│ │                                                        │ │
│ │ Reorder Level *                                        │ │
│ │ [______________] units                                 │ │
│ │ Alert when stock falls below this level               │ │
│ │                                                        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Supplier Information                                   │ │
│ │                                                        │ │
│ │ Primary Supplier *                                     │ │
│ │ [Select Supplier ▼]                                   │ │
│ │                                                        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Product Image (Optional)                               │ │
│ │                                                        │ │
│ │ [Upload Image] or drag and drop                        │ │
│ │ Max 5MB, JPG/PNG/WebP                                  │ │
│ │                                                        │ │
│ └─────────────���──────────────────────────────────────────┘ │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ℹ️ Initial Inventory                                   │ │
│ │                                                        │ │
│ │ This product will be created with 0 quantity on hand.  │ │
│ │ To add inventory, use the Inventory Adjustment page    │ │
│ │ after creating the product.                            │ │
│ │                                                        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ [Cancel]                              [Create Product]    │
│                                                            │
└────────────────────────────────────────────────────────���───┘
```

### 3. Success State

**After Successful Creation:**
```
┌────────────────────────────────────────────────────────────┐
│ ✓ Product created successfully!                            │
│                                                            │
│ "Wireless Mouse" has been added to your catalog.           │
│ Quantity on hand: 0                                        │
│                                                            │
│ [View Product] [Add Inventory] [Create Another]            │
└────────────────────────────────────────────────────────────┘
```

### 4. Product Detail View (After Creation)

```
┌────────────────────────────────────────────────────────────┐
│ Wireless Mouse                                    [Edit]   │
│ SKU: PROD-001                                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Status: ⚪ Defined (No Stock)  ← Indicates zero quantity  │
│                                                            │
│ Quantity on Hand: 0 units                                  │
│ Reorder Level: 10 units                                    │
│                                                            │
│ Price: $29.99                                              │
│ Cost: $12.50                                               │
│ Margin: $17.49 (58.4%)                                     │
│                                                            │
│ Category: Electronics                                      │
│ Supplier: Tech Supplies Inc                                │
│                                                            │
│ ⚠️ This product has no inventory                           │
│ [+ Add Inventory]  ← Quick action to adjust inventory     │
│                                                            │
│ No inventory movements yet                                 │
│                                                            │
└──────────────────────────────────���─────────────────────────┘
```

---

## ✅ Validation Rules

### Client-Side Validation

```typescript
const validationRules = {
  // Required Fields
  name: {
    required: true,
    minLength: 3,
    maxLength: 255,
    message: "Product name must be between 3 and 255 characters"
  },
  
  sku: {
    required: true,
    pattern: /^[A-Z0-9-]+$/,
    minLength: 1,
    maxLength: 50,
    message: "SKU must contain only uppercase letters, numbers, and hyphens"
  },
  
  category: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: "Category is required"
  },
  
  supplier: {
    required: true,
    minLength: 1,
    maxLength: 255,
    message: "Supplier is required"
  },
  
  price: {
    required: true,
    type: "number",
    min: 0.01,
    decimal: 2,
    message: "Price must be greater than 0"
  },
  
  cost: {
    required: true,
    type: "number",
    min: 0.01,
    decimal: 2,
    message: "Cost must be greater than 0"
  },
  
  reorderLevel: {
    required: true,
    type: "integer",
    min: 0,
    default: 10,
    message: "Reorder level must be a non-negative integer"
  },
  
  // Optional Fields
  description: {
    required: false,
    maxLength: 1000,
    message: "Description cannot exceed 1000 characters"
  },
  
  image: {
    required: false,
    maxSize: 5242880, // 5MB
    formats: ["jpg", "jpeg", "png", "webp"],
    message: "Image must be JPG, PNG, or WebP and under 5MB"
  }
}
```

### Server-Side Validation

```typescript
// Additional server-side checks
const serverValidation = {
  // SKU Uniqueness Check
  checkSkuUnique: async (sku: string) => {
    const existing = await db.product.findOne({ where: { sku } })
    if (existing) {
      throw new Error("SKU already exists")
    }
  },
  
  // Category Validation
  validateCategory: async (category: string) => {
    const validCategories = await db.category.findAll()
    if (!validCategories.includes(category)) {
      throw new Error("Invalid category")
    }
  },
  
  // Supplier Validation
  validateSupplier: async (supplier: string) => {
    const validSuppliers = await db.supplier.findAll()
    if (!validSuppliers.includes(supplier)) {
      throw new Error("Invalid supplier")
    }
  },
  
  // Price vs Cost Validation (Warning)
  validatePricing: (price: number, cost: number) => {
    if (price < cost) {
      return {
        warning: "Selling price is lower than cost. This will result in a loss."
      }
    }
  }
}
```

---

## 🔌 API Integration

### Endpoint

```
POST /api/products
```

### Request

```typescript
// Headers
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}

// Body
{
  "sku": "PROD-001",
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "category": "Electronics",
  "supplier": "Tech Supplies Inc",
  "price": 29.99,
  "cost": 12.50,
  "reorderLevel": 10
}
```

### Response (Success)

```typescript
// Status: 201 Created
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "sku": "PROD-001",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with USB receiver",
    "category": "Electronics",
    "supplier": "Tech Supplies Inc",
    "price": 29.99,
    "cost": 12.50,
    "reorderLevel": 10,
    "quantity": 0,           // ← Always 0 for new products
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Response (Validation Error)

```typescript
// Status: 400 Bad Request
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "sku",
      "message": "SKU is required"
    },
    {
      "field": "price",
      "message": "Price must be greater than 0"
    }
  ]
}
```

### Response (Duplicate SKU)

```typescript
// Status: 409 Conflict
{
  "success": false,
  "error": "SKU already exists",
  "message": "A product with SKU 'PROD-001' already exists in the system"
}
```

---

## 🧪 Testing Scenarios

### Unit Tests

```typescript
describe('Create Product Functionality', () => {
  
  test('should create product with zero initial quantity', async () => {
    const productData = {
      sku: 'TEST-001',
      name: 'Test Product',
      category: 'Test',
      supplier: 'Test Supplier',
      price: 10.00,
      cost: 5.00,
      reorderLevel: 10
    }
    
    const result = await createProduct(productData)
    
    expect(result.quantity).toBe(0)
    expect(result.isActive).toBe(true)
    expect(result.sku).toBe('TEST-001')
  })
  
  test('should validate required fields', async () => {
    const invalidData = {
      sku: '',
      name: '',
      category: ''
    }
    
    await expect(createProduct(invalidData)).rejects.toThrow()
  })
  
  test('should reject duplicate SKU', async () => {
    await createProduct({ sku: 'DUP-001', /* ... */ })
    
    await expect(
      createProduct({ sku: 'DUP-001', /* ... */ })
    ).rejects.toThrow('SKU already exists')
  })
  
  test('should validate SKU format', async () => {
    const invalidSku = { sku: 'prod@001', /* ... */ }
    
    await expect(createProduct(invalidSku)).rejects.toThrow()
  })
  
  test('should validate price and cost are positive', async () => {
    const invalidPrice = { price: -10, cost: 0, /* ... */ }
    
    await expect(createProduct(invalidPrice)).rejects.toThrow()
  })
  
  test('should not create inventory movement on product creation', async () => {
    const product = await createProduct({ /* ... */ })
    const movements = await getInventoryMovements(product.id)
    
    expect(movements).toHaveLength(0)
  })
})
```

### Integration Tests (BDD)

See updated `product-management.feature` file for comprehensive BDD scenarios.

---

## 🎯 User Experience Considerations

### 1. Clear Communication

**Inform users about zero initial quantity:**
- Display info box explaining that quantity starts at 0
- Provide quick link to inventory adjustment after creation
- Show "Defined" status badge for products with no stock

### 2. Guided Workflow

**Help users complete the process:**
- Mark required fields clearly with asterisks
- Provide inline validation feedback
- Show helpful hints (e.g., "SKU must be unique")
- Offer suggestions for categories and suppliers

### 3. Error Prevention

**Prevent common mistakes:**
- Check SKU uniqueness in real-time (debounced)
- Warn if price < cost (potential loss)
- Validate format before submission
- Confirm before leaving with unsaved changes

### 4. Next Steps

**Guide users after creation:**
- Show success message with product details
- Offer quick actions: "View Product", "Add Inventory", "Create Another"
- Highlight that inventory needs to be added separately

---

## 📱 Responsive Design

### Desktop (>1024px)
- Two-column form layout
- Side-by-side fields for related data
- Large form with ample spacing

### Tablet (768px - 1024px)
- Single column layout
- Full-width fields
- Stacked sections

### Mobile (<768px)
- Single column, full width
- Larger touch targets
- Simplified layout
- Sticky action buttons at bottom

---

## ♿ Accessibility

### Keyboard Navigation
- Tab through all form fields
- Enter to submit form
- Escape to cancel
- Arrow keys for dropdowns

### Screen Reader Support
- Proper ARIA labels for all fields
- Required field announcements
- Error message associations
- Success/failure announcements

### Visual Accessibility
- High contrast labels and borders
- Clear focus indicators
- Error messages in red with icons
- Success messages in green with icons

---

## 🚀 Performance

### Optimization Strategies
- Lazy load categories and suppliers
- Debounce SKU uniqueness check (500ms)
- Client-side validation before API call
- Image compression before upload
- Form state persistence (localStorage)

### Loading States
- Show skeleton loader while fetching data
- Disable submit button during submission
- Show progress indicator for image upload
- Provide feedback for all async operations

---

## 📊 Success Metrics

### Key Performance Indicators
- **Form Completion Rate**: % of users who complete the form
- **Validation Error Rate**: % of submissions with errors
- **Time to Create**: Average time to create a product
- **SKU Uniqueness Errors**: Frequency of duplicate SKU attempts
- **Follow-up Actions**: % of users who add inventory after creation

### User Satisfaction
- Form usability score
- Error message clarity rating
- Overall satisfaction with creation process

---

## 🔄 Future Enhancements

### Phase 2 Features
- Bulk product import (CSV/Excel)
- Product templates for quick creation
- Duplicate product functionality
- Draft save functionality
- Product variants support

### Phase 3 Features
- AI-powered SKU generation
- Price suggestion based on cost
- Category auto-suggestion
- Supplier recommendations
- Image recognition for product details

---

## 📚 Related Documentation

- [Product Form Page Design](./product-form-page.design.md)
- [Product List Page Design](./product-list-page.design.md)
- [Inventory Adjustment Design](./inventory-adjust-page.design.md)
- [BDD Feature: Product Management](../../bdd/features/products/product-management.feature)
- [API Contracts: Product](../../contracts/src/product.ts)

---

## ✅ Implementation Checklist

### Backend
- [ ] Create POST /api/products endpoint
- [ ] Implement validation logic
- [ ] Add SKU uniqueness check
- [ ] Set quantity = 0 for new products
- [ ] Add unit tests
- [ ] Add integration tests

### Frontend
- [ ] Create ProductFormPage.vue component
- [ ] Implement form validation
- [ ] Add SKU uniqueness check (debounced)
- [ ] Implement image upload
- [ ] Add success/error handling
- [ ] Add loading states
- [ ] Implement responsive design
- [ ] Add accessibility features
- [ ] Write unit tests
- [ ] Write E2E tests

### Documentation
- [x] Update BDD feature file
- [x] Create design specification
- [ ] Update API documentation
- [ ] Create user guide
- [ ] Add troubleshooting guide

---

**Document Version:** 1.0  
**Last Updated:** 2024-01-15  
**Author:** System Architect  
**Status:** Ready for Implementation

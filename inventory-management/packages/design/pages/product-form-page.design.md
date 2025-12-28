# Product Form Page Design Specification

## 1️⃣ Purpose

The Product Form Page provides a comprehensive interface for creating and editing products in the inventory system. It handles product information collection, validation, and submission with support for image uploads, category selection, and pricing configuration. This page ensures data consistency and guides users through the product creation process.

---

## 2️⃣ User Actions

### Primary Actions

- **Enter Product Name**: Input product name
- **Enter SKU**: Input unique product identifier
- **Select Category**: Choose product category
- **Enter Price**: Input selling price
- **Enter Cost**: Input product cost
- **Set Reorder Level**: Define low stock threshold
- **Select Supplier**: Choose primary supplier
- **Upload Image**: Add product image
- **Enter Description**: Add product details
- **Save Product**: Submit form and create/update product
- **Cancel**: Discard changes and go back

### Secondary Actions

- **Remove Image**: Delete uploaded image
- **Add More Details**: Expand advanced options
- **Preview Product**: View product as it will appear
- **Duplicate Product**: Create copy of existing product
- **Save as Draft**: Save incomplete product

### Keyboard Shortcuts

- **Ctrl+S**: Save product
- **Escape**: Cancel and go back
- **Tab**: Navigate between fields

---

## 3️⃣ Data Requirements

### Product Form Data

```typescript
interface ProductFormData {
  name: string
  sku: string
  category: string
  supplier: string
  price: number
  cost: number
  reorderLevel: number
  description?: string
  image?: File | string
  status: 'active' | 'inactive'
  tags?: string[]
}
```

### Form Validation Rules

```typescript
interface ValidationRules {
  name: { required: true, minLength: 3, maxLength: 100 }
  sku: { required: true, pattern: /^[A-Z0-9-]+$/, unique: true }
  category: { required: true }
  supplier: { required: true }
  price: { required: true, min: 0, decimal: 2 }
  cost: { required: true, min: 0, decimal: 2 }
  reorderLevel: { required: true, min: 0, integer: true }
  description: { maxLength: 1000 }
  image: { maxSize: 5242880, format: ['jpg', 'png', 'webp'] }
}
```

### Data Sources

- **API Endpoints**: 
  - `POST /api/products` (create)
  - `PUT /api/products/:id` (update)
  - `GET /api/categories` (categories)
  - `GET /api/suppliers` (suppliers)
- **Store**: `useProductStore` for product data
- **Cache**: Cache categories and suppliers

---

## 4️⃣ UI States

### Loading State (Initial)

```
┌─────────────────────────────────────────────────────────┐
│ Create New Product                                      │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⟳ Loading form...                                  │ │
│ │                                                     │ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Normal State (Create)

```
┌─────────────────────────────────────────────────────────┐
│ Create New Product                                      │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Product Information                                 │ │
│ │                                                     │ │
│ │ Product Name *                                      │ │
│ │ [_____________________________]                     │ │
│ │                                                     │ │
│ �� SKU *                          Category *           │ │
│ │ [______________]               [Select ▼]          │ │
│ │                                                     │ │
│ │ Pricing Information                                 │ │
│ │                                                     │ │
│ │ Selling Price *                Cost *               │ │
│ │ [______________]               [______________]    │ │
│ │                                                     │ │
│ │ Reorder Level *                Supplier *           │ │
│ │ [______________]               [Select ▼]          │ │
│ │                                                     │ │
│ │ Product Image                                       │ │
│ │ [Upload Image]                                      │ │
│ │                                                     │ │
│ │ Description                                         │ │
│ │ [_____________________________]                     │ │
│ │ [_____________________________]                     │ │
│ │                                                     │ │
│ │ [Cancel] [Save Product]                             │ │
│ │                                                     │ │
│ ���─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Validation Error State

```
┌─────────────────────────────────────────────────────────┐
│ Create New Product                                      │
├─────────────────────────────────────────────────────────┤
│ ⚠ Please fix the errors below before saving             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Product Name *                                      │ │
│ │ [_____________________________]                     │ │
│ │ ✗ Product name is required                          │ │
│ │                                                     │ │
│ │ SKU *                          Category *           │ │
│ │ [______________]               [Select ▼]          │ │
│ │ ✗ SKU must be unique                               │ │
│ │                                                     │ │
│ │ Selling Price *                Cost *               │ │
│ │ [______________]               [______________]    │ │
│ │ ✗ Price must be greater than 0                     │ │
│ │                                                     │ │
│ │ [Cancel] [Save Product]                             │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Success State

```
┌─────────────────────────────────────────────────────────┐
│ ✓ Product saved successfully!                           │
│ Redirecting to product details...                       │
└───────────────��─────────────────────────────────────────┘
```

---

## 5️⃣ Layout & Components

### Form Layout

```
ProductFormPage.vue
├── Page Header
│   ├── Title (Create/Edit)
│   └── Breadcrumb
├── Form Container
│   ├── Product Information Section
│   │   ├── FormField (Name)
│   │   ├── FormField (SKU)
│   │   └── FormField (Category)
│   ├── Pricing Section
│   │   ├── FormField (Price)
│   │   ├── FormField (Cost)
│   │   └── FormField (Reorder Level)
│   ├── Supplier Section
│   │   └── FormField (Supplier)
│   ├── Image Upload Section
│   │   ├── Image Preview
│   │   └── Upload Button
│   ├── Description Section
│   │   └── FormField (Description)
│   └── Form Actions
│       ├── Cancel Button
│       └── Save Button
└── Modals (Conditional)
    ├── Unsaved Changes Warning
    └── Success Message
```

### Two-Column Layout (Desktop)

```
┌─────────────────────────────────────────────────────────┐
│ Create New Product                                      │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────────────┬──────────────────────────────┐ │
│ │ Product Name *       │ Category *                   │ │
│ │ [______________]     │ [Select ▼]                  │ │
│ │                      │                              │ │
│ │ SKU *                │ Supplier *                   │ │
│ │ [______________]     │ [Select ▼]                  │ │
│ │                      │                              │ │
│ │ Selling Price *      │ Cost *                       │ │
│ │ [______________]     │ [______________]            │ │
│ │                      │                              │ │
│ │ Reorder Level *      │ Status                       │ │
│ │ [______________]     │ [Active ▼]                  │ │
│ │                      │                              │ │
│ └──────────────────────┴─────────────────────���────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Product Image                                       │ │
│ │ [Upload Image]                                      │ │
│ │                                                     │ │
│ │ Description                                         │ │
│ │ [_____________________________]                     │ │
│ │ [_____________________________]                     │ │
│ │                                                     │ │
│ │ [Cancel] [Save Product]                             │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Spacing & Sizing

- **Form Padding**: 32px
- **Section Spacing**: 24px
- **Field Spacing**: 16px
- **Column Gap**: 20px
- **Input Height**: 40px
- **Button Height**: 44px
- **Max Width**: 800px

---

## 6️⃣ Responsive Design

### Desktop (>1024px)

- **Layout**: Two-column form layout
- **Width**: 800px max width, centered
- **Sections**: Grouped logically
- **Image Preview**: Large preview (200x200px)
- **Buttons**: Side by side at bottom

```
┌──────────────────────────────────────────────────────┐
│ ┌────────────────┬────────────────┐                 │
│ │ Field 1        │ Field 2        │                 │
│ ├────────────────┼────────────────┤                 │
│ │ Field 3        │ Field 4        │                 │
│ └────────────────┴────────────────┘                 │
│ ┌──────────────────────────────────┐                │
│ │ Image Upload                     │                │
│ └────────���─────────────────────────┘                │
│ ┌──────────────────────────────────┐                │
│ │ Description                      │                │
│ └──────────────────────────────────┘                │
│ [Cancel] [Save]                                     │
└──────────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

- **Layout**: Single column with wider fields
- **Width**: 90% with max 600px
- **Sections**: Stacked vertically
- **Image Preview**: Medium preview (150x150px)
- **Buttons**: Full width stacked

```
┌────────────────────────────────────┐
│ ┌────────────────────────────────┐ │
│ │ Field 1                        │ │
│ ├────────────────────────────────┤ │
│ │ Field 2                        │ │
│ ├────────────────────────────────┤ │
│ │ Field 3                        │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ Image Upload                   │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ Description                    │ │
│ └────────────────────────────────┘ │
│ [Cancel] [Save]                    │
└────────────────────────────────────┘
```

### Mobile (<768px)

- **Layout**: Single column, full width
- **Width**: 100% with 16px padding
- **Sections**: Stacked vertically
- **Image Preview**: Small preview (100x100px)
- **Buttons**: Full width stacked

```
┌──────────────────────────┐
│ ┌────────────────────────┐
│ │ Field 1                │
│ ├──���─────────────────────┤
│ │ Field 2                │
│ ├────────────────────────┤
│ │ Field 3                │
│ └────────────────────────┘
│ ┌────────────────────────┐
│ │ Image Upload           │
│ └────────────────────────┘
│ ┌────────────────────────┐
│ │ Description            │
│ └────────────────────────┘
│ [Cancel]                 │
│ [Save]                   │
└──────────────────────────┘
```

---

## 7️⃣ Interaction Patterns

### Form Field Interactions

**Text Input:**
- **Focus**: Blue border, shadow effect
- **Typing**: Real-time validation feedback
- **Blur**: Validate field value
- **Error**: Red border, error message appears
- **Success**: Green checkmark (optional)

**Select Dropdown:**
- **Click**: Open dropdown menu
- **Hover**: Highlight option
- **Select**: Close dropdown, show selected value
- **Keyboard**: Arrow keys to navigate, Enter to select

**Image Upload:**
- **Click**: Open file picker
- **Drag & Drop**: Drop image to upload
- **Preview**: Show image preview after upload
- **Remove**: Delete uploaded image
- **Progress**: Show upload progress bar

**Textarea:**
- **Focus**: Blue border, shadow effect
- **Typing**: Show character count
- **Blur**: Validate field value
- **Error**: Red border, error message appears

### Form Submission

1. User fills in required fields
2. User clicks Save button
3. Form validates all fields
4. If valid, submit to API
5. Show loading state
6. On success: Show success message, redirect to product detail
7. On error: Show error message, keep form data

### Unsaved Changes

- **Detect Changes**: Track form state changes
- **Warn on Leave**: Show confirmation dialog if leaving with unsaved changes
- **Save Shortcut**: Ctrl+S to save form

---

## 8️⃣ Accessibility

### Keyboard Navigation

- **Tab**: Navigate through all form fields
- **Shift+Tab**: Navigate backwards
- **Enter**: Submit form or open dropdown
- **Space**: Toggle checkbox or button
- **Arrow Keys**: Navigate dropdown options
- **Escape**: Close dropdown or cancel form

### Screen Reader Support

```html
<form aria-label="Product form">
  <fieldset>
    <legend>Product Information</legend>
    
    <div>
      <label for="name">Product Name <span aria-label="required">*</span></label>
      <input 
        id="name" 
        type="text" 
        aria-required="true"
        aria-describedby="name-error"
      />
      <span id="name-error" role="alert"></span>
    </div>
    
    <div>
      <label for="category">Category <span aria-label="required">*</span></label>
      <select 
        id="category" 
        aria-required="true"
        aria-describedby="category-error"
      >
        <option value="">Select category</option>
      </select>
      <span id="category-error" role="alert"></span>
    </div>
  </fieldset>
  
  <div>
    <label for="image">Product Image</label>
    <input 
      id="image" 
      type="file" 
      accept="image/*"
      aria-describedby="image-help"
    />
    <span id="image-help">Max 5MB, JPG/PNG/WebP</span>
  </div>
  
  <div>
    <button type="submit" aria-busy="false">Save Product</button>
    <button type="button">Cancel</button>
  </div>
</form>
```

### Color Contrast

- **Labels**: WCAG AA (4.5:1 minimum)
- **Input Borders**: WCAG AA (3:1 minimum)
- **Error Messages**: Red (#DC2626) on white (5.2:1)
- **Success Messages**: Green (#16A34A) on white (4.5:1)

### Focus Indicators

- **Visible Focus Ring**: 2px solid blue (#3B82F6)
- **Focus Offset**: 2px from element
- **High Contrast Mode**: Thicker border (3px)

---

## 9️⃣ Performance Considerations

### Form Optimization

- **Lazy Load**: Load categories and suppliers on demand
- **Debounce**: Debounce SKU uniqueness check (500ms)
- **Validation**: Client-side validation before API call
- **Image Compression**: Compress image before upload

### API Optimization

- **Single Request**: One API call to save product
- **Timeout**: 30-second timeout for form submission
- **Retry Logic**: Automatic retry on network failure
- **Error Handling**: Graceful degradation on API errors

### Bundle Optimization

- **Code Splitting**: Lazy load form page
- **Image Optimization**: Use WebP with fallback
- **Tree Shaking**: Remove unused utilities
- **Minification**: Minify CSS and JavaScript

---

## 🔟 Technical Constraints

- **Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS utility classes
- **State Management**: Pinia for product store
- **Form Validation**: Zod or Vee-Validate
- **Image Upload**: Multipart form data
- **API**: RESTful endpoints
- **Browser Support**: Modern browsers
- **Accessibility**: WCAG 2.1 Level AA compliance

---

## 1️⃣1️⃣ Component Architecture & Implementation

### Component Contracts

#### `ProductFormPage.vue` (Container)

**Responsibility:** Manage product form state and submission

**Props:**
```typescript
interface ProductFormPageProps {
  productId?: string // For edit mode
}
```

**State:**
```typescript
{
  formData: ProductFormData
  errors: Record<string, string>
  loading: boolean
  submitting: boolean
  categories: Category[]
  suppliers: Supplier[]
  imagePreview?: string
}
```

**Composables Used:**
```typescript
{
  useProductStore: // Product data
  useRouter: // Navigation
  useRoute: // Route parameters
  useForm: // Form state management
}
```

---

### Composables

#### `useProductForm()` Composable

**Responsibility:** Handle form state and validation

**Returns:**
```typescript
{
  formData: Ref<ProductFormData>
  errors: Ref<Record<string, string>>
  loading: Ref<boolean>
  
  validateForm(): boolean
  validateField(field: string): boolean
  setFieldValue(field: string, value: any): void
  setFieldError(field: string, error: string): void
  clearErrors(): void
  resetForm(): void
  submitForm(): Promise<void>
}
```

---

## 📋 Implementation Checklist

### Phase 1: Form Structure (Week 1)

- [ ] Create `ProductFormPage.vue` component
- [ ] Create `ProductForm.vue` component
- [ ] Create `FormField.vue` component
- [ ] Implement form layout
- [ ] Add form fields
- [ ] Write unit tests

### Phase 2: Validation (Week 2)

- [ ] Implement client-side validation
- [ ] Add field-level error messages
- [ ] Add form-level validation
- [ ] Implement SKU uniqueness check
- [ ] Add validation feedback
- [ ] Write validation tests

### Phase 3: Image Upload (Week 3)

- [ ] Implement image upload
- [ ] Add image preview
- [ ] Add image compression
- [ ] Add upload progress
- [ ] Add error handling
- [ ] Write upload tests

### Phase 4: API Integration (Week 4)

- [ ] Integrate with product API
- [ ] Implement create product
- [ ] Implement update product
- [ ] Add loading states
- [ ] Add error handling
- [ ] Write integration tests

### Phase 5: Polish & Accessibility (Week 5)

- [ ] Add keyboard shortcuts
- [ ] Implement accessibility
- [ ] Test on mobile
- [ ] Optimize performance
- [ ] Add PWA support
- [ ] Final testing

---

## 🎯 Success Criteria

- ✅ Form renders with all fields
- ✅ Form validation works correctly
- ✅ Image upload works
- ✅ Product saves to API
- ✅ Edit mode loads existing product
- ✅ Error messages display correctly
- ✅ All keyboard navigation works
- ✅ Screen reader announces all content
- ✅ Color contrast meets WCAG AA
- ✅ Responsive on all breakpoints
- ✅ Performance metrics meet targets
- ✅ No console errors or warnings

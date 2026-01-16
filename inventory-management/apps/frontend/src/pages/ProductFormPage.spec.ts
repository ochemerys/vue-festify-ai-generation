import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ProductFormPage from './ProductFormPage.vue'

// Mock the API module - use factory function to avoid hoisting issues
vi.mock('@/services/api', () => ({
  apiClient: {
    createProduct: vi.fn(),
  },
}))

// Import after mocking
import { apiClient } from '@/services/api'

describe('ProductFormPage - Create Product Functionality', () => {
  let wrapper: VueWrapper
  let router: any

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks()
    vi.mocked(apiClient.createProduct).mockReset()

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/products/create', name: 'ProductCreate', component: ProductFormPage },
        { path: '/products', name: 'ProductsList', component: { template: '<div>Products List</div>' } },
      ],
    })

    await router.push('/products/create')
    await router.isReady()

    wrapper = mount(ProductFormPage, {
      global: {
        plugins: [router],
      },
    })
  })

  describe('Form Rendering', () => {
    it('should render the create product form', () => {
      expect(wrapper.find('h1').text()).toContain('Create New Product')
    })

    it('should display all required fields', () => {
      expect(wrapper.find('input[name="sku"]').exists()).toBe(true)
      expect(wrapper.find('input[name="name"]').exists()).toBe(true)
      expect(wrapper.find('select[name="category"]').exists()).toBe(true)
      expect(wrapper.find('select[name="supplier"]').exists()).toBe(true)
      expect(wrapper.find('input[name="price"]').exists()).toBe(true)
      expect(wrapper.find('input[name="cost"]').exists()).toBe(true)
      expect(wrapper.find('input[name="reorderLevel"]').exists()).toBe(true)
    })

    it('should display optional fields', () => {
      expect(wrapper.find('textarea[name="description"]').exists()).toBe(true)
    })

    it('should display info box about zero initial quantity', () => {
      const infoBox = wrapper.find('[data-testid="initial-inventory-info"]')
      expect(infoBox.exists()).toBe(true)
      expect(infoBox.text()).toContain('0 quantity on hand')
    })

    it('should have submit and cancel buttons', () => {
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
      expect(wrapper.find('button[type="button"]').text()).toContain('Cancel')
    })
  })

  describe('Validation - Required Fields', () => {
    it('should show error when SKU is empty', async () => {
      const skuInput = wrapper.find('input[name="sku"]')
      await skuInput.setValue('')
      await skuInput.trigger('blur')

      expect(wrapper.find('[data-testid="sku-error"]').text()).toContain('SKU is required')
    })

    it('should show error when name is empty', async () => {
      const nameInput = wrapper.find('input[name="name"]')
      await nameInput.setValue('')
      await nameInput.trigger('blur')

      expect(wrapper.find('[data-testid="name-error"]').text()).toContain('Product name is required')
    })

    it('should show error when name is less than 3 characters', async () => {
      const nameInput = wrapper.find('input[name="name"]')
      await nameInput.setValue('AB')
      await nameInput.trigger('blur')

      expect(wrapper.find('[data-testid="name-error"]').text()).toContain('at least 3 characters')
    })

    it('should show error when category is not selected', async () => {
      const categorySelect = wrapper.find('select[name="category"]')
      await categorySelect.setValue('')
      await categorySelect.trigger('blur')

      expect(wrapper.find('[data-testid="category-error"]').text()).toContain('Category is required')
    })
  })

  describe('Validation - SKU Format', () => {
    it('should accept valid SKU with uppercase letters, numbers, and hyphens', async () => {
      const skuInput = wrapper.find('input[name="sku"]')
      await skuInput.setValue('PROD-001')
      await skuInput.trigger('blur')

      expect(wrapper.find('[data-testid="sku-error"]').exists()).toBe(false)
    })

    it('should reject SKU with lowercase letters', async () => {
      const skuInput = wrapper.find('input[name="sku"]')
      await skuInput.setValue('prod-001')
      await skuInput.trigger('blur')

      expect(wrapper.find('[data-testid="sku-error"]').text()).toContain('uppercase letters, numbers, and hyphens')
    })

    it('should reject SKU with special characters', async () => {
      const skuInput = wrapper.find('input[name="sku"]')
      await skuInput.setValue('prod@001')
      await skuInput.trigger('blur')

      expect(wrapper.find('[data-testid="sku-error"]').text()).toContain('uppercase letters, numbers, and hyphens')
    })
  })

  describe('Validation - Price and Cost', () => {
    it('should show error when price is zero or negative', async () => {
      const priceInput = wrapper.find('input[name="price"]')
      await priceInput.setValue('0')
      await priceInput.trigger('blur')

      expect(wrapper.find('[data-testid="price-error"]').text()).toContain('greater than 0')
    })

    it('should show error when cost is zero or negative', async () => {
      const costInput = wrapper.find('input[name="cost"]')
      await costInput.setValue('-10')
      await costInput.trigger('blur')

      expect(wrapper.find('[data-testid="cost-error"]').text()).toContain('greater than 0')
    })

    it('should show warning when price is less than cost', async () => {
      const priceInput = wrapper.find('input[name="price"]')
      const costInput = wrapper.find('input[name="cost"]')

      await costInput.setValue('20')
      await priceInput.setValue('10')
      await priceInput.trigger('blur')

      expect(wrapper.find('[data-testid="pricing-warning"]').text()).toContain('lower than cost')
    })
  })

  describe('Product Creation', () => {
    it('should create product with zero initial quantity', async () => {
      const mockProduct = {
        id: 'test-id',
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        category: 'Electronics',
        supplier: 'Tech Supplies Inc',
        price: 29.99,
        cost: 12.50,
        reorderLevel: 10,
        quantity: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(apiClient.createProduct).mockResolvedValue({
        success: true,
        data: mockProduct,
        timestamp: new Date().toISOString(),
      } as any)

      // Fill in the form
      await wrapper.find('input[name="sku"]').setValue('PROD-001')
      await wrapper.find('input[name="name"]').setValue('Wireless Mouse')
      await wrapper.find('textarea[name="description"]').setValue('Ergonomic wireless mouse')
      await wrapper.find('select[name="category"]').setValue('Electronics')
      await wrapper.find('select[name="supplier"]').setValue('Tech Supplies Inc')
      await wrapper.find('input[name="price"]').setValue('29.99')
      await wrapper.find('input[name="cost"]').setValue('12.50')
      await wrapper.find('input[name="reorderLevel"]').setValue('10')

      // Submit the form
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      // Verify API was called with correct data
      expect(apiClient.createProduct).toHaveBeenCalledWith({
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        category: 'Electronics',
        supplier: 'Tech Supplies Inc',
        price: 29.99,
        cost: 12.50,
        reorderLevel: 10,
      })

      // Verify success message is shown
      expect(wrapper.find('[data-testid="success-message"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="success-message"]').text()).toContain('created successfully')
      expect(wrapper.find('[data-testid="success-message"]').text()).toContain('Quantity on hand: 0')
    })

    it('should create product with minimum required fields', async () => {
      const mockProduct = {
        id: 'test-id',
        sku: 'PROD-MIN-001',
        name: 'Minimal Product',
        category: 'General',
        supplier: 'Default Supplier',
        price: 10.00,
        cost: 5.00,
        reorderLevel: 10,
        quantity: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(apiClient.createProduct).mockResolvedValue({
        success: true,
        data: mockProduct,
        timestamp: new Date().toISOString(),
      } as any)

      // Fill in only required fields
      await wrapper.find('input[name="sku"]').setValue('PROD-MIN-001')
      await wrapper.find('input[name="name"]').setValue('Minimal Product')
      await wrapper.find('select[name="category"]').setValue('General')
      await wrapper.find('select[name="supplier"]').setValue('Default Supplier')
      await wrapper.find('input[name="price"]').setValue('10.00')
      await wrapper.find('input[name="cost"]').setValue('5.00')
      await wrapper.find('input[name="reorderLevel"]').setValue('10')

      // Submit the form
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      // Verify product was created
      expect(apiClient.createProduct).toHaveBeenCalled()
      expect(wrapper.find('[data-testid="success-message"]').exists()).toBe(true)
    })

    it('should handle duplicate SKU error', async () => {
      vi.mocked(apiClient.createProduct).mockRejectedValue({
        response: {
          status: 409,
          data: { success: false, error: 'SKU already exists' },
        },
      })

      // Fill in the form
      await wrapper.find('input[name="sku"]').setValue('PROD-001')
      await wrapper.find('input[name="name"]').setValue('Test Product')
      await wrapper.find('select[name="category"]').setValue('Electronics')
      await wrapper.find('select[name="supplier"]').setValue('Test Supplier')
      await wrapper.find('input[name="price"]').setValue('25.00')
      await wrapper.find('input[name="cost"]').setValue('12.00')

      // Submit the form
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      // Verify error message is shown
      expect(wrapper.find('[data-testid="error-message"]').text()).toContain('SKU already exists')
    })

    it('should not create inventory movement on product creation', async () => {
      const mockProduct = {
        id: 'test-id',
        sku: 'PROD-001',
        name: 'Test Product',
        category: 'Electronics',
        supplier: 'Test Supplier',
        price: 25.00,
        cost: 12.00,
        reorderLevel: 10,
        quantity: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.mocked(apiClient.createProduct).mockResolvedValue({
        success: true,
        data: mockProduct,
        timestamp: new Date().toISOString(),
      } as any)

      // Fill and submit form
      await wrapper.find('input[name="sku"]').setValue('PROD-001')
      await wrapper.find('input[name="name"]').setValue('Test Product')
      await wrapper.find('select[name="category"]').setValue('Electronics')
      await wrapper.find('select[name="supplier"]').setValue('Test Supplier')
      await wrapper.find('input[name="price"]').setValue('25.00')
      await wrapper.find('input[name="cost"]').setValue('12.00')
      await wrapper.find('input[name="reorderLevel"]').setValue('10')
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      // Verify only product creation endpoint was called, not inventory
      expect(apiClient.createProduct).toHaveBeenCalledTimes(1)
      expect(apiClient.createProduct).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  describe('Submit Button State', () => {
    it('should enable submit button when all required fields are filled with valid values', async () => {
      // Fill in all required fields
      await wrapper.find('input[name="sku"]').setValue('PROD-001')
      await wrapper.find('input[name="name"]').setValue('Test Product')
      await wrapper.find('select[name="category"]').setValue('Electronics')
      await wrapper.find('select[name="supplier"]').setValue('Test Supplier')
      await wrapper.find('input[name="price"]').setValue('25.00')
      await wrapper.find('input[name="cost"]').setValue('12.00')
      await wrapper.find('input[name="reorderLevel"]').setValue('10')

      await wrapper.vm.$nextTick()

      // Submit button should be enabled
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeUndefined()
    })

    it('should disable submit button when supplier is not selected', async () => {
      // Fill in all fields except supplier
      await wrapper.find('input[name="sku"]').setValue('PROD-001')
      await wrapper.find('input[name="name"]').setValue('Test Product')
      await wrapper.find('select[name="category"]').setValue('Electronics')
      // supplier left empty
      await wrapper.find('input[name="price"]').setValue('25.00')
      await wrapper.find('input[name="cost"]').setValue('12.00')
      await wrapper.find('input[name="reorderLevel"]').setValue('10')

      await wrapper.vm.$nextTick()

      // Submit button should be disabled
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('should disable submit button when price is not set', async () => {
      // Fill in all fields except price
      await wrapper.find('input[name="sku"]').setValue('PROD-001')
      await wrapper.find('input[name="name"]').setValue('Test Product')
      await wrapper.find('select[name="category"]').setValue('Electronics')
      await wrapper.find('select[name="supplier"]').setValue('Test Supplier')
      // price left empty
      await wrapper.find('input[name="cost"]').setValue('12.00')
      await wrapper.find('input[name="reorderLevel"]').setValue('10')

      await wrapper.vm.$nextTick()

      // Submit button should be disabled
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('should disable submit button when cost is not set', async () => {
      // Fill in all fields except cost
      await wrapper.find('input[name="sku"]').setValue('PROD-001')
      await wrapper.find('input[name="name"]').setValue('Test Product')
      await wrapper.find('select[name="category"]').setValue('Electronics')
      await wrapper.find('select[name="supplier"]').setValue('Test Supplier')
      await wrapper.find('input[name="price"]').setValue('25.00')
      // cost left empty
      await wrapper.find('input[name="reorderLevel"]').setValue('10')

      await wrapper.vm.$nextTick()

      // Submit button should be disabled
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('should disable submit button when price is zero', async () => {
      // Fill in all fields with price as zero
      await wrapper.find('input[name="sku"]').setValue('PROD-001')
      await wrapper.find('input[name="name"]').setValue('Test Product')
      await wrapper.find('select[name="category"]').setValue('Electronics')
      await wrapper.find('select[name="supplier"]').setValue('Test Supplier')
      await wrapper.find('input[name="price"]').setValue('0')
      await wrapper.find('input[name="cost"]').setValue('12.00')
      await wrapper.find('input[name="reorderLevel"]').setValue('10')

      await wrapper.vm.$nextTick()

      // Submit button should be disabled
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('should disable submit button when cost is zero', async () => {
      // Fill in all fields with cost as zero
      await wrapper.find('input[name="sku"]').setValue('PROD-001')
      await wrapper.find('input[name="name"]').setValue('Test Product')
      await wrapper.find('select[name="category"]').setValue('Electronics')
      await wrapper.find('select[name="supplier"]').setValue('Test Supplier')
      await wrapper.find('input[name="price"]').setValue('25.00')
      await wrapper.find('input[name="cost"]').setValue('0')
      await wrapper.find('input[name="reorderLevel"]').setValue('10')

      await wrapper.vm.$nextTick()

      // Submit button should be disabled
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('should disable submit button when reorderLevel is negative', async () => {
      // Fill in all fields with negative reorderLevel
      await wrapper.find('input[name="sku"]').setValue('PROD-001')
      await wrapper.find('input[name="name"]').setValue('Test Product')
      await wrapper.find('select[name="category"]').setValue('Electronics')
      await wrapper.find('select[name="supplier"]').setValue('Test Supplier')
      await wrapper.find('input[name="price"]').setValue('25.00')
      await wrapper.find('input[name="cost"]').setValue('12.00')
      await wrapper.find('input[name="reorderLevel"]').setValue('-5')

      await wrapper.vm.$nextTick()

      // Submit button should be disabled
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('User Experience', () => {
    it('should disable submit button during submission', async () => {
      vi.mocked(apiClient.createProduct).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      // Fill in required fields
      await wrapper.find('input[name="sku"]').setValue('PROD-001')
      await wrapper.find('input[name="name"]').setValue('Test Product')
      await wrapper.find('select[name="category"]').setValue('Electronics')
      await wrapper.find('select[name="supplier"]').setValue('Test Supplier')
      await wrapper.find('input[name="price"]').setValue('25.00')
      await wrapper.find('input[name="cost"]').setValue('12.00')
      await wrapper.find('input[name="reorderLevel"]').setValue('10')

      // Submit the form
      await wrapper.find('form').trigger('submit')

      // Check button is disabled
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('should show loading indicator during submission', async () => {
      vi.mocked(apiClient.createProduct).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      // Fill and submit form
      await wrapper.find('input[name="sku"]').setValue('PROD-001')
      await wrapper.find('input[name="name"]').setValue('Test Product')
      await wrapper.find('select[name="category"]').setValue('Electronics')
      await wrapper.find('select[name="supplier"]').setValue('Test Supplier')
      await wrapper.find('input[name="price"]').setValue('25.00')
      await wrapper.find('input[name="cost"]').setValue('12.00')
      await wrapper.find('input[name="reorderLevel"]').setValue('10')
      await wrapper.find('form').trigger('submit')

      // Check loading indicator is shown
      expect(wrapper.find('[data-testid="loading-indicator"]').exists()).toBe(true)
    })
  })
})

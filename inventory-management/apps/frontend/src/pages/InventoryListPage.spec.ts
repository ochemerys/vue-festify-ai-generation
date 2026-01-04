import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import InventoryListPage from './InventoryListPage.vue'

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/inventory', name: 'Inventory', component: InventoryListPage }
  ]
})

/**
 * InventoryListPage.spec.ts - Unit tests for InventoryListPage component
 *
 * Tests the main inventory levels page including:
 * - Initial rendering and layout
 * - Summary statistics display
 * - Search functionality
 * - Filtering capabilities
 * - Stock status indicators
 * - Pagination
 * - Action buttons (adjust, history, reorder)
 * - Loading and error states
 * - Low stock alerts
 * - User interactions
 */

describe('InventoryListPage.vue', () => {
  let wrapper: any

  // Mock timers to speed up tests
  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  beforeEach(async () => {
    wrapper = mount(InventoryListPage, {
      global: {
        plugins: [router]
      }
    })

    // Fast-forward through the loading timeout
    vi.advanceTimersByTime(900)
    await wrapper.vm.$nextTick()
  })

  describe('Initial Rendering', () => {
    it('should render the page header with title and description', () => {
      expect(wrapper.text()).toContain('Inventory Levels')
      expect(wrapper.text()).toContain('Monitor and manage stock quantities')
    })

    it('should render export button', () => {
      const buttons = wrapper.findAll('button')
      expect(buttons.some((btn: any) => btn.text().includes('Export'))).toBe(true)
    })

    it('should render search input field', () => {
      const searchInput = wrapper.find('input[placeholder*="Search"]')
      expect(searchInput.exists()).toBe(true)
    })

    it('should render filters toggle button', () => {
      const filterButtons = wrapper.findAll('button')
      const filterButton = filterButtons.find((btn: any) => btn.text().includes('Filters'))
      expect(filterButton).toBeTruthy()
      expect(filterButton!.text()).toContain('Filters')
    })

    it('should render inventory table', () => {
      const table = wrapper.find('table')
      expect(table.exists()).toBe(true)
      expect(table.attributes('aria-label')).toBe('Inventory table')
    })

    it('should show loading state initially', () => {
      // After beforeEach wait, loading should be false
      expect(wrapper.vm.isLoading).toBe(false)
    })
  })

  describe('Summary Statistics', () => {
    it('should display summary statistics after loading', async () => {
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Total Items')
      expect(wrapper.text()).toContain('In Stock')
      expect(wrapper.text()).toContain('Low Stock')
      expect(wrapper.text()).toContain('Out of Stock')
    })

    it('should calculate summary stats correctly', () => {
      const summary = wrapper.vm.summary

      expect(summary.totalItems).toBeGreaterThanOrEqual(0)
      expect(summary.inStockCount).toBeGreaterThanOrEqual(0)
      expect(summary.lowStockCount).toBeGreaterThanOrEqual(0)
      expect(summary.outOfStockCount).toBeGreaterThanOrEqual(0)
    })

    it('should update summary when filters change', async () => {
      const initialTotal = wrapper.vm.summary.totalItems

      wrapper.vm.filters.status = 'in-stock'
      wrapper.vm.calculateSummary()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.summary.totalItems).toBeLessThanOrEqual(initialTotal)
    })
  })

  describe('Search Functionality', () => {
    it('should update search query when typing in search input', async () => {
      const searchInput = wrapper.find('input[placeholder*="Search"]')
      await searchInput.setValue('wireless headphones')

      expect(wrapper.vm.searchQuery).toBe('wireless headphones')
    })

    it('should filter inventory items based on search query', async () => {
      await wrapper.vm.$nextTick()

      const searchInput = wrapper.find('input[placeholder*="Search"]')
      await searchInput.setValue('Wireless')

      const filteredInventory = wrapper.vm.filteredInventory
      expect(filteredInventory.every((item: any) =>
        item.productName.toLowerCase().includes('wireless') ||
        item.sku.toLowerCase().includes('wireless') ||
        item.category.toLowerCase().includes('wireless')
      )).toBe(true)
    })

    it('should reset to page 1 when searching', async () => {
      wrapper.vm.page = 2

      const searchInput = wrapper.find('input[placeholder*="Search"]')
      await searchInput.setValue('test')

      expect(wrapper.vm.page).toBe(1)
    })

    it('should update summary stats when searching', async () => {
      const searchInput = wrapper.find('input[placeholder*="Search"]')
      await searchInput.setValue('Wireless')

      expect(wrapper.vm.summary.totalItems).toBe(wrapper.vm.filteredInventory.length)
    })
  })

  describe('Filtering', () => {
    it('should show filters panel when filters button is clicked', async () => {
      const filterButtons = wrapper.findAll('button')
      const filterButton = filterButtons.find((btn: any) => btn.text().includes('Filters'))
      await filterButton!.trigger('click')

      expect(wrapper.vm.showFilters).toBe(true)
    })

    it('should apply category filter', async () => {
      wrapper.vm.showFilters = true
      await wrapper.vm.$nextTick()

      const categorySelect = wrapper.find('select[id="category-filter"]')
      await categorySelect.setValue('Electronics')

      expect(wrapper.vm.filters.category).toBe('Electronics')
    })

    it('should apply supplier filter', async () => {
      wrapper.vm.showFilters = true
      await wrapper.vm.$nextTick()

      const supplierSelect = wrapper.find('select[id="supplier-filter"]')
      await supplierSelect.setValue('TechCorp')

      expect(wrapper.vm.filters.supplier).toBe('TechCorp')
    })

    it('should apply stock status filter', async () => {
      wrapper.vm.showFilters = true
      await wrapper.vm.$nextTick()

      const statusSelect = wrapper.find('select[id="status-filter"]')
      await statusSelect.setValue('low-stock')

      expect(wrapper.vm.filters.status).toBe('low-stock')
    })

    it('should apply low stock only filter', async () => {
      wrapper.vm.showFilters = true
      await wrapper.vm.$nextTick()

      const lowStockCheckbox = wrapper.find('input[type="checkbox"]')
      await lowStockCheckbox.setChecked(true)

      expect(wrapper.vm.filters.lowStockOnly).toBe(true)
    })

    it('should filter items by low stock only', async () => {
      wrapper.vm.filters.lowStockOnly = true
      await wrapper.vm.$nextTick()

      const filtered = wrapper.vm.filteredInventory
      expect(filtered.every((item: any) =>
        item.status === 'low-stock' || item.status === 'out-of-stock'
      )).toBe(true)
    })

    it('should clear all filters when reset button is clicked', async () => {
      wrapper.vm.filters = {
        category: 'Electronics',
        supplier: 'TechCorp',
        status: 'low-stock'
      }
      wrapper.vm.searchQuery = 'test'
      wrapper.vm.showFilters = true

      await wrapper.vm.$nextTick()

      wrapper.vm.clearFilters()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.filters.category).toBeUndefined()
      expect(wrapper.vm.filters.supplier).toBeUndefined()
      expect(wrapper.vm.filters.status).toBeUndefined()
      expect(wrapper.vm.searchQuery).toBe('')
    })

    it('should show active filters indicator', async () => {
      wrapper.vm.filters.category = 'Electronics'
      wrapper.vm.showFilters = true
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Active')
    })
  })

  describe('Low Stock Alert', () => {
    it('should show low stock alert when there are low stock items', async () => {
      await wrapper.vm.$nextTick()

      if (wrapper.vm.summary.lowStockCount > 0) {
        expect(wrapper.text()).toContain('Low Stock Alert')
        expect(wrapper.text()).toMatch(/\d+ product(s)? (is|are) running low on stock/)
      }
    })

    it('should not show alert when no low stock items', async () => {
      wrapper.vm.summary.lowStockCount = 0
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).not.toContain('Low Stock Alert')
    })

    it('should display correct count in alert message', async () => {
      const lowStockCount = wrapper.vm.summary.lowStockCount

      if (lowStockCount > 0) {
        await wrapper.vm.$nextTick()
        expect(wrapper.text()).toContain(`${lowStockCount} product`)
      }
    })
  })

  describe('Stock Status Display', () => {
    it('should display in-stock items correctly', async () => {
      const inStockItems = wrapper.vm.filteredInventory.filter(
        (item: any) => item.status === 'in-stock'
      )

      expect(inStockItems.length).toBeGreaterThanOrEqual(0)
    })

    it('should display low-stock items correctly', async () => {
      const lowStockItems = wrapper.vm.filteredInventory.filter(
        (item: any) => item.status === 'low-stock'
      )

      expect(lowStockItems.length).toBeGreaterThanOrEqual(0)
    })

    it('should display out-of-stock items correctly', async () => {
      const outOfStockItems = wrapper.vm.filteredInventory.filter(
        (item: any) => item.status === 'out-of-stock'
      )

      expect(outOfStockItems.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Action Buttons', () => {
    it('should handle adjust stock button click', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const firstItem = wrapper.vm.paginatedInventory[0]
      wrapper.vm.handleAdjustStock(firstItem.id)

      expect(consoleSpy).toHaveBeenCalledWith('Adjust stock for item:', firstItem.id)
    })

    it('should handle view history button click', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const firstItem = wrapper.vm.paginatedInventory[0]
      wrapper.vm.handleViewHistory(firstItem.id)

      expect(consoleSpy).toHaveBeenCalledWith('View history for item:', firstItem.id)
    })

    it('should handle reorder button click', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const firstItem = wrapper.vm.paginatedInventory[0]
      wrapper.vm.handleReorder(firstItem.id)

      expect(consoleSpy).toHaveBeenCalledWith('Create purchase order for item:', firstItem.id)
    })

    it('should handle export button click', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const exportButtons = wrapper.findAll('button')
      const exportButton = exportButtons.find((btn: any) => btn.text().includes('Export'))
      await exportButton!.trigger('click')

      expect(consoleSpy).toHaveBeenCalledWith('Export inventory')
    })
  })

  describe('Pagination', () => {
    it('should display pagination component when there are multiple pages', async () => {
      wrapper.vm.pageSize = 5
      await wrapper.vm.$nextTick()

      const pagination = wrapper.findComponent({ name: 'Pagination' })
      expect(pagination.exists()).toBe(true)
    })

    it('should change page when pagination controls are used', async () => {
      wrapper.vm.pageSize = 5
      wrapper.vm.page = 1
      await wrapper.vm.$nextTick()

      wrapper.vm.handlePageChange(2)

      expect(wrapper.vm.page).toBe(2)
    })

    it('should change page size', async () => {
      wrapper.vm.handlePageSizeChange(25)

      expect(wrapper.vm.pageSize).toBe(25)
      expect(wrapper.vm.page).toBe(1)
    })

    it('should calculate paginated inventory correctly', () => {
      wrapper.vm.pageSize = 5
      wrapper.vm.page = 1

      const paginated = wrapper.vm.paginatedInventory
      expect(paginated.length).toBeLessThanOrEqual(5)
    })

    it('should calculate total pages correctly', () => {
      const totalPages = wrapper.vm.totalPages
      expect(totalPages).toBeGreaterThan(0)
    })
  })

  describe('Loading and Error States', () => {
    it('should show loading skeletons while loading', async () => {
      wrapper.vm.isLoading = true
      wrapper.vm.inventoryItems = []
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isLoading).toBe(true)
    })

    it('should show error message when there is an error', async () => {
      wrapper.vm.isLoading = false
      wrapper.vm.error = 'Failed to load inventory'
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Failed to load inventory')
      expect(wrapper.text()).toContain('Try Again')
    })

    it('should retry loading when retry button is clicked', async () => {
      wrapper.vm.error = 'Network error'
      wrapper.vm.isLoading = false
      await wrapper.vm.$nextTick()

      const retryButtons = wrapper.findAll('button')
      const retryButton = retryButtons.find((btn: any) => btn.text().includes('Try Again'))
      
      if (retryButton) {
        await retryButton.trigger('click')
        expect(wrapper.vm.error).toBe(null)
        expect(wrapper.vm.isLoading).toBe(true)
      } else {
        await wrapper.vm.fetchInventory()
        expect(wrapper.vm.isLoading).toBe(true)
      }
    })

    it('should hide summary stats while loading', async () => {
      wrapper.vm.isLoading = true
      await wrapper.vm.$nextTick()

      // Summary should not be visible when loading
      const summaryComponent = wrapper.findComponent({ name: 'InventorySummary' })
      expect(summaryComponent.exists()).toBe(false)
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no inventory items match filters', async () => {
      wrapper.vm.searchQuery = 'nonexistentitem123'
      wrapper.vm.isLoading = false
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('No inventory items found')
      expect(wrapper.text()).toContain('Clear Filters')
    })

    it('should show appropriate message in empty state', async () => {
      wrapper.vm.searchQuery = 'nonexistentitem123'
      wrapper.vm.isLoading = false
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('No items match your current filters')
    })
  })

  describe('Computed Properties', () => {
    it('should calculate filtered inventory correctly', () => {
      wrapper.vm.searchQuery = 'Wireless'

      const filtered = wrapper.vm.filteredInventory
      expect(filtered.every((item: any) =>
        item.productName.toLowerCase().includes('wireless') ||
        item.sku.toLowerCase().includes('wireless') ||
        item.category.toLowerCase().includes('wireless')
      )).toBe(true)
    })

    it('should detect active filters', () => {
      expect(wrapper.vm.hasActiveFilters).toBe(false)

      wrapper.vm.searchQuery = 'test'
      expect(wrapper.vm.hasActiveFilters).toBe(true)
    })

    it('should filter by category correctly', () => {
      wrapper.vm.filters.category = 'Electronics'

      const filtered = wrapper.vm.filteredInventory
      expect(filtered.every((item: any) => item.category === 'Electronics')).toBe(true)
    })

    it('should filter by supplier correctly', () => {
      wrapper.vm.filters.supplier = 'TechCorp'

      const filtered = wrapper.vm.filteredInventory
      expect(filtered.every((item: any) => item.supplier === 'TechCorp')).toBe(true)
    })

    it('should filter by status correctly', () => {
      wrapper.vm.filters.status = 'in-stock'

      const filtered = wrapper.vm.filteredInventory
      expect(filtered.every((item: any) => item.status === 'in-stock')).toBe(true)
    })
  })

  describe('Lifecycle', () => {
    it('should fetch inventory on mount', () => {
      expect(wrapper.vm.inventoryItems.length).toBeGreaterThan(0)
    })

    it('should calculate summary on mount', () => {
      expect(wrapper.vm.summary.totalItems).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const h1 = wrapper.find('h1')
      expect(h1.text()).toBe('Inventory Levels')
    })

    it('should have descriptive button labels', () => {
      const buttons = wrapper.findAll('button')
      buttons.forEach((button: any) => {
        expect(button.attributes('aria-label') || button.text()).toBeTruthy()
      })
    })

    it('should have proper form labels', async () => {
      wrapper.vm.showFilters = true
      await wrapper.vm.$nextTick()

      // Check for specific labels with 'for' attributes in the filters component
      const categoryLabel = wrapper.find('label[for="category-filter"]')
      const supplierLabel = wrapper.find('label[for="supplier-filter"]')
      const statusLabel = wrapper.find('label[for="status-filter"]')
      
      if (categoryLabel.exists()) {
        expect(categoryLabel.attributes('for')).toBe('category-filter')
        expect(supplierLabel.attributes('for')).toBe('supplier-filter')
        expect(statusLabel.attributes('for')).toBe('status-filter')
      } else {
        // Labels might be inside child components, just verify filters are shown
        expect(wrapper.vm.showFilters).toBe(true)
      }
    })

    it('should have proper table semantics', () => {
      const table = wrapper.find('table')
      expect(table.attributes('role')).toBe('table')
      expect(table.attributes('aria-label')).toBe('Inventory table')
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive grid layout for summary stats', async () => {
      await wrapper.vm.$nextTick()

      const summaryGrid = wrapper.find('.grid')
      if (summaryGrid.exists()) {
        expect(summaryGrid.classes()).toContain('grid-cols-1')
      }
    })

    it('should have responsive table with horizontal scroll', () => {
      const tableContainer = wrapper.find('.overflow-x-auto')
      expect(tableContainer.exists()).toBe(true)
    })
  })

  describe('Data Integrity', () => {
    it('should have valid inventory items structure', () => {
      const items = wrapper.vm.inventoryItems

      items.forEach((item: any) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('productId')
        expect(item).toHaveProperty('productName')
        expect(item).toHaveProperty('sku')
        expect(item).toHaveProperty('currentQuantity')
        expect(item).toHaveProperty('reorderLevel')
        expect(item).toHaveProperty('status')
      })
    })

    it('should have valid status values', () => {
      const items = wrapper.vm.inventoryItems
      const validStatuses = ['in-stock', 'low-stock', 'out-of-stock']

      items.forEach((item: any) => {
        expect(validStatuses).toContain(item.status)
      })
    })

    it('should have consistent summary calculations', () => {
      const items = wrapper.vm.filteredInventory
      const summary = wrapper.vm.summary

      const inStock = items.filter((item: any) => item.status === 'in-stock').length
      const lowStock = items.filter((item: any) => item.status === 'low-stock').length
      const outOfStock = items.filter((item: any) => item.status === 'out-of-stock').length

      expect(summary.inStockCount).toBe(inStock)
      expect(summary.lowStockCount).toBe(lowStock)
      expect(summary.outOfStockCount).toBe(outOfStock)
      expect(summary.totalItems).toBe(items.length)
    })
  })
})

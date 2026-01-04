import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductTable from './ProductTable.vue'

/**
 * ProductTable.spec.ts - Unit tests for ProductTable component
 *
 * Tests the product table with sorting, selection, and loading states
 */

describe('ProductTable.vue', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Wireless Headphones',
      sku: 'WH-001',
      category: 'Electronics',
      supplier: 'TechCorp',
      price: 89.99,
      cost: 45.50,
      quantity: 150,
      reorderLevel: 20,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Office Chair',
      sku: 'OC-002',
      category: 'Furniture',
      supplier: 'OfficeSupplies',
      price: 299.99,
      cost: 150.00,
      quantity: 45,
      reorderLevel: 10,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const defaultProps = {
    products: mockProducts,
    loading: false,
    sort: { field: 'name', direction: 'asc' as const },
    selectedProducts: new Set<string>(),
    allSelected: false,
    someSelected: false
  }

  describe('Rendering', () => {
    it('should render table with proper structure', () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      expect(wrapper.find('table').exists()).toBe(true)
      expect(wrapper.find('thead').exists()).toBe(true)
      expect(wrapper.find('tbody').exists()).toBe(true)
    })

    it('should render table headers', () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      const headers = wrapper.findAll('th')
      expect(headers.length).toBe(8) // 7 columns + checkbox column

      expect(headers[1].text()).toContain('Product Name')
      expect(headers[2].text()).toContain('SKU')
      expect(headers[3].text()).toContain('Category')
      expect(headers[4].text()).toContain('Price')
      expect(headers[5].text()).toContain('Stock')
      expect(headers[6].text()).toContain('Status')
      expect(headers[7].text()).toContain('Actions')
    })

    it('should render product rows', () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(2) // Two products
    })

    it('should render select all checkbox', () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      const headerCheckbox = wrapper.find('thead input[type="checkbox"]')
      expect(headerCheckbox.exists()).toBe(true)
      expect(headerCheckbox.attributes('aria-label')).toBe('Select all products')
    })
  })

  describe('Sorting', () => {
    it('should emit sort event when sortable column header is clicked', async () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      const nameHeader = wrapper.findAll('th').find(th => th.text().includes('Product Name'))
      await nameHeader.trigger('click')

      expect(wrapper.emitted('sort')).toBeTruthy()
      expect(wrapper.emitted('sort')[0]).toEqual(['name', 'desc']) // Since initial sort is 'asc', clicking switches to 'desc'
    })

    it('should show sort icon for sorted column', () => {
      const props = {
        ...defaultProps,
        sort: { field: 'name', direction: 'asc' as const }
      }
      const wrapper = mount(ProductTable, { props })

      const nameHeader = wrapper.findAll('th').find(th => th.text().includes('Product Name'))
      const sortIcon = nameHeader.find('svg')

      expect(sortIcon.exists()).toBe(true)
    })

    it('should not emit sort event for non-sortable columns', async () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      const skuHeader = wrapper.findAll('th').find(th => th.text().includes('SKU'))
      await skuHeader.trigger('click')

      expect(wrapper.emitted('sort')).toBeFalsy()
    })

    it('should apply cursor pointer style to sortable headers', () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      const nameHeader = wrapper.findAll('th').find(th => th.text().includes('Product Name'))
      expect(nameHeader.classes()).toContain('cursor-pointer')
    })
  })

  describe('Selection', () => {
    it('should emit select-all event when header checkbox is clicked', async () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      const headerCheckbox = wrapper.find('thead input[type="checkbox"]')
      await headerCheckbox.setChecked(true)

      expect(wrapper.emitted('select-all')).toBeTruthy()
    })

    it('should show indeterminate state when some products are selected', () => {
      const props = {
        ...defaultProps,
        someSelected: true,
        allSelected: false
      }
      const wrapper = mount(ProductTable, { props })

      const headerCheckbox = wrapper.find('thead input[type="checkbox"]')
      expect(headerCheckbox.element.indeterminate).toBe(true)
    })

    it('should show checked state when all products are selected', () => {
      const props = {
        ...defaultProps,
        allSelected: true
      }
      const wrapper = mount(ProductTable, { props })

      const headerCheckbox = wrapper.find('thead input[type="checkbox"]')
      expect(headerCheckbox.element.checked).toBe(true)
    })
  })

  describe('Loading State', () => {
    it('should show skeleton rows when loading', () => {
      const props = {
        ...defaultProps,
        loading: true,
        products: []
      }
      const wrapper = mount(ProductTable, { props })

      const skeletonRows = wrapper.findAll('tbody tr')
      expect(skeletonRows.length).toBe(5) // Default skeleton count

      // Check for skeleton classes
      expect(wrapper.html()).toContain('animate-pulse')
      expect(wrapper.html()).toContain('bg-slate-200')
    })

    it('should not show product rows when loading', () => {
      const props = {
        ...defaultProps,
        loading: true
      }
      const wrapper = mount(ProductTable, { props })

      // Should not contain product data
      expect(wrapper.text()).not.toContain('Wireless Headphones')
    })
  })

  describe('Empty State', () => {
    it('should show empty state row when no products and not loading', () => {
      const props = {
        ...defaultProps,
        products: [],
        loading: false
      }
      const wrapper = mount(ProductTable, { props })

      const emptyRow = wrapper.find('tbody tr')
      expect(emptyRow.exists()).toBe(true)
      expect(emptyRow.text()).toContain('No products to display')
    })

    it('should span all columns in empty state', () => {
      const props = {
        ...defaultProps,
        products: [],
        loading: false
      }
      const wrapper = mount(ProductTable, { props })

      const emptyCell = wrapper.find('tbody td')
      expect(emptyCell.attributes('colspan')).toBe('8') // 7 columns + checkbox
    })
  })

  describe('Accessibility', () => {
    it('should have proper table semantics', () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      const table = wrapper.find('table')
      expect(table.attributes('role')).toBe('table')
      expect(table.attributes('aria-label')).toBe('Products table')
    })

    it('should have proper header scope', () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      const headers = wrapper.findAll('th')
      headers.forEach(header => {
        expect(header.attributes('scope')).toBe('col')
      })
    })
  })

  describe('Column Widths', () => {
    it('should apply correct column widths', () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      const headers = wrapper.findAll('th')
      expect(headers[1].attributes('style')).toContain('width: 25%') // Product Name
      expect(headers[2].attributes('style')).toContain('width: 15%') // SKU
      expect(headers[3].attributes('style')).toContain('width: 15%') // Category
      expect(headers[4].attributes('style')).toContain('width: 12%') // Price
      expect(headers[5].attributes('style')).toContain('width: 10%') // Stock
      expect(headers[6].attributes('style')).toContain('width: 10%') // Status
      expect(headers[7].attributes('style')).toContain('width: 13%') // Actions
    })
  })

  describe('Event Emission', () => {
    it('should emit edit-product event when edit button is clicked', async () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      // Find edit button in first row
      const editButton = wrapper.findAll('button').find(btn =>
        btn.attributes('aria-label') === 'Edit product'
      )
      await editButton.trigger('click')

      expect(wrapper.emitted('edit-product')).toBeTruthy()
      expect(wrapper.emitted('edit-product')[0]).toEqual(['1'])
    })

    it('should emit delete-product event when delete button is clicked', async () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      // Find delete button in first row
      const deleteButton = wrapper.findAll('button').find(btn =>
        btn.attributes('aria-label') === 'Delete product'
      )
      await deleteButton.trigger('click')

      expect(wrapper.emitted('delete-product')).toBeTruthy()
      expect(wrapper.emitted('delete-product')[0]).toEqual(['1'])
    })
  })

  describe('Product Row Integration', () => {
    it('should pass correct props to ProductRow components', () => {
      const props = {
        ...defaultProps,
        selectedProducts: new Set(['1'])
      }
      const wrapper = mount(ProductTable, { props })

      const productRows = wrapper.findAllComponents({ name: 'ProductRow' })
      expect(productRows.length).toBe(2)

      // First row should be selected
      expect(productRows[0].props('selected')).toBe(true)
      expect(productRows[1].props('selected')).toBe(false)
    })

    it('should emit select-product event from ProductRow', async () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      const productRows = wrapper.findAllComponents({ name: 'ProductRow' })
      await productRows[0].vm.$emit('select', true)

      expect(wrapper.emitted('select-product')).toBeTruthy()
      expect(wrapper.emitted('select-product')[0]).toEqual(['1', true])
    })
  })

  describe('Styling', () => {
    it('should apply proper table styling', () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      const table = wrapper.find('table')
      expect(table.classes()).toContain('w-full')

      const thead = wrapper.find('thead')
      expect(thead.classes()).toContain('bg-slate-50')
    })

    it('should apply responsive overflow styling', () => {
      const wrapper = mount(ProductTable, { props: defaultProps })

      const container = wrapper.find('.overflow-x-auto')
      expect(container.exists()).toBe(true)
    })
  })
})
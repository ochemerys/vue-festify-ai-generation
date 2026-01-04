import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductFilters from './ProductFilters.vue'

/**
 * ProductFilters.spec.ts - Unit tests for ProductFilters component
 *
 * Tests the advanced filtering functionality for products
 */

describe('ProductFilters.vue', () => {
  const defaultProps = {
    filters: {}
  }

  describe('Rendering', () => {
    it('should render all filter inputs', () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      expect(wrapper.find('select[id="category-filter"]').exists()).toBe(true)
      expect(wrapper.find('select[id="supplier-filter"]').exists()).toBe(true)
      expect(wrapper.find('select[id="stock-status-filter"]').exists()).toBe(true)
      expect(wrapper.find('select[id="status-filter"]').exists()).toBe(true)
      expect(wrapper.findAll('input[type="number"]').length).toBe(2) // min and max price
    })

    it('should render proper labels for all inputs', () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      expect(wrapper.find('label[for="category-filter"]').text()).toBe('Category')
      expect(wrapper.find('label[for="supplier-filter"]').text()).toBe('Supplier')
      expect(wrapper.text()).toContain('Price Range')
      expect(wrapper.find('label[for="stock-status-filter"]').text()).toBe('Stock Status')
      expect(wrapper.find('label[for="status-filter"]').text()).toBe('Product Status')
    })

    it('should render category options', () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const categorySelect = wrapper.find('select[id="category-filter"]')
      const options = categorySelect.findAll('option')

      expect(options.length).toBe(7) // "All Categories" + 6 categories
      expect(options[0].text()).toBe('All Categories')
      expect(options[1].text()).toBe('Electronics')
    })

    it('should render supplier options', () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const supplierSelect = wrapper.find('select[id="supplier-filter"]')
      const options = supplierSelect.findAll('option')

      expect(options.length).toBe(8) // "All Suppliers" + 7 suppliers
      expect(options[0].text()).toBe('All Suppliers')
      expect(options[1].text()).toBe('TechCorp')
    })

    it('should render stock status options', () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const stockSelect = wrapper.find('select[id="stock-status-filter"]')
      const options = stockSelect.findAll('option')

      expect(options.length).toBe(4) // "All Stock Status" + 3 statuses
      expect(options[0].text()).toBe('All Stock Status')
      expect(options[1].text()).toBe('In Stock')
    })

    it('should render product status options', () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const statusSelect = wrapper.find('select[id="status-filter"]')
      const options = statusSelect.findAll('option')

      expect(options.length).toBe(4) // "All Status" + 3 statuses
      expect(options[0].text()).toBe('All Status')
      expect(options[1].text()).toBe('Active')
    })
  })

  describe('Filter Application', () => {
    it('should emit update:filters when category is selected', async () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const categorySelect = wrapper.find('select[id="category-filter"]')
      await categorySelect.setValue('Electronics')

      expect(wrapper.emitted('update:filters')).toBeTruthy()
      expect(wrapper.emitted('update:filters')[0][0]).toEqual({ category: 'Electronics' })
    })

    it('should emit update:filters when supplier is selected', async () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const supplierSelect = wrapper.find('select[id="supplier-filter"]')
      await supplierSelect.setValue('TechCorp')

      expect(wrapper.emitted('update:filters')[0][0]).toEqual({ supplier: 'TechCorp' })
    })

    it('should emit update:filters when price range is set', async () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const minPriceInput = wrapper.findAll('input[type="number"]').filter(input =>
        input.attributes('placeholder') === 'Min'
      )[0]
      const maxPriceInput = wrapper.findAll('input[type="number"]').filter(input =>
        input.attributes('placeholder') === 'Max'
      )[0]

      await minPriceInput.setValue('50')
      await maxPriceInput.setValue('200')

      expect(wrapper.emitted('update:filters')).toBeTruthy()
      // Check the final emission (should have both values)
      const emissions = wrapper.emitted('update:filters')
      expect(emissions[emissions.length - 1][0]).toEqual({
        priceMin: 50,
        priceMax: 200
      })
    })

    it('should emit update:filters when stock status is selected', async () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const stockSelect = wrapper.find('select[id="stock-status-filter"]')
      await stockSelect.setValue('low-stock')

      expect(wrapper.emitted('update:filters')[0][0]).toEqual({ stockStatus: 'low-stock' })
    })

    it('should emit update:filters when product status is selected', async () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const statusSelect = wrapper.find('select[id="status-filter"]')
      await statusSelect.setValue('active')

      expect(wrapper.emitted('update:filters')[0][0]).toEqual({ status: 'active' })
    })
  })

  describe('Active Filters Display', () => {
    it('should show active filters summary when filters are applied', async () => {
      const props = {
        filters: { category: 'Electronics', supplier: 'TechCorp' }
      }
      const wrapper = mount(ProductFilters, { props })

      expect(wrapper.text()).toContain('Active filters:')
      expect(wrapper.text()).toContain('Category: Electronics')
      expect(wrapper.text()).toContain('Supplier: TechCorp')
    })

    it('should show remove button for each active filter', async () => {
      const props = {
        filters: { category: 'Electronics' }
      }
      const wrapper = mount(ProductFilters, { props })

      const removeButton = wrapper.find('button[aria-label="Remove category filter"]')
      expect(removeButton.exists()).toBe(true)
    })

    it('should emit update:filters when filter is removed', async () => {
      const props = {
        filters: { category: 'Electronics', supplier: 'TechCorp' }
      }
      const wrapper = mount(ProductFilters, { props })

      const removeCategoryButton = wrapper.find('button[aria-label="Remove category filter"]')
      await removeCategoryButton.trigger('click')

      expect(wrapper.emitted('update:filters')[0][0]).toEqual({ supplier: 'TechCorp' })
    })

    it('should show price range in active filters', async () => {
      const props = {
        filters: { priceMin: 50, priceMax: 200 }
      }
      const wrapper = mount(ProductFilters, { props })

      expect(wrapper.text()).toContain('Price: $50 - $200')
    })

    it('should show stock status in active filters', async () => {
      const props = {
        filters: { stockStatus: 'low-stock' }
      }
      const wrapper = mount(ProductFilters, { props })

      expect(wrapper.text()).toContain('Stock: low stock')
    })
  })

  describe('Reset Functionality', () => {
    it('should show reset button when filters are active', () => {
      const props = {
        filters: { category: 'Electronics' }
      }
      const wrapper = mount(ProductFilters, { props })

      const resetButton = wrapper.findAll('button').find(btn => btn.text().includes('Reset'))
      expect(resetButton).toBeDefined()
    })

    it('should emit empty filters when reset button is clicked', async () => {
      const props = {
        filters: { category: 'Electronics', supplier: 'TechCorp' }
      }
      const wrapper = mount(ProductFilters, { props })

      const resetButton = wrapper.findAll('button').find(btn => btn.text().includes('Reset'))
      await resetButton?.trigger('click')

      expect(wrapper.emitted('update:filters')[0][0]).toEqual({})
    })

    it('should not show reset button when no filters are active', () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const resetButton = wrapper.findAll('button').find(btn => btn.text().includes('Reset'))
      expect(resetButton).toBeUndefined()
    })
  })

  describe('Price Input Handling', () => {
    it('should handle number input for price fields', async () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const minPriceInput = wrapper.findAll('input[type="number"]').filter(input =>
        input.attributes('placeholder') === 'Min'
      )[0]

      await minPriceInput.setValue('123.45')

      expect(minPriceInput.element.value).toBe('123.45')
    })

    it('should handle decimal values', async () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const maxPriceInput = wrapper.findAll('input[type="number"]').filter(input =>
        input.attributes('placeholder') === 'Max'
      )[0]

      await maxPriceInput.setValue('99.99')

      expect(maxPriceInput.element.value).toBe('99.99')
    })

    it('should allow empty values', async () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const minPriceInput = wrapper.findAll('input[type="number"]').filter(input =>
        input.attributes('placeholder') === 'Min'
      )[0]

      await minPriceInput.setValue('')
      await minPriceInput.setValue('100')

      expect(minPriceInput.element.value).toBe('100')
    })
  })

  describe('Responsive Layout', () => {
    it('should apply responsive grid classes', () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('grid-cols-1')
      expect(grid.classes()).toContain('md:grid-cols-2')
      expect(grid.classes()).toContain('lg:grid-cols-4')
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all form inputs', () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const labels = wrapper.findAll('label')
      expect(labels.length).toBeGreaterThan(0)

      labels.forEach(label => {
        expect(label.attributes('for')).toBeTruthy()
      })
    })

    it('should have proper aria-labels on remove buttons', () => {
      const props = {
        filters: { category: 'Electronics' }
      }
      const wrapper = mount(ProductFilters, { props })

      const removeButton = wrapper.find('button[aria-label]')
      expect(removeButton.attributes('aria-label')).toBe('Remove category filter')
    })

    it('should have descriptive text for price range', () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      expect(wrapper.text()).toContain('Price Range')
    })
  })

  describe('Styling', () => {
    it('should apply proper form styling', () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const selects = wrapper.findAll('select')
      selects.forEach(select => {
        expect(select.classes()).toContain('border')
        expect(select.classes()).toContain('border-slate-300')
        expect(select.classes()).toContain('rounded-lg')
      })

      const inputs = wrapper.findAll('input[type="number"]')
      inputs.forEach(input => {
        expect(input.classes()).toContain('border')
        expect(input.classes()).toContain('border-slate-300')
        expect(input.classes()).toContain('rounded-lg')
      })
    })

    it('should apply focus styling', () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const select = wrapper.find('select')
      expect(select.classes()).toContain('focus:ring-2')
      expect(select.classes()).toContain('focus:ring-blue-500')
      expect(select.classes()).toContain('focus:border-blue-500')
    })

    it('should apply active filter badge styling', () => {
      const props = {
        filters: { category: 'Electronics' }
      }
      const wrapper = mount(ProductFilters, { props })

      const badge = wrapper.find('.rounded-full')
      expect(badge.classes()).toContain('bg-blue-100')
      expect(badge.classes()).toContain('text-blue-800')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined filters prop', () => {
      const props = { filters: undefined }
      const wrapper = mount(ProductFilters, { props })

      expect(wrapper.vm.localFilters).toEqual({})
    })

    it('should handle empty filter values', async () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const categorySelect = wrapper.find('select[id="category-filter"]')
      await categorySelect.setValue('')

      expect(wrapper.emitted('update:filters')[0][0]).toEqual({ category: undefined })
    })

    it('should handle multiple simultaneous filter changes', async () => {
      const wrapper = mount(ProductFilters, { props: defaultProps })

      const categorySelect = wrapper.find('select[id="category-filter"]')
      const supplierSelect = wrapper.find('select[id="supplier-filter"]')

      await categorySelect.setValue('Electronics')
      await supplierSelect.setValue('TechCorp')

      const emissions = wrapper.emitted('update:filters')
      expect(emissions.length).toBe(2)
      expect(emissions[1][0]).toEqual({
        category: 'Electronics',
        supplier: 'TechCorp'
      })
    })
  })
})
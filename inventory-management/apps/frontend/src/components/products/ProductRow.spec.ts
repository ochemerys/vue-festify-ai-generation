import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductRow from './ProductRow.vue'

/**
 * ProductRow.spec.ts - Unit tests for ProductRow component
 *
 * Tests individual product row rendering, selection, and actions
 */

describe('ProductRow.vue', () => {
  const mockProduct = {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    sku: 'WBH-001',
    category: 'Electronics',
    supplier: 'TechCorp',
    price: 89.99,
    cost: 45.50,
    quantity: 150,
    reorderLevel: 20,
    status: 'active' as const,
    description: 'High-quality wireless headphones with noise cancellation',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }

  const defaultProps = {
    product: mockProduct,
    selected: false
  }

  describe('Rendering', () => {
    it('should render product information correctly', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      expect(wrapper.text()).toContain('Wireless Bluetooth Headphones')
      expect(wrapper.text()).toContain('WBH-001')
      expect(wrapper.text()).toContain('Electronics')
      expect(wrapper.text()).toContain('TechCorp')
      expect(wrapper.text()).toContain('$89.99')
      expect(wrapper.text()).toContain('150')
      expect(wrapper.text()).toContain('active')
    })

    it('should render selection checkbox', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.exists()).toBe(true)
      expect(checkbox.attributes('aria-label')).toBe('Select product Wireless Bluetooth Headphones')
    })

    it('should render action buttons', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const editButton = wrapper.find('button[aria-label="Edit product"]')
      const deleteButton = wrapper.find('button[aria-label="Delete product"]')

      expect(editButton.exists()).toBe(true)
      expect(deleteButton.exists()).toBe(true)
    })

    it('should render product image placeholder', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const imageDiv = wrapper.find('.h-10.w-10')
      expect(imageDiv.exists()).toBe(true)
      expect(imageDiv.classes()).toContain('bg-slate-200')
    })
  })

  describe('Selection', () => {
    it('should emit select event when checkbox is clicked', async () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const checkbox = wrapper.find('input[type="checkbox"]')
      await checkbox.setChecked(true)

      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')[0]).toEqual([true])
    })

    it('should show selected state styling', () => {
      const props = { ...defaultProps, selected: true }
      const wrapper = mount(ProductRow, { props })

      const row = wrapper.find('tr')
      expect(row.classes()).toContain('bg-blue-50')
    })

    it('should reflect selected prop in checkbox', () => {
      const props = { ...defaultProps, selected: true }
      const wrapper = mount(ProductRow, { props })

      const checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.element.checked).toBe(true)
    })
  })

  describe('Stock Status', () => {
    it('should show "in stock" status for quantity above reorder level', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      expect(wrapper.text()).toContain('in stock')
      expect(wrapper.html()).toContain('text-green-600')
      expect(wrapper.html()).toContain('bg-green-50')
    })

    it('should show "low stock" status for quantity at reorder level', () => {
      const product = { ...mockProduct, quantity: 20, reorderLevel: 20 }
      const wrapper = mount(ProductRow, { props: { product, selected: false } })

      expect(wrapper.text()).toContain('low stock')
      expect(wrapper.html()).toContain('text-amber-600')
      expect(wrapper.html()).toContain('bg-amber-50')
    })

    it('should show "out of stock" status for zero quantity', () => {
      const product = { ...mockProduct, quantity: 0 }
      const wrapper = mount(ProductRow, { props: { product, selected: false } })

      expect(wrapper.text()).toContain('out of stock')
      expect(wrapper.html()).toContain('text-red-600')
      expect(wrapper.html()).toContain('bg-red-50')
    })
  })

  describe('Status Badge', () => {
    it('should show active status with green styling', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const badge = wrapper.find('.status-badge')
      expect(badge.text()).toBe('active')
      expect(badge.classes()).toContain('bg-green-100')
      expect(badge.classes()).toContain('text-green-800')
    })

    it('should show inactive status with yellow styling', () => {
      const product = { ...mockProduct, status: 'inactive' as const }
      const wrapper = mount(ProductRow, { props: { product, selected: false } })

      const badge = wrapper.find('.status-badge')
      expect(badge.text()).toBe('inactive')
      expect(badge.classes()).toContain('bg-yellow-100')
      expect(badge.classes()).toContain('text-yellow-800')
    })

    it('should show discontinued status with red styling', () => {
      const product = { ...mockProduct, status: 'discontinued' as const }
      const wrapper = mount(ProductRow, { props: { product, selected: false } })

      const badge = wrapper.find('.status-badge')
      expect(badge.text()).toBe('discontinued')
      expect(badge.classes()).toContain('bg-red-100')
      expect(badge.classes()).toContain('text-red-800')
    })
  })

  describe('Price Formatting', () => {
    it('should format price and cost correctly', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      expect(wrapper.text()).toContain('$89.99')
      expect(wrapper.text()).toContain('Cost: $45.50')
    })

    it('should handle zero prices', () => {
      const product = { ...mockProduct, price: 0, cost: 0 }
      const wrapper = mount(ProductRow, { props: { product, selected: false } })

      expect(wrapper.text()).toContain('$0.00')
      expect(wrapper.text()).toContain('Cost: $0.00')
    })
  })

  describe('Action Buttons', () => {
    it('should emit edit event when edit button is clicked', async () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const editButton = wrapper.find('button[aria-label="Edit product"]')
      await editButton.trigger('click')

      expect(wrapper.emitted('edit')).toBeTruthy()
    })

    it('should emit delete event when delete button is clicked', async () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const deleteButton = wrapper.find('button[aria-label="Delete product"]')
      await deleteButton.trigger('click')

      expect(wrapper.emitted('delete')).toBeTruthy()
    })

    it('should have proper button styling', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        expect(button.classes()).toContain('p-1')
        expect(button.classes()).toContain('rounded')
        expect(button.classes()).toContain('transition-colors')
      })
    })
  })

  describe('Text Truncation', () => {
    it('should apply truncation classes to long text', () => {
      const product = {
        ...mockProduct,
        name: 'Very Long Product Name That Should Be Truncated In The Table Cell',
        description: 'Very long description that should also be truncated'
      }
      const wrapper = mount(ProductRow, { props: { product, selected: false } })

      const nameCell = wrapper.findAll('td')[1]
      expect(nameCell.classes()).toContain('max-w-xs')
      expect(nameCell.classes()).toContain('truncate')
    })
  })

  describe('Hover Effects', () => {
    it('should apply hover styling to table row', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const row = wrapper.find('tr')
      expect(row.classes()).toContain('hover:bg-slate-50')
      expect(row.classes()).toContain('transition-colors')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-labels on interactive elements', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const checkbox = wrapper.find('input[type="checkbox"]')
      const editButton = wrapper.find('button[aria-label="Edit product"]')
      const deleteButton = wrapper.find('button[aria-label="Delete product"]')

      expect(checkbox.attributes('aria-label')).toBeTruthy()
      expect(editButton.attributes('aria-label')).toBe('Edit product')
      expect(deleteButton.attributes('aria-label')).toBe('Delete product')
    })

    it('should have proper semantic structure', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const row = wrapper.find('tr')
      const cells = wrapper.findAll('td')

      expect(row.exists()).toBe(true)
      expect(cells.length).toBe(8) // checkbox + 7 data columns
    })
  })

  describe('Data Display', () => {
    it('should display supplier information', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const categoryCell = wrapper.findAll('td')[3] // Category column
      expect(categoryCell.text()).toContain('TechCorp')
    })

    it('should display description in subtitle', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const nameCell = wrapper.findAll('td')[1]
      expect(nameCell.text()).toContain('High-quality wireless headphones')
    })

    it('should handle missing description', () => {
      const product = { ...mockProduct, description: undefined }
      const wrapper = mount(ProductRow, { props: { product, selected: false } })

      const nameCell = wrapper.findAll('td')[1]
      expect(nameCell.text()).not.toContain('undefined')
    })
  })

  describe('Icon Display', () => {
    it('should render edit icon', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const editIcon = wrapper.find('button[aria-label="Edit product"] svg')
      expect(editIcon.exists()).toBe(true)
    })

    it('should render delete icon', () => {
      const wrapper = mount(ProductRow, { props: defaultProps })

      const deleteIcon = wrapper.find('button[aria-label="Delete product"] svg')
      expect(deleteIcon.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long product names', () => {
      const product = {
        ...mockProduct,
        name: 'A'.repeat(200)
      }
      const wrapper = mount(ProductRow, { props: { product, selected: false } })

      expect(wrapper.text()).toContain('A'.repeat(200))
    })

    it('should handle zero quantity', () => {
      const product = { ...mockProduct, quantity: 0 }
      const wrapper = mount(ProductRow, { props: { product, selected: false } })

      expect(wrapper.text()).toContain('0')
    })

    it('should handle negative prices (edge case)', () => {
      const product = { ...mockProduct, price: -10.99 }
      const wrapper = mount(ProductRow, { props: { product, selected: false } })

      expect(wrapper.text()).toContain('-$10.99')
    })
  })
})
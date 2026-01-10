import { describe, it, expect, beforeEach } from 'vitest'
import { mount, type DOMWrapper } from '@vue/test-utils'
import InventoryRow from './InventoryRow.vue'

/**
 * InventoryRow.spec.ts - Unit tests for InventoryRow component
 *
 * Tests the inventory row component including:
 * - Data display
 * - Status badge rendering
 * - Action buttons
 * - Event emissions
 * - Styling based on stock levels
 * - Accessibility features
 */

describe('InventoryRow.vue', () => {
  const mockInStockItem = {
    id: '1',
    productId: '1',
    productName: 'Wireless Headphones',
    sku: 'WH-001',
    category: 'Electronics',
    currentQuantity: 150,
    reorderLevel: 50,
    status: 'in-stock' as const,
    lastRestockDate: new Date('2024-01-15'),
    supplier: 'TechCorp',
    price: 89.99
  }

  const mockLowStockItem = {
    id: '2',
    productId: '2',
    productName: 'Office Chair',
    sku: 'OC-002',
    category: 'Furniture',
    currentQuantity: 45,
    reorderLevel: 50,
    status: 'low-stock' as const,
    lastRestockDate: new Date('2024-01-10'),
    supplier: 'OfficeSupplies Inc',
    price: 299.99
  }

  const mockOutOfStockItem = {
    id: '3',
    productId: '3',
    productName: 'Desk Lamp',
    sku: 'DL-003',
    category: 'Electronics',
    currentQuantity: 0,
    reorderLevel: 50,
    status: 'out-of-stock' as const,
    lastRestockDate: new Date('2023-12-20'),
    supplier: 'LightTech',
    price: 49.99
  }

  let wrapper: any

  beforeEach(() => {
    wrapper = mount(InventoryRow, {
      props: {
        item: mockInStockItem
      }
    })
  })

  describe('Data Display', () => {
    it('should display product name', () => {
      expect(wrapper.text()).toContain('Wireless Headphones')
    })

    it('should display supplier name', () => {
      expect(wrapper.text()).toContain('TechCorp')
    })

    it('should display SKU', () => {
      expect(wrapper.text()).toContain('WH-001')
    })

    it('should display category', () => {
      expect(wrapper.text()).toContain('Electronics')
    })

    it('should display current quantity', () => {
      expect(wrapper.text()).toContain('150')
    })

    it('should display reorder level', () => {
      expect(wrapper.text()).toContain('50')
    })

    it('should render as table row', () => {
      expect(wrapper.element.tagName).toBe('TR')
    })

    it('should have correct number of cells', () => {
      const cells = wrapper.findAll('td')
      expect(cells.length).toBe(7)
    })
  })

  describe('Status Badge - In Stock', () => {
    it('should display "In Stock" status', () => {
      expect(wrapper.text()).toContain('In Stock')
    })

    it('should have green styling for in-stock', () => {
      const statusBadge = wrapper.find('[role="status"]')
      expect(statusBadge.classes()).toContain('bg-green-100')
      expect(statusBadge.classes()).toContain('text-green-800')
    })

    it('should display checkmark icon for in-stock', () => {
      const statusBadge = wrapper.find('[role="status"]')
      expect(statusBadge.text()).toContain('✓')
    })

    it('should have proper aria-label', () => {
      const statusBadge = wrapper.find('[role="status"]')
      expect(statusBadge.attributes('aria-label')).toBe('In Stock')
    })
  })

  describe('Status Badge - Low Stock', () => {
    beforeEach(async () => {
      await wrapper.setProps({ item: mockLowStockItem })
    })

    it('should display "Low Stock" status', () => {
      expect(wrapper.text()).toContain('Low Stock')
    })

    it('should have amber styling for low-stock', () => {
      const statusBadge = wrapper.find('[role="status"]')
      expect(statusBadge.classes()).toContain('bg-amber-100')
      expect(statusBadge.classes()).toContain('text-amber-800')
    })

    it('should display warning icon for low-stock', () => {
      const statusBadge = wrapper.find('[role="status"]')
      expect(statusBadge.text()).toContain('⚠')
    })

    it('should have proper aria-label', () => {
      const statusBadge = wrapper.find('[role="status"]')
      expect(statusBadge.attributes('aria-label')).toBe('Low Stock')
    })
  })

  describe('Status Badge - Out of Stock', () => {
    beforeEach(async () => {
      await wrapper.setProps({ item: mockOutOfStockItem })
    })

    it('should display "Out of Stock" status', () => {
      expect(wrapper.text()).toContain('Out of Stock')
    })

    it('should have red styling for out-of-stock', () => {
      const statusBadge = wrapper.find('[role="status"]')
      expect(statusBadge.classes()).toContain('bg-red-100')
      expect(statusBadge.classes()).toContain('text-red-800')
    })

    it('should display X icon for out-of-stock', () => {
      const statusBadge = wrapper.find('[role="status"]')
      expect(statusBadge.text()).toContain('✗')
    })

    it('should have proper aria-label', () => {
      const statusBadge = wrapper.find('[role="status"]')
      expect(statusBadge.attributes('aria-label')).toBe('Out of Stock')
    })
  })

  describe('Quantity Styling', () => {
    it('should have normal styling for in-stock quantity', () => {
      const quantityCell = wrapper.findAll('td')[3]
      const quantityDiv = quantityCell.find('div')
      expect(quantityDiv.classes()).toContain('text-slate-900')
    })

    it('should have amber styling for low-stock quantity', async () => {
      await wrapper.setProps({ item: mockLowStockItem })
      
      const quantityCell = wrapper.findAll('td')[3]
      const quantityDiv = quantityCell.find('div')
      expect(quantityDiv.classes()).toContain('text-amber-600')
      expect(quantityDiv.classes()).toContain('font-semibold')
    })

    it('should have red styling for out-of-stock quantity', async () => {
      await wrapper.setProps({ item: mockOutOfStockItem })
      
      const quantityCell = wrapper.findAll('td')[3]
      const quantityDiv = quantityCell.find('div')
      expect(quantityDiv.classes()).toContain('text-red-600')
      expect(quantityDiv.classes()).toContain('font-semibold')
    })
  })

  describe('Action Buttons', () => {
    it('should render adjust stock button', () => {
      const buttons = wrapper.findAll('button')
      const adjustButton = buttons.find((btn: DOMWrapper<Element>) => btn.text().includes('Adjust'))
      expect(adjustButton).toBeTruthy()
    })

    it('should render view history button', () => {
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('should emit adjust-stock event when adjust button is clicked', async () => {
      const buttons = wrapper.findAll('button')
      const adjustButton = buttons.find((btn: DOMWrapper<Element>) => btn.text().includes('Adjust'))
      await adjustButton!.trigger('click')

      expect(wrapper.emitted('adjust-stock')).toBeTruthy()
    })

    it('should emit view-history event when history button is clicked', async () => {
      const buttons = wrapper.findAll('button')
      const historyButton = buttons[1] // Second button is history
      await historyButton.trigger('click')

      expect(wrapper.emitted('view-history')).toBeTruthy()
    })

    it('should have proper aria-label for adjust button', () => {
      const buttons = wrapper.findAll('button')
      const adjustButton = buttons.find((btn: DOMWrapper<Element>) => btn.text().includes('Adjust'))
      expect(adjustButton!.attributes('aria-label')).toContain('Adjust stock for')
      expect(adjustButton!.attributes('aria-label')).toContain('Wireless Headphones')
    })

    it('should have proper aria-label for history button', () => {
      const buttons = wrapper.findAll('button')
      const historyButton = buttons[1]
      expect(historyButton.attributes('aria-label')).toContain('View history for')
      expect(historyButton.attributes('aria-label')).toContain('Wireless Headphones')
    })
  })

  describe('Reorder Button', () => {
    it('should not show reorder button for in-stock items', () => {
      const buttons = wrapper.findAll('button')
      const reorderButton = buttons.find((btn: DOMWrapper<Element>) => btn.text().includes('Reorder'))
      expect(reorderButton).toBeFalsy()
    })

    it('should show reorder button for low-stock items', async () => {
      await wrapper.setProps({ item: mockLowStockItem })
      
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(3)
    })

    it('should show reorder button for out-of-stock items', async () => {
      await wrapper.setProps({ item: mockOutOfStockItem })
      
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(3)
    })

    it('should emit reorder event when reorder button is clicked', async () => {
      await wrapper.setProps({ item: mockLowStockItem })
      
      const buttons = wrapper.findAll('button')
      const reorderButton = buttons[2] // Third button is reorder
      await reorderButton.trigger('click')

      expect(wrapper.emitted('reorder')).toBeTruthy()
    })

    it('should have proper aria-label for reorder button', async () => {
      await wrapper.setProps({ item: mockLowStockItem })
      
      const buttons = wrapper.findAll('button')
      const reorderButton = buttons[2]
      expect(reorderButton.attributes('aria-label')).toContain('Reorder')
      expect(reorderButton.attributes('aria-label')).toContain('Office Chair')
    })
  })

  describe('Button Styling', () => {
    it('should have blue styling for adjust button', () => {
      const buttons = wrapper.findAll('button')
      const adjustButton = buttons.find((btn: DOMWrapper<Element>) => btn.text().includes('Adjust'))
      expect(adjustButton!.classes()).toContain('text-blue-700')
      expect(adjustButton!.classes()).toContain('bg-blue-50')
    })

    it('should have slate styling for history button', () => {
      const buttons = wrapper.findAll('button')
      const historyButton = buttons[1]
      expect(historyButton.classes()).toContain('text-slate-700')
      expect(historyButton.classes()).toContain('bg-slate-100')
    })

    it('should have green styling for reorder button', async () => {
      await wrapper.setProps({ item: mockLowStockItem })
      
      const buttons = wrapper.findAll('button')
      const reorderButton = buttons[2]
      expect(reorderButton.classes()).toContain('text-green-700')
      expect(reorderButton.classes()).toContain('bg-green-50')
    })
  })

  describe('Hover Effects', () => {
    it('should have hover transition class on row', () => {
      expect(wrapper.classes()).toContain('hover:bg-slate-50')
      expect(wrapper.classes()).toContain('transition-colors')
    })

    it('should have hover effects on buttons', () => {
      const buttons = wrapper.findAll('button')
      
      buttons.forEach((button: DOMWrapper<Element>) => {
        expect(button.classes()).toContain('transition-colors')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper table row semantics', () => {
      expect(wrapper.element.tagName).toBe('TR')
    })

    it('should have status role on status badge', () => {
      const statusBadge = wrapper.find('[role="status"]')
      expect(statusBadge.exists()).toBe(true)
    })

    it('should have descriptive aria-labels on all buttons', () => {
      const buttons = wrapper.findAll('button')
      
      buttons.forEach((button: DOMWrapper<Element>) => {
        expect(button.attributes('aria-label')).toBeTruthy()
        expect(button.attributes('aria-label')).toContain(mockInStockItem.productName)
      })
    })

    it('should have aria-hidden on decorative icons', () => {
      const statusBadge = wrapper.find('[role="status"]')
      const icon = statusBadge.find('[aria-hidden="true"]')
      expect(icon.exists()).toBe(true)
    })
  })

  describe('Props Validation', () => {
    it('should accept item prop', () => {
      expect(wrapper.props('item')).toEqual(mockInStockItem)
    })

    it('should update when item prop changes', async () => {
      expect(wrapper.text()).toContain('Wireless Headphones')
      
      await wrapper.setProps({ item: mockLowStockItem })
      
      expect(wrapper.text()).toContain('Office Chair')
      expect(wrapper.text()).not.toContain('Wireless Headphones')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero quantity correctly', async () => {
      await wrapper.setProps({ item: mockOutOfStockItem })
      
      expect(wrapper.text()).toContain('0')
      const quantityCell = wrapper.findAll('td')[3]
      const quantityDiv = quantityCell.find('div')
      expect(quantityDiv.classes()).toContain('text-red-600')
    })

    it('should handle quantity exactly at reorder level', async () => {
      const atReorderLevel = {
        ...mockInStockItem,
        currentQuantity: 50,
        reorderLevel: 50,
        status: 'low-stock' as const
      }
      
      await wrapper.setProps({ item: atReorderLevel })
      
      const quantityCell = wrapper.findAll('td')[3]
      const quantityDiv = quantityCell.find('div')
      expect(quantityDiv.classes()).toContain('text-amber-600')
    })

    it('should handle very large quantities', async () => {
      const largeQuantity = {
        ...mockInStockItem,
        currentQuantity: 999999
      }
      
      await wrapper.setProps({ item: largeQuantity })
      
      expect(wrapper.text()).toContain('999999')
    })

    it('should handle long product names', async () => {
      const longName = {
        ...mockInStockItem,
        productName: 'Very Long Product Name That Should Still Display Correctly Without Breaking Layout'
      }
      
      await wrapper.setProps({ item: longName })
      
      expect(wrapper.text()).toContain('Very Long Product Name')
    })

    it('should handle special characters in SKU', async () => {
      const specialSKU = {
        ...mockInStockItem,
        sku: 'SKU-001-A/B'
      }
      
      await wrapper.setProps({ item: specialSKU })
      
      expect(wrapper.text()).toContain('SKU-001-A/B')
    })
  })

  describe('Computed Properties', () => {
    it('should compute correct status config for in-stock', () => {
      const statusConfig = wrapper.vm.statusConfig
      
      expect(statusConfig.label).toBe('In Stock')
      expect(statusConfig.icon).toBe('✓')
      expect(statusConfig.classes).toContain('bg-green-100')
    })

    it('should compute correct status config for low-stock', async () => {
      await wrapper.setProps({ item: mockLowStockItem })
      
      const statusConfig = wrapper.vm.statusConfig
      
      expect(statusConfig.label).toBe('Low Stock')
      expect(statusConfig.icon).toBe('⚠')
      expect(statusConfig.classes).toContain('bg-amber-100')
    })

    it('should compute correct status config for out-of-stock', async () => {
      await wrapper.setProps({ item: mockOutOfStockItem })
      
      const statusConfig = wrapper.vm.statusConfig
      
      expect(statusConfig.label).toBe('Out of Stock')
      expect(statusConfig.icon).toBe('✗')
      expect(statusConfig.classes).toContain('bg-red-100')
    })

    it('should compute correct quantity classes for in-stock', () => {
      const quantityClasses = wrapper.vm.quantityClasses
      expect(quantityClasses).toBe('text-slate-900')
    })

    it('should compute correct quantity classes for low-stock', async () => {
      await wrapper.setProps({ item: mockLowStockItem })
      
      const quantityClasses = wrapper.vm.quantityClasses
      expect(quantityClasses).toContain('text-amber-600')
      expect(quantityClasses).toContain('font-semibold')
    })

    it('should compute correct quantity classes for out-of-stock', async () => {
      await wrapper.setProps({ item: mockOutOfStockItem })
      
      const quantityClasses = wrapper.vm.quantityClasses
      expect(quantityClasses).toContain('text-red-600')
      expect(quantityClasses).toContain('font-semibold')
    })
  })
})

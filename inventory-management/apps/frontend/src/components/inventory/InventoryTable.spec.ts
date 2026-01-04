import { describe, it, expect, beforeEach } from 'vitest'
import { mount, type DOMWrapper } from '@vue/test-utils'
import InventoryTable from './InventoryTable.vue'

/**
 * InventoryTable.spec.ts - Unit tests for InventoryTable component
 *
 * Tests the inventory table component including:
 * - Table rendering with columns
 * - Loading skeleton states
 * - Empty state display
 * - Row rendering
 * - Event emissions
 * - Accessibility features
 */

describe('InventoryTable.vue', () => {
  const mockItems = [
    {
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
    },
    {
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
    },
    {
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
  ]

  let wrapper: any

  beforeEach(() => {
    wrapper = mount(InventoryTable, {
      props: {
        items: mockItems,
        loading: false
      }
    })
  })

  describe('Table Structure', () => {
    it('should render table element', () => {
      const table = wrapper.find('table')
      expect(table.exists()).toBe(true)
    })

    it('should have proper table role and aria-label', () => {
      const table = wrapper.find('table')
      expect(table.attributes('role')).toBe('table')
      expect(table.attributes('aria-label')).toBe('Inventory table')
    })

    it('should render table header', () => {
      const thead = wrapper.find('thead')
      expect(thead.exists()).toBe(true)
    })

    it('should render table body', () => {
      const tbody = wrapper.find('tbody')
      expect(tbody.exists()).toBe(true)
    })

    it('should render all column headers', () => {
      const headers = wrapper.findAll('th')
      
      expect(headers.length).toBe(7)
      expect(headers[0].text()).toContain('Product Name')
      expect(headers[1].text()).toContain('SKU')
      expect(headers[2].text()).toContain('Category')
      expect(headers[3].text()).toContain('Current')
      expect(headers[4].text()).toContain('Reorder')
      expect(headers[5].text()).toContain('Status')
      expect(headers[6].text()).toContain('Actions')
    })
  })

  describe('Data Rendering', () => {
    it('should render all inventory items', () => {
      const rows = wrapper.findAllComponents({ name: 'InventoryRow' })
      expect(rows.length).toBe(mockItems.length)
    })

    it('should pass correct props to InventoryRow', () => {
      const firstRow = wrapper.findAllComponents({ name: 'InventoryRow' })[0]
      expect(firstRow.props('item')).toEqual(mockItems[0])
    })

    it('should render items in correct order', () => {
      const rows = wrapper.findAllComponents({ name: 'InventoryRow' })
      
      rows.forEach((row: any, index: number) => {
        expect(row.props('item').id).toBe(mockItems[index].id)
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading skeletons when loading is true', async () => {
      await wrapper.setProps({ loading: true, items: [] })

      const skeletonRows = wrapper.findAll('tbody tr')
      expect(skeletonRows.length).toBe(5)
    })

    it('should show skeleton cells with animation', async () => {
      await wrapper.setProps({ loading: true, items: [] })

      const skeletonCells = wrapper.findAll('.animate-pulse')
      expect(skeletonCells.length).toBeGreaterThan(0)
    })

    it('should not show InventoryRow components when loading', async () => {
      await wrapper.setProps({ loading: true, items: [] })

      const rows = wrapper.findAllComponents({ name: 'InventoryRow' })
      expect(rows.length).toBe(0)
    })

    it('should hide loading skeletons when loading is false', async () => {
      await wrapper.setProps({ loading: false, items: mockItems })

      const rows = wrapper.findAllComponents({ name: 'InventoryRow' })
      expect(rows.length).toBe(mockItems.length)
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no items and not loading', async () => {
      await wrapper.setProps({ loading: false, items: [] })

      expect(wrapper.text()).toContain('No inventory items to display')
    })

    it('should show empty state icon', async () => {
      await wrapper.setProps({ loading: false, items: [] })

      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should span all columns in empty state', async () => {
      await wrapper.setProps({ loading: false, items: [] })

      const emptyCell = wrapper.find('tbody td')
      expect(emptyCell.attributes('colspan')).toBe('7')
    })

    it('should not show empty state when loading', async () => {
      await wrapper.setProps({ loading: true, items: [] })

      expect(wrapper.text()).not.toContain('No inventory items to display')
    })

    it('should not show empty state when items exist', async () => {
      await wrapper.setProps({ loading: false, items: mockItems })

      expect(wrapper.text()).not.toContain('No inventory items to display')
    })
  })

  describe('Event Handling', () => {
    it('should emit adjust-stock event when row emits it', async () => {
      const firstRow = wrapper.findAllComponents({ name: 'InventoryRow' })[0]
      await firstRow.vm.$emit('adjust-stock')

      expect(wrapper.emitted('adjust-stock')).toBeTruthy()
      expect(wrapper.emitted('adjust-stock')[0]).toEqual([mockItems[0].id])
    })

    it('should emit view-history event when row emits it', async () => {
      const firstRow = wrapper.findAllComponents({ name: 'InventoryRow' })[0]
      await firstRow.vm.$emit('view-history')

      expect(wrapper.emitted('view-history')).toBeTruthy()
      expect(wrapper.emitted('view-history')[0]).toEqual([mockItems[0].id])
    })

    it('should emit reorder event when row emits it', async () => {
      const firstRow = wrapper.findAllComponents({ name: 'InventoryRow' })[0]
      await firstRow.vm.$emit('reorder')

      expect(wrapper.emitted('reorder')).toBeTruthy()
      expect(wrapper.emitted('reorder')[0]).toEqual([mockItems[0].id])
    })
  })

  describe('Responsive Design', () => {
    it('should have overflow-x-auto for horizontal scrolling', () => {
      const container = wrapper.find('.overflow-x-auto')
      expect(container.exists()).toBe(true)
    })

    it('should have full width table', () => {
      const table = wrapper.find('table')
      expect(table.classes()).toContain('w-full')
    })
  })

  describe('Accessibility', () => {
    it('should have proper table semantics', () => {
      const table = wrapper.find('table')
      expect(table.attributes('role')).toBe('table')
      expect(table.attributes('aria-label')).toBe('Inventory table')
    })

    it('should have proper column headers with scope', () => {
      const headers = wrapper.findAll('th')
      
      headers.forEach((header: DOMWrapper<Element>) => {
        expect(header.attributes('scope')).toBe('col')
      })
    })

    it('should have thead and tbody elements', () => {
      expect(wrapper.find('thead').exists()).toBe(true)
      expect(wrapper.find('tbody').exists()).toBe(true)
    })
  })

  describe('Styling', () => {
    it('should have proper header styling', () => {
      const thead = wrapper.find('thead')
      expect(thead.classes()).toContain('bg-slate-50')
      expect(thead.classes()).toContain('border-b')
    })

    it('should have proper body styling', () => {
      const tbody = wrapper.find('tbody')
      expect(tbody.classes()).toContain('bg-white')
      expect(tbody.classes()).toContain('divide-y')
    })

    it('should have uppercase column headers', () => {
      const headers = wrapper.findAll('th')
      
      headers.forEach((header: DOMWrapper<Element>) => {
        expect(header.classes()).toContain('uppercase')
      })
    })
  })

  describe('Column Configuration', () => {
    it('should have correct number of columns', () => {
      const headers = wrapper.findAll('th')
      expect(headers.length).toBe(7)
    })

    it('should have proper column widths', () => {
      const headers = wrapper.findAll('th')
      
      expect(headers[0].attributes('style')).toContain('width: 25%')
      expect(headers[1].attributes('style')).toContain('width: 12%')
      expect(headers[2].attributes('style')).toContain('width: 15%')
      expect(headers[3].attributes('style')).toContain('width: 10%')
      expect(headers[4].attributes('style')).toContain('width: 10%')
      expect(headers[5].attributes('style')).toContain('width: 13%')
      expect(headers[6].attributes('style')).toContain('width: 15%')
    })
  })

  describe('Props Validation', () => {
    it('should accept items prop', () => {
      expect(wrapper.props('items')).toEqual(mockItems)
    })

    it('should accept loading prop', () => {
      expect(wrapper.props('loading')).toBe(false)
    })

    it('should handle empty items array', async () => {
      await wrapper.setProps({ items: [] })
      expect(wrapper.props('items')).toEqual([])
    })

    it('should handle loading true', async () => {
      await wrapper.setProps({ loading: true })
      expect(wrapper.props('loading')).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle single item', async () => {
      await wrapper.setProps({ items: [mockItems[0]] })

      const rows = wrapper.findAllComponents({ name: 'InventoryRow' })
      expect(rows.length).toBe(1)
    })

    it('should handle many items', async () => {
      const manyItems = Array(50).fill(null).map((_, i) => ({
        ...mockItems[0],
        id: `${i}`,
        productId: `${i}`
      }))

      await wrapper.setProps({ items: manyItems })

      const rows = wrapper.findAllComponents({ name: 'InventoryRow' })
      expect(rows.length).toBe(50)
    })

    it('should handle transition from loading to loaded', async () => {
      await wrapper.setProps({ loading: true, items: [] })
      expect(wrapper.findAll('.animate-pulse').length).toBeGreaterThan(0)

      await wrapper.setProps({ loading: false, items: mockItems })
      const rows = wrapper.findAllComponents({ name: 'InventoryRow' })
      expect(rows.length).toBe(mockItems.length)
    })

    it('should handle transition from loaded to empty', async () => {
      await wrapper.setProps({ loading: false, items: mockItems })
      expect(wrapper.findAllComponents({ name: 'InventoryRow' }).length).toBe(mockItems.length)

      await wrapper.setProps({ loading: false, items: [] })
      expect(wrapper.text()).toContain('No inventory items to display')
    })
  })
})

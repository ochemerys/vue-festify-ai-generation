import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import OrderRow from './OrderRow.vue'
import type { Order } from './OrderRow.vue'

describe('OrderRow', () => {
  let wrapper: VueWrapper<any>

  const mockOrder: Order = {
    id: 'order-1',
    orderNumber: 'ORD-2024-001',
    customerId: 'customer-1',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    status: 'pending',
    total: 299.99,
    itemCount: 3,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    notes: 'Test order',
  }

  beforeEach(() => {
    wrapper = mount(OrderRow, {
      props: {
        order: mockOrder,
      },
    })
  })

  describe('Component Rendering', () => {
    it('should render order number as clickable link', () => {
      const orderNumberButton = wrapper.find('button')
      expect(orderNumberButton.text()).toBe('ORD-2024-001')
    })

    it('should render customer name and email', () => {
      expect(wrapper.text()).toContain('John Doe')
      expect(wrapper.text()).toContain('john.doe@example.com')
    })

    it('should render status badge', () => {
      expect(wrapper.text()).toContain('pending')
      const badge = wrapper.find('[role="status"]')
      expect(badge.exists()).toBe(true)
    })

    it('should render formatted total amount', () => {
      expect(wrapper.text()).toContain('$299.99')
    })

    it('should render formatted date', () => {
      expect(wrapper.text()).toContain('Jan')
      expect(wrapper.text()).toContain('15')
      expect(wrapper.text()).toContain('2024')
    })

    it('should render actions dropdown button', () => {
      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      expect(actionsButton?.exists()).toBe(true)
    })
  })

  describe('Status Badge Styling', () => {
    it('should apply pending status colors', () => {
      const badge = wrapper.find('[role="status"]')
      expect(badge.classes()).toContain('bg-amber-50')
      expect(badge.classes()).toContain('text-amber-800')
    })

    it('should apply processing status colors', async () => {
      await wrapper.setProps({
        order: { ...mockOrder, status: 'processing' },
      })

      const badge = wrapper.find('[role="status"]')
      expect(badge.classes()).toContain('bg-blue-50')
      expect(badge.classes()).toContain('text-blue-800')
    })

    it('should apply shipped status colors', async () => {
      await wrapper.setProps({
        order: { ...mockOrder, status: 'shipped' },
      })

      const badge = wrapper.find('[role="status"]')
      expect(badge.classes()).toContain('bg-violet-50')
      expect(badge.classes()).toContain('text-violet-800')
    })

    it('should apply delivered status colors', async () => {
      await wrapper.setProps({
        order: { ...mockOrder, status: 'delivered' },
      })

      const badge = wrapper.find('[role="status"]')
      expect(badge.classes()).toContain('bg-green-50')
      expect(badge.classes()).toContain('text-green-800')
    })

    it('should apply cancelled status colors', async () => {
      await wrapper.setProps({
        order: { ...mockOrder, status: 'cancelled' },
      })

      const badge = wrapper.find('[role="status"]')
      expect(badge.classes()).toContain('bg-red-50')
      expect(badge.classes()).toContain('text-red-800')
    })

    it('should render status dot with correct color', () => {
      const dot = wrapper.find('.h-1\\.5.w-1\\.5.rounded-full')
      expect(dot.exists()).toBe(true)
      expect(dot.classes()).toContain('bg-amber-500')
    })
  })

  describe('Dropdown Menu', () => {
    it('should toggle dropdown on button click', async () => {
      expect(wrapper.vm.isDropdownOpen).toBe(false)

      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      await actionsButton?.trigger('click')

      expect(wrapper.vm.isDropdownOpen).toBe(true)
    })

    it('should show dropdown menu when open', async () => {
      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      await actionsButton?.trigger('click')

      const dropdown = wrapper.find('[role="menu"]')
      expect(dropdown.exists()).toBe(true)
    })

    it('should display View Details option in dropdown', async () => {
      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      await actionsButton?.trigger('click')

      expect(wrapper.text()).toContain('View Details')
    })

    it('should display item count in dropdown', async () => {
      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      await actionsButton?.trigger('click')

      expect(wrapper.text()).toContain('Items:')
      expect(wrapper.text()).toContain('3')
    })

    it('should display status update select in dropdown', async () => {
      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      await actionsButton?.trigger('click')

      const select = wrapper.find('select')
      expect(select.exists()).toBe(true)
      expect(wrapper.text()).toContain('Update Status')
    })

    it('should show cancel button for pending orders', async () => {
      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      await actionsButton?.trigger('click')

      expect(wrapper.text()).toContain('Cancel Order')
    })

    it('should not show cancel button for non-pending orders', async () => {
      await wrapper.setProps({
        order: { ...mockOrder, status: 'delivered' },
      })

      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      await actionsButton?.trigger('click')

      expect(wrapper.text()).not.toContain('Cancel Order')
    })
  })

  describe('Event Emissions', () => {
    it('should emit view-details when order number is clicked', async () => {
      const orderNumberButton = wrapper.find('button')
      await orderNumberButton.trigger('click')

      expect(wrapper.emitted('view-details')).toBeTruthy()
      expect(wrapper.emitted('view-details')?.[0]).toEqual(['order-1'])
    })

    it('should emit view-details when View Details is clicked', async () => {
      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      await actionsButton?.trigger('click')

      const viewDetailsButton = wrapper.findAll('button').find(btn => btn.text() === 'View Details')
      await viewDetailsButton?.trigger('click')

      expect(wrapper.emitted('view-details')).toBeTruthy()
      expect(wrapper.emitted('view-details')?.[0]).toEqual(['order-1'])
    })

    it('should emit update-status when status is changed', async () => {
      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      await actionsButton?.trigger('click')

      const select = wrapper.find('select')
      await select.setValue('shipped')

      expect(wrapper.emitted('update-status')).toBeTruthy()
      expect(wrapper.emitted('update-status')?.[0]).toEqual([
        { orderId: 'order-1', status: 'shipped' },
      ])
    })

    it('should emit cancel when cancel button is clicked', async () => {
      // Mock window.confirm
      global.confirm = vi.fn(() => true)

      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      await actionsButton?.trigger('click')

      const cancelButton = wrapper.findAll('button').find(btn => btn.text() === 'Cancel Order')
      await cancelButton?.trigger('click')

      expect(wrapper.emitted('cancel')).toBeTruthy()
      expect(wrapper.emitted('cancel')?.[0]).toEqual(['order-1'])
    })

    it('should not emit cancel when confirmation is rejected', async () => {
      global.confirm = vi.fn(() => false)

      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      await actionsButton?.trigger('click')

      const cancelButton = wrapper.findAll('button').find(btn => btn.text() === 'Cancel Order')
      await cancelButton?.trigger('click')

      expect(wrapper.emitted('cancel')).toBeFalsy()
    })
  })

  describe('Currency Formatting', () => {
    it('should format currency with dollar sign and decimals', () => {
      expect(wrapper.text()).toContain('$299.99')
    })

    it('should format large amounts correctly', async () => {
      await wrapper.setProps({
        order: { ...mockOrder, total: 1234.56 },
      })

      expect(wrapper.text()).toContain('$1,234.56')
    })

    it('should format small amounts correctly', async () => {
      await wrapper.setProps({
        order: { ...mockOrder, total: 9.99 },
      })

      expect(wrapper.text()).toContain('$9.99')
    })
  })

  describe('Date Formatting', () => {
    it('should format date in readable format', () => {
      const dateText = wrapper.text()
      expect(dateText).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)
      expect(dateText).toContain('2024')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for order number button', () => {
      const orderNumberButton = wrapper.find('button')
      expect(orderNumberButton.attributes('aria-label')).toContain('View details for order ORD-2024-001')
    })

    it('should have proper ARIA label for status', () => {
      const statusBadge = wrapper.find('[role="status"]')
      expect(statusBadge.attributes('aria-label')).toContain('Order status: pending')
    })

    it('should have proper ARIA label for actions button', () => {
      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      expect(actionsButton?.attributes('aria-label')).toContain('Actions for order ORD-2024-001')
    })

    it('should have proper ARIA expanded attribute', async () => {
      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      expect(actionsButton?.attributes('aria-expanded')).toBe('false')

      await actionsButton?.trigger('click')
      expect(actionsButton?.attributes('aria-expanded')).toBe('true')
    })

    it('should have proper role attributes', async () => {
      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      await actionsButton?.trigger('click')

      const menu = wrapper.find('[role="menu"]')
      expect(menu.exists()).toBe(true)

      const menuItems = wrapper.findAll('[role="menuitem"]')
      expect(menuItems.length).toBeGreaterThan(0)
    })
  })

  describe('Hover Effects', () => {
    it('should have hover effect on table row', () => {
      const row = wrapper.find('tr')
      expect(row.classes()).toContain('hover:bg-gray-50')
    })

    it('should have transition classes', () => {
      const row = wrapper.find('tr')
      expect(row.classes()).toContain('transition-colors')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing optional fields', async () => {
      const minimalOrder: Order = {
        id: 'order-2',
        orderNumber: 'ORD-2024-002',
        customerId: 'customer-2',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        status: 'pending',
        total: 100,
        itemCount: 1,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      }

      await wrapper.setProps({ order: minimalOrder })
      expect(wrapper.text()).toContain('Jane Smith')
    })

    it('should handle zero total', async () => {
      await wrapper.setProps({
        order: { ...mockOrder, total: 0 },
      })

      expect(wrapper.text()).toContain('$0.00')
    })

    it('should handle zero item count', async () => {
      await wrapper.setProps({
        order: { ...mockOrder, itemCount: 0 },
      })

      const actionsButton = wrapper.findAll('button').find(btn => btn.text().includes('Actions'))
      await actionsButton?.trigger('click')

      expect(wrapper.text()).toContain('0')
    })
  })
})

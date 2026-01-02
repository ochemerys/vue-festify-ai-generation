import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RecentOrders from './RecentOrders.vue'

/**
 * RecentOrders.spec.ts - Unit tests for RecentOrders component
 * 
 * Tests the recent orders table with status badges,
 * formatting, event emission, and loading states
 */

describe('RecentOrders.vue', () => {
  describe('Table Rendering', () => {
    it('should render table with correct headers', () => {
      // Arrange
      const props = {
        orders: []
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('Order Number')
      expect(wrapper.text()).toContain('Customer')
      expect(wrapper.text()).toContain('Status')
      expect(wrapper.text()).toContain('Total')
      expect(wrapper.text()).toContain('Date')
    })

    it('should render table element with role', () => {
      // Arrange
      const props = {
        orders: []
      }

      // Act
      const wrapper = mount(RecentOrders, { props })
      const table = wrapper.find('table')

      // Assert
      expect(table.exists()).toBe(true)
      expect(table.attributes('role')).toBe('table')
    })

    it('should render table headers with scope attribute', () => {
      // Arrange
      const props = {
        orders: []
      }

      // Act
      const wrapper = mount(RecentOrders, { props })
      const headers = wrapper.findAll('th')

      // Assert
      headers.forEach(header => {
        if (header.text() !== 'Actions') {
          expect(header.attributes('scope')).toBe('col')
        }
      })
    })

    it('should render order rows for each order', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          },
          {
            id: '2',
            orderNumber: 'ORD-002',
            customer: 'Jane Smith',
            status: 'fulfilled' as const,
            total: 200,
            date: '2024-01-02'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })
      const rows = wrapper.findAll('tbody tr')

      // Assert
      expect(rows).toHaveLength(2)
    })
  })

  describe('Order Data Display', () => {
    it('should display order number correctly', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-12345',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('ORD-12345')
    })

    it('should display customer name correctly', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'Alice Johnson',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('Alice Johnson')
    })

    it('should format currency correctly', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 1234.56,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('$1,234.56')
    })

    it('should format date correctly', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-15'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('2024')
    })

    it('should handle large currency amounts', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 999999.99,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('$999,999.99')
    })

    it('should handle zero currency amount', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 0,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('$0.00')
    })
  })

  describe('Status Badges', () => {
    it('should display fulfilled status with green styling', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'fulfilled' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('Fulfilled')
      expect(wrapper.html()).toContain('bg-green-100')
      expect(wrapper.html()).toContain('text-green-800')
    })

    it('should display processing status with blue styling', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'processing' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('Processing')
      expect(wrapper.html()).toContain('bg-blue-100')
      expect(wrapper.html()).toContain('text-blue-800')
    })

    it('should display pending status with yellow styling', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('Pending')
      expect(wrapper.html()).toContain('bg-yellow-100')
      expect(wrapper.html()).toContain('text-yellow-800')
    })

    it('should display cancelled status with red styling', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'cancelled' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('Cancelled')
      expect(wrapper.html()).toContain('bg-red-100')
      expect(wrapper.html()).toContain('text-red-800')
    })

    it('should have aria-label on status badge', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'fulfilled' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })
      const badge = wrapper.find('span[aria-label]')

      // Assert
      expect(badge.attributes('aria-label')).toContain('Status')
      expect(badge.attributes('aria-label')).toContain('Fulfilled')
    })

    it('should capitalize status label correctly', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('Pending')
      expect(wrapper.text()).not.toContain('pending')
    })
  })

  describe('Event Emission', () => {
    it('should emit view-order event with order ID when row is clicked', async () => {
      // Arrange
      const props = {
        orders: [
          {
            id: 'order-123',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }
      const wrapper = mount(RecentOrders, { props })
      const row = wrapper.find('tbody tr')

      // Act
      await row.trigger('click')

      // Assert
      expect(wrapper.emitted('view-order')).toBeTruthy()
      expect(wrapper.emitted('view-order')?.[0]).toEqual(['order-123'])
    })

    it('should emit correct order ID for multiple orders', async () => {
      // Arrange
      const props = {
        orders: [
          {
            id: 'order-1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          },
          {
            id: 'order-2',
            orderNumber: 'ORD-002',
            customer: 'Jane Smith',
            status: 'fulfilled' as const,
            total: 200,
            date: '2024-01-02'
          }
        ]
      }
      const wrapper = mount(RecentOrders, { props })
      const rows = wrapper.findAll('tbody tr')

      // Act
      await rows[0]?.trigger('click')
      await rows[1]?.trigger('click')

      // Assert
      const emitted = wrapper.emitted('view-order')
      expect(emitted).toHaveLength(2)
      expect(emitted?.[0]).toEqual(['order-1'])
      expect(emitted?.[1]).toEqual(['order-2'])
    })

    it('should make rows clickable with cursor pointer', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })
      const row = wrapper.find('tbody tr')

      // Assert
      expect(row.html()).toContain('cursor-pointer')
    })
  })

  describe('Loading State', () => {
    it('should show skeleton loading state when loading is true', () => {
      // Arrange
      const props = {
        orders: [],
        loading: true
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.html()).toContain('animate-pulse')
      expect(wrapper.html()).toContain('bg-slate-200')
    })

    it('should show table when loading is false', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          }
        ],
        loading: false
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.find('table').exists()).toBe(true)
    })

    it('should show content by default when loading is not provided', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.find('table').exists()).toBe(true)
    })

    it('should render 5 skeleton rows when loading', () => {
      // Arrange
      const props = {
        orders: [],
        loading: true
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.html()).toContain('animate-pulse')
    })
  })

  describe('Empty State', () => {
    it('should show empty state message when no orders provided', () => {
      // Arrange
      const props = {
        orders: [],
        loading: false
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('No recent orders found')
    })

    it('should have role status on empty state', () => {
      // Arrange
      const props = {
        orders: [],
        loading: false
      }

      // Act
      const wrapper = mount(RecentOrders, { props })
      const emptyState = wrapper.find('[role="status"]')

      // Assert
      expect(emptyState.exists()).toBe(true)
    })

    it('should not show empty state when orders are present', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).not.toContain('No recent orders found')
    })

    it('should not show empty state when loading', () => {
      // Arrange
      const props = {
        orders: [],
        loading: true
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).not.toContain('No recent orders found')
    })
  })

  describe('Footer Link', () => {
    it('should show view all orders link when orders are present', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).toContain('View all orders')
    })

    it('should not show footer when no orders', () => {
      // Arrange
      const props = {
        orders: [],
        loading: false
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).not.toContain('View all orders')
    })

    it('should not show footer when loading', () => {
      // Arrange
      const props = {
        orders: [],
        loading: true
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.text()).not.toContain('View all orders')
    })

    it('should have correct href for orders page', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })
      const link = wrapper.find('a[href="/orders"]')

      // Assert
      expect(link.exists()).toBe(true)
    })
  })

  describe('Table Styling', () => {
    it('should apply hover effect to rows', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })
      const row = wrapper.find('tbody tr')

      // Assert
      expect(row.html()).toContain('hover:bg-slate-50')
    })

    it('should apply border styling to table', () => {
      // Arrange
      const props = {
        orders: []
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.html()).toContain('border')
      expect(wrapper.html()).toContain('rounded-lg')
    })

    it('should apply responsive styling', () => {
      // Arrange
      const props = {
        orders: []
      }

      // Act
      const wrapper = mount(RecentOrders, { props })

      // Assert
      expect(wrapper.html()).toContain('overflow-x-auto')
    })
  })

  describe('Multiple Orders', () => {
    it('should render all orders correctly', () => {
      // Arrange
      const props = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customer: 'John Doe',
            status: 'pending' as const,
            total: 100,
            date: '2024-01-01'
          },
          {
            id: '2',
            orderNumber: 'ORD-002',
            customer: 'Jane Smith',
            status: 'fulfilled' as const,
            total: 200,
            date: '2024-01-02'
          },
          {
            id: '3',
            orderNumber: 'ORD-003',
            customer: 'Bob Johnson',
            status: 'processing' as const,
            total: 150,
            date: '2024-01-03'
          }
        ]
      }

      // Act
      const wrapper = mount(RecentOrders, { props })
      const rows = wrapper.findAll('tbody tr')

      // Assert
      expect(rows).toHaveLength(3)
      expect(wrapper.text()).toContain('ORD-001')
      expect(wrapper.text()).toContain('ORD-002')
      expect(wrapper.text()).toContain('ORD-003')
    })
  })
})

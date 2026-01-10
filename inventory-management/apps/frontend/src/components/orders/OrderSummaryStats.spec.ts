import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderSummaryStats from './OrderSummaryStats.vue'

describe('OrderSummaryStats', () => {
  const mockSummary = {
    totalOrders: 100,
    pendingOrders: 15,
    processingOrders: 25,
    shippedOrders: 35,
    deliveredOrders: 25,
  }

  describe('Component Rendering', () => {
    it('should render all stat cards', () => {
      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: mockSummary,
          loading: false,
        },
      })

      expect(wrapper.text()).toContain('Total')
      expect(wrapper.text()).toContain('Pending')
      expect(wrapper.text()).toContain('Processing')
      expect(wrapper.text()).toContain('Shipped')
      expect(wrapper.text()).toContain('Delivered')
    })

    it('should display correct stat values', () => {
      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: mockSummary,
          loading: false,
        },
      })

      expect(wrapper.text()).toContain('100')
      expect(wrapper.text()).toContain('15')
      expect(wrapper.text()).toContain('25')
      expect(wrapper.text()).toContain('35')
    })

    it('should format numbers with thousands separator', () => {
      const largeSummary = {
        totalOrders: 1234,
        pendingOrders: 567,
        processingOrders: 890,
        shippedOrders: 1234,
        deliveredOrders: 5678,
      }

      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: largeSummary,
          loading: false,
        },
      })

      expect(wrapper.text()).toContain('1,234')
      expect(wrapper.text()).toContain('5,678')
    })
  })

  describe('Loading State', () => {
    it('should show loading skeleton when loading is true', () => {
      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: mockSummary,
          loading: true,
        },
      })

      const skeletons = wrapper.findAll('.animate-pulse')
      expect(skeletons.length).toBe(5)
    })

    it('should hide actual stats when loading', () => {
      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: mockSummary,
          loading: true,
        },
      })

      expect(wrapper.find('dl').exists()).toBe(false)
    })

    it('should show stats when not loading', () => {
      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: mockSummary,
          loading: false,
        },
      })

      expect(wrapper.find('dl').exists()).toBe(true)
    })
  })

  describe('Styling and Colors', () => {
    it('should apply correct color classes for each stat', () => {
      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: mockSummary,
          loading: false,
        },
      })

      const html = wrapper.html()
      
      // Check for color-specific classes
      expect(html).toContain('border-amber-200') // Pending
      expect(html).toContain('bg-amber-50')
      expect(html).toContain('border-blue-200') // Processing
      expect(html).toContain('bg-blue-50')
      expect(html).toContain('border-violet-200') // Shipped
      expect(html).toContain('bg-violet-50')
      expect(html).toContain('border-green-200') // Delivered
      expect(html).toContain('bg-green-50')
    })

    it('should have hover effects on stat cards', () => {
      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: mockSummary,
          loading: false,
        },
      })

      const statCards = wrapper.findAll('[role="group"]')
      statCards.forEach(card => {
        const classes = card.classes().join(' ')
        // Check if any hover class is present
        const hasHoverEffect = classes.includes('hover:bg-amber-100') ||
          classes.includes('hover:bg-blue-100') ||
          classes.includes('hover:bg-violet-100') ||
          classes.includes('hover:bg-green-100') ||
          classes.includes('hover:bg-gray-100')
        expect(hasHoverEffect).toBe(true)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: mockSummary,
          loading: false,
        },
      })

      expect(wrapper.find('#summary-heading').exists()).toBe(true)
      expect(wrapper.find('[role="group"]').exists()).toBe(true)
    })

    it('should have screen reader only heading', () => {
      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: mockSummary,
          loading: false,
        },
      })

      const heading = wrapper.find('#summary-heading')
      expect(heading.classes()).toContain('sr-only')
    })

    it('should have proper semantic HTML structure', () => {
      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: mockSummary,
          loading: false,
        },
      })

      expect(wrapper.find('section').exists()).toBe(true)
      expect(wrapper.find('dl').exists()).toBe(true)
      expect(wrapper.findAll('dt').length).toBe(5)
      expect(wrapper.findAll('dd').length).toBe(5)
    })

    it('should have descriptive labels for each stat', () => {
      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: mockSummary,
          loading: false,
        },
      })

      expect(wrapper.text()).toContain('All orders')
      expect(wrapper.text()).toContain('Awaiting processing')
      expect(wrapper.text()).toContain('Being prepared')
      expect(wrapper.text()).toContain('In transit')
      expect(wrapper.text()).toContain('Completed')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      const zeroSummary = {
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
      }

      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: zeroSummary,
          loading: false,
        },
      })

      const dds = wrapper.findAll('dd')
      dds.forEach(dd => {
        expect(dd.text()).toBe('0')
      })
    })

    it('should handle very large numbers', () => {
      const largeSummary = {
        totalOrders: 999999,
        pendingOrders: 123456,
        processingOrders: 234567,
        shippedOrders: 345678,
        deliveredOrders: 456789,
      }

      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: largeSummary,
          loading: false,
        },
      })

      expect(wrapper.text()).toContain('999,999')
      expect(wrapper.text()).toContain('123,456')
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: mockSummary,
          loading: false,
        },
      })

      const grid = wrapper.find('dl')
      expect(grid.classes()).toContain('grid')
      expect(grid.classes()).toContain('grid-cols-2')
      expect(grid.classes()).toContain('md:grid-cols-5')
    })

    it('should have responsive gap spacing', () => {
      const wrapper = mount(OrderSummaryStats, {
        props: {
          summary: mockSummary,
          loading: false,
        },
      })

      const grid = wrapper.find('dl')
      expect(grid.classes()).toContain('gap-4')
    })
  })
})

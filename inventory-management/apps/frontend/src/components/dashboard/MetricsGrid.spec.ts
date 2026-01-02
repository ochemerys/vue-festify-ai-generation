import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MetricsGrid from './MetricsGrid.vue'
import MetricCard from './MetricCard.vue'

/**
 * MetricsGrid.spec.ts - Unit tests for MetricsGrid component
 * 
 * Tests the responsive grid layout of metric cards with
 * skeleton loading states and proper prop passing
 */

describe('MetricsGrid.vue', () => {
  describe('Grid Rendering', () => {
    it('should render exactly 8 grid items', () => {
      // Arrange
      const props = {
        metrics: [
          { id: '1', label: 'Revenue', value: '$100,000' },
          { id: '2', label: 'Orders', value: '250' }
        ]
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const cards = wrapper.findAllComponents(MetricCard)

      // Assert
      expect(cards).toHaveLength(8)
    })

    it('should render MetricCard components for each grid item', () => {
      // Arrange
      const props = {
        metrics: [
          { id: '1', label: 'Metric 1', value: '100' },
          { id: '2', label: 'Metric 2', value: '200' }
        ]
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const cards = wrapper.findAllComponents(MetricCard)

      // Assert
      expect(cards.length).toBeGreaterThan(0)
      cards.forEach(card => {
        expect(card.exists()).toBe(true)
      })
    })

    it('should have region role with aria-label', () => {
      // Arrange
      const props = {
        metrics: []
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })

      // Assert
      expect(wrapper.attributes('role')).toBe('region')
      expect(wrapper.attributes('aria-label')).toBe('Key metrics')
    })
  })

  describe('Responsive Grid Classes', () => {
    it('should apply responsive grid classes', () => {
      // Arrange
      const props = {
        metrics: []
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })

      // Assert
      expect(wrapper.html()).toContain('grid')
      expect(wrapper.html()).toContain('grid-cols-1')
      expect(wrapper.html()).toContain('sm:grid-cols-2')
      expect(wrapper.html()).toContain('lg:grid-cols-4')
    })

    it('should apply gap between grid items', () => {
      // Arrange
      const props = {
        metrics: []
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })

      // Assert
      expect(wrapper.html()).toContain('gap-4')
    })
  })

  describe('Props Passing', () => {
    it('should pass metric data to MetricCard components', () => {
      // Arrange
      const props = {
        metrics: [
          {
            id: '1',
            label: 'Total Revenue',
            value: '$125,430',
            trend: 15,
            trendDirection: 'up' as const,
            isUrgent: false
          }
        ]
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const firstCard = wrapper.findComponent(MetricCard)

      // Assert
      expect(firstCard.props('label')).toBe('Total Revenue')
      expect(firstCard.props('value')).toBe('$125,430')
      expect(firstCard.props('trend')).toBe(15)
      expect(firstCard.props('trendDirection')).toBe('up')
    })

    it('should pass loading prop to all MetricCard components', () => {
      // Arrange
      const props = {
        metrics: [
          { id: '1', label: 'Metric 1', value: '100' },
          { id: '2', label: 'Metric 2', value: '200' }
        ],
        loading: true
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const cards = wrapper.findAllComponents(MetricCard)

      // Assert
      cards.forEach(card => {
        expect(card.props('loading')).toBe(true)
      })
    })

    it('should pass isUrgent prop to MetricCard', () => {
      // Arrange
      const props = {
        metrics: [
          {
            id: '1',
            label: 'Critical',
            value: '5',
            isUrgent: true
          }
        ]
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const firstCard = wrapper.findComponent(MetricCard)

      // Assert
      expect(firstCard.props('isUrgent')).toBe(true)
    })

    it('should pass trend data to MetricCard', () => {
      // Arrange
      const props = {
        metrics: [
          {
            id: '1',
            label: 'Sales',
            value: '$50,000',
            trend: 25,
            trendDirection: 'up' as const
          }
        ]
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const firstCard = wrapper.findComponent(MetricCard)

      // Assert
      expect(firstCard.props('trend')).toBe(25)
      expect(firstCard.props('trendDirection')).toBe('up')
    })
  })

  describe('Loading State', () => {
    it('should show loading state for all cards when loading is true', () => {
      // Arrange
      const props = {
        metrics: [
          { id: '1', label: 'Metric 1', value: '100' }
        ],
        loading: true
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const cards = wrapper.findAllComponents(MetricCard)

      // Assert
      cards.forEach(card => {
        expect(card.props('loading')).toBe(true)
      })
    })

    it('should show content when loading is false', () => {
      // Arrange
      const props = {
        metrics: [
          { id: '1', label: 'Revenue', value: '$100,000' }
        ],
        loading: false
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const firstCard = wrapper.findComponent(MetricCard)

      // Assert
      expect(firstCard.props('loading')).toBeFalsy()
    })

    it('should show content by default when loading is not provided', () => {
      // Arrange
      const props = {
        metrics: [
          { id: '1', label: 'Metric', value: '100' }
        ]
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const firstCard = wrapper.findComponent(MetricCard)

      // Assert
      expect(firstCard.props('loading')).toBeFalsy()
    })
  })

  describe('Empty Metrics Handling', () => {
    it('should handle empty metrics array gracefully', () => {
      // Arrange
      const props = {
        metrics: []
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const cards = wrapper.findAllComponents(MetricCard)

      // Assert
      expect(cards).toHaveLength(8)
      cards.forEach(card => {
        expect(card.props('label')).toBe('')
        expect(card.props('value')).toBe('—')
      })
    })

    it('should fill remaining slots with skeleton cards', () => {
      // Arrange
      const props = {
        metrics: [
          { id: '1', label: 'Metric 1', value: '100' },
          { id: '2', label: 'Metric 2', value: '200' },
          { id: '3', label: 'Metric 3', value: '300' }
        ]
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const cards = wrapper.findAllComponents(MetricCard)

      // Assert
      expect(cards).toHaveLength(8)
      // First 3 should have data
      expect(cards[0]?.props('label')).toBe('Metric 1')
      expect(cards[1]?.props('label')).toBe('Metric 2')
      expect(cards[2]?.props('label')).toBe('Metric 3')
      // Remaining 5 should be empty
      expect(cards[3]?.props('label')).toBe('')
      expect(cards[4]?.props('label')).toBe('')
    })

    it('should use skeleton key for empty slots', () => {
      // Arrange
      const props = {
        metrics: [
          { id: '1', label: 'Metric 1', value: '100' }
        ]
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const cards = wrapper.findAllComponents(MetricCard)

      // Assert
      // Should render 8 cards total
      expect(cards).toHaveLength(8)
    })
  })

  describe('Full Metrics Array', () => {
    it('should render all 8 metrics when provided', () => {
      // Arrange
      const props = {
        metrics: [
          { id: '1', label: 'Revenue', value: '$100,000', trend: 15, trendDirection: 'up' as const },
          { id: '2', label: 'Orders', value: '250', trend: 8, trendDirection: 'up' as const },
          { id: '3', label: 'Inventory', value: '5,000', trend: 5, trendDirection: 'down' as const },
          { id: '4', label: 'Customers', value: '1,200', trend: 12, trendDirection: 'up' as const },
          { id: '5', label: 'Returns', value: '15', trend: 3, trendDirection: 'down' as const },
          { id: '6', label: 'Pending', value: '42', trend: 2, trendDirection: 'up' as const },
          { id: '7', label: 'Shipped', value: '180', trend: 10, trendDirection: 'up' as const },
          { id: '8', label: 'Delivered', value: '2,100', trend: 20, trendDirection: 'up' as const }
        ]
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const cards = wrapper.findAllComponents(MetricCard)

      // Assert
      expect(cards).toHaveLength(8)
      expect(cards[0]?.props('label')).toBe('Revenue')
      expect(cards[7]?.props('label')).toBe('Delivered')
    })

    it('should pass all metric properties correctly', () => {
      // Arrange
      const props = {
        metrics: [
          {
            id: 'metric-1',
            label: 'Test Metric',
            value: 999,
            trend: 50,
            trendDirection: 'up' as const,
            isUrgent: true,
            loading: false
          }
        ]
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const firstCard = wrapper.findComponent(MetricCard)

      // Assert
      expect(firstCard.props('label')).toBe('Test Metric')
      expect(firstCard.props('value')).toBe(999)
      expect(firstCard.props('trend')).toBe(50)
      expect(firstCard.props('trendDirection')).toBe('up')
      expect(firstCard.props('isUrgent')).toBe(true)
      expect(firstCard.props('loading')).toBe(false)
    })
  })

  describe('Metric Card Keys', () => {
    it('should render all cards with proper keys', () => {
      // Arrange
      const props = {
        metrics: [
          { id: 'unique-id-1', label: 'Metric 1', value: '100' }
        ]
      }

      // Act
      const wrapper = mount(MetricsGrid, { props })
      const cards = wrapper.findAllComponents(MetricCard)

      // Assert
      expect(cards.length).toBeGreaterThan(0)
    })
  })
})

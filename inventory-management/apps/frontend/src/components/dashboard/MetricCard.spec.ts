import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MetricCard from './MetricCard.vue'

/**
 * MetricCard.spec.ts - Unit tests for MetricCard component
 * 
 * Tests the single metric card with trend indicator functionality
 * including styling, accessibility, and loading states
 */

describe('MetricCard.vue', () => {
  describe('Rendering', () => {
    it('should render metric label and value correctly', () => {
      // Arrange
      const props = {
        label: 'Total Revenue',
        value: '$125,430'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).toContain('Total Revenue')
      expect(wrapper.text()).toContain('$125,430')
    })

    it('should render numeric value correctly', () => {
      // Arrange
      const props = {
        label: 'Orders',
        value: 1234
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).toContain('1234')
    })

    it('should render with article semantic element', () => {
      // Arrange
      const props = {
        label: 'Test Metric',
        value: '100'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.element.tagName).toBe('ARTICLE')
    })
  })

  describe('Trend Indicator', () => {
    it('should display trend indicator with up direction and green color', () => {
      // Arrange
      const props = {
        label: 'Revenue',
        value: '$100,000',
        trend: 15,
        trendDirection: 'up'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).toContain('+15%')
      expect(wrapper.html()).toContain('text-green-600')
    })

    it('should display trend indicator with down direction and red color', () => {
      // Arrange
      const props = {
        label: 'Inventory',
        value: '500',
        trend: 8,
        trendDirection: 'down'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).toContain('-8%')
      expect(wrapper.html()).toContain('text-red-600')
    })

    it('should display trend indicator with neutral direction and slate color', () => {
      // Arrange
      const props = {
        label: 'Metric',
        value: '100',
        trend: 0,
        trendDirection: 'neutral'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).toContain('0%')
      expect(wrapper.html()).toContain('text-slate-600')
    })

    it('should not display trend when trend is undefined', () => {
      // Arrange
      const props = {
        label: 'Metric',
        value: '100'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).not.toContain('%')
    })

    it('should add plus sign for positive trend', () => {
      // Arrange
      const props = {
        label: 'Sales',
        value: '$50,000',
        trend: 25,
        trendDirection: 'up'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).toContain('+25%')
    })

    it('should not add plus sign for negative trend', () => {
      // Arrange
      const props = {
        label: 'Costs',
        value: '$10,000',
        trend: 5,
        trendDirection: 'down'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).toContain('5%')
    })
  })

  describe('Urgent Styling', () => {
    it('should apply urgent styling with red left border when isUrgent is true', () => {
      // Arrange
      const props = {
        label: 'Critical Alert',
        value: '3',
        isUrgent: true
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.html()).toContain('border-l-4')
      expect(wrapper.html()).toContain('border-l-red-500')
    })

    it('should apply normal styling when isUrgent is false', () => {
      // Arrange
      const props = {
        label: 'Normal Metric',
        value: '100',
        isUrgent: false
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.html()).toContain('border-slate-200')
      expect(wrapper.html()).not.toContain('border-l-red-500')
    })

    it('should apply normal styling when isUrgent is not provided', () => {
      // Arrange
      const props = {
        label: 'Metric',
        value: '100'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.html()).toContain('border-slate-200')
    })
  })

  describe('Loading State', () => {
    it('should show skeleton loading state when loading is true', () => {
      // Arrange
      const props = {
        label: 'Metric',
        value: '100',
        loading: true
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.html()).toContain('animate-pulse')
      expect(wrapper.html()).toContain('bg-slate-200')
    })

    it('should show content when loading is false', () => {
      // Arrange
      const props = {
        label: 'Revenue',
        value: '$50,000',
        loading: false
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).toContain('Revenue')
      expect(wrapper.text()).toContain('$50,000')
    })

    it('should show content by default when loading is not provided', () => {
      // Arrange
      const props = {
        label: 'Metric',
        value: '100'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).toContain('Metric')
      expect(wrapper.text()).toContain('100')
    })

    it('should hide content when loading is true', () => {
      // Arrange
      const props = {
        label: 'Revenue',
        value: '$50,000',
        loading: true
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).not.toContain('Revenue')
      expect(wrapper.text()).not.toContain('$50,000')
    })
  })

  describe('Accessibility', () => {
    it('should generate correct aria-label with label and value', () => {
      // Arrange
      const props = {
        label: 'Total Orders',
        value: '1,234'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.attributes('aria-label')).toBe('Total Orders: 1,234')
    })

    it('should include trend information in aria-label when trend is provided', () => {
      // Arrange
      const props = {
        label: 'Revenue',
        value: '$100,000',
        trend: 15,
        trendDirection: 'up'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.attributes('aria-label')).toContain('Revenue: $100,000')
      expect(wrapper.attributes('aria-label')).toContain('+15%')
    })

    it('should include negative trend in aria-label', () => {
      // Arrange
      const props = {
        label: 'Inventory',
        value: '500',
        trend: 10,
        trendDirection: 'down'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.attributes('aria-label')).toContain('-10%')
    })

    it('should have aria-hidden on trend icon', () => {
      // Arrange
      const props = {
        label: 'Sales',
        value: '$50,000',
        trend: 5,
        trendDirection: 'up'
      }

      // Act
      const wrapper = mount(MetricCard, { props })
      const icon = wrapper.find('svg')

      // Assert
      expect(icon.attributes('aria-hidden')).toBe('true')
    })
  })

  describe('Styling Classes', () => {
    it('should apply base card classes', () => {
      // Arrange
      const props = {
        label: 'Metric',
        value: '100'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.html()).toContain('bg-white')
      expect(wrapper.html()).toContain('rounded-lg')
      expect(wrapper.html()).toContain('shadow-sm')
    })

    it('should apply hover effect classes', () => {
      // Arrange
      const props = {
        label: 'Metric',
        value: '100'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.html()).toContain('hover:shadow-md')
      expect(wrapper.html()).toContain('transition-all')
    })
  })

  describe('Props Validation', () => {
    it('should handle string value', () => {
      // Arrange
      const props = {
        label: 'Status',
        value: 'Active'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).toContain('Active')
    })

    it('should handle numeric value', () => {
      // Arrange
      const props = {
        label: 'Count',
        value: 42
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).toContain('42')
    })

    it('should handle zero trend', () => {
      // Arrange
      const props = {
        label: 'Metric',
        value: '100',
        trend: 0,
        trendDirection: 'neutral'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).toContain('0%')
    })

    it('should handle large values', () => {
      // Arrange
      const props = {
        label: 'Revenue',
        value: '$999,999,999.99'
      }

      // Act
      const wrapper = mount(MetricCard, { props })

      // Assert
      expect(wrapper.text()).toContain('$999,999,999.99')
    })
  })
})

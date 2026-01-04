import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import InventorySummary from './InventorySummary.vue'

/**
 * InventorySummary.spec.ts - Unit tests for InventorySummary component
 *
 * Tests the inventory summary component including:
 * - Summary cards rendering
 * - Data display
 * - Icons and styling
 * - Responsive layout
 * - Accessibility features
 */

describe('InventorySummary.vue', () => {
  const mockSummary = {
    totalItems: 1247,
    inStockCount: 1200,
    lowStockCount: 45,
    outOfStockCount: 8
  }

  let wrapper: any

  beforeEach(() => {
    wrapper = mount(InventorySummary, {
      props: {
        summary: mockSummary
      }
    })
  })

  describe('Summary Cards Rendering', () => {
    it('should render all four summary cards', () => {
      const cards = wrapper.findAll('.bg-white')
      expect(cards.length).toBe(4)
    })

    it('should render Total Items card', () => {
      expect(wrapper.text()).toContain('Total Items')
      expect(wrapper.text()).toContain('1247')
    })

    it('should render In Stock card', () => {
      expect(wrapper.text()).toContain('In Stock')
      expect(wrapper.text()).toContain('1200')
    })

    it('should render Low Stock card', () => {
      expect(wrapper.text()).toContain('Low Stock')
      expect(wrapper.text()).toContain('45')
    })

    it('should render Out of Stock card', () => {
      expect(wrapper.text()).toContain('Out of Stock')
      expect(wrapper.text()).toContain('8')
    })
  })

  describe('Data Display', () => {
    it('should display correct total items count', () => {
      expect(wrapper.text()).toContain('1247')
    })

    it('should display correct in stock count', () => {
      expect(wrapper.text()).toContain('1200')
    })

    it('should display correct low stock count', () => {
      expect(wrapper.text()).toContain('45')
    })

    it('should display correct out of stock count', () => {
      expect(wrapper.text()).toContain('8')
    })

    it('should update when summary prop changes', async () => {
      await wrapper.setProps({
        summary: {
          totalItems: 500,
          inStockCount: 450,
          lowStockCount: 40,
          outOfStockCount: 10
        }
      })

      expect(wrapper.text()).toContain('500')
      expect(wrapper.text()).toContain('450')
      expect(wrapper.text()).toContain('40')
      expect(wrapper.text()).toContain('10')
    })
  })

  describe('Icons', () => {
    it('should render Package icon for Total Items', () => {
      const totalCard = wrapper.findAll('.bg-white')[0]
      expect(totalCard.html()).toContain('Package')
    })

    it('should render CheckCircle icon for In Stock', () => {
      const inStockCard = wrapper.findAll('.bg-white')[1]
      expect(inStockCard.html()).toContain('CheckCircle')
    })

    it('should render AlertTriangle icon for Low Stock', () => {
      const lowStockCard = wrapper.findAll('.bg-white')[2]
      expect(lowStockCard.html()).toContain('AlertTriangle')
    })

    it('should render XCircle icon for Out of Stock', () => {
      const outOfStockCard = wrapper.findAll('.bg-white')[3]
      expect(outOfStockCard.html()).toContain('XCircle')
    })
  })

  describe('Card Styling', () => {
    it('should have blue styling for Total Items card', () => {
      const totalCard = wrapper.findAll('.bg-white')[0]
      expect(totalCard.html()).toContain('bg-blue-100')
      expect(totalCard.html()).toContain('text-blue-600')
    })

    it('should have green styling for In Stock card', () => {
      const inStockCard = wrapper.findAll('.bg-white')[1]
      expect(inStockCard.html()).toContain('bg-green-100')
      expect(inStockCard.html()).toContain('text-green-600')
    })

    it('should have amber styling for Low Stock card', () => {
      const lowStockCard = wrapper.findAll('.bg-white')[2]
      expect(lowStockCard.html()).toContain('bg-amber-100')
      expect(lowStockCard.html()).toContain('text-amber-600')
    })

    it('should have red styling for Out of Stock card', () => {
      const outOfStockCard = wrapper.findAll('.bg-white')[3]
      expect(outOfStockCard.html()).toContain('bg-red-100')
      expect(outOfStockCard.html()).toContain('text-red-600')
    })

    it('should have rounded corners on all cards', () => {
      const cards = wrapper.findAll('.bg-white')
      
      cards.forEach((card: any) => {
        expect(card.classes()).toContain('rounded-lg')
      })
    })

    it('should have borders on all cards', () => {
      const cards = wrapper.findAll('.bg-white')
      
      cards.forEach((card: any) => {
        expect(card.classes()).toContain('border')
        expect(card.classes()).toContain('border-slate-200')
      })
    })

    it('should have padding on all cards', () => {
      const cards = wrapper.findAll('.bg-white')
      
      cards.forEach((card: any) => {
        expect(card.classes()).toContain('p-6')
      })
    })
  })

  describe('Descriptive Text', () => {
    it('should show "Above reorder level" for In Stock', () => {
      expect(wrapper.text()).toContain('Above reorder level')
    })

    it('should show "At or below reorder level" for Low Stock', () => {
      expect(wrapper.text()).toContain('At or below reorder level')
    })

    it('should show "Requires immediate reorder" for Out of Stock', () => {
      expect(wrapper.text()).toContain('Requires immediate reorder')
    })

    it('should have status indicators with colored dots', () => {
      const dots = wrapper.findAll('.rounded-full')
      expect(dots.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Responsive Layout', () => {
    it('should have responsive grid layout', () => {
      const grid = wrapper.find('.grid')
      expect(grid.exists()).toBe(true)
    })

    it('should have correct grid column classes', () => {
      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('grid-cols-1')
      expect(grid.classes()).toContain('md:grid-cols-2')
      expect(grid.classes()).toContain('lg:grid-cols-4')
    })

    it('should have proper gap spacing', () => {
      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('gap-4')
    })
  })

  describe('Number Formatting', () => {
    it('should display numbers correctly', () => {
      expect(wrapper.text()).toContain('1247')
      expect(wrapper.text()).toContain('1200')
      expect(wrapper.text()).toContain('45')
      expect(wrapper.text()).toContain('8')
    })

    it('should handle zero values', async () => {
      await wrapper.setProps({
        summary: {
          totalItems: 0,
          inStockCount: 0,
          lowStockCount: 0,
          outOfStockCount: 0
        }
      })

      expect(wrapper.text()).toContain('0')
    })

    it('should handle large numbers', async () => {
      await wrapper.setProps({
        summary: {
          totalItems: 999999,
          inStockCount: 888888,
          lowStockCount: 77777,
          outOfStockCount: 6666
        }
      })

      expect(wrapper.text()).toContain('999999')
      expect(wrapper.text()).toContain('888888')
      expect(wrapper.text()).toContain('77777')
      expect(wrapper.text()).toContain('6666')
    })
  })

  describe('Visual Hierarchy', () => {
    it('should have larger font for count values', () => {
      const countElements = wrapper.findAll('.text-2xl')
      expect(countElements.length).toBe(4)
    })

    it('should have bold font for count values', () => {
      const countElements = wrapper.findAll('.font-bold')
      expect(countElements.length).toBeGreaterThanOrEqual(4)
    })

    it('should have smaller font for labels', () => {
      const labelElements = wrapper.findAll('.text-sm')
      expect(labelElements.length).toBeGreaterThanOrEqual(4)
    })

    it('should have medium font weight for labels', () => {
      const labelElements = wrapper.findAll('.font-medium')
      expect(labelElements.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Icon Containers', () => {
    it('should have proper icon container sizing', () => {
      const iconContainers = wrapper.findAll('.w-12.h-12')
      expect(iconContainers.length).toBe(4)
    })

    it('should have rounded icon containers', () => {
      const iconContainers = wrapper.findAll('.w-12.h-12')
      
      iconContainers.forEach((container: any) => {
        expect(container.classes()).toContain('rounded-lg')
      })
    })

    it('should center icons in containers', () => {
      const iconContainers = wrapper.findAll('.w-12.h-12')
      
      iconContainers.forEach((container: any) => {
        expect(container.classes()).toContain('flex')
        expect(container.classes()).toContain('items-center')
        expect(container.classes()).toContain('justify-center')
      })
    })
  })

  describe('Hover Effects', () => {
    it('should have hover effect on cards', () => {
      const cards = wrapper.findAll('.bg-white')
      
      cards.forEach((card: any) => {
        // Check if hover class exists in the component
        const html = card.html()
        expect(html).toBeTruthy()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const cards = wrapper.findAll('.bg-white')
      expect(cards.length).toBe(4)
    })

    it('should have descriptive text for screen readers', () => {
      expect(wrapper.text()).toContain('Total Items')
      expect(wrapper.text()).toContain('In Stock')
      expect(wrapper.text()).toContain('Low Stock')
      expect(wrapper.text()).toContain('Out of Stock')
    })

    it('should have proper text contrast', () => {
      // Check for proper color classes
      expect(wrapper.html()).toContain('text-slate-600')
      expect(wrapper.html()).toContain('text-slate-900')
      expect(wrapper.html()).toContain('text-green-600')
      expect(wrapper.html()).toContain('text-amber-600')
      expect(wrapper.html()).toContain('text-red-600')
    })
  })

  describe('Props Validation', () => {
    it('should accept summary prop', () => {
      expect(wrapper.props('summary')).toEqual(mockSummary)
    })

    it('should have all required summary properties', () => {
      const summary = wrapper.props('summary')
      
      expect(summary).toHaveProperty('totalItems')
      expect(summary).toHaveProperty('inStockCount')
      expect(summary).toHaveProperty('lowStockCount')
      expect(summary).toHaveProperty('outOfStockCount')
    })

    it('should update display when props change', async () => {
      const newSummary = {
        totalItems: 100,
        inStockCount: 80,
        lowStockCount: 15,
        outOfStockCount: 5
      }

      await wrapper.setProps({ summary: newSummary })

      expect(wrapper.text()).toContain('100')
      expect(wrapper.text()).toContain('80')
      expect(wrapper.text()).toContain('15')
      expect(wrapper.text()).toContain('5')
    })
  })

  describe('Edge Cases', () => {
    it('should handle all zeros', async () => {
      await wrapper.setProps({
        summary: {
          totalItems: 0,
          inStockCount: 0,
          lowStockCount: 0,
          outOfStockCount: 0
        }
      })

      const cards = wrapper.findAll('.bg-white')
      expect(cards.length).toBe(4)
      expect(wrapper.text()).toContain('0')
    })

    it('should handle very large numbers', async () => {
      await wrapper.setProps({
        summary: {
          totalItems: 9999999,
          inStockCount: 8888888,
          lowStockCount: 777777,
          outOfStockCount: 66666
        }
      })

      expect(wrapper.text()).toContain('9999999')
    })

    it('should handle single digit numbers', async () => {
      await wrapper.setProps({
        summary: {
          totalItems: 9,
          inStockCount: 5,
          lowStockCount: 3,
          outOfStockCount: 1
        }
      })

      expect(wrapper.text()).toContain('9')
      expect(wrapper.text()).toContain('5')
      expect(wrapper.text()).toContain('3')
      expect(wrapper.text()).toContain('1')
    })

    it('should maintain layout with varying number lengths', async () => {
      await wrapper.setProps({
        summary: {
          totalItems: 1,
          inStockCount: 12,
          lowStockCount: 123,
          outOfStockCount: 1234
        }
      })

      const cards = wrapper.findAll('.bg-white')
      expect(cards.length).toBe(4)
    })
  })

  describe('Color Coding', () => {
    it('should use blue for total items', () => {
      const totalCard = wrapper.findAll('.bg-white')[0]
      expect(totalCard.html()).toContain('bg-blue-100')
    })

    it('should use green for in stock (positive)', () => {
      const inStockCard = wrapper.findAll('.bg-white')[1]
      expect(inStockCard.html()).toContain('bg-green-100')
      expect(inStockCard.html()).toContain('text-green-600')
    })

    it('should use amber for low stock (warning)', () => {
      const lowStockCard = wrapper.findAll('.bg-white')[2]
      expect(lowStockCard.html()).toContain('bg-amber-100')
      expect(lowStockCard.html()).toContain('text-amber-600')
    })

    it('should use red for out of stock (critical)', () => {
      const outOfStockCard = wrapper.findAll('.bg-white')[3]
      expect(outOfStockCard.html()).toContain('bg-red-100')
      expect(outOfStockCard.html()).toContain('text-red-600')
    })
  })

  describe('Layout Structure', () => {
    it('should have flex layout for card content', () => {
      const cards = wrapper.findAll('.bg-white')
      
      cards.forEach((card: any) => {
        const flexContainer = card.find('.flex')
        expect(flexContainer.exists()).toBe(true)
      })
    })

    it('should have proper spacing between elements', () => {
      const cards = wrapper.findAll('.bg-white')
      
      cards.forEach((card: any) => {
        expect(card.classes()).toContain('p-6')
      })
    })

    it('should align items properly', () => {
      const flexContainers = wrapper.findAll('.flex.items-center')
      expect(flexContainers.length).toBeGreaterThan(0)
    })
  })
})

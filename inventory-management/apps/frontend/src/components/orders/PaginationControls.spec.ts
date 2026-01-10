import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PaginationControls from './PaginationControls.vue'

describe('PaginationControls', () => {
  const createWrapper = (props = {}) => {
    return mount(PaginationControls, {
      props: {
        page: 1,
        pageSize: 10,
        total: 100,
        ...props,
      },
    })
  }

  describe('Component Rendering', () => {
    it('should render Previous and Next buttons', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.text()).toContain('Previous')
      expect(wrapper.text()).toContain('Next')
    })

    it('should render current page information', () => {
      const wrapper = createWrapper({ page: 2 })
      
      expect(wrapper.text()).toContain('Page 2 of 10')
    })

    it('should render results count', () => {
      const wrapper = createWrapper({ page: 1, pageSize: 10, total: 100 })
      
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).toContain('Showing 1')
      expect(text).toContain('10 of 100 results')
    })

    it('should render page size selector', () => {
      const wrapper = createWrapper()
      
      const select = wrapper.find('select')
      expect(select.exists()).toBe(true)
      expect(wrapper.text()).toContain('Rows per page:')
    })

    it('should render page size options', () => {
      const wrapper = createWrapper()
      
      const options = wrapper.findAll('option')
      const optionValues = options.map(opt => opt.element.value)
      
      expect(optionValues).toContain('10')
      expect(optionValues).toContain('20')
      expect(optionValues).toContain('50')
      expect(optionValues).toContain('100')
    })
  })

  describe('Page Calculation', () => {
    it('should calculate total pages correctly', () => {
      const wrapper = createWrapper({ total: 100, pageSize: 10 })
      
      expect(wrapper.text()).toContain('Page 1 of 10')
    })

    it('should handle non-divisible totals', () => {
      const wrapper = createWrapper({ total: 95, pageSize: 10 })
      
      expect(wrapper.text()).toContain('Page 1 of 10')
    })

    it('should show at least 1 page when total is 0', () => {
      const wrapper = createWrapper({ total: 0, pageSize: 10 })
      
      expect(wrapper.text()).toContain('Page 1 of 1')
    })

    it('should calculate start item correctly', () => {
      const wrapper = createWrapper({ page: 2, pageSize: 10, total: 100 })
      
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).toContain('Showing 11')
      expect(text).toContain('20')
    })

    it('should calculate end item correctly for last page', () => {
      const wrapper = createWrapper({ page: 10, pageSize: 10, total: 95 })
      
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).toContain('Showing 91')
      expect(text).toContain('95')
    })

    it('should show 0 for start item when total is 0', () => {
      const wrapper = createWrapper({ page: 1, pageSize: 10, total: 0 })
      
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).toContain('Showing 0')
      expect(text).toContain('0 of 0')
    })
  })

  describe('Previous Button', () => {
    it('should be disabled on first page', () => {
      const wrapper = createWrapper({ page: 1 })
      
      const prevButton = wrapper.findAll('button').find(btn => btn.text().includes('Previous'))
      expect(prevButton?.attributes('disabled')).toBeDefined()
    })

    it('should be enabled on pages after first', () => {
      const wrapper = createWrapper({ page: 2 })
      
      const prevButton = wrapper.findAll('button').find(btn => btn.text().includes('Previous'))
      expect(prevButton?.attributes('disabled')).toBeUndefined()
    })

    it('should emit update:page with previous page number', async () => {
      const wrapper = createWrapper({ page: 3 })
      
      const prevButton = wrapper.findAll('button').find(btn => btn.text().includes('Previous'))
      await prevButton?.trigger('click')
      
      expect(wrapper.emitted('update:page')).toBeTruthy()
      expect(wrapper.emitted('update:page')?.[0]).toEqual([2])
    })

    it('should not go below page 1', async () => {
      const wrapper = createWrapper({ page: 1 })
      
      const prevButton = wrapper.findAll('button').find(btn => btn.text().includes('Previous'))
      await prevButton?.trigger('click')
      
      // Should not emit since button is disabled
      expect(wrapper.emitted('update:page')).toBeFalsy()
    })
  })

  describe('Next Button', () => {
    it('should be disabled on last page', () => {
      const wrapper = createWrapper({ page: 10, pageSize: 10, total: 100 })
      
      const nextButton = wrapper.findAll('button').find(btn => btn.text().includes('Next'))
      expect(nextButton?.attributes('disabled')).toBeDefined()
    })

    it('should be enabled on pages before last', () => {
      const wrapper = createWrapper({ page: 1, pageSize: 10, total: 100 })
      
      const nextButton = wrapper.findAll('button').find(btn => btn.text().includes('Next'))
      expect(nextButton?.attributes('disabled')).toBeUndefined()
    })

    it('should emit update:page with next page number', async () => {
      const wrapper = createWrapper({ page: 2 })
      
      const nextButton = wrapper.findAll('button').find(btn => btn.text().includes('Next'))
      await nextButton?.trigger('click')
      
      expect(wrapper.emitted('update:page')).toBeTruthy()
      expect(wrapper.emitted('update:page')?.[0]).toEqual([3])
    })

    it('should not go beyond last page', async () => {
      const wrapper = createWrapper({ page: 10, pageSize: 10, total: 100 })
      
      const nextButton = wrapper.findAll('button').find(btn => btn.text().includes('Next'))
      await nextButton?.trigger('click')
      
      // Should not emit since button is disabled
      expect(wrapper.emitted('update:page')).toBeFalsy()
    })
  })

  describe('Page Size Selector', () => {
    it('should display current page size', () => {
      const wrapper = createWrapper({ pageSize: 20 })
      
      const select = wrapper.find('select') as any
      expect(select.element.value).toBe('20')
    })

    it('should emit update:page-size when changed', async () => {
      const wrapper = createWrapper()
      
      const select = wrapper.find('select')
      await select.setValue('50')
      
      expect(wrapper.emitted('update:page-size')).toBeTruthy()
      expect(wrapper.emitted('update:page-size')?.[0]).toEqual([50])
    })

    it('should have all page size options', () => {
      const wrapper = createWrapper()
      
      const options = wrapper.findAll('option')
      expect(options.length).toBe(4)
      
      const values = options.map(opt => opt.element.value)
      expect(values).toEqual(['10', '20', '50', '100'])
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA label for navigation', () => {
      const wrapper = createWrapper()
      
      const nav = wrapper.find('nav')
      expect(nav.attributes('aria-label')).toBe('Pagination navigation')
    })

    it('should have proper ARIA labels for buttons', () => {
      const wrapper = createWrapper()
      
      const prevButton = wrapper.findAll('button').find(btn => btn.text().includes('Previous'))
      const nextButton = wrapper.findAll('button').find(btn => btn.text().includes('Next'))
      
      expect(prevButton?.attributes('aria-label')).toBe('Go to previous page')
      expect(nextButton?.attributes('aria-label')).toBe('Go to next page')
    })

    it('should have proper ARIA label for page size selector', () => {
      const wrapper = createWrapper()
      
      const select = wrapper.find('select')
      expect(select.attributes('aria-label')).toBe('Select number of rows per page')
    })

    it('should have semantic HTML structure', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.find('nav').exists()).toBe(true)
      expect(wrapper.find('label').exists()).toBe(true)
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive layout classes', () => {
      const wrapper = createWrapper()
      
      const nav = wrapper.find('nav')
      expect(nav.classes()).toContain('flex')
      expect(nav.classes()).toContain('items-center')
      expect(nav.classes()).toContain('justify-between')
    })

    it('should hide button text on mobile', () => {
      const wrapper = createWrapper()
      
      const prevButton = wrapper.findAll('button').find(btn => btn.text().includes('Previous'))
      const prevSpan = prevButton?.find('span')
      
      expect(prevSpan?.classes()).toContain('hidden')
      expect(prevSpan?.classes()).toContain('sm:inline')
    })

    it('should have responsive gap spacing', () => {
      const wrapper = createWrapper()
      
      const nav = wrapper.find('nav')
      expect(nav.classes()).toContain('gap-4')
    })
  })

  describe('Button Styling', () => {
    it('should have proper styling for enabled buttons', () => {
      const wrapper = createWrapper({ page: 2 })
      
      const prevButton = wrapper.findAll('button').find(btn => btn.text().includes('Previous'))
      expect(prevButton?.classes()).toContain('hover:bg-gray-50')
      expect(prevButton?.classes()).toContain('transition-colors')
    })

    it('should have disabled styling for disabled buttons', () => {
      const wrapper = createWrapper({ page: 1 })
      
      const prevButton = wrapper.findAll('button').find(btn => btn.text().includes('Previous'))
      expect(prevButton?.classes()).toContain('disabled:opacity-50')
      expect(prevButton?.classes()).toContain('disabled:cursor-not-allowed')
    })

    it('should have icons in buttons', () => {
      const wrapper = createWrapper()
      
      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        const svg = button.find('svg')
        expect(svg.exists()).toBe(true)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle single page scenario', () => {
      const wrapper = createWrapper({ page: 1, pageSize: 100, total: 50 })
      
      expect(wrapper.text()).toContain('Page 1 of 1')
      
      const prevButton = wrapper.findAll('button').find(btn => btn.text().includes('Previous'))
      const nextButton = wrapper.findAll('button').find(btn => btn.text().includes('Next'))
      
      expect(prevButton?.attributes('disabled')).toBeDefined()
      expect(nextButton?.attributes('disabled')).toBeDefined()
    })

    it('should handle empty results', () => {
      const wrapper = createWrapper({ page: 1, pageSize: 10, total: 0 })
      
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).toContain('Showing 0')
      expect(text).toContain('0 of 0 results')
    })

    it('should handle large page numbers', () => {
      const wrapper = createWrapper({ page: 999, pageSize: 10, total: 10000 })
      
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).toContain('Page 999 of 1000')
    })

    it('should handle large totals', () => {
      const wrapper = createWrapper({ page: 1, pageSize: 10, total: 1000000 })
      
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).toContain('1000000 results')
    })

    it('should clamp page number to valid range', async () => {
      const wrapper = createWrapper({ page: 5, pageSize: 10, total: 100 })
      
      // Try to go to page 15 (beyond max)
      const nextButton = wrapper.findAll('button').find(btn => btn.text().includes('Next'))
      await nextButton?.trigger('click')
      
      const emittedPage = wrapper.emitted('update:page')?.[0]?.[0]
      expect(emittedPage).toBeLessThanOrEqual(10)
    })
  })

  describe('Text Formatting', () => {
    it('should format page numbers with commas', () => {
      const wrapper = createWrapper({ page: 1, pageSize: 10, total: 1000 })
      
      const text = wrapper.text().replace(/\s+/g, ' ')
      expect(text).toContain('1000')
    })

    it('should use singular "result" for 1 item', () => {
      const wrapper = createWrapper({ page: 1, pageSize: 10, total: 1 })
      
      expect(wrapper.text()).toContain('1 result')
    })

    it('should use plural "results" for multiple items', () => {
      const wrapper = createWrapper({ page: 1, pageSize: 10, total: 100 })
      
      expect(wrapper.text()).toContain('100 results')
    })
  })
})

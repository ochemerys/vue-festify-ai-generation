import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from './Pagination.vue'

/**
 * Pagination.spec.ts - Unit tests for Pagination component
 *
 * Tests pagination controls, page navigation, and page size selection
 */

describe('Pagination.vue', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    pageSize: 10,
    totalItems: 95
  }

  describe('Rendering', () => {
    it('should render pagination controls', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      expect(wrapper.find('.flex.items-center.justify-between').exists()).toBe(true)
      expect(wrapper.find('nav[aria-label="Pagination"]').exists()).toBe(true)
    })

    it('should display item count information', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      expect(wrapper.text()).toContain('Showing 1 to 10 of 95 results')
    })

    it('should render page size selector', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const select = wrapper.find('select[aria-label="Items per page"]')
      expect(select.exists()).toBe(true)

      const options = select.findAll('option')
      expect(options.length).toBe(4) // 10, 25, 50, 100
    })

    it('should render navigation buttons', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const prevButton = wrapper.find('button[aria-label="Previous page"]')
      const nextButton = wrapper.find('button[aria-label="Next page"]')

      expect(prevButton.exists()).toBe(true)
      expect(nextButton.exists()).toBe(true)
    })
  })

  describe('Page Navigation', () => {
    it('should emit page-change when next button is clicked', async () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const nextButton = wrapper.find('button[aria-label="Next page"]')
      await nextButton.trigger('click')

      expect(wrapper.emitted('page-change')).toBeTruthy()
      expect(wrapper.emitted('page-change')[0]).toEqual([2])
    })

    it('should emit page-change when previous button is clicked', async () => {
      const props = { ...defaultProps, currentPage: 3 }
      const wrapper = mount(Pagination, { props })

      const prevButton = wrapper.find('button[aria-label="Previous page"]')
      await prevButton.trigger('click')

      expect(wrapper.emitted('page-change')[0]).toEqual([2])
    })

    it('should emit page-change when page number is clicked', async () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const pageButtons = wrapper.findAll('button').filter(btn =>
        !btn.attributes('aria-label')?.includes('Previous') &&
        !btn.attributes('aria-label')?.includes('Next') &&
        btn.text().match(/^\d+$/) &&
        !btn.attributes('aria-current') // Exclude current page
      )

      if (pageButtons.length > 0) {
        await pageButtons[0].trigger('click')
        expect(wrapper.emitted('page-change')).toBeTruthy()
      }
    })

    it('should disable previous button on first page', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const prevButton = wrapper.find('button[aria-label="Previous page"]')
      expect(prevButton.classes()).toContain('cursor-not-allowed')
      expect(prevButton.classes()).toContain('opacity-50')
    })

    it('should disable next button on last page', () => {
      const props = { ...defaultProps, currentPage: 10 }
      const wrapper = mount(Pagination, { props })

      const nextButton = wrapper.find('button[aria-label="Next page"]')
      expect(nextButton.attributes('disabled')).toBeDefined()
      expect(nextButton.classes()).toContain('opacity-50')
    })

    it('should highlight current page', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const currentPageButton = wrapper.find('button[aria-current="page"]')
      expect(currentPageButton.exists()).toBe(true)
      expect(currentPageButton.classes()).toContain('bg-blue-600')
    })
  })

  describe('Page Size Selection', () => {
    it('should emit page-size-change when page size is changed', async () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const select = wrapper.find('select[aria-label="Items per page"]')
      await select.setValue('25')

      expect(wrapper.emitted('page-size-change')).toBeTruthy()
      expect(wrapper.emitted('page-size-change')[0]).toEqual([25])
    })

    it('should display current page size as selected', () => {
      const props = { ...defaultProps, pageSize: 25 }
      const wrapper = mount(Pagination, { props })

      const select = wrapper.find('select[aria-label="Items per page"]')
      expect(select.element.value).toBe('25')
    })
  })

  describe('Page Display Logic', () => {
    it('should show all pages when total pages <= 7', () => {
      const props = { ...defaultProps, totalPages: 5 }
      const wrapper = mount(Pagination, { props })

      const pageButtons = wrapper.findAll('button').filter(btn =>
        btn.text().match(/^\d+$/) && !btn.attributes('disabled')
      )
      expect(pageButtons.length).toBe(5)
    })

    it('should show ellipsis for large page counts', () => {
      const props = { ...defaultProps, totalPages: 20, currentPage: 10 }
      const wrapper = mount(Pagination, { props })

      const ellipsis = wrapper.findAll('span').filter(span =>
        span.text() === '...' && span.attributes('aria-hidden')
      )
      expect(ellipsis.length).toBeGreaterThan(0)
    })

    it('should always show first and last page when applicable', () => {
      const props = { ...defaultProps, totalPages: 20, currentPage: 10 }
      const wrapper = mount(Pagination, { props })

      const pageButtons = wrapper.findAll('button').filter(btn =>
        btn.text().match(/^\d+$/) && !btn.attributes('disabled')
      )

      const firstPage = pageButtons.find(btn => btn.text() === '1')
      const lastPage = pageButtons.find(btn => btn.text() === '20')

      expect(firstPage).toBeTruthy()
      expect(lastPage).toBeTruthy()
    })
  })

  describe('Item Count Display', () => {
    it('should calculate correct item range for first page', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      expect(wrapper.text()).toContain('Showing 1 to 10 of 95 results')
    })

    it('should calculate correct item range for middle page', () => {
      const props = { ...defaultProps, currentPage: 3 }
      const wrapper = mount(Pagination, { props })

      expect(wrapper.text()).toContain('Showing 21 to 30 of 95 results')
    })

    it('should calculate correct item range for last page', () => {
      const props = { ...defaultProps, currentPage: 10, totalItems: 95 }
      const wrapper = mount(Pagination, { props })

      expect(wrapper.text()).toContain('Showing 91 to 95 of 95 results')
    })

    it('should handle exact page size matches', () => {
      const props = { ...defaultProps, totalItems: 100 }
      const wrapper = mount(Pagination, { props })

      expect(wrapper.text()).toContain('Showing 1 to 10 of 100 results')
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive flex layout', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const container = wrapper.find('.flex.items-center.justify-between')
      expect(container.classes()).toContain('flex-col')
      expect(container.classes()).toContain('sm:flex-row')
    })

    it('should have responsive gap spacing', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const container = wrapper.find('.flex.items-center.justify-between')
      expect(container.classes()).toContain('gap-4')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      expect(wrapper.find('nav[aria-label="Pagination"]').exists()).toBe(true)
      expect(wrapper.find('select[aria-label="Items per page"]').exists()).toBe(true)
      expect(wrapper.find('button[aria-label="Previous page"]').exists()).toBe(true)
      expect(wrapper.find('button[aria-label="Next page"]').exists()).toBe(true)
    })

    it('should have aria-current on active page', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const currentPageButton = wrapper.find('button[aria-current="page"]')
      expect(currentPageButton.exists()).toBe(true)
    })

    it('should have proper page button labels', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const pageButtons = wrapper.findAll('button[aria-label*="Page"]')
      pageButtons.forEach(button => {
        expect(button.attributes('aria-label')).toMatch(/Page \d+/)
      })
    })

    it('should hide ellipsis from screen readers', () => {
      const props = { ...defaultProps, totalPages: 20, currentPage: 10 }
      const wrapper = mount(Pagination, { props })

      const ellipsis = wrapper.find('span[aria-hidden="true"]')
      expect(ellipsis.exists()).toBe(true)
    })
  })

  describe('Styling', () => {
    it('should apply proper button styling', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        expect(button.classes()).toContain('rounded-lg')
        expect(button.classes()).toContain('border')
      })
    })

    it('should apply disabled styling', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const disabledButton = wrapper.find('button[aria-label="Previous page"]')
      expect(disabledButton.classes()).toContain('cursor-not-allowed')
      expect(disabledButton.classes()).toContain('opacity-50')
    })

    it('should apply active page styling', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const activeButton = wrapper.find('button[aria-current="page"]')
      expect(activeButton.classes()).toContain('bg-blue-600')
      expect(activeButton.classes()).toContain('text-white')
    })

    it('should apply hover styling', () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const buttons = wrapper.findAll('button').filter(btn => {
        const disabled = btn.attributes('disabled')
        const isCurrent = btn.attributes('aria-current')
        return (disabled === undefined || disabled === null) && !isCurrent
      })
      buttons.forEach(button => {
        const classAttr = button.attributes('class') || ''
        expect(classAttr).toContain('hover:bg-slate-50')
        expect(classAttr).toContain('hover:text-slate-700')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle single page correctly', () => {
      const props = { ...defaultProps, totalPages: 1 }
      const wrapper = mount(Pagination, { props })

      const pageButtons = wrapper.findAll('button').filter(btn =>
        btn.text().match(/^\d+$/) && !btn.attributes('disabled')
      )
      expect(pageButtons.length).toBe(1)

      const prevButton = wrapper.find('button[aria-label="Previous page"]')
      const nextButton = wrapper.find('button[aria-label="Next page"]')

      expect(prevButton.attributes('disabled')).toBeDefined()
      expect(nextButton.attributes('disabled')).toBeDefined()
    })

    it('should handle zero total items', () => {
      const props = { ...defaultProps, totalItems: 0 }
      const wrapper = mount(Pagination, { props })

      expect(wrapper.text()).toContain('Showing 0 to 0 of 0 results')
    })

    it('should handle very large page numbers', () => {
      const props = { ...defaultProps, totalPages: 1000, currentPage: 500 }
      const wrapper = mount(Pagination, { props })

      // Should still render without crashing
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle page size larger than total items', () => {
      const props = { ...defaultProps, pageSize: 100, totalItems: 50 }
      const wrapper = mount(Pagination, { props })

      expect(wrapper.text()).toContain('Showing 1 to 50 of 50 results')
    })
  })

  describe('Event Emission', () => {
    it('should not emit page-change for disabled buttons', async () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const prevButton = wrapper.find('button[aria-label="Previous page"]')
      await prevButton.trigger('click')

      expect(wrapper.emitted('page-change')).toBeFalsy()
    })

    it('should not emit page-change for current page', async () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const currentPageButton = wrapper.find('button[aria-current="page"]')
      await currentPageButton.trigger('click')

      expect(wrapper.emitted('page-change')).toBeFalsy()
    })

    it('should emit page-size-change with number type', async () => {
      const wrapper = mount(Pagination, { props: defaultProps })

      const select = wrapper.find('select[aria-label="Items per page"]')
      await select.setValue('50')

      expect(wrapper.emitted('page-size-change')[0][0]).toBe(50)
    })
  })
})
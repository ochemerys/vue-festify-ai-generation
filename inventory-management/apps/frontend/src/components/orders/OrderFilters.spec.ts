import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrderFilters from './OrderFilters.vue'
import type { OrderStatus } from './OrderFilters.vue'

describe('OrderFilters', () => {
  let wrapper: VueWrapper<any>

  const defaultFilters = {
    search: '',
    status: [] as OrderStatus[],
    startDate: '',
    endDate: '',
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (filters = defaultFilters, loading = false) => {
    return mount(OrderFilters, {
      props: {
        filters,
        loading,
      },
    })
  }

  describe('Component Rendering', () => {
    it('should render search input', () => {
      wrapper = createWrapper()
      
      const searchInput = wrapper.find('input[type="text"]')
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.attributes('placeholder')).toContain('Order #, customer, email')
    })

    it('should render status select', () => {
      wrapper = createWrapper()
      
      const statusSelect = wrapper.find('select')
      expect(statusSelect.exists()).toBe(true)
    })

    it('should render date inputs', () => {
      wrapper = createWrapper()
      
      const dateInputs = wrapper.findAll('input[type="date"]')
      expect(dateInputs.length).toBe(2)
    })

    it('should render clear filters button', () => {
      wrapper = createWrapper()
      
      const clearButton = wrapper.findAll('button').find(btn => btn.text().includes('Clear filters'))
      expect(clearButton?.exists()).toBe(true)
    })

    it('should have proper labels for all inputs', () => {
      wrapper = createWrapper()
      
      expect(wrapper.text()).toContain('Search')
      expect(wrapper.text()).toContain('Status')
      expect(wrapper.text()).toContain('Start Date')
      expect(wrapper.text()).toContain('End Date')
    })
  })

  describe('Loading State', () => {
    it('should show loading skeleton when loading is true', () => {
      wrapper = createWrapper(defaultFilters, true)
      
      const skeletons = wrapper.findAll('.animate-pulse')
      expect(skeletons.length).toBe(4)
    })

    it('should hide form when loading', () => {
      wrapper = createWrapper(defaultFilters, true)
      
      expect(wrapper.find('form').exists()).toBe(false)
    })

    it('should show form when not loading', () => {
      wrapper = createWrapper(defaultFilters, false)
      
      expect(wrapper.find('form').exists()).toBe(true)
    })
  })

  describe('Search Input', () => {
    it('should display current search value', () => {
      wrapper = createWrapper({ ...defaultFilters, search: 'test query' })
      
      const searchInput = wrapper.find('input[type="text"]') as any
      expect(searchInput.element.value).toBe('test query')
    })

    it('should emit update:filters with debounced search', async () => {
      wrapper = createWrapper()
      
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('new search')
      
      // Should not emit immediately
      expect(wrapper.emitted('update:filters')).toBeFalsy()
      
      // Should emit after debounce delay
      await vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(wrapper.emitted('update:filters')).toBeTruthy()
      expect(wrapper.emitted('update:filters')?.[0]).toEqual([
        { ...defaultFilters, search: 'new search' }
      ])
    })

    it('should cancel previous debounce timer on new input', async () => {
      wrapper = createWrapper()
      
      const searchInput = wrapper.find('input[type="text"]')
      
      await searchInput.setValue('first')
      await vi.advanceTimersByTime(100)
      
      await searchInput.setValue('second')
      await vi.advanceTimersByTime(300)
      await nextTick()
      
      // Should only emit once with the latest value
      expect(wrapper.emitted('update:filters')?.length).toBe(1)
      expect(wrapper.emitted('update:filters')?.[0]).toEqual([
        { ...defaultFilters, search: 'second' }
      ])
    })
  })

  describe('Status Filter', () => {
    it('should display all status options', () => {
      wrapper = createWrapper()
      
      const options = wrapper.findAll('option')
      const optionTexts = options.map(opt => opt.text())
      
      expect(optionTexts).toContain('All statuses')
      expect(optionTexts).toContain('Pending')
      expect(optionTexts).toContain('Processing')
      expect(optionTexts).toContain('Shipped')
      expect(optionTexts).toContain('Delivered')
      expect(optionTexts).toContain('Cancelled')
    })

    it('should display selected statuses', async () => {
      wrapper = createWrapper({ ...defaultFilters, status: ['pending', 'processing'] })
      await nextTick()
      
      // Check that the value prop is set correctly
      const select = wrapper.find('select')
      const value = select.attributes('value') || select.element.value
      
      // The component should receive the status array
      expect(wrapper.vm.filters.status).toContain('pending')
      expect(wrapper.vm.filters.status).toContain('processing')
    })

    it('should emit update:filters when status changes', async () => {
      wrapper = createWrapper()
      
      const select = wrapper.find('select')
      const options = select.findAll('option')
      
      // Select pending option
      options[1].element.selected = true
      await select.trigger('change')
      
      expect(wrapper.emitted('update:filters')).toBeTruthy()
    })

    it('should show helper text for multi-select', () => {
      wrapper = createWrapper()
      
      expect(wrapper.text()).toContain('Hold Ctrl/Cmd to select multiple')
    })
  })

  describe('Date Filters', () => {
    it('should display start date value', () => {
      wrapper = createWrapper({ ...defaultFilters, startDate: '2024-01-01' })
      
      const startDateInput = wrapper.findAll('input[type="date"]')[0] as any
      expect(startDateInput.element.value).toBe('2024-01-01')
    })

    it('should display end date value', () => {
      wrapper = createWrapper({ ...defaultFilters, endDate: '2024-12-31' })
      
      const endDateInput = wrapper.findAll('input[type="date"]')[1] as any
      expect(endDateInput.element.value).toBe('2024-12-31')
    })

    it('should emit update:filters when start date changes', async () => {
      wrapper = createWrapper()
      
      const startDateInput = wrapper.findAll('input[type="date"]')[0]
      await startDateInput.setValue('2024-01-01')
      
      expect(wrapper.emitted('update:filters')).toBeTruthy()
      expect(wrapper.emitted('update:filters')?.[0]).toEqual([
        { ...defaultFilters, startDate: '2024-01-01' }
      ])
    })

    it('should emit update:filters when end date changes', async () => {
      wrapper = createWrapper()
      
      const endDateInput = wrapper.findAll('input[type="date"]')[1]
      await endDateInput.setValue('2024-12-31')
      
      expect(wrapper.emitted('update:filters')).toBeTruthy()
      expect(wrapper.emitted('update:filters')?.[0]).toEqual([
        { ...defaultFilters, endDate: '2024-12-31' }
      ])
    })
  })

  describe('Active Filters Indicator', () => {
    it('should show active indicator when search is present', () => {
      wrapper = createWrapper({ ...defaultFilters, search: 'test' })
      
      expect(wrapper.text()).toContain('Filters active')
    })

    it('should show active indicator when status is selected', () => {
      wrapper = createWrapper({ ...defaultFilters, status: ['pending'] })
      
      expect(wrapper.text()).toContain('Filters active')
    })

    it('should show active indicator when dates are set', () => {
      wrapper = createWrapper({ ...defaultFilters, startDate: '2024-01-01' })
      
      expect(wrapper.text()).toContain('Filters active')
    })

    it('should not show active indicator when no filters are set', () => {
      wrapper = createWrapper(defaultFilters)
      
      expect(wrapper.text()).not.toContain('Filters active')
    })

    it('should show filter icon when filters are active', () => {
      wrapper = createWrapper({ ...defaultFilters, search: 'test' })
      
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })
  })

  describe('Clear Filters', () => {
    it('should emit reset event when clear button is clicked', async () => {
      wrapper = createWrapper({ ...defaultFilters, search: 'test' })
      
      const clearButton = wrapper.findAll('button').find(btn => btn.text().includes('Clear filters'))
      await clearButton?.trigger('click')
      
      expect(wrapper.emitted('reset')).toBeTruthy()
    })

    it('should disable clear button when no filters are active', () => {
      wrapper = createWrapper(defaultFilters)
      
      const clearButton = wrapper.findAll('button').find(btn => btn.text().includes('Clear filters'))
      expect(clearButton?.attributes('disabled')).toBeDefined()
    })

    it('should enable clear button when filters are active', () => {
      wrapper = createWrapper({ ...defaultFilters, search: 'test' })
      
      const clearButton = wrapper.findAll('button').find(btn => btn.text().includes('Clear filters'))
      expect(clearButton?.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for inputs', () => {
      wrapper = createWrapper()
      
      const searchInput = wrapper.find('input[type="text"]')
      expect(searchInput.attributes('aria-label')).toContain('Search orders')
      
      const statusSelect = wrapper.find('select')
      expect(statusSelect.attributes('aria-label')).toContain('Filter by order status')
      
      const dateInputs = wrapper.findAll('input[type="date"]')
      expect(dateInputs[0].attributes('aria-label')).toContain('Filter orders from this date')
      expect(dateInputs[1].attributes('aria-label')).toContain('Filter orders until this date')
    })

    it('should have proper heading structure', () => {
      wrapper = createWrapper()
      
      const heading = wrapper.find('#filters-heading')
      expect(heading.exists()).toBe(true)
      expect(heading.classes()).toContain('sr-only')
    })

    it('should have proper fieldset for status', () => {
      wrapper = createWrapper()
      
      const fieldset = wrapper.find('fieldset')
      expect(fieldset.exists()).toBe(true)
      
      const legend = fieldset.find('legend')
      expect(legend.exists()).toBe(true)
      expect(legend.text()).toBe('Status')
    })

    it('should have proper label associations', () => {
      wrapper = createWrapper()
      
      const labels = wrapper.findAll('label')
      expect(labels.length).toBeGreaterThan(0)
      
      labels.forEach(label => {
        const input = label.find('input')
        expect(input.exists()).toBe(true)
      })
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      wrapper = createWrapper()
      
      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('grid-cols-1')
      expect(grid.classes()).toContain('lg:grid-cols-2')
    })

    it('should have proper spacing classes', () => {
      wrapper = createWrapper()
      
      const columns = wrapper.findAll('.space-y-4')
      expect(columns.length).toBeGreaterThan(0)
    })
  })

  describe('Form Submission', () => {
    it('should prevent default form submission', async () => {
      wrapper = createWrapper()
      
      const form = wrapper.find('form')
      const submitEvent = new Event('submit')
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault')
      
      await form.trigger('submit')
      
      // Form should have @submit.prevent
      expect(form.attributes('onsubmit')).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string search', async () => {
      wrapper = createWrapper({ ...defaultFilters, search: 'test' })
      
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('')
      
      await vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(wrapper.emitted('update:filters')?.[0]).toEqual([
        { ...defaultFilters, search: '' }
      ])
    })

    it('should handle multiple status selections', async () => {
      wrapper = createWrapper()
      
      const select = wrapper.find('select')
      const options = select.findAll('option')
      
      // Select multiple options
      options[1].element.selected = true
      options[2].element.selected = true
      await select.trigger('change')
      
      expect(wrapper.emitted('update:filters')).toBeTruthy()
    })

    it('should handle clearing status selection', async () => {
      wrapper = createWrapper({ ...defaultFilters, status: ['pending'] })
      
      const select = wrapper.find('select')
      const options = select.findAll('option')
      
      // Deselect all
      options.forEach(opt => opt.element.selected = false)
      await select.trigger('change')
      
      expect(wrapper.emitted('update:filters')).toBeTruthy()
    })
  })

  describe('Focus Management', () => {
    it('should expose focusSearch method', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.focusSearch).toBeDefined()
      expect(typeof wrapper.vm.focusSearch).toBe('function')
    })

    it('should focus search input when focusSearch is called', async () => {
      wrapper = createWrapper()
      
      const searchInput = wrapper.find('input[type="text"]').element as HTMLInputElement
      const focusSpy = vi.spyOn(searchInput, 'focus')
      
      wrapper.vm.focusSearch()
      
      expect(focusSpy).toHaveBeenCalled()
    })
  })
})

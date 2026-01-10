import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrderListPage from './OrderListPage.vue'
import type { Order } from './OrderListPage.vue'

// Mock child components
vi.mock('../components/orders/OrderSummaryStats.vue', () => ({
  default: { name: 'OrderSummaryStats', template: '<div data-testid="order-summary-stats"></div>' }
}))
vi.mock('../components/orders/OrderFilters.vue', () => ({
  default: { name: 'OrderFilters', template: '<div data-testid="order-filters"></div>' }
}))
vi.mock('../components/orders/OrderTable.vue', () => ({
  default: { name: 'OrderTable', template: '<div data-testid="order-table"></div>' }
}))
vi.mock('../components/orders/OrderCardList.vue', () => ({
  default: { name: 'OrderCardList', template: '<div data-testid="order-card-list"></div>' }
}))
vi.mock('../components/orders/PaginationControls.vue', () => ({
  default: { name: 'PaginationControls', template: '<div data-testid="pagination-controls"></div>' }
}))
vi.mock('../components/orders/OrderDetailsModal.vue', () => ({
  default: { name: 'OrderDetailsModal', template: '<div data-testid="order-details-modal"></div>' }
}))

describe('OrderListPage', () => {
  let wrapper: VueWrapper<any>

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

  const createWrapper = () => {
    return mount(OrderListPage, {
      global: {
        stubs: {
          OrderSummaryStats: true,
          OrderFilters: true,
          OrderTable: true,
          OrderCardList: true,
          PaginationControls: true,
          OrderDetailsModal: true,
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render the page header with title and description', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('h1').text()).toBe('Orders')
      expect(wrapper.text()).toContain('Manage and track customer orders')
    })

    it('should render Export and New Order buttons', () => {
      wrapper = createWrapper()
      
      const buttons = wrapper.findAll('button')
      const exportButton = buttons.find(btn => btn.text().includes('Export'))
      const newOrderButton = buttons.find(btn => btn.text().includes('New Order'))
      
      expect(exportButton?.exists()).toBe(true)
      expect(newOrderButton?.exists()).toBe(true)
    })

    it('should render OrderSummaryStats component', () => {
      wrapper = createWrapper()
      
      expect(wrapper.findComponent({ name: 'OrderSummaryStats' }).exists()).toBe(true)
    })

    it('should render search input', () => {
      wrapper = createWrapper()
      
      const searchInput = wrapper.find('input[type="text"]')
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.attributes('placeholder')).toContain('Search by order')
    })

    it('should render filter toggle button', () => {
      wrapper = createWrapper()
      
      const filterButton = wrapper.findAll('button').find(btn => btn.text().includes('Filters'))
      expect(filterButton?.exists()).toBe(true)
    })
  })

  describe('Data Loading', () => {
    it('should load orders on mount', async () => {
      wrapper = createWrapper()
      
      // Wait for async operations
      await vi.runAllTimersAsync()
      await nextTick()
      
      expect(wrapper.vm.all.length).toBeGreaterThan(0)
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should show loading state initially', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.loading).toBe(true)
    })

    it('should generate 48 mock orders', async () => {
      wrapper = createWrapper()
      
      await vi.runAllTimersAsync()
      await nextTick()
      
      expect(wrapper.vm.all.length).toBe(48)
    })
  })

  describe('Search Functionality', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await vi.runAllTimersAsync()
      await nextTick()
    })

    it('should filter orders by order number', async () => {
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('ORD-2024-001')
      
      await vi.runAllTimersAsync()
      await nextTick()
      
      expect(wrapper.vm.filtered.length).toBeGreaterThan(0)
      expect(wrapper.vm.filtered[0].orderNumber).toContain('001')
    })

    it('should filter orders by customer name', async () => {
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('John Doe')
      
      await vi.runAllTimersAsync()
      await nextTick()
      
      const filtered = wrapper.vm.filtered
      expect(filtered.every((o: Order) => o.customerName.toLowerCase().includes('john doe'))).toBe(true)
    })

    it('should filter orders by email', async () => {
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('jane.smith@example.com')
      
      await vi.runAllTimersAsync()
      await nextTick()
      
      const filtered = wrapper.vm.filtered
      expect(filtered.every((o: Order) => o.customerEmail.toLowerCase().includes('jane.smith'))).toBe(true)
    })

    it('should debounce search input', async () => {
      const searchInput = wrapper.find('input[type="text"]')
      
      await searchInput.setValue('test')
      expect(wrapper.vm.filters.search).toBe('')
      
      await vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(wrapper.vm.filters.search).toBe('test')
    })

    it('should reset page to 1 when searching', async () => {
      wrapper.vm.page = 3
      
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('search')
      
      await vi.runAllTimersAsync()
      await nextTick()
      
      expect(wrapper.vm.page).toBe(1)
    })
  })

  describe('Filter Functionality', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await vi.runAllTimersAsync()
      await nextTick()
    })

    it('should toggle filter panel visibility', async () => {
      expect(wrapper.vm.showFilters).toBe(false)
      
      const filterButton = wrapper.findAll('button').find(btn => btn.text().includes('Filters'))
      await filterButton?.trigger('click')
      
      expect(wrapper.vm.showFilters).toBe(true)
    })

    it('should show active filter badge when filters are applied', async () => {
      wrapper.vm.filters = { search: 'test', status: [], startDate: '', endDate: '' }
      await nextTick()
      
      expect(wrapper.vm.hasActiveFilters).toBe(true)
      expect(wrapper.text()).toContain('Active')
    })

    it('should clear all filters', async () => {
      wrapper.vm.filters = { 
        search: 'test', 
        status: ['pending'], 
        startDate: '2024-01-01', 
        endDate: '2024-12-31' 
      }
      wrapper.vm.searchQuery = 'test'
      wrapper.vm.page = 3
      
      // Call clearFilters directly
      wrapper.vm.clearFilters()
      await nextTick()
      
      expect(wrapper.vm.filters.search).toBe('')
      expect(wrapper.vm.filters.status).toEqual([])
      expect(wrapper.vm.filters.startDate).toBe('')
      expect(wrapper.vm.filters.endDate).toBe('')
      expect(wrapper.vm.searchQuery).toBe('')
      expect(wrapper.vm.page).toBe(1)
    })

    it('should filter by status', async () => {
      wrapper.vm.filters = { search: '', status: ['pending'], startDate: '', endDate: '' }
      await nextTick()
      
      const filtered = wrapper.vm.filtered
      expect(filtered.every((o: Order) => o.status === 'pending')).toBe(true)
    })

    it('should filter by date range', async () => {
      const startDate = new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0]
      const endDate = new Date().toISOString().split('T')[0]
      
      wrapper.vm.filters = { 
        search: '', 
        status: [], 
        startDate, 
        endDate 
      }
      await nextTick()
      
      const filtered = wrapper.vm.filtered
      expect(filtered.length).toBeGreaterThan(0)
      expect(filtered.length).toBeLessThan(wrapper.vm.all.length)
    })
  })

  describe('Pagination', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await vi.runAllTimersAsync()
      await nextTick()
    })

    it('should paginate orders correctly', () => {
      wrapper.vm.page = 1
      wrapper.vm.pageSize = 10
      
      const paged = wrapper.vm.pagedOrders
      expect(paged.length).toBe(10)
    })

    it('should update page number', () => {
      wrapper.vm.onUpdatePage(2)
      expect(wrapper.vm.page).toBe(2)
    })

    it('should update page size and reset to page 1', () => {
      wrapper.vm.page = 3
      wrapper.vm.onUpdatePageSize(20)
      
      expect(wrapper.vm.pageSize).toBe(20)
      expect(wrapper.vm.page).toBe(1)
    })

    it('should show correct number of orders per page', () => {
      wrapper.vm.pageSize = 5
      const paged = wrapper.vm.pagedOrders
      
      expect(paged.length).toBeLessThanOrEqual(5)
    })
  })

  describe('Order Actions', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await vi.runAllTimersAsync()
      await nextTick()
    })

    it('should update order status', () => {
      const orderId = wrapper.vm.all[0].id
      const originalStatus = wrapper.vm.all[0].status
      
      wrapper.vm.onUpdateStatus({ orderId, status: 'shipped' })
      
      const updatedOrder = wrapper.vm.all.find((o: Order) => o.id === orderId)
      expect(updatedOrder?.status).toBe('shipped')
      expect(updatedOrder?.status).not.toBe(originalStatus)
    })

    it('should cancel pending order', () => {
      const pendingOrder = wrapper.vm.all.find((o: Order) => o.status === 'pending')
      if (pendingOrder) {
        wrapper.vm.onCancel(pendingOrder.id)
        
        const cancelledOrder = wrapper.vm.all.find((o: Order) => o.id === pendingOrder.id)
        expect(cancelledOrder?.status).toBe('cancelled')
      }
    })

    it('should not cancel non-pending order', () => {
      const shippedOrder = wrapper.vm.all.find((o: Order) => o.status === 'shipped')
      if (shippedOrder) {
        wrapper.vm.onCancel(shippedOrder.id)
        
        const order = wrapper.vm.all.find((o: Order) => o.id === shippedOrder.id)
        expect(order?.status).toBe('shipped')
      }
    })

    it('should open order details modal', () => {
      const orderId = wrapper.vm.all[0].id
      
      wrapper.vm.openDetails(orderId)
      
      expect(wrapper.vm.detailsOpen).toBe(true)
      expect(wrapper.vm.activeOrder?.id).toBe(orderId)
    })

    it('should close order details modal', async () => {
      wrapper.vm.detailsOpen = true
      wrapper.vm.activeOrder = wrapper.vm.all[0]
      
      wrapper.vm.closeDetails()
      
      expect(wrapper.vm.detailsOpen).toBe(false)
    })
  })

  describe('Quick Actions', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await vi.runAllTimersAsync()
      await nextTick()
    })

    it('should create new order', async () => {
      const initialCount = wrapper.vm.all.length
      
      const newOrderButton = wrapper.findAll('button').find(btn => btn.text().includes('New Order'))
      await newOrderButton?.trigger('click')
      
      expect(wrapper.vm.all.length).toBe(initialCount + 1)
      expect(wrapper.vm.all[0].status).toBe('pending')
    })

    it('should export orders to CSV', async () => {
      // Mock URL.createObjectURL and document.createElement
      const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
      const mockRevokeObjectURL = vi.fn()
      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = mockRevokeObjectURL
      
      const mockClick = vi.fn()
      const mockAnchor = { click: mockClick, href: '', download: '' }
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
      
      const exportButton = wrapper.findAll('button').find(btn => btn.text().includes('Export'))
      await exportButton?.trigger('click')
      
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()
    })
  })

  describe('Keyboard Shortcuts', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await vi.runAllTimersAsync()
      await nextTick()
    })

    it('should create new order with Ctrl+N', async () => {
      const initialCount = wrapper.vm.all.length
      
      const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true })
      document.dispatchEvent(event)
      
      await nextTick()
      
      expect(wrapper.vm.all.length).toBe(initialCount + 1)
    })

    it('should focus search input with Ctrl+F', async () => {
      const searchInput = wrapper.find('input[type="text"]').element as HTMLInputElement
      const focusSpy = vi.spyOn(searchInput, 'focus')
      
      const event = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true })
      document.dispatchEvent(event)
      
      await nextTick()
      
      expect(focusSpy).toHaveBeenCalled()
    })
  })

  describe('Summary Statistics', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await vi.runAllTimersAsync()
      await nextTick()
    })

    it('should compute summary correctly', () => {
      const summary = wrapper.vm.response.summary
      
      expect(summary.totalOrders).toBe(wrapper.vm.all.length)
      expect(summary.pendingOrders).toBeGreaterThanOrEqual(0)
      expect(summary.processingOrders).toBeGreaterThanOrEqual(0)
      expect(summary.shippedOrders).toBeGreaterThanOrEqual(0)
      expect(summary.deliveredOrders).toBeGreaterThanOrEqual(0)
    })

    it('should show pending orders alert when there are pending orders', async () => {
      // Ensure there's at least one pending order
      wrapper.vm.all[0].status = 'pending'
      await nextTick()
      
      const summary = wrapper.vm.response.summary
      if (summary.pendingOrders > 0) {
        expect(wrapper.text()).toContain('Pending Orders')
        expect(wrapper.text()).toContain('awaiting processing')
      }
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no orders match filters', async () => {
      wrapper = createWrapper()
      await vi.runAllTimersAsync()
      await nextTick()
      
      // Set filter that matches nothing
      wrapper.vm.filters = { search: 'nonexistent-order-xyz', status: [], startDate: '', endDate: '' }
      await nextTick()
      
      expect(wrapper.text()).toContain('No orders found')
      expect(wrapper.text()).toContain('No orders match your current filters')
    })

    it('should show create order button in empty state', async () => {
      wrapper = createWrapper()
      await vi.runAllTimersAsync()
      await nextTick()
      
      wrapper.vm.all = []
      await nextTick()
      
      expect(wrapper.text()).toContain('Create Order')
    })
  })

  describe('Error Handling', () => {
    it('should display error state when fetch fails', async () => {
      wrapper = createWrapper()
      
      wrapper.vm.error = 'Failed to load orders'
      await nextTick()
      
      expect(wrapper.text()).toContain('Failed to load orders')
      expect(wrapper.text()).toContain('Try Again')
    })

    it('should retry fetching orders on error', async () => {
      wrapper = createWrapper()
      await vi.runAllTimersAsync()
      
      wrapper.vm.error = 'Network error'
      await nextTick()
      
      const tryAgainButton = wrapper.findAll('button').find(btn => btn.text().includes('Try Again'))
      await tryAgainButton?.trigger('click')
      
      await vi.runAllTimersAsync()
      await nextTick()
      
      expect(wrapper.vm.error).toBeNull()
    })
  })

  describe('Responsive Behavior', () => {
    it('should render OrderTable for desktop view', () => {
      wrapper = createWrapper()
      
      expect(wrapper.findComponent({ name: 'OrderTable' }).exists()).toBe(true)
    })

    it('should render OrderCardList for mobile view', () => {
      wrapper = createWrapper()
      
      expect(wrapper.findComponent({ name: 'OrderCardList' }).exists()).toBe(true)
    })
  })
})

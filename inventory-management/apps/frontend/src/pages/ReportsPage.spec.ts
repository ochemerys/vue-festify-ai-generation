import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ReportsPage from './ReportsPage.vue'

// Helper to flush timers and microtasks
async function flush(): Promise<void> {
  await new Promise((r) => setTimeout(r, 0))
}

describe('ReportsPage.vue', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('renders page header and title', () => {
    const wrapper = mount(ReportsPage)
    expect(wrapper.text()).toContain('Reports & Analytics')
    expect(wrapper.text()).toContain('Generate reports and view analytics for informed business decisions')
  })

  it('displays all 6 report type options', () => {
    const wrapper = mount(ReportsPage)
    expect(wrapper.text()).toContain('Inventory Summary')
    expect(wrapper.text()).toContain('Low Stock Report')
    expect(wrapper.text()).toContain('Sales Report')
    expect(wrapper.text()).toContain('Inventory Movement')
    expect(wrapper.text()).toContain('Supplier Performance')
    expect(wrapper.text()).toContain('Product Performance')
  })

  it('shows empty state when no report type is selected', () => {
    const wrapper = mount(ReportsPage)
    expect(wrapper.text()).toContain('Select a Report Type')
    expect(wrapper.text()).toContain('Choose a report type above to get started')
  })

  it('shows report parameters section when a report type is selected', async () => {
    const wrapper = mount(ReportsPage)
    
    const buttons = wrapper.findAll('button')
    const inventorySummaryBtn = buttons.find(b => b.text().includes('Inventory Summary'))
    expect(inventorySummaryBtn).toBeTruthy()
    
    await inventorySummaryBtn!.trigger('click')
    await flush()

    expect(wrapper.text()).toContain('Report Parameters')
    expect(wrapper.text()).toContain('Date From')
    expect(wrapper.text()).toContain('Date To')
    expect(wrapper.text()).toContain('Format')
  })

  it('highlights selected report type', async () => {
    const wrapper = mount(ReportsPage)
    
    const buttons = wrapper.findAll('button')
    const salesReportBtn = buttons.find(b => b.text().includes('Sales Report'))
    
    await salesReportBtn!.trigger('click')
    await flush()

    // Check if the button has the selected class
    const selectedBtn = wrapper.findAll('button').find(b => 
      b.text().includes('Sales Report') && 
      b.classes().includes('border-blue-500')
    )
    expect(selectedBtn).toBeTruthy()
  })

  it('generates inventory summary report', async () => {
    const wrapper = mount(ReportsPage)
    
    // Select report type
    const buttons = wrapper.findAll('button')
    const inventoryBtn = buttons.find(b => b.text().includes('Inventory Summary'))
    await inventoryBtn!.trigger('click')
    await flush()

    // Click generate button
    const generateBtn = wrapper.findAll('button').find(b => b.text() === 'Generate Report')
    expect(generateBtn).toBeTruthy()
    await generateBtn!.trigger('click')
    
    // Wait for async operation
    await new Promise((r) => setTimeout(r, 900))

    expect(wrapper.text()).toContain('Inventory Summary Report')
    expect(wrapper.text()).toContain('Total Products')
    expect(wrapper.text()).toContain('Total Quantity')
    expect(wrapper.text()).toContain('Total Inventory Value')
  })

  it('generates low stock report', async () => {
    const wrapper = mount(ReportsPage)
    
    const buttons = wrapper.findAll('button')
    const lowStockBtn = buttons.find(b => b.text().includes('Low Stock Report'))
    await lowStockBtn!.trigger('click')
    await flush()

    const generateBtn = wrapper.findAll('button').find(b => b.text() === 'Generate Report')
    await generateBtn!.trigger('click')
    await new Promise((r) => setTimeout(r, 900))

    expect(wrapper.text()).toContain('Low Stock Report')
    expect(wrapper.text()).toContain('LOW_STOCK')
    expect(wrapper.text()).toContain('OUT_OF_STOCK')
  })

  it('generates sales report', async () => {
    const wrapper = mount(ReportsPage)
    
    const buttons = wrapper.findAll('button')
    const salesBtn = buttons.find(b => b.text().includes('Sales Report'))
    await salesBtn!.trigger('click')
    await flush()

    const generateBtn = wrapper.findAll('button').find(b => b.text() === 'Generate Report')
    await generateBtn!.trigger('click')
    await new Promise((r) => setTimeout(r, 900))

    expect(wrapper.text()).toContain('Sales Report')
    expect(wrapper.text()).toContain('Total Orders')
    expect(wrapper.text()).toContain('Total Revenue')
    expect(wrapper.text()).toContain('ORD-2024-001')
  })

  it('shows loading state while generating report', async () => {
    const wrapper = mount(ReportsPage)
    
    const buttons = wrapper.findAll('button')
    const inventoryBtn = buttons.find(b => b.text().includes('Inventory Summary'))
    await inventoryBtn!.trigger('click')
    await flush()

    const generateBtn = wrapper.findAll('button').find(b => b.text() === 'Generate Report')
    await generateBtn!.trigger('click')
    await flush()

    expect(wrapper.text()).toContain('Generating report...')
    expect(wrapper.text()).toContain('Generating...')
  })

  it('clears filters when clear button is clicked', async () => {
    const wrapper = mount(ReportsPage)
    
    const buttons = wrapper.findAll('button')
    const inventoryBtn = buttons.find(b => b.text().includes('Inventory Summary'))
    await inventoryBtn!.trigger('click')
    await flush()

    // Set filter values
    const dateInputs = wrapper.findAll('input[type="date"]')
    await dateInputs[0].setValue('2024-01-01')
    await dateInputs[1].setValue('2024-12-31')

    const formatSelect = wrapper.find('select')
    await formatSelect.setValue('csv')

    // Click clear button
    const clearBtn = wrapper.findAll('button').find(b => b.text() === 'Clear')
    await clearBtn!.trigger('click')
    await flush()

    // Check values are cleared
    expect((dateInputs[0].element as HTMLInputElement).value).toBe('')
    expect((dateInputs[1].element as HTMLInputElement).value).toBe('')
    expect((formatSelect.element as HTMLSelectElement).value).toBe('table')
  })

  it('displays report data table with correct columns', async () => {
    const wrapper = mount(ReportsPage)
    
    const buttons = wrapper.findAll('button')
    const inventoryBtn = buttons.find(b => b.text().includes('Inventory Summary'))
    await inventoryBtn!.trigger('click')
    await flush()

    const generateBtn = wrapper.findAll('button').find(b => b.text() === 'Generate Report')
    await generateBtn!.trigger('click')
    await new Promise((r) => setTimeout(r, 900))

    const table = wrapper.find('table')
    expect(table.exists()).toBe(true)
    
    const headers = table.findAll('th')
    expect(headers.length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('SKU')
    expect(wrapper.text()).toContain('Name')
    expect(wrapper.text()).toContain('Quantity')
  })

  it('displays summary metrics for reports', async () => {
    const wrapper = mount(ReportsPage)
    
    const buttons = wrapper.findAll('button')
    const salesBtn = buttons.find(b => b.text().includes('Sales Report'))
    await salesBtn!.trigger('click')
    await flush()

    const generateBtn = wrapper.findAll('button').find(b => b.text() === 'Generate Report')
    await generateBtn!.trigger('click')
    await new Promise((r) => setTimeout(r, 900))

    expect(wrapper.text()).toContain('Summary')
    expect(wrapper.text()).toContain('Total Orders')
    expect(wrapper.text()).toContain('Completed Orders')
    expect(wrapper.text()).toContain('Total Revenue')
  })

  it('shows export buttons when report is generated', async () => {
    const wrapper = mount(ReportsPage)
    
    const buttons = wrapper.findAll('button')
    const inventoryBtn = buttons.find(b => b.text().includes('Inventory Summary'))
    await inventoryBtn!.trigger('click')
    await flush()

    const generateBtn = wrapper.findAll('button').find(b => b.text() === 'Generate Report')
    await generateBtn!.trigger('click')
    await new Promise((r) => setTimeout(r, 900))

    expect(wrapper.text()).toContain('Export CSV')
    expect(wrapper.text()).toContain('Export PDF')
  })

  it('exports report to CSV', async () => {
    const wrapper = mount(ReportsPage)
    
    // Mock URL.createObjectURL and document.createElement
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
    const mockRevokeObjectURL = vi.fn()
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL

    const mockClick = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName)
      if (tagName === 'a') {
        element.click = mockClick
      }
      return element
    })

    const buttons = wrapper.findAll('button')
    const inventoryBtn = buttons.find(b => b.text().includes('Inventory Summary'))
    await inventoryBtn!.trigger('click')
    await flush()

    const generateBtn = wrapper.findAll('button').find(b => b.text() === 'Generate Report')
    await generateBtn!.trigger('click')
    await new Promise((r) => setTimeout(r, 900))

    const exportCsvBtn = wrapper.findAll('button').find(b => b.text() === 'Export CSV')
    await exportCsvBtn!.trigger('click')

    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()
  })

  it('handles history button click', async () => {
    const wrapper = mount(ReportsPage)
    
    // Mock alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    const historyBtn = wrapper.findAll('button').find(b => b.text().includes('History'))
    await historyBtn!.trigger('click')

    expect(alertSpy).toHaveBeenCalledWith('Report history would show previously generated reports')
    
    alertSpy.mockRestore()
  })

  it('generates different report types correctly', async () => {
    const wrapper = mount(ReportsPage)
    
    const reportTypes = [
      { name: 'Inventory Movement', expectedText: 'Inventory Movement Report' },
      { name: 'Supplier Performance', expectedText: 'Supplier Performance Report' },
      { name: 'Product Performance', expectedText: 'Product Performance Report' }
    ]

    for (const reportType of reportTypes) {
      const buttons = wrapper.findAll('button')
      const typeBtn = buttons.find(b => b.text().includes(reportType.name))
      await typeBtn!.trigger('click')
      await flush()

      const generateBtn = wrapper.findAll('button').find(b => b.text() === 'Generate Report')
      await generateBtn!.trigger('click')
      await new Promise((r) => setTimeout(r, 900))

      expect(wrapper.text()).toContain(reportType.expectedText)
    }
  })

  it('formats metric names correctly', async () => {
    const wrapper = mount(ReportsPage)
    
    const buttons = wrapper.findAll('button')
    const inventoryBtn = buttons.find(b => b.text().includes('Inventory Summary'))
    await inventoryBtn!.trigger('click')
    await flush()

    const generateBtn = wrapper.findAll('button').find(b => b.text() === 'Generate Report')
    await generateBtn!.trigger('click')
    await new Promise((r) => setTimeout(r, 900))

    // Check camelCase is converted to readable format
    expect(wrapper.text()).toContain('Total Products')
    expect(wrapper.text()).toContain('Total Quantity')
    expect(wrapper.text()).toContain('Average Value Per Item')
  })

  it('disables generate button while loading', async () => {
    const wrapper = mount(ReportsPage)
    
    const buttons = wrapper.findAll('button')
    const inventoryBtn = buttons.find(b => b.text().includes('Inventory Summary'))
    await inventoryBtn!.trigger('click')
    await flush()

    const generateBtn = wrapper.findAll('button').find(b => b.text() === 'Generate Report')
    await generateBtn!.trigger('click')
    await flush()

    // Button should be disabled during loading
    expect(generateBtn!.attributes('disabled')).toBeDefined()
  })

  it('clears previous report data when selecting new report type', async () => {
    const wrapper = mount(ReportsPage)
    
    // Generate first report
    let buttons = wrapper.findAll('button')
    const inventoryBtn = buttons.find(b => b.text().includes('Inventory Summary'))
    await inventoryBtn!.trigger('click')
    await flush()

    let generateBtn = wrapper.findAll('button').find(b => b.text() === 'Generate Report')
    await generateBtn!.trigger('click')
    await new Promise((r) => setTimeout(r, 900))

    expect(wrapper.text()).toContain('Inventory Summary Report')

    // Select different report type
    buttons = wrapper.findAll('button')
    const salesBtn = buttons.find(b => b.text().includes('Sales Report'))
    await salesBtn!.trigger('click')
    await flush()

    // Previous report should be cleared
    expect(wrapper.text()).not.toContain('Inventory Summary Report')
  })
})

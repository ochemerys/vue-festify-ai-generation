import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsTabs from './SettingsTabs.vue'

describe('SettingsTabs', () => {
  const mockTabs = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
    { id: 'tab3', label: 'Tab 3' }
  ]

  it('renders all tabs', () => {
    const wrapper = mount(SettingsTabs, {
      props: {
        tabs: mockTabs,
        activeTab: 'tab1'
      }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(3)
    expect(buttons[0].text()).toBe('Tab 1')
    expect(buttons[1].text()).toBe('Tab 2')
    expect(buttons[2].text()).toBe('Tab 3')
  })

  it('highlights active tab', () => {
    const wrapper = mount(SettingsTabs, {
      props: {
        tabs: mockTabs,
        activeTab: 'tab2'
      }
    })

    const buttons = wrapper.findAll('button')
    
    // Active tab should have blue color classes
    expect(buttons[1].classes()).toContain('border-blue-500')
    expect(buttons[1].classes()).toContain('text-blue-600')
    
    // Inactive tabs should have transparent border
    expect(buttons[0].classes()).toContain('border-transparent')
    expect(buttons[2].classes()).toContain('border-transparent')
  })

  it('sets aria-current on active tab', () => {
    const wrapper = mount(SettingsTabs, {
      props: {
        tabs: mockTabs,
        activeTab: 'tab1'
      }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('aria-current')).toBe('page')
    expect(buttons[1].attributes('aria-current')).toBeUndefined()
    expect(buttons[2].attributes('aria-current')).toBeUndefined()
  })

  it('emits update:activeTab when tab is clicked', async () => {
    const wrapper = mount(SettingsTabs, {
      props: {
        tabs: mockTabs,
        activeTab: 'tab1'
      }
    })

    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')

    expect(wrapper.emitted('update:activeTab')).toBeTruthy()
    expect(wrapper.emitted('update:activeTab')?.[0]).toEqual(['tab2'])
  })

  it('renders with proper accessibility attributes', () => {
    const wrapper = mount(SettingsTabs, {
      props: {
        tabs: mockTabs,
        activeTab: 'tab1'
      }
    })

    const nav = wrapper.find('nav')
    expect(nav.attributes('aria-label')).toBe('Settings tabs')
  })

  it('handles empty tabs array', () => {
    const wrapper = mount(SettingsTabs, {
      props: {
        tabs: [],
        activeTab: ''
      }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(0)
  })
})

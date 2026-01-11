import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsSection from './SettingsSection.vue'

describe('SettingsSection', () => {
  it('renders title correctly', () => {
    const wrapper = mount(SettingsSection, {
      props: {
        title: 'Test Section'
      }
    })

    expect(wrapper.find('h3').text()).toBe('Test Section')
  })

  it('renders description when provided', () => {
    const wrapper = mount(SettingsSection, {
      props: {
        title: 'Test Section',
        description: 'This is a test description'
      }
    })

    expect(wrapper.text()).toContain('This is a test description')
  })

  it('does not render description when not provided', () => {
    const wrapper = mount(SettingsSection, {
      props: {
        title: 'Test Section'
      }
    })

    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBe(0)
  })

  it('renders slot content', () => {
    const wrapper = mount(SettingsSection, {
      props: {
        title: 'Test Section'
      },
      slots: {
        default: '<div class="test-content">Slot Content</div>'
      }
    })

    expect(wrapper.find('.test-content').text()).toBe('Slot Content')
  })

  it('applies correct CSS classes', () => {
    const wrapper = mount(SettingsSection, {
      props: {
        title: 'Test Section'
      }
    })

    expect(wrapper.find('.settings-section').exists()).toBe(true)
    expect(wrapper.find('.settings-content').exists()).toBe(true)
  })
})

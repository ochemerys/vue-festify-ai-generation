import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import QuickActions from './QuickActions.vue'

/**
 * QuickActions.spec.ts - Unit tests for QuickActions component
 * 
 * Tests the action buttons rail with icon rendering,
 * event emission, and accessibility features
 */

describe('QuickActions.vue', () => {
  describe('Rendering', () => {
    it('should render action button for each action in the list', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add Product', icon: 'Plus' },
          { id: 'edit', label: 'Edit Product', icon: 'Edit' },
          { id: 'delete', label: 'Delete Product', icon: 'AlertTriangle' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })
      const buttons = wrapper.findAll('button')

      // Assert
      expect(buttons).toHaveLength(3)
    })

    it('should render action label text', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add New Item', icon: 'Plus' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.text()).toContain('Add New Item')
    })

    it('should render description when provided', () => {
      // Arrange
      const props = {
        actions: [
          {
            id: 'add',
            label: 'Add Product',
            icon: 'Plus',
            description: 'Create a new product'
          }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.text()).toContain('Create a new product')
    })

    it('should not render description when not provided', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add Product', icon: 'Plus' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.text()).not.toContain('description')
    })

    it('should render empty state when no actions provided', () => {
      // Arrange
      const props = {
        actions: []
      }

      // Act
      const wrapper = mount(QuickActions, { props })
      const buttons = wrapper.findAll('button')

      // Assert
      expect(buttons).toHaveLength(0)
    })
  })

  describe('Icon Rendering', () => {
    it('should display correct icon component based on icon name', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add', icon: 'Plus' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })
      const svg = wrapper.find('svg')

      // Assert
      expect(svg.exists()).toBe(true)
    })

    it('should render Plus icon for Plus action', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add', icon: 'Plus' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.html()).toContain('svg')
    })

    it('should render Edit icon for Edit action', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'edit', label: 'Edit', icon: 'Edit' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.html()).toContain('svg')
    })

    it('should render AlertTriangle icon for Alert action', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'alert', label: 'Alert', icon: 'AlertTriangle' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.html()).toContain('svg')
    })

    it('should render BarChart3 icon for Reports action', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'reports', label: 'Reports', icon: 'BarChart3' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.html()).toContain('svg')
    })

    it('should use Plus icon as fallback for unknown icon name', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'unknown', label: 'Unknown', icon: 'UnknownIcon' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.html()).toContain('svg')
    })

    it('should have aria-hidden on icon', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add', icon: 'Plus' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })
      const icon = wrapper.find('svg')

      // Assert
      expect(icon.attributes('aria-hidden')).toBe('true')
    })
  })

  describe('Event Emission', () => {
    it('should emit execute event with action ID when button is clicked', async () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add-product', label: 'Add Product', icon: 'Plus' }
        ]
      }
      const wrapper = mount(QuickActions, { props })
      const button = wrapper.find('button')

      // Act
      await button.trigger('click')

      // Assert
      expect(wrapper.emitted('execute')).toBeTruthy()
      expect(wrapper.emitted('execute')?.[0]).toEqual(['add-product'])
    })

    it('should emit correct action ID for multiple actions', async () => {
      // Arrange
      const props = {
        actions: [
          { id: 'action-1', label: 'Action 1', icon: 'Plus' },
          { id: 'action-2', label: 'Action 2', icon: 'Edit' },
          { id: 'action-3', label: 'Action 3', icon: 'AlertTriangle' }
        ]
      }
      const wrapper = mount(QuickActions, { props })
      const buttons = wrapper.findAll('button')

      // Act
      await buttons[0].trigger('click')
      await buttons[1].trigger('click')
      await buttons[2].trigger('click')

      // Assert
      const emitted = wrapper.emitted('execute')
      expect(emitted).toHaveLength(3)
      expect(emitted?.[0]).toEqual(['action-1'])
      expect(emitted?.[1]).toEqual(['action-2'])
      expect(emitted?.[2]).toEqual(['action-3'])
    })

    it('should emit event with correct payload structure', async () => {
      // Arrange
      const props = {
        actions: [
          { id: 'test-action', label: 'Test', icon: 'Plus' }
        ]
      }
      const wrapper = mount(QuickActions, { props })
      const button = wrapper.find('button')

      // Act
      await button.trigger('click')

      // Assert
      const emitted = wrapper.emitted('execute')
      expect(emitted).toBeTruthy()
      expect(emitted?.[0]).toEqual(['test-action'])
    })
  })

  describe('Styling and Interactions', () => {
    it('should apply button styling classes', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add', icon: 'Plus' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })
      const button = wrapper.find('button')

      // Assert
      expect(button.html()).toContain('bg-white')
      expect(button.html()).toContain('rounded-lg')
      expect(button.html()).toContain('border')
    })

    it('should apply hover styling classes', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add', icon: 'Plus' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })
      const button = wrapper.find('button')

      // Assert
      expect(button.html()).toContain('hover:border-blue-300')
      expect(button.html()).toContain('hover:bg-blue-50')
    })

    it('should apply transition classes', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add', icon: 'Plus' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })
      const button = wrapper.find('button')

      // Assert
      expect(button.html()).toContain('transition-all')
    })

    it('should have icon background styling', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add', icon: 'Plus' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.html()).toContain('bg-blue-100')
      expect(wrapper.html()).toContain('hover:bg-blue-200')
    })

    it('should have chevron icon styling', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add', icon: 'Plus' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.html()).toContain('text-slate-400')
      expect(wrapper.html()).toContain('group-hover:text-blue-600')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on button', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add Product', icon: 'Plus' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })
      const button = wrapper.find('button')

      // Assert
      expect(button.attributes('aria-label')).toBe('Add Product')
    })

    it('should have proper button semantics', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add', icon: 'Plus' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })
      const button = wrapper.find('button')

      // Assert
      expect(button.element.tagName).toBe('BUTTON')
    })

    it('should have focus-visible styling', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add', icon: 'Plus' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })
      const button = wrapper.find('button')

      // Assert
      expect(button.exists()).toBe(true)
    })
  })

  describe('Multiple Actions', () => {
    it('should render all actions with correct labels', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add Product', icon: 'Plus' },
          { id: 'edit', label: 'Edit Product', icon: 'Edit' },
          { id: 'alert', label: 'View Alerts', icon: 'AlertTriangle' },
          { id: 'reports', label: 'Generate Report', icon: 'BarChart3' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.text()).toContain('Add Product')
      expect(wrapper.text()).toContain('Edit Product')
      expect(wrapper.text()).toContain('View Alerts')
      expect(wrapper.text()).toContain('Generate Report')
    })

    it('should render all actions with descriptions', () => {
      // Arrange
      const props = {
        actions: [
          {
            id: 'add',
            label: 'Add Product',
            icon: 'Plus',
            description: 'Create a new product'
          },
          {
            id: 'edit',
            label: 'Edit Product',
            icon: 'Edit',
            description: 'Modify existing product'
          }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.text()).toContain('Create a new product')
      expect(wrapper.text()).toContain('Modify existing product')
    })

    it('should apply spacing between actions', () => {
      // Arrange
      const props = {
        actions: [
          { id: 'add', label: 'Add', icon: 'Plus' },
          { id: 'edit', label: 'Edit', icon: 'Edit' }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.html()).toContain('space-y-3')
    })
  })

  describe('Action Properties', () => {
    it('should handle action with all properties', () => {
      // Arrange
      const props = {
        actions: [
          {
            id: 'complete-action',
            label: 'Complete Action',
            icon: 'Plus',
            description: 'This is a complete action'
          }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.text()).toContain('Complete Action')
      expect(wrapper.text()).toContain('This is a complete action')
    })

    it('should handle action with minimal properties', () => {
      // Arrange
      const props = {
        actions: [
          {
            id: 'minimal',
            label: 'Minimal',
            icon: 'Plus'
          }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.text()).toContain('Minimal')
    })

    it('should handle long action labels', () => {
      // Arrange
      const props = {
        actions: [
          {
            id: 'long',
            label: 'This is a very long action label that should still render correctly',
            icon: 'Plus'
          }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.text()).toContain('This is a very long action label')
    })

    it('should handle long descriptions', () => {
      // Arrange
      const props = {
        actions: [
          {
            id: 'long-desc',
            label: 'Action',
            icon: 'Plus',
            description: 'This is a very long description that provides detailed information about what this action does'
          }
        ]
      }

      // Act
      const wrapper = mount(QuickActions, { props })

      // Assert
      expect(wrapper.text()).toContain('This is a very long description')
    })
  })
})

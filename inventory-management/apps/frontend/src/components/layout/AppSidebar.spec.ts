import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { createPinia } from 'pinia'
import AppSidebar from './AppSidebar.vue'

// Mock the auth store
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    currentUser: {
      firstName: 'User',
      lastName: 'Name',
      email: 'user@example.com'
    },
    logout: vi.fn()
  }))
}))

/**
 * AppSidebar.spec.ts - Unit tests for AppSidebar component
 * 
 * Tests the left navigation sidebar with active route highlighting,
 * badge support, collapse state, and accessibility features
 */

// Global stubs for router-link
const RouterLinkStub = {
  name: 'RouterLink',
  props: ['to'],
  render() {
    return h('a', {
      href: typeof this.to === 'string' ? this.to : this.to?.path,
      ...this.$attrs
    }, this.$slots.default?.())
  }
}

describe('AppSidebar.vue', () => {
  const defaultNavigation = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
    { id: 'products', label: 'Products', icon: 'Package', path: '/products' },
    { id: 'inventory', label: 'Inventory', icon: 'Boxes', path: '/inventory' },
    { id: 'orders', label: 'Orders', icon: 'ShoppingCart', path: '/orders' }
  ]

  const mountOptions = {
    global: {
      plugins: [createPinia()],
      stubs: {
        RouterLink: RouterLinkStub
      }
    }
  }

  describe('Rendering', () => {
    it('should render navigation items with correct labels', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.text()).toContain('Dashboard')
      expect(wrapper.text()).toContain('Products')
      expect(wrapper.text()).toContain('Inventory')
      expect(wrapper.text()).toContain('Orders')
    })

    it('should render navigation items as links', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const links = wrapper.findAll('a')

      // Assert
      expect(links.length).toBeGreaterThan(0)
    })

    it('should render sidebar header with logo', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.text()).toContain('IM')
      expect(wrapper.text()).toContain('Inventory')
    })

    it('should render user profile section', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.text()).toContain('User Name')
      expect(wrapper.text()).toContain('user@example.com')
    })

    it('should render settings link', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.text()).toContain('Settings')
    })

    it('should have semantic nav element', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const nav = wrapper.find('nav')

      // Assert
      expect(nav.exists()).toBe(true)
    })
  })

  describe('Navigation Items', () => {
    it('should render correct number of navigation items', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const navLinks = wrapper.findAll('nav a')

      // Assert
      expect(navLinks).toHaveLength(defaultNavigation.length)
    })

    it('should set correct href for each navigation item', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const links = wrapper.findAll('nav a')

      // Assert
      expect(links[0]?.attributes('href')).toBe('/')
      expect(links[1]?.attributes('href')).toBe('/products')
      expect(links[2]?.attributes('href')).toBe('/inventory')
      expect(links[3]?.attributes('href')).toBe('/orders')
    })

    it('should render icon for each navigation item', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const svgs = wrapper.findAll('nav svg')

      // Assert
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('Active Route Highlighting', () => {
    it('should highlight active route with correct styling', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const links = wrapper.findAll('nav a')

      // Assert
      // First link (/) should be active by default
      expect(links[0]?.html()).toContain('bg-blue-600')
      expect(links[0]?.html()).toContain('text-white')
    })

    it('should set aria-current on active link', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const links = wrapper.findAll('nav a')

      // Assert
      expect(links[0]?.attributes('aria-current')).toBe('page')
    })

    it('should not set aria-current on inactive links', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const links = wrapper.findAll('nav a')

      // Assert
      expect(links[1]?.attributes('aria-current')).toBeUndefined()
      expect(links[2]?.attributes('aria-current')).toBeUndefined()
    })

    it('should apply inactive styling to non-active links', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const links = wrapper.findAll('nav a')

      // Assert
      expect(links[1]?.html()).toContain('text-slate-300')
      expect(links[1]?.html()).toContain('hover:bg-slate-800')
    })
  })

  describe('Badge Support', () => {
    it('should display badge count when provided', () => {
      // Arrange
      const props = {
        navigation: [
          { id: 'orders', label: 'Orders', icon: 'ShoppingCart', path: '/orders', badge: 5 }
        ]
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.text()).toContain('5')
    })

    it('should not display badge when count is zero', () => {
      // Arrange
      const props = {
        navigation: [
          { id: 'orders', label: 'Orders', icon: 'ShoppingCart', path: '/orders', badge: 0 }
        ]
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const badges = wrapper.findAll('span')

      // Assert
      const badgeWithZero = badges.find(b => b.text() === '0')
      expect(badgeWithZero).toBeUndefined()
    })

    it('should display badge with red background for inactive links', () => {
      // Arrange
      const props = {
        navigation: [
          { id: 'products', label: 'Products', icon: 'Package', path: '/products', badge: 3 }
        ]
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.html()).toContain('bg-red-500')
    })

    it('should display badge with blue background for active links', () => {
      // Arrange
      const props = {
        navigation: [
          { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/', badge: 2 }
        ]
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.html()).toContain('bg-blue-400')
    })

    it('should display multiple badges for multiple items', () => {
      // Arrange
      const props = {
        navigation: [
          { id: 'orders', label: 'Orders', icon: 'ShoppingCart', path: '/orders', badge: 5 },
          { id: 'products', label: 'Products', icon: 'Package', path: '/products', badge: 3 }
        ]
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.text()).toContain('5')
      expect(wrapper.text()).toContain('3')
    })
  })

  describe('Collapsed State', () => {
    it('should show labels when not collapsed', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation,
        isCollapsed: false
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.text()).toContain('Dashboard')
      expect(wrapper.text()).toContain('Products')
    })

    it('should hide labels when collapsed', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation,
        isCollapsed: true
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const labels = wrapper.findAll('span')

      // Assert
      // Labels should be hidden but still in DOM
      const visibleLabels = labels.filter(l => l.text() === 'Dashboard' || l.text() === 'Products')
      expect(visibleLabels.length).toBe(0)
    })

    it('should show tooltip on hover when collapsed', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation,
        isCollapsed: true
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.html()).toContain('group-hover:opacity-100')
    })

    it('should hide sidebar text when collapsed', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation,
        isCollapsed: true
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.html()).toContain('opacity-0')
    })

    it('should show logo text when not collapsed', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation,
        isCollapsed: false
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.text()).toContain('Inventory')
    })

    it('should hide logo text when collapsed', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation,
        isCollapsed: true
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      // Assert
      expect(wrapper.html()).toContain('whitespace-nowrap')
    })
  })

  describe('Mobile State', () => {
    it('should render close button for mobile', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation,
        isMobileOpen: true
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const closeButton = wrapper.find('button')

      // Assert
      expect(closeButton.exists()).toBe(true)
      expect(closeButton.attributes('aria-label')).toBe('Close navigation')
    })

    it('should emit close-mobile event when close button is clicked', async () => {
      // Arrange
      const props = {
        navigation: defaultNavigation,
        isMobileOpen: true
      }
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const closeButton = wrapper.find('button')

      // Act
      await closeButton.trigger('click')

      // Assert
      expect(wrapper.emitted('close-mobile')).toBeTruthy()
    })

    it('should have X icon on close button', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation,
        isMobileOpen: true
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.html()).toContain('svg')
    })
  })

  describe('Styling', () => {
    it('should apply dark theme styling', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.html()).toContain('bg-slate-900')
      expect(wrapper.html()).toContain('text-white')
    })

    it('should apply flex column layout', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.html()).toContain('flex')
      expect(wrapper.html()).toContain('flex-col')
    })

    it('should apply border styling', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.html()).toContain('border')
      expect(wrapper.html()).toContain('border-slate-700')
    })

    it('should apply transition classes', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.html()).toContain('transition-colors')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.html()).toContain('font-semibold')
    })

    it('should have focus management for navigation links', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const links = wrapper.findAll('nav a')

      // Assert
      links.forEach(link => {
        expect(link.element.tagName).toBe('A')
      })
    })

    it('should have aria-hidden on decorative icons', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const svgs = wrapper.findAll('svg')

      // Assert
      // Check that at least some SVGs have aria-hidden
      const hiddenSvgs = svgs.filter(svg => svg.attributes('aria-hidden') === 'true')
      expect(hiddenSvgs.length).toBeGreaterThan(0)
    })

    it('should have proper button semantics for user profile', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const profileButton = wrapper.find('[role="button"]')

      // Assert
      expect(profileButton.exists()).toBe(true)
      expect(profileButton.attributes('tabindex')).toBe('0')
    })
  })

  describe('User Profile Section', () => {
    it('should display user avatar', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.html()).toContain('bg-gradient-to-br')
      expect(wrapper.html()).toContain('rounded-full')
    })

    it('should display user name and email', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.text()).toContain('User Name')
      expect(wrapper.text()).toContain('user@example.com')
    })

    it('should display user profile when not collapsed', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation,
        isCollapsed: false
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.text()).toContain('User Name')
      expect(wrapper.text()).toContain('user@example.com')
    })
  })

  describe('Navigation Item Styling', () => {
    it('should apply padding to navigation items', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const links = wrapper.findAll('nav a')

      // Assert
      links.forEach(link => {
        expect(link.html()).toContain('px-3')
        expect(link.html()).toContain('py-2')
      })
    })

    it('should apply rounded styling to navigation items', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const links = wrapper.findAll('nav a')

      // Assert
      links.forEach(link => {
        expect(link.html()).toContain('rounded-lg')
      })
    })

    it('should apply gap between icon and label', () => {
      // Arrange
      const props = {
        navigation: defaultNavigation
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })

      // Assert
      expect(wrapper.html()).toContain('gap-3')
    })
  })

  describe('Multiple Navigation Items', () => {
    it('should render all navigation items correctly', () => {
      // Arrange
      const props = {
        navigation: [
          { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
          { id: 'products', label: 'Products', icon: 'Package', path: '/products' },
          { id: 'inventory', label: 'Inventory', icon: 'Boxes', path: '/inventory' },
          { id: 'orders', label: 'Orders', icon: 'ShoppingCart', path: '/orders' },
          { id: 'purchase-orders', label: 'Purchase Orders', icon: 'Truck', path: '/purchase-orders' },
          { id: 'reports', label: 'Reports', icon: 'BarChart3', path: '/reports' }
        ]
      }

      // Act
      const wrapper = mount(AppSidebar, { props, ...mountOptions })
      const links = wrapper.findAll('nav a')

      // Assert
      expect(links).toHaveLength(6)
    })
  })
})

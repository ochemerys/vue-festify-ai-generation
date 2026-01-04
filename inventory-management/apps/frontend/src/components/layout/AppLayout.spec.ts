import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import AppLayout from './AppLayout.vue'
import AppHeader from '../AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

/**
 * AppLayout.spec.ts - Unit tests for AppLayout component
 * 
 * Tests the main application shell with responsive layout,
 * mobile sidebar management, and breakpoint handling
 */

// RouterLink stub
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

const mountOptions = {
  global: {
    stubs: {
      RouterLink: RouterLinkStub
    }
  }
}

describe('AppLayout.vue', () => {
  beforeEach(() => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render header component', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act & Assert
      expect(wrapper.findComponent(AppHeader).exists()).toBe(true)
    })

    it('should render sidebar component', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act & Assert
      expect(wrapper.findComponent(AppSidebar).exists()).toBe(true)
    })

    it('should render main content slot', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div class="test-content">Test Content</div>'
        }
      })

      // Act & Assert
      expect(wrapper.text()).toContain('Test Content')
    })

    it('should have semantic structure with header, aside, and main', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act & Assert
      expect(wrapper.find('header').exists()).toBe(true)
      expect(wrapper.find('aside').exists()).toBe(true)
      expect(wrapper.find('main').exists()).toBe(true)
    })

    it('should have navigation aria-label on aside', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act & Assert
      expect(wrapper.find('aside').attributes('aria-label')).toBe('Main navigation')
    })

    it('should have navigation role on aside', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act & Assert
      expect(wrapper.find('aside').attributes('role')).toBe('navigation')
    })
  })

  describe('Desktop Breakpoint (>1280px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1400
      })
    })

    it('should apply desktop layout classes to main content', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const main = wrapper.find('main')
      expect(main.html()).toContain('ml-60')
    })

    it('should show full sidebar width on desktop', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const aside = wrapper.find('aside')
      expect(aside.html()).toContain('w-60')
    })

    it('should not show mobile overlay on desktop', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const overlay = wrapper.find('[role="presentation"]')
      expect(overlay.html()).toContain('hidden')
    })
  })

  describe('Laptop Breakpoint (1024-1280px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1100
      })
    })

    it('should apply laptop layout classes to main content', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const main = wrapper.find('main')
      expect(main.html()).toContain('ml-60')
    })

    it('should show full sidebar on laptop', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const aside = wrapper.find('aside')
      expect(aside.html()).toContain('w-60')
    })
  })

  describe('Tablet Breakpoint (768-1024px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 900
      })
    })

    it('should apply tablet layout classes to main content', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const main = wrapper.find('main')
      expect(main.html()).toContain('ml-20')
    })

    it('should show collapsed sidebar on tablet', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const aside = wrapper.find('aside')
      expect(aside.html()).toContain('w-20')
    })
  })

  describe('Mobile Breakpoint (<768px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      })
    })

    it('should apply mobile layout classes to main content', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const main = wrapper.find('main')
      expect(main.html()).toContain('ml-0')
    })

    it('should hide sidebar by default on mobile', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const aside = wrapper.find('aside')
      expect(aside.html()).toContain('-translate-x-full')
    })

    it('should show sidebar when mobile menu is opened', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()
      // Simulate opening mobile sidebar
      await wrapper.vm.toggleMobileSidebar()
      await wrapper.vm.$nextTick()

      // Assert
      const aside = wrapper.find('aside')
      expect(aside.html()).toContain('translate-x-0')
    })

    it('should show mobile overlay when sidebar is open', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()
      await wrapper.vm.toggleMobileSidebar()
      await wrapper.vm.$nextTick()

      // Assert
      const overlay = wrapper.find('[role="presentation"]')
      expect(overlay.html()).toContain('opacity-100')
      expect(overlay.html()).toContain('pointer-events-auto')
    })

    it('should hide mobile overlay when sidebar is closed', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()

      // Assert
      const overlay = wrapper.find('[role="presentation"]')
      expect(overlay.html()).toContain('opacity-0')
      expect(overlay.html()).toContain('pointer-events-none')
    })
  })

  describe('Mobile Sidebar Toggle', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      })
    })

    it('should toggle mobile sidebar when hamburger is clicked', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()
      const initialState = wrapper.vm.isMobileSidebarOpen
      await wrapper.vm.toggleMobileSidebar()
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.isMobileSidebarOpen).toBe(!initialState)
    })

    it('should close mobile sidebar when overlay is clicked', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()
      await wrapper.vm.toggleMobileSidebar()
      await wrapper.vm.$nextTick()
      const overlay = wrapper.find('[role="presentation"]')
      await overlay.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.isMobileSidebarOpen).toBe(false)
    })

    it('should close mobile sidebar when close-mobile event is emitted', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()
      await wrapper.vm.toggleMobileSidebar()
      await wrapper.vm.$nextTick()
      await wrapper.vm.closeMobileSidebar()
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.isMobileSidebarOpen).toBe(false)
    })
  })

  describe('Window Resize Handling', () => {
    it('should update breakpoint on window resize', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      })
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.currentBreakpoint).toBe('mobile')
    })

    it('should close mobile sidebar when resizing to larger breakpoint', async () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      })
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()
      await wrapper.vm.toggleMobileSidebar()
      await wrapper.vm.$nextTick()

      // Resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1400
      })
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.isMobileSidebarOpen).toBe(false)
    })

    it('should add resize listener on mount', () => {
      // Arrange
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      // Act
      mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Assert
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('should remove resize listener on unmount', () => {
      // Arrange
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      // Act
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })
      wrapper.unmount()

      // Assert
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

  describe('Header Integration', () => {
    it('should pass notification count to header', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const header = wrapper.findComponent(AppHeader)

      // Assert
      expect(header.props('notificationCount')).toBe(3)
    })

    it('should handle toggle-sidebar event from header', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const header = wrapper.findComponent(AppHeader)
      await header.vm.$emit('toggle-sidebar')
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.isMobileSidebarOpen).toBe(true)
    })
  })

  describe('Sidebar Integration', () => {
    it('should pass navigation items to sidebar', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const sidebar = wrapper.findComponent(AppSidebar)

      // Assert
      expect(sidebar.props('navigation')).toBeDefined()
      expect(sidebar.props('navigation').length).toBeGreaterThan(0)
    })

    it('should pass isCollapsed prop to sidebar', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const sidebar = wrapper.findComponent(AppSidebar)

      // Assert
      expect(sidebar.props('isCollapsed')).toBeDefined()
    })

    it('should pass isMobileOpen prop to sidebar', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const sidebar = wrapper.findComponent(AppSidebar)

      // Assert
      expect(sidebar.props('isMobileOpen')).toBeDefined()
    })

    it('should handle update:isCollapsed event from sidebar', async () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const sidebar = wrapper.findComponent(AppSidebar)
      await sidebar.vm.$emit('update:isCollapsed', true)
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.sidebarCollapsed).toBe(true)
    })

    it('should handle close-mobile event from sidebar', async () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      })
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      await wrapper.vm.$nextTick()
      await wrapper.vm.toggleMobileSidebar()
      await wrapper.vm.$nextTick()
      const sidebar = wrapper.findComponent(AppSidebar)
      await sidebar.vm.$emit('close-mobile')
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.isMobileSidebarOpen).toBe(false)
    })
  })

  describe('Layout Structure', () => {
    it('should have fixed header at top', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const header = wrapper.find('header')

      // Assert
      expect(header.html()).toContain('fixed')
      expect(header.html()).toContain('top-0')
      expect(header.html()).toContain('h-16')
    })

    it('should have fixed sidebar', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const aside = wrapper.find('aside')

      // Assert
      expect(aside.html()).toContain('fixed')
      expect(aside.html()).toContain('left-0')
      expect(aside.html()).toContain('top-0')
    })

    it('should have scrollable main content', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const main = wrapper.find('main')

      // Assert
      expect(main.html()).toContain('overflow-auto')
    })

    it('should apply padding-top to account for header', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const contentArea = wrapper.find('[class*="pt-16"]')

      // Assert
      expect(contentArea.exists()).toBe(true)
    })
  })

  describe('Navigation Items', () => {
    it('should have correct navigation items', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const sidebar = wrapper.findComponent(AppSidebar)
      const navItems = sidebar.props('navigation')

      // Assert
      expect(navItems).toContainEqual(expect.objectContaining({ label: 'Dashboard' }))
      expect(navItems).toContainEqual(expect.objectContaining({ label: 'Products' }))
      expect(navItems).toContainEqual(expect.objectContaining({ label: 'Orders' }))
    })

    it('should have correct paths for navigation items', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const sidebar = wrapper.findComponent(AppSidebar)
      const navItems = sidebar.props('navigation')

      // Assert
      expect(navItems[0]?.path).toBe('/')
      expect(navItems[1]?.path).toBe('/products')
      expect(navItems[2]?.path).toBe('/inventory')
    })
  })

  describe('Responsive Transitions', () => {
    it('should apply transition classes to main content', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const main = wrapper.find('main')

      // Assert
      expect(main.html()).toContain('transition-all')
      expect(main.html()).toContain('duration-300')
    })

    it('should apply transition classes to sidebar', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const aside = wrapper.find('aside')

      // Assert
      expect(aside.html()).toContain('transition-all')
      expect(aside.html()).toContain('duration-300')
    })

    it('should apply transition classes to overlay', () => {
      // Arrange
      const wrapper = mount(AppLayout, { ...mountOptions,
        slots: {
          default: '<div>Content</div>'
        }
      })

      // Act
      const overlay = wrapper.find('[role="presentation"]')

      // Assert
      expect(overlay.html()).toContain('transition-opacity')
      expect(overlay.html()).toContain('duration-300')
    })
  })
})

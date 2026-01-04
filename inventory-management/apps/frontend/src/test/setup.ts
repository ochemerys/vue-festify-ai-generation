// Test setup file
import { vi } from 'vitest'
import { h } from 'vue'

// Helper to create mock icon component
const createMockIcon = (name: string) => ({
  name,
  props: ['size', 'color', 'strokeWidth'],
  render() {
    return h('svg', {
      'data-icon': name,
      width: this.size || 24,
      height: this.size || 24
    })
  }
})

// Mock Lucide Vue icons
vi.mock('lucide-vue-next', () => ({
  Package: createMockIcon('Package'),
  Search: createMockIcon('Search'),
  Plus: createMockIcon('Plus'),
  Download: createMockIcon('Download'),
  Filter: createMockIcon('Filter'),
  ChevronUp: createMockIcon('ChevronUp'),
  ChevronDown: createMockIcon('ChevronDown'),
  Edit: createMockIcon('Edit'),
  Trash2: createMockIcon('Trash2'),
  ChevronLeft: createMockIcon('ChevronLeft'),
  ChevronRight: createMockIcon('ChevronRight'),
  AlertTriangle: createMockIcon('AlertTriangle'),
  LayoutDashboard: createMockIcon('LayoutDashboard'),
  Boxes: createMockIcon('Boxes'),
  ShoppingCart: createMockIcon('ShoppingCart'),
  Truck: createMockIcon('Truck'),
  BarChart3: createMockIcon('BarChart3'),
  X: createMockIcon('X'),
  Menu: createMockIcon('Menu'),
  Bell: createMockIcon('Bell'),
  User: createMockIcon('User'),
  TrendingUp: createMockIcon('TrendingUp'),
  TrendingDown: createMockIcon('TrendingDown'),
  Minus: createMockIcon('Minus'),
  CheckCircle: createMockIcon('CheckCircle'),
  XCircle: createMockIcon('XCircle'),
  History: createMockIcon('History')
}))

// Mock Vue Router
vi.mock('vue-router', () => ({
  createRouter: vi.fn(() => ({
    install: vi.fn()
  })),
  createWebHistory: vi.fn(),
  useRoute: vi.fn(() => ({
    path: '/'
  }))
}))
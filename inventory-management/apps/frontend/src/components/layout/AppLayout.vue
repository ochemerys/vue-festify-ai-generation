<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppHeader from '../AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

/**
 * AppLayout.vue - Main application shell
 * 
 * Manages responsive layout with:
 * - Desktop (>1280px): Fixed sidebar (240px) + main content + quick actions rail
 * - Laptop (1024-1280px): Fixed sidebar + main content (quick actions move to top)
 * - Tablet (768-1024px): Collapsed sidebar (80px icons only)
 * - Mobile (<768px): Hidden sidebar (drawer accessible via hamburger)
 * 
 * Accessibility:
 * - aria-expanded on hamburger button reflects mobile sidebar state
 * - Semantic HTML structure with proper heading hierarchy
 * - Focus management for mobile drawer
 */

interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
}

type Breakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop'

// Navigation items
const navigationItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { id: 'products', label: 'Products', icon: 'Package', path: '/products' },
  { id: 'inventory', label: 'Inventory', icon: 'Boxes', path: '/inventory' },
  { id: 'orders', label: 'Orders', icon: 'ShoppingCart', path: '/orders' },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: 'Truck', path: '/purchase-orders' },
  { id: 'reports', label: 'Reports', icon: 'BarChart3', path: '/reports' }
]

// Responsive state
const windowWidth = ref<number>(typeof window !== 'undefined' ? window.innerWidth : 1280)
const isMobileSidebarOpen = ref<boolean>(false)
const sidebarCollapsed = ref<boolean>(false)

// Computed breakpoint
const currentBreakpoint = computed<Breakpoint>(() => {
  if (windowWidth.value < 768) return 'mobile'
  if (windowWidth.value < 1024) return 'tablet'
  if (windowWidth.value < 1280) return 'laptop'
  return 'desktop'
})

// Computed layout classes
const mainContentClasses = computed(() => {
  const baseClasses = 'flex-1 flex flex-col overflow-hidden transition-all duration-300'
  
  switch (currentBreakpoint.value) {
    case 'mobile':
      return `${baseClasses} ml-0`
    case 'tablet':
      return `${baseClasses} ml-20`
    case 'laptop':
    case 'desktop':
      return `${baseClasses} ml-60`
    default:
      return baseClasses
  }
})

// Content wrapper classes for dynamic max-width
const contentWrapperClasses = computed(() => {
  const baseClasses = 'w-full mx-auto px-4 sm:px-6 py-6'
  
  switch (currentBreakpoint.value) {
    case 'mobile':
      return `${baseClasses} max-w-full`
    case 'tablet':
      return `${baseClasses} max-w-full`
    case 'laptop':
      return `${baseClasses} max-w-7xl` // 1280px
    case 'desktop':
      return `${baseClasses} max-w-full` // Full width with right rail
    default:
      return baseClasses
  }
})

const sidebarClasses = computed(() => {
  const baseClasses = 'fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-40'
  
  switch (currentBreakpoint.value) {
    case 'mobile':
      return `${baseClasses} w-60 transform ${isMobileSidebarOpen.value ? 'translate-x-0' : '-translate-x-full'}`
    case 'tablet':
      return `${baseClasses} w-20`
    case 'laptop':
    case 'desktop':
      return `${baseClasses} w-60`
    default:
      return baseClasses
  }
})

// Mobile overlay (for closing sidebar when clicking outside)
const mobileOverlayClasses = computed(() => {
  const baseClasses = 'fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300'
  
  if (currentBreakpoint.value !== 'mobile') {
    return `${baseClasses} hidden`
  }
  
  return `${baseClasses} ${isMobileSidebarOpen.value ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`
})

// Event handlers
const handleWindowResize = () => {
  windowWidth.value = window.innerWidth
  
  // Close mobile sidebar when resizing to larger breakpoint
  if (currentBreakpoint.value !== 'mobile' && isMobileSidebarOpen.value) {
    isMobileSidebarOpen.value = false
  }
}

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

const handleSidebarCollapse = (collapsed: boolean) => {
  sidebarCollapsed.value = collapsed
}

// Lifecycle
onMounted(() => {
  window.addEventListener('resize', handleWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
})

// Expose for tests
defineExpose({
  toggleMobileSidebar,
  closeMobileSidebar,
  isMobileSidebarOpen,
  currentBreakpoint,
  sidebarCollapsed
})
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-slate-50">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-20 shadow-sm">
      <AppHeader
        :notification-count="3"
        @toggle-sidebar="toggleMobileSidebar"
      />
    </header>

    <!-- Main content area -->
    <div class="flex flex-1 pt-16 overflow-hidden">
      <!-- Sidebar -->
      <aside
        :class="sidebarClasses"
        role="navigation"
        aria-label="Main navigation"
      >
        <AppSidebar
          :navigation="navigationItems"
          :is-collapsed="sidebarCollapsed"
          :is-mobile-open="isMobileSidebarOpen"
          @update:is-collapsed="handleSidebarCollapse"
          @close-mobile="closeMobileSidebar"
        />
      </aside>

      <!-- Mobile overlay -->
      <div
        :class="mobileOverlayClasses"
        role="presentation"
        @click="closeMobileSidebar"
      />

      <!-- Main content -->
      <main :class="mainContentClasses">
        <div class="flex flex-1 overflow-hidden">
          <!-- Page content area with dynamic width -->
          <div class="flex-1 overflow-auto">
            <div :class="contentWrapperClasses">
              <slot />
            </div>
          </div>

          <!-- Right rail for quick actions (desktop only) -->
          <aside
            v-if="currentBreakpoint === 'desktop' && $slots['right-rail']"
            class="w-64 border-l border-slate-200 bg-white overflow-y-auto flex-shrink-0"
            role="complementary"
            aria-label="Quick actions"
          >
            <div class="p-4">
              <slot name="right-rail" />
            </div>
          </aside>
        </div>

        <!-- Inline quick actions for laptop (below header, above content) -->
        <div
          v-if="currentBreakpoint === 'laptop' && $slots['inline-actions']"
          class="border-b border-slate-200 bg-white px-6 py-3"
        >
          <slot name="inline-actions" />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions for responsive layout changes */
:deep(.transition-all) {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>

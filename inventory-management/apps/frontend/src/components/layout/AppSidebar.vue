<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Truck,
  BarChart3,
  X
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()

/**
 * AppSidebar.vue - Left navigation sidebar
 *
 * Features:
 * - Responsive: Full width on desktop/laptop, icons-only on tablet, hidden on mobile
 * - Active route highlighting
 * - Badge support for notifications
 * - Smooth transitions
 *
 * Accessibility:
 * - Semantic nav element with aria-label
 * - Active link marked with aria-current="page"
 * - Close button for mobile with aria-label
 * - Keyboard navigation support
 */

interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
}

interface Props {
  navigation: NavItem[]
  isCollapsed?: boolean
  isMobileOpen?: boolean
}

interface Emits {
  (e: 'update:isCollapsed', value: boolean): void
  (e: 'close-mobile'): void
}

defineProps<Props>()
defineEmits<Emits>()

const route = useRoute()

// Icon component map
const iconMap: Record<string, any> = {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Truck,
  BarChart3
}

// Check if route is active
const isRouteActive = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

// Get icon component
const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || Package
}

// Get user initials
const userInitials = computed(() => {
  try {
    if (!authStore.currentUser) return 'U'
    const firstName = authStore.currentUser.firstName || ''
    const lastName = authStore.currentUser.lastName || ''
    if (!firstName && !lastName) return 'U'
    
    const first = firstName.charAt(0) || ''
    const second = lastName.charAt(0) || ''
    const initials = (first + second).toUpperCase()
    return initials || 'U'
  } catch (e) {
    return 'U'
  }
})
</script>

<template>
  <div class="h-full flex flex-col bg-slate-900 text-white">
    <!-- Sidebar header with logo -->
    <div class="h-16 flex items-center justify-between px-4 border-b border-slate-700">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">
          IM
        </div>
        <span
          v-if="!isCollapsed"
          class="font-semibold text-sm whitespace-nowrap"
        >
          Inventory
        </span>
      </div>
      <!-- Close button for mobile -->
      <button
        class="md:hidden p-1 hover:bg-slate-800 rounded transition-colors"
        aria-label="Close navigation"
        @click="$emit('close-mobile')"
      >
        <X :size="20" />
      </button>
    </div>

    <!-- Navigation items -->
    <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-1">
      <router-link
        v-for="item in navigation"
        :key="item.id"
        :to="item.path"
        :aria-current="isRouteActive(item.path) ? 'page' : undefined"
        class="group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200"
        :class="[
          isRouteActive(item.path)
            ? 'bg-blue-600 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        ]"
      >
        <!-- Icon -->
        <component
          :is="getIconComponent(item.icon)"
          :size="20"
          class="flex-shrink-0"
          :aria-hidden="true"
        />

        <!-- Label (hidden on tablet/mobile) -->
        <span
          v-if="!isCollapsed"
          class="text-sm font-medium whitespace-nowrap flex-1"
        >
          {{ item.label }}
        </span>

        <!-- Badge -->
        <span
          v-if="item.badge && item.badge > 0"
          class="ml-auto flex-shrink-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-0 rounded-full"
          :class="[
            isRouteActive(item.path)
              ? 'bg-blue-400'
              : 'bg-red-500'
          ]"
        >
          {{ item.badge }}
        </span>

        <!-- Tooltip for collapsed state -->
        <div
          v-if="isCollapsed"
          class="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
        >
          {{ item.label }}
        </div>
      </router-link>
    </nav>

    <!-- Sidebar footer -->
    <div class="border-t border-slate-700 p-4 space-y-2">
      <!-- User profile link -->
      <router-link
        to="/users/me"
        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        role="button"
        tabindex="0"
      >
        <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold">
          {{ userInitials }}
        </div>
        <div
          v-if="!isCollapsed"
          class="flex-1 min-w-0"
        >
          <p class="text-sm font-medium truncate">
            {{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}
          </p>
          <p class="text-xs text-slate-400 truncate">
            {{ authStore.currentUser?.email }}
          </p>
        </div>
      </router-link>

      <!-- Settings link -->
      <router-link
        to="/settings"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm"
      >
        <svg
          class="w-5 h-5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span
          v-if="!isCollapsed"
          class="text-sm"
        >Settings</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
/* Smooth scrolling for navigation */
nav {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.5) transparent;
}

nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.5);
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background-color: rgba(148, 163, 184, 0.7);
}
</style>

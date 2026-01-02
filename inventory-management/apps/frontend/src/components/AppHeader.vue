<script setup lang="ts">
import { ref, computed } from 'vue'
import { Menu, Bell, LogOut, User, Settings } from 'lucide-vue-next'

/**
 * AppHeader.vue - Top navigation bar
 * 
 * Features:
 * - Hamburger menu for mobile (triggers sidebar toggle)
 * - Notification bell with count badge
 * - User profile dropdown menu
 * - Responsive design
 * 
 * Accessibility:
 * - aria-expanded on dropdown buttons
 * - aria-label on icon buttons
 * - Semantic button elements
 * - Focus management for dropdown
 */

interface Props {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  notificationCount?: number
}

interface Emits {
  (e: 'toggle-sidebar'): void
  (e: 'logout'): void
  (e: 'navigate-to-profile'): void
}

defineProps<Props>()
defineEmits<Emits>()

// Dropdown state
const isUserMenuOpen = ref<boolean>(false)
const isNotificationMenuOpen = ref<boolean>(false)

// Mock notifications
const notifications = [
  { id: 1, message: 'Low stock alert: Product A', time: '5 minutes ago', read: false },
  { id: 2, message: 'Purchase order received', time: '1 hour ago', read: false },
  { id: 3, message: 'Order #123 fulfilled', time: '2 hours ago', read: true }
]

// Computed
const unreadCount = computed(() => {
  return notifications.filter(n => !n.read).length
})

// Methods
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
  isNotificationMenuOpen.value = false
}

const toggleNotificationMenu = () => {
  isNotificationMenuOpen.value = !isNotificationMenuOpen.value
  isUserMenuOpen.value = false
}

const closeMenus = () => {
  isUserMenuOpen.value = false
  isNotificationMenuOpen.value = false
}
</script>

<template>
  <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
    <!-- Left section: Hamburger + Logo -->
    <div class="flex items-center gap-4">
      <!-- Hamburger menu (mobile only) -->
      <button
        class="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Toggle navigation menu"
        aria-expanded="false"
        @click="$emit('toggle-sidebar')"
      >
        <Menu :size="24" class="text-slate-600" />
      </button>

      <!-- Logo/Title -->
      <h1 class="text-lg font-semibold text-slate-900 hidden sm:block">
        Inventory Management
      </h1>
    </div>

    <!-- Right section: Notifications + User menu -->
    <div class="flex items-center gap-2">
      <!-- Notifications button -->
      <div class="relative">
        <button
          class="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
          :aria-expanded="isNotificationMenuOpen"
          aria-label="Notifications"
          @click="toggleNotificationMenu"
        >
          <Bell :size="20" class="text-slate-600" />
          <!-- Badge -->
          <span
            v-if="unreadCount > 0"
            class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {{ unreadCount }}
          </span>
        </button>

        <!-- Notification dropdown -->
        <div
          v-if="isNotificationMenuOpen"
          class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50"
          role="menu"
          aria-label="Notifications menu"
        >
          <div class="p-4 border-b border-slate-200">
            <h3 class="text-sm font-semibold text-slate-900">Notifications</h3>
          </div>

          <div class="max-h-96 overflow-y-auto">
            <a
              v-for="notification in notifications"
              :key="notification.id"
              href="#"
              class="block px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
              :class="[!notification.read && 'bg-blue-50']"
              role="menuitem"
            >
              <div class="flex items-start gap-3">
                <div
                  v-if="!notification.read"
                  class="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-900">{{ notification.message }}</p>
                  <p class="text-xs text-slate-500 mt-1">{{ notification.time }}</p>
                </div>
              </div>
            </a>
          </div>

          <div class="p-3 border-t border-slate-200 text-center">
            <a
              href="#"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
              role="menuitem"
            >
              View all notifications
            </a>
          </div>
        </div>
      </div>

      <!-- User menu -->
      <div class="relative">
        <button
          class="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          :aria-expanded="isUserMenuOpen"
          aria-label="User menu"
          @click="toggleUserMenu"
        >
          <!-- Avatar -->
          <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {{ user?.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <!-- Name (hidden on mobile) -->
          <span class="hidden sm:inline text-sm font-medium text-slate-900">
            {{ user?.name || 'User' }}
          </span>
        </button>

        <!-- User dropdown menu -->
        <div
          v-if="isUserMenuOpen"
          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50"
          role="menu"
          aria-label="User menu"
        >
          <!-- User info -->
          <div class="px-4 py-3 border-b border-slate-200">
            <p class="text-sm font-semibold text-slate-900">{{ user?.name || 'User' }}</p>
            <p class="text-xs text-slate-500">{{ user?.email || 'user@example.com' }}</p>
          </div>

          <!-- Menu items -->
          <a
            href="#"
            class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            role="menuitem"
            @click.prevent="$emit('navigate-to-profile')"
          >
            <User :size="16" />
            Profile
          </a>

          <a
            href="#"
            class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-200"
            role="menuitem"
          >
            <Settings :size="16" />
            Settings
          </a>

          <button
            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            role="menuitem"
            @click="$emit('logout')"
          >
            <LogOut :size="16" />
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Click outside to close menus -->
    <div
      v-if="isUserMenuOpen || isNotificationMenuOpen"
      class="fixed inset-0 z-40"
      @click="closeMenus"
    />
  </header>
</template>

<style scoped>
/* Smooth transitions */
button {
  transition: background-color 0.2s ease;
}
</style>

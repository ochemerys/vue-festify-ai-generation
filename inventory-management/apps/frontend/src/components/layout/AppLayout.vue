<script setup lang="ts">
import { ref, provide, onMounted } from 'vue'

const SIDEBAR_COLLAPSE_KEY = 'ims.sidebarCollapsed'

const sidebarOpen = ref(false) // mobile drawer
const sidebarCollapsed = ref(false) // desktop collapse

function toggleSidebarOpen() {
  sidebarOpen.value = !sidebarOpen.value
}
function closeSidebar() {
  sidebarOpen.value = false
}
function toggleSidebarCollapsed() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  try {
    localStorage.setItem(SIDEBAR_COLLAPSE_KEY, JSON.stringify(sidebarCollapsed.value))
  } catch {}
}

onMounted(() => {
  try {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSE_KEY)
    if (saved != null) sidebarCollapsed.value = JSON.parse(saved)
  } catch {}
})

provide('layoutState', {
  sidebarOpen,
  sidebarCollapsed,
  toggleSidebarOpen,
  closeSidebar,
  toggleSidebarCollapsed,
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <!-- Header -->
    <header
      role="banner"
      aria-label="Application header"
      class="sticky top-0 z-30 bg-white border-b border-gray-200"
    >
      <div class="flex items-center gap-3 px-4 h-14">
        <!-- Mobile hamburger -->
        <button
          class="md:hidden p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Toggle navigation"
          @click="toggleSidebarOpen()"
        >
          <span class="i-heroicons-bars-3 w-6 h-6" aria-hidden="true"></span>
        </button>
        <!-- Brand -->
        <div class="flex items-center gap-2 font-semibold">
          <span class="i-heroicons-cube w-5 h-5 text-indigo-600" aria-hidden="true"></span>
          <span>Inventory Management System</span>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <button
            class="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="View notifications"
          >
            <span class="relative inline-flex">
              <span class="i-heroicons-bell w-6 h-6" aria-hidden="true"></span>
              <span
                class="absolute -top-1 -right-1 inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px]"
                aria-label="2 unread notifications"
              >2</span>
            </span>
          </button>
          <button
            class="p-1.5 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="User menu"
          >
            <span class="i-heroicons-user-circle w-8 h-8 text-gray-700" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside
        role="navigation"
        aria-label="Main navigation"
        class="fixed inset-y-0 left-0 z-20 w-64 md:static md:translate-x-0 md:block transition-transform duration-300 ease-out"
        :class="[
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
          sidebarCollapsed ? 'md:w-20' : 'md:w-64'
        ]"
      >
        <div class="h-full bg-white border-r border-gray-200 flex flex-col">
          <div class="hidden md:flex items-center justify-between h-12 px-3 border-b">
            <span class="text-sm font-medium text-gray-600">Navigation</span>
            <button
              class="p-1.5 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Collapse sidebar"
              @click="toggleSidebarCollapsed()"
            >
              <span class="i-heroicons-chevron-double-left w-5 h-5" :class="sidebarCollapsed ? 'rotate-180' : ''"></span>
            </button>
          </div>

          <nav class="flex-1 overflow-y-auto py-2">
            <ul class="px-2 space-y-1">
              <li>
                <a href="#" class="group flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100"
                  :class="'text-indigo-600 font-medium'">
                  <span class="i-heroicons-chart-bar w-5 h-5" aria-hidden="true"></span>
                  <span class="truncate" :class="sidebarCollapsed ? 'md:hidden' : ''">Dashboard</span>
                </a>
              </li>
              <li>
                <a href="#" class="group flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
                  <span class="i-heroicons-cube w-5 h-5" aria-hidden="true"></span>
                  <span class="truncate" :class="sidebarCollapsed ? 'md:hidden' : ''">Products</span>
                </a>
              </li>
              <li>
                <a href="#" class="group flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
                  <span class="i-heroicons-archive-box w-5 h-5" aria-hidden="true"></span>
                  <span class="truncate" :class="sidebarCollapsed ? 'md:hidden' : ''">Inventory</span>
                </a>
              </li>
              <li>
                <a href="#" class="group flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
                  <span class="i-heroicons-shopping-cart w-5 h-5" aria-hidden="true"></span>
                  <span class="truncate" :class="sidebarCollapsed ? 'md:hidden' : ''">Orders</span>
                </a>
              </li>
              <li>
                <a href="#" class="group flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
                  <span class="i-heroicons-inbox w-5 h-5" aria-hidden="true"></span>
                  <span class="truncate" :class="sidebarCollapsed ? 'md:hidden' : ''">Purchase Orders</span>
                </a>
              </li>
              <li>
                <a href="#" class="group flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
                  <span class="i-heroicons-chart-bar-square w-5 h-5" aria-hidden="true"></span>
                  <span class="truncate" :class="sidebarCollapsed ? 'md:hidden' : ''">Reports</span>
                </a>
              </li>
              <li>
                <a href="#" class="group flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
                  <span class="i-heroicons-cog-6-tooth w-5 h-5" aria-hidden="true"></span>
                  <span class="truncate" :class="sidebarCollapsed ? 'md:hidden' : ''">Settings</span>
                </a>
              </li>
            </ul>
          </nav>

          <div class="px-2 py-2 border-t">
            <button class="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
              <span class="i-heroicons-arrow-left-on-rectangle w-5 h-5 text-red-600" aria-hidden="true"></span>
              <span class="truncate" :class="sidebarCollapsed ? 'md:hidden' : ''">Logout</span>
            </button>
          </div>
        </div>

        <!-- Backdrop for mobile -->
        <button
          class="fixed inset-0 bg-black/40 md:hidden"
          v-if="sidebarOpen"
          aria-label="Close navigation"
          @click="closeSidebar()"
        />
      </aside>

      <!-- Main content -->
      <main role="main" aria-label="Dashboard content" class="flex-1 md:ml-0 w-full"
        :class="sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'"
      >
        <div class="p-4 md:p-6">
          <!-- Heading -->
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-xl font-semibold">Dashboard</h1>
            <button class="hidden md:inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-100">
              <span class="i-heroicons-arrow-path w-4 h-4"></span>
              Refresh
            </button>
          </div>

          <!-- Placeholder for metrics grid (no data wiring yet) -->
          <section aria-labelledby="metrics-heading" class="mb-6">
            <h2 id="metrics-heading" class="sr-only">Key Metrics</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="rounded-lg border bg-white p-4 h-28 flex flex-col justify-between">
                <div class="text-sm text-gray-500">Total Products</div>
                <div class="text-2xl font-semibold">—</div>
              </div>
              <div class="rounded-lg border bg-white p-4 h-28 flex flex-col justify-between">
                <div class="text-sm text-gray-500">Total Orders</div>
                <div class="text-2xl font-semibold">—</div>
              </div>
              <div class="rounded-lg border bg-white p-4 h-28 flex flex-col justify-between">
                <div class="text-sm text-gray-500">Pending Orders</div>
                <div class="text-2xl font-semibold">—</div>
              </div>
              <div class="rounded-lg border bg-white p-4 h-28 flex flex-col justify-between">
                <div class="text-sm text-gray-500">Low Stock Items</div>
                <div class="text-2xl font-semibold">—</div>
              </div>
              <div class="rounded-lg border bg-white p-4 h-28 flex flex-col justify-between">
                <div class="text-sm text-gray-500">Monthly Revenue</div>
                <div class="text-2xl font-semibold">—</div>
              </div>
              <div class="rounded-lg border bg-white p-4 h-28 flex flex-col justify-between">
                <div class="text-sm text-gray-500">Today's Orders</div>
                <div class="text-2xl font-semibold">—</div>
              </div>
              <div class="rounded-lg border bg-white p-4 h-28 flex flex-col justify-between">
                <div class="text-sm text-gray-500">Out of Stock</div>
                <div class="text-2xl font-semibold">—</div>
              </div>
              <div class="rounded-lg border bg-white p-4 h-28 flex flex-col justify-between">
                <div class="text-sm text-gray-500">Overdue Orders</div>
                <div class="text-2xl font-semibold">—</div>
              </div>
            </div>
          </section>

          <!-- Content sections layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Recent Orders Table placeholder -->
            <section aria-labelledby="orders-heading" class="lg:col-span-2">
              <div class="rounded-lg border bg-white">
                <div class="px-4 py-3 border-b">
                  <h2 id="orders-heading" class="font-medium">Recent Orders</h2>
                </div>
                <div class="p-4 overflow-x-auto">
                  <table class="min-w-full text-sm">
                    <thead class="text-left text-gray-500">
                      <tr>
                        <th class="py-2 pr-6">Order #</th>
                        <th class="py-2 pr-6">Customer</th>
                        <th class="py-2 pr-6">Status</th>
                        <th class="py-2 pr-6">Total</th>
                        <th class="py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="border-t">
                        <td class="py-2 pr-6">—</td>
                        <td class="py-2 pr-6">—</td>
                        <td class="py-2 pr-6">—</td>
                        <td class="py-2 pr-6">—</td>
                        <td class="py-2">—</td>
                      </tr>
                      <tr class="border-t">
                        <td class="py-2 pr-6">—</td>
                        <td class="py-2 pr-6">—</td>
                        <td class="py-2 pr-6">—</td>
                        <td class="py-2 pr-6">—</td>
                        <td class="py-2">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <!-- Quick Actions Panel placeholder -->
            <section aria-labelledby="qa-heading" class="lg:col-span-1">
              <div class="rounded-lg border bg-white">
                <div class="px-4 py-3 border-b">
                  <h2 id="qa-heading" class="font-medium">Quick Actions</h2>
                </div>
                <div class="p-2">
                  <button class="w-full text-left flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50">
                    <span class="i-heroicons-plus-circle w-5 h-5 text-indigo-600"></span>
                    Create New Order
                  </button>
                  <button class="w-full text-left flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50">
                    <span class="i-heroicons-plus-circle w-5 h-5 text-indigo-600"></span>
                    Add New Product
                  </button>
                  <button class="w-full text-left flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50">
                    <span class="i-heroicons-exclamation-triangle w-5 h-5 text-amber-600"></span>
                    View Low Stock Alerts
                  </button>
                  <button class="w-full text-left flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50">
                    <span class="i-heroicons-chart-bar w-5 h-5 text-indigo-600"></span>
                    Generate Report
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/***** Iconify/UnoCSS utility fallbacks (if not available, icons will be blank) *****/
.i-heroicons-bars-3::before {}
.i-heroicons-cube::before {}
.i-heroicons-bell::before {}
.i-heroicons-user-circle::before {}
.i-heroicons-chevron-double-left::before {}
.i-heroicons-chart-bar::before {}
.i-heroicons-archive-box::before {}
.i-heroicons-shopping-cart::before {}
.i-heroicons-inbox::before {}
.i-heroicons-chart-bar-square::before {}
.i-heroicons-cog-6-tooth::before {}
.i-heroicons-arrow-left-on-rectangle::before {}
.i-heroicons-arrow-path::before {}
.i-heroicons-plus-circle::before {}
.i-heroicons-exclamation-triangle::before {}
</style>

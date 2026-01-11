<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, Shield, UserX, UserCheck } from 'lucide-vue-next'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

interface UserItem {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER'
  active: boolean
}

const users = ref<UserItem[]>([
  { id: 1, email: 'admin@inventory.local', firstName: 'System', lastName: 'Admin', role: 'ADMIN', active: true },
  { id: 2, email: 'manager@inventory.local', firstName: 'Marta', lastName: 'Manager', role: 'MANAGER', active: true },
  { id: 3, email: 'staff@inventory.local', firstName: 'Sam', lastName: 'Staff', role: 'STAFF', active: true }
])

const query = ref('')
const roleFilter = ref<'ALL' | UserItem['role']>('ALL')

const filteredUsers = computed(() => {
  const q = query.value.toLowerCase()
  return users.value.filter(u => {
    const matchesQuery = !q || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)
    const matchesRole = roleFilter.value === 'ALL' || u.role === roleFilter.value
    return matchesQuery && matchesRole
  })
})

const toggleActive = (user: UserItem) => {
  user.active = !user.active
}

const updateRole = (user: UserItem, newRole: UserItem['role']) => {
  user.role = newRole
}

const navigateToUser = (user: UserItem) => {
  userStore.setSelectedUser(user)
  router.push(`/users/${user.id}`)
}

const getUserInitials = (user: UserItem): string => {
  try {
    const first = user.firstName.charAt(0) || ''
    const second = user.lastName.charAt(0) || ''
    const initials = (first + second).toUpperCase()
    return initials || 'U'
  } catch (e) {
    return 'U'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">User Management</h2>
        <p class="text-sm text-slate-600">Create, update, deactivate and manage user roles.</p>
      </div>
      <router-link to="/users/new" class="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
        <Plus :size="18" />
        New User
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center gap-3">
      <div class="relative">
        <input v-model="query" placeholder="Search users..." class="w-64 rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <Search :size="16" class="absolute left-3 top-2.5 text-slate-400" />
      </div>
      <select v-model="roleFilter" class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="ALL">All roles</option>
        <option value="ADMIN">Admin</option>
        <option value="MANAGER">Manager</option>
        <option value="STAFF">Staff</option>
        <option value="VIEWER">Viewer</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">User</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Role</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="u in filteredUsers" :key="u.id" class="hover:bg-slate-50">
            <td class="px-4 py-3">
              <div @click="navigateToUser(u)" class="block cursor-pointer">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                    {{ getUserInitials(u) }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-slate-900 hover:underline">{{ u.firstName }} {{ u.lastName }}</div>
                    <div class="text-xs text-slate-600">{{ u.email }}</div>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full"
                   :class="{
                     'bg-purple-100 text-purple-700': u.role==='ADMIN',
                     'bg-amber-100 text-amber-800': u.role==='MANAGER',
                     'bg-sky-100 text-sky-700': u.role==='STAFF',
                     'bg-slate-100 text-slate-700': u.role==='VIEWER'
                   }">
                <Shield :size="14" />
                {{ u.role }}
              </div>
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full"
                    :class="u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                <span class="w-2 h-2 rounded-full" :class="u.active ? 'bg-green-500' : 'bg-red-500'"></span>
                {{ u.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="inline-flex items-center gap-2">
                <select :value="u.role" @change="updateRole(u, ($event.target as HTMLSelectElement).value as any)" class="rounded-lg border border-slate-300 px-2 py-1 text-xs">
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="STAFF">STAFF</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
                <button @click="toggleActive(u)" class="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium"
                        :class="u.active ? 'border-red-300 text-red-700 hover:bg-red-50' : 'border-green-300 text-green-700 hover:bg-green-50'">
                  <component :is="u.active ? UserX : UserCheck" :size="14" />
                  {{ u.active ? 'Deactivate' : 'Reactivate' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
</style>

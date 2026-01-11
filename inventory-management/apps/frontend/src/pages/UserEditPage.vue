<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Save, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const userId = ref<string | null>(null)

const email = ref('user@example.com')
const firstName = ref('User')
const lastName = ref('Name')
const role = ref<'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER'>('STAFF')
const active = ref(true)
const loading = ref(false)

onMounted(() => {
  // Load from params or default to current user (placeholder id 'me')
  userId.value = (route.params.id as string) || 'me'
  // TODO: Fetch user by id and populate fields
})

const handleSubmit = async () => {
  loading.value = true
  try {
    // TODO: integrate API call to update user
    await new Promise(r => setTimeout(r, 700))
    router.push('/users')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Edit User</h2>
        <p class="text-sm text-slate-600">Update profile information and role.</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50" @click="router.back()">
          <ArrowLeft :size="16" />
          Back
        </button>
        <button class="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60" :disabled="loading" @click="handleSubmit">
          <Save :size="16" />
          Save
        </button>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">First Name</label>
          <input v-model="firstName" class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
          <input v-model="lastName" class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" v-model="email" class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300" />
        </div>
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <select v-model="role" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="STAFF">STAFF</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" v-model="active" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            Active
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Save, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const email = ref('')
const firstName = ref('')
const lastName = ref('')
const role = ref<'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER'>('STAFF')
const password = ref('')
const active = ref(true)
const loading = ref(false)
const fieldErrors = ref<Record<string, string>>({})

const validate = () => {
  fieldErrors.value = {}
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) fieldErrors.value.email = 'Email is required'
  else if (!emailRegex.test(email.value)) fieldErrors.value.email = 'Invalid email format'
  if (!firstName.value) fieldErrors.value.firstName = 'First name is required'
  if (!lastName.value) fieldErrors.value.lastName = 'Last name is required'
  if (!password.value || password.value.length < 8) fieldErrors.value.password = 'Password must be at least 8 characters'
  return Object.keys(fieldErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    // TODO: integrate API call to create user
    await new Promise(r => setTimeout(r, 700))
    router.push('/users')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-0.5">
        <h2 class="text-xl font-semibold text-slate-900">Create User</h2>
        <p class="text-sm text-slate-600">Add a new user and assign a role.</p>
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

    <!-- Form -->
    <div class="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">First Name</label>
          <input v-model="firstName" class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" :class="fieldErrors.firstName ? 'border-red-300' : 'border-slate-300'" />
          <p v-if="fieldErrors.firstName" class="mt-1 text-xs text-red-600">{{ fieldErrors.firstName }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
          <input v-model="lastName" class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" :class="fieldErrors.lastName ? 'border-red-300' : 'border-slate-300'" />
          <p v-if="fieldErrors.lastName" class="mt-1 text-xs text-red-600">{{ fieldErrors.lastName }}</p>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" v-model="email" class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" :class="fieldErrors.email ? 'border-red-300' : 'border-slate-300'" placeholder="user@inventory.local" />
          <p v-if="fieldErrors.email" class="mt-1 text-xs text-red-600">{{ fieldErrors.email }}</p>
        </div>
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input type="password" v-model="password" class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" :class="fieldErrors.password ? 'border-red-300' : 'border-slate-300'" />
          <p v-if="fieldErrors.password" class="mt-1 text-xs text-red-600">{{ fieldErrors.password }}</p>
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

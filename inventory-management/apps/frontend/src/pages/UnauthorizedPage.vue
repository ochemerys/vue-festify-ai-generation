<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AlertCircle, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen w-screen flex items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-md text-center">
      <!-- Icon -->
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
        <AlertCircle :size="32" class="text-red-600" />
      </div>

      <!-- Content -->
      <h1 class="text-2xl font-semibold text-slate-900 mb-2">Unauthorized Access</h1>
      <p class="text-slate-600 mb-6">
        You do not have permission to access this resource. Please log in with a valid account.
      </p>

      <!-- Actions -->
      <div class="flex flex-col gap-3">
        <button
          @click="router.push('/login')"
          class="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          Go to Login
        </button>
        <button
          @click="router.back()"
          class="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft :size="16" />
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

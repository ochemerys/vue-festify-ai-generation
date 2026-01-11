<script setup lang="ts">
import { ref, watch } from 'vue'
import SettingsSection from '../SettingsSection.vue'
import type { AccountSettings } from '../../../types/settings'

/**
 * ProfileSettings.vue - User profile information section
 */

interface Props {
  settings: AccountSettings
}

interface Emits {
  (e: 'update', settings: AccountSettings): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localProfile = ref({ ...props.settings.profile })
const errors = ref<Record<string, string>>({})

watch(() => props.settings.profile, (newProfile) => {
  localProfile.value = { ...newProfile }
}, { deep: true })

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string): boolean => {
  if (!phone) return true // Phone is optional
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone)
}

const updateField = (field: keyof typeof localProfile.value, value: string) => {
  localProfile.value[field] = value
  errors.value[field] = ''

  // Validate specific fields
  if (field === 'email' && !validateEmail(value)) {
    errors.value[field] = 'Please enter a valid email address'
  } else if (field === 'phone' && !validatePhone(value)) {
    errors.value[field] = 'Please enter a valid phone number'
  }

  emit('update', {
    ...props.settings,
    profile: { ...localProfile.value }
  })
}
</script>

<template>
  <SettingsSection
    title="Profile Information"
    description="Update your personal information"
  >
    <div class="space-y-4">
      <!-- First Name -->
      <div>
        <label
          for="firstName"
          class="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1"
        >
          First Name <span class="text-red-500">*</span>
        </label>
        <input
          id="firstName"
          type="text"
          :value="localProfile.firstName"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your first name"
          required
          @input="updateField('firstName', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <!-- Last Name -->
      <div>
        <label
          for="lastName"
          class="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1"
        >
          Last Name <span class="text-red-500">*</span>
        </label>
        <input
          id="lastName"
          type="text"
          :value="localProfile.lastName"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your last name"
          required
          @input="updateField('lastName', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <!-- Email -->
      <div>
        <label
          for="email"
          class="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1"
        >
          Email <span class="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          :value="localProfile.email"
          :class="[
            'w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          ]"
          placeholder="your.email@example.com"
          required
          @input="updateField('email', ($event.target as HTMLInputElement).value)"
        >
        <p
          v-if="errors.email"
          class="text-xs text-red-500 mt-1"
        >
          {{ errors.email }}
        </p>
        <p
          v-else
          class="text-xs text-slate-500 dark:text-slate-400 mt-1"
        >
          ⓘ Email changes require verification
        </p>
      </div>

      <!-- Phone -->
      <div>
        <label
          for="phone"
          class="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1"
        >
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          :value="localProfile.phone"
          :class="[
            'w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          ]"
          placeholder="+1 (555) 123-4567"
          @input="updateField('phone', ($event.target as HTMLInputElement).value)"
        >
        <p
          v-if="errors.phone"
          class="text-xs text-red-500 mt-1"
        >
          {{ errors.phone }}
        </p>
      </div>

      <!-- Job Title -->
      <div>
        <label
          for="jobTitle"
          class="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1"
        >
          Job Title
        </label>
        <input
          id="jobTitle"
          type="text"
          :value="localProfile.jobTitle"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Inventory Manager"
          @input="updateField('jobTitle', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </div>
  </SettingsSection>
</template>

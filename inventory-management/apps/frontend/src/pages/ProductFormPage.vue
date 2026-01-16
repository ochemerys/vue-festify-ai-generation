<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Header -->
    <div class="mb-6">
      <button
        class="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        @click="handleCancel"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Products
      </button>
      <h1 class="text-3xl font-bold text-gray-900">Create New Product</h1>
      <p class="text-gray-600 mt-2">Define a new product in your catalog</p>
    </div>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      data-testid="success-message"
      class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
    >
      <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      <div class="flex-1">
        <p class="font-medium text-green-900">{{ successMessage }}</p>
        <p class="text-sm text-green-700 mt-1">Quantity on hand: 0</p>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
      data-testid="error-message"
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
    >
      <svg class="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      <p class="flex-1 text-red-900">{{ errorMessage }}</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Product Information Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Product Information</h2>

        <div class="space-y-4">
          <!-- Product Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Product Name
              <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              name="name"
              type="text"
              required
              @blur="validateField('name')"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" data-testid="name-error" class="mt-1 text-sm text-red-600">
              {{ errors.name }}
            </p>
          </div>

          <!-- SKU and Category Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- SKU -->
            <div>
              <label for="sku" class="block text-sm font-medium text-gray-700 mb-1">
                SKU
                <span class="text-red-500">*</span>
              </label>
              <input
                id="sku"
                v-model="formData.sku"
                name="sku"
                type="text"
                required
                @blur="validateField('sku')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.sku }"
                placeholder="PROD-001"
              />
              <p class="mt-1 text-xs text-gray-500">Must be unique</p>
              <p v-if="errors.sku" data-testid="sku-error" class="mt-1 text-sm text-red-600">
                {{ errors.sku }}
              </p>
            </div>

            <!-- Category -->
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
                Category
                <span class="text-red-500">*</span>
              </label>
              <select
                id="category"
                v-model="formData.category"
                name="category"
                required
                @blur="validateField('category')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.category }"
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Food">Food</option>
                <option value="Books">Books</option>
                <option value="General">General</option>
              </select>
              <p
                v-if="errors.category"
                data-testid="category-error"
                class="mt-1 text-sm text-red-600"
              >
                {{ errors.category }}
              </p>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              v-model="formData.description"
              name="description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product description..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Pricing Information Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Pricing Information</h2>

        <div class="space-y-4">
          <!-- Price and Cost Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Selling Price -->
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
                Selling Price
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  id="price"
                  v-model.number="formData.price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  @blur="validateField('price')"
                  class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.price }"
                />
              </div>
              <p v-if="errors.price" data-testid="price-error" class="mt-1 text-sm text-red-600">
                {{ errors.price }}
              </p>
            </div>

            <!-- Cost -->
            <div>
              <label for="cost" class="block text-sm font-medium text-gray-700 mb-1">
                Cost
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  id="cost"
                  v-model.number="formData.cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  @blur="validateField('cost')"
                  class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.cost }"
                />
              </div>
              <p v-if="errors.cost" data-testid="cost-error" class="mt-1 text-sm text-red-600">
                {{ errors.cost }}
              </p>
            </div>
          </div>

          <!-- Pricing Warning -->
          <div
            v-if="pricingWarning"
            data-testid="pricing-warning"
            class="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2"
          >
            <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <p class="text-sm text-yellow-800">{{ pricingWarning }}</p>
          </div>

          <!-- Reorder Level -->
          <div>
            <label for="reorderLevel" class="block text-sm font-medium text-gray-700 mb-1">
              Reorder Level
              <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center gap-2">
              <input
                id="reorderLevel"
                v-model.number="formData.reorderLevel"
                name="reorderLevel"
                type="number"
                min="0"
                required
                class="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span class="text-gray-600">units</span>
            </div>
            <p class="mt-1 text-xs text-gray-500">Alert when stock falls below this level</p>
          </div>
        </div>
      </div>

      <!-- Supplier Information Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Supplier Information</h2>

        <div>
          <label for="supplier" class="block text-sm font-medium text-gray-700 mb-1">
            Primary Supplier
            <span class="text-red-500">*</span>
          </label>
          <select
            id="supplier"
            v-model="formData.supplier"
            name="supplier"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Supplier</option>
            <option value="Tech Supplies Inc">Tech Supplies Inc</option>
            <option value="Global Electronics">Global Electronics</option>
            <option value="Office Depot">Office Depot</option>
            <option value="Default Supplier">Default Supplier</option>
            <option value="Test Supplier">Test Supplier</option>
          </select>
        </div>
      </div>

      <!-- Initial Inventory Info -->
      <div
        data-testid="initial-inventory-info"
        class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
      >
        <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="flex-1">
          <p class="font-medium text-blue-900">Initial Inventory</p>
          <p class="text-sm text-blue-700 mt-1">
            This product will be created with 0 quantity on hand. To add inventory, use the
            Inventory Adjustment page after creating the product.
          </p>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          @click="handleCancel"
          :disabled="isSubmitting"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting || !isFormValid"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            v-if="isSubmitting"
            data-testid="loading-indicator"
            class="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ isSubmitting ? 'Creating...' : 'Create Product' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/services/api'

const router = useRouter()

interface FormData {
  sku: string
  name: string
  description: string
  category: string
  supplier: string
  price: number | null
  cost: number | null
  reorderLevel: number
}

const formData = ref<FormData>({
  sku: '',
  name: '',
  description: '',
  category: '',
  supplier: '',
  price: null,
  cost: null,
  reorderLevel: 10,
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const SKU_PATTERN = /^[A-Z0-9-]+$/

const validateField = (field: keyof FormData) => {
  errors.value[field] = ''

  switch (field) {
    case 'sku':
      if (!formData.value.sku) {
        errors.value.sku = 'SKU is required'
      } else if (!SKU_PATTERN.test(formData.value.sku)) {
        errors.value.sku = 'SKU must contain only uppercase letters, numbers, and hyphens'
      }
      break

    case 'name':
      if (!formData.value.name) {
        errors.value.name = 'Product name is required'
      } else if (formData.value.name.length < 3) {
        errors.value.name = 'Product name must be at least 3 characters'
      }
      break

    case 'category':
      if (!formData.value.category) {
        errors.value.category = 'Category is required'
      }
      break

    case 'price':
      if (formData.value.price === null || formData.value.price <= 0) {
        errors.value.price = 'Price must be greater than 0'
      }
      break

    case 'cost':
      if (formData.value.cost === null || formData.value.cost <= 0) {
        errors.value.cost = 'Cost must be greater than 0'
      }
      break

    case 'supplier':
      if (!formData.value.supplier) {
        errors.value.supplier = 'Supplier is required'
      }
      break

    case 'reorderLevel':
      if (formData.value.reorderLevel < 0) {
        errors.value.reorderLevel = 'Reorder level must be 0 or greater'
      }
      break
  }
}

const validateAllFields = () => {
  validateField('sku')
  validateField('name')
  validateField('category')
  validateField('price')
  validateField('cost')
  validateField('supplier')
  validateField('reorderLevel')

  return Object.values(errors.value).every((error) => !error)
}

const pricingWarning = computed(() => {
  if (
    formData.value.price !== null &&
    formData.value.cost !== null &&
    formData.value.price > 0 &&
    formData.value.cost > 0 &&
    formData.value.price < formData.value.cost
  ) {
    return 'Selling price is lower than cost. This will result in a loss.'
  }
  return ''
})

const isFormValid = computed(() => {
  return (
    formData.value.sku &&
    formData.value.name &&
    formData.value.category &&
    formData.value.supplier &&
    formData.value.price !== null &&
    formData.value.price > 0 &&
    formData.value.cost !== null &&
    formData.value.cost > 0 &&
    formData.value.reorderLevel >= 0
  )
})

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateAllFields()) {
    return
  }

  isSubmitting.value = true

  try {
    const payload = {
      sku: formData.value.sku,
      name: formData.value.name,
      category: formData.value.category,
      supplier: formData.value.supplier,
      price: formData.value.price!,
      cost: formData.value.cost!,
      reorderLevel: formData.value.reorderLevel,
      ...(formData.value.description && { description: formData.value.description }),
    }

    const response = await apiClient.createProduct(payload)

    if (response && response.success) {
      successMessage.value = `Product "${formData.value.name}" created successfully!`
      console.log('[ProductForm] Product created successfully:', response.data)

      // Navigate to products list after a short delay
      setTimeout(() => {
        router.push({ name: 'ProductsList' })
      }, 2000)
    } else {
      errorMessage.value = 'Failed to create product. Please try again.'
    }
  } catch (error: any) {
    console.error('[ProductForm] Error creating product:', error)
    if (error.code === 'UNKNOWN_ERROR' && error.message.includes('409')) {
      errorMessage.value = 'SKU already exists'
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to create product. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push({ name: 'ProductsList' })
}
</script>

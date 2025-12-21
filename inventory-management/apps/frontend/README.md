# Inventory Management Frontend

Vue 3 + TypeScript frontend for the Inventory Management System.

## Features

- **Modern UI** - Vue 3 with Composition API
- **Type Safety** - TypeScript with Zod schema integration
- **Responsive Design** - Tailwind CSS for styling
- **Form Validation** - Zod schemas for client-side validation
- **State Management** - Pinia for global state (planned)
- **API Integration** - Type-safe API calls with contracts
- **Component Library** - Reusable Vue components

## Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Vue Test Utils
- **Linting**: ESLint with Vue support
- **Contracts**: Zod schemas from `@inventory/contracts`

## Project Structure

```
apps/frontend/
├── src/
│   ├── components/       # Reusable Vue components
│   ├── views/           # Page components
│   ├── composables/     # Vue composables
│   ├── types/           # Local type definitions
│   ├── utils/           # Utility functions
│   ├── styles/          # Global styles
│   └── main.ts          # App entry point
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind configuration
└── package.json
```

## Getting Started

### Development

```bash
pnpm dev
```

The app will start at `http://localhost:5173`

### Build

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Testing

```bash
pnpm test
pnpm test:watch
```

### Linting

```bash
pnpm lint
pnpm lint:fix
```

## Key Components

### Form Components

```vue
<template>
  <ProductForm v-model="product" :schema="CreateProductRequestSchema" @submit="handleSubmit" />
</template>

<script setup lang="ts">
import { CreateProductRequestSchema } from '@inventory/contracts'
import ProductForm from '@/components/forms/ProductForm.vue'
</script>
```

### API Integration

```typescript
import { apiClient } from '@/utils/api'
import type { Product, ApiResponse } from '@inventory/contracts'

const {
  data: products,
  loading,
  error,
} = await apiClient.get<ApiResponse<Product[]>>('/api/products')
```

### Type-Safe Forms

```typescript
import { useForm } from 'vue-form'
import { CreateProductRequestSchema } from '@inventory/contracts'

const form = useForm({
  schema: CreateProductRequestSchema,
  initialValues: {
    name: '',
    sku: '',
    price: 0,
  },
})
```

## Styling Guidelines

### Tailwind Classes

- Use Tailwind utility classes for styling
- Follow the design system color palette
- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`

### Component Structure

```vue
<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">{{ title }}</h3>
    </div>
    <div class="card-body">
      <!-- Content -->
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-md;
}

.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.card-title {
  @apply text-lg font-semibold text-gray-900;
}

.card-body {
  @apply px-6 py-4;
}
</style>
```

## Environment Variables

```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=Inventory Management
```

## Development Guidelines

### Component Naming

- Use PascalCase for component names: `ProductList.vue`
- Use kebab-case for file names: `product-list.vue`
- Prefix component names with domain: `ProductCard`, `OrderForm`

### State Management

- Use Pinia for global state
- Use composables for component-specific logic
- Keep components stateless when possible

### API Calls

- Use the centralized API client
- Handle loading and error states
- Type API responses with contracts

### Testing

- Write unit tests for components
- Test user interactions with Vue Test Utils
- Mock API calls in tests

## Contributing

1. Follow Vue 3 Composition API patterns
2. Use TypeScript for all new code
3. Follow the established component structure
4. Add tests for new components
5. Update styles to match the design system

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

See LICENSE in the root directory.

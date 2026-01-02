# Implementation Lessons Learned - Vue 3 Component Generation

## Overview

This document captures all the errors, warnings, and best practices discovered during the development of the Inventory Management Dashboard components. These lessons are critical for avoiding similar issues in future Vue 3 projects.

---

## 1. Props Usage in Templates

### The Problem

In Vue 3 with `<script setup>`, props are NOT automatically available in templates. They must be explicitly referenced through the props object.

### Error Encountered

```
ReferenceError: label is not defined
ReferenceError: value is not defined
ReferenceError: loading is not defined
```

### Wrong Approach

```vue
<script setup lang="ts">
interface Props {
  label: string;
  value: string | number;
  loading?: boolean;
}

defineProps<Props>();
</script>

<template>
  <!-- ❌ WRONG: These will be undefined -->
  <div>{{ label }}</div>
  <div>{{ value }}</div>
  <div v-if="loading">Loading...</div>
</template>
```

### Correct Approach

```vue
<script setup lang="ts">
interface Props {
  label: string;
  value: string | number;
  loading?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <!-- ✅ CORRECT: Use props object -->
  <div>{{ props.label }}</div>
  <div>{{ props.value }}</div>
  <div v-if="props.loading">Loading...</div>
</template>
```

### Key Takeaway

**Always assign defineProps to a const variable and reference it in templates.**

---

## 2. Props Usage in Computed Properties

### The Problem

When accessing props in computed properties, you must use `props.propertyName`, NOT `props.propertyName.value`.

### Error Encountered

```
ReferenceError: metrics is not defined
```

### Wrong Approach

```typescript
const props = defineProps<Props>();

// ❌ WRONG: metrics is not defined
const gridItems = computed(() => {
  return Array.from({ length: 8 }, (_, i) => metrics.value[i] || null);
});
```

### Correct Approach

```typescript
const props = defineProps<Props>();

// ✅ CORRECT: Use props.metrics
const gridItems = computed(() => {
  return Array.from({ length: 8 }, (_, i) => props.metrics[i] || null);
});
```

### Key Takeaway

**In computed properties, use `props.propertyName` directly, not `props.propertyName.value`.**

---

## 3. Duplicate defineProps() Calls

### The Problem

Calling `defineProps()` multiple times in the same component causes a Vue compiler error.

### Error Encountered

```
[@vue/compiler-sfc] duplicate defineProps() call
```

### Wrong Approach

```typescript
interface Props {
  label: string;
  value: string | number;
}

defineProps<Props>();

// ... later in the file ...

const props = defineProps<Props>(); // ❌ DUPLICATE!
```

### Correct Approach

```typescript
interface Props {
  label: string;
  value: string | number;
}

const props = defineProps<Props>(); // ✅ Only call once

// Use props throughout the component
```

### Key Takeaway

**Call defineProps() exactly once per component and assign it to a const variable.**

---

## 4. Router Dependency Issues

### The Problem

Using `useRoute()` from vue-router without configuring the router causes injection errors.

### Error Encountered

```
[Vue warn]: injection "Symbol(route location)" not found
TypeError: Cannot read properties of undefined (reading 'path')
```

### Wrong Approach

```typescript
import { useRoute } from "vue-router";

// ❌ WRONG: This fails if router is not configured
const route = useRoute();

const isRouteActive = (path: string): boolean => {
  return route.path.startsWith(path);
};
```

### Correct Approach (Option 1: Ref-based Fallback)

```typescript
import { ref } from "vue";

// ✅ CORRECT: Use ref-based fallback
const currentPath = ref("/");

const isRouteActive = (path: string): boolean => {
  if (path === "/") {
    return currentPath.value === "/";
  }
  return currentPath.value.startsWith(path);
};
```

### Correct Approach (Option 2: Try-Catch with Fallback)

```typescript
import { ref } from "vue";

let route: any = null;
try {
  route = useRoute();
} catch (e) {
  // Router not configured, use fallback
  route = { path: "/" };
}

const isRouteActive = (path: string): boolean => {
  if (!route) return false;
  if (path === "/") {
    return route.path === "/";
  }
  return route.path?.startsWith(path) || false;
};
```

### Key Takeaway

**Components should work WITHOUT vue-router configured. Use ref-based fallbacks for router-dependent features.**

---

## 5. Component Independence

### The Problem

Components should not depend on external libraries or configurations that may not be available.

### Best Practice

- **Do NOT assume router is configured**
- **Do NOT assume Pinia stores are available**
- **Do NOT assume external dependencies are installed**
- **Provide fallbacks for optional features**

### Example: Router-Independent Navigation

```typescript
// ✅ GOOD: Works with or without router
const currentPath = ref("/");

const isRouteActive = (path: string): boolean => {
  return currentPath.value === path || currentPath.value.startsWith(path);
};

// When router is available, update currentPath
// When router is not available, currentPath defaults to '/'
```

### Key Takeaway

**Design components to be self-contained and work independently of external configurations.**

---

## 6. TypeScript Interface Best Practices

### Props Interface

```typescript
// ✅ GOOD: Clear, explicit interface
interface Props {
  label: string;
  value: string | number;
  trend?: number;
  trendDirection?: "up" | "down" | "neutral";
  isUrgent?: boolean;
  loading?: boolean;
}

const props = defineProps<Props>();
```

### Emits Interface

```typescript
// ✅ GOOD: Clear, explicit interface
interface Emits {
  (e: "execute", actionId: string): void;
  (e: "view-order", orderId: string): void;
}

const emits = defineEmits<Emits>();
```

### Key Takeaway

**Use explicit TypeScript interfaces for props and emits. Always assign to const variables.**

---

## 7. Template Syntax Best Practices

### Conditional Rendering

```vue
<!-- ✅ GOOD: Use v-if for conditional rendering -->
<div v-if="props.loading" class="skeleton">Loading...</div>
<div v-else>Content</div>

<!-- ❌ AVOID: v-show for heavy components -->
<div v-show="props.loading" class="skeleton">Loading...</div>
```

### Event Handling

```vue
<!-- ✅ GOOD: Use @click with method -->
<button @click="handleClick">Action</button>

<!-- ❌ AVOID: Inline logic in templates -->
<button @click="emits('action', props.id)">Action</button>
```

### Prop References

```vue
<!-- ✅ GOOD: Always use props object -->
<div>{{ props.label }}</div>
<div :class="props.isUrgent ? 'urgent' : 'normal'">Content</div>

<!-- ❌ WRONG: Direct reference without props -->
<div>{{ label }}</div>
<div :class="isUrgent ? 'urgent' : 'normal'">Content</div>
```

### Key Takeaway

**Always use the props object in templates. Keep templates clean and readable.**

---

## 8. Computed Properties Best Practices

### Accessing Props

```typescript
// ✅ GOOD: Direct access to props
const displayValue = computed(() => {
  return props.value || "—";
});

// ❌ WRONG: Using .value on props
const displayValue = computed(() => {
  return props.value.value || "—";
});
```

### Complex Logic

```typescript
// ✅ GOOD: Extract complex logic to computed
const cardClasses = computed(() => {
  const baseClasses = 'bg-white rounded-lg p-6'
  const borderClass = props.isUrgent ? 'border-l-4 border-red-500' : 'border border-slate-200'
  return `${baseClasses} ${borderClass}`
})

// ❌ AVOID: Complex logic in templates
<div :class="`bg-white rounded-lg p-6 ${props.isUrgent ? 'border-l-4 border-red-500' : 'border border-slate-200'}`">
```

### Key Takeaway

**Use computed properties for derived state. Keep templates simple and readable.**

---

## 9. Error Handling Best Practices

### Optional Chaining

```typescript
// ✅ GOOD: Use optional chaining for safety
const isRouteActive = (path: string): boolean => {
  return route?.path?.startsWith(path) || false;
};

// ❌ WRONG: Direct access without checking
const isRouteActive = (path: string): boolean => {
  return route.path.startsWith(path); // Can throw error
};
```

### Null Checks

```typescript
// ✅ GOOD: Check for null/undefined
const isRouteActive = (path: string): boolean => {
  if (!route) return false;
  if (path === "/") {
    return route.path === "/";
  }
  return route.path?.startsWith(path) || false;
};

// ❌ WRONG: Assume route exists
const isRouteActive = (path: string): boolean => {
  return route.path.startsWith(path);
};
```

### Key Takeaway

**Always check for null/undefined before accessing properties. Use optional chaining.**

---

## 10. Testing Without Dependencies

### Testing Without Router

```typescript
// ✅ GOOD: Component works without router
const currentPath = ref("/");

// Test by updating currentPath
currentPath.value = "/products";
expect(isRouteActive("/products")).toBe(true);
```

### Testing Without Pinia

```typescript
// ✅ GOOD: Component works with mock data
const metrics = ref([
  { id: "1", label: "Total", value: 100 },
  { id: "2", label: "Low Stock", value: 5 },
]);

// Test by updating metrics
metrics.value.push({ id: "3", label: "Orders", value: 25 });
expect(metrics.value.length).toBe(3);
```

### Key Takeaway

**Design components to be testable without external dependencies.**

---

## 11. Common Mistakes Summary

| Mistake                                            | Error                       | Solution                                     |
| -------------------------------------------------- | --------------------------- | -------------------------------------------- |
| Using `label` instead of `props.label` in template | ReferenceError              | Always use `props.propertyName`              |
| Using `metrics.value[i]` in computed               | ReferenceError              | Use `props.metrics[i]`                       |
| Calling `defineProps()` twice                      | Duplicate defineProps error | Call once and assign to const                |
| Using `useRoute()` without router                  | Injection error             | Use ref-based fallback                       |
| Not assigning `defineProps()` to const             | Template errors             | Always: `const props = defineProps<Props>()` |
| Accessing `props.propertyName.value`               | Undefined error             | Use `props.propertyName` directly            |

---

## 12. Checklist for Future Vue 3 Components

- [ ] Props assigned to const: `const props = defineProps<Props>()`
- [ ] Emits assigned to const: `const emits = defineEmits<Emits>()`
- [ ] All template references use props object: `{{ props.label }}`
- [ ] All computed properties use props.propertyName: `props.metrics[i]`
- [ ] No duplicate defineProps() or defineEmits() calls
- [ ] No useRoute() without fallback
- [ ] No useStore() without fallback
- [ ] Optional chaining used: `route?.path?.startsWith()`
- [ ] Null checks before accessing properties
- [ ] Components work without external dependencies
- [ ] TypeScript strict mode compliance
- [ ] No console errors or warnings
- [ ] Accessibility features implemented
- [ ] Responsive design tested

---

## 13. Updated Prompt

An updated version of the original prompt has been created with all these lessons incorporated:

**File:** `ai-prompts/frontend/generate-main-page-layout-UPDATED.txt`

This updated prompt includes:

- Critical implementation rules with examples
- Common pitfalls to avoid
- Verification checklist
- Example of correct component structure
- Post-generation steps

---

## Conclusion

The errors encountered during this project were all preventable with proper understanding of Vue 3's `<script setup>` syntax and component independence principles. The key lessons are:

1. **Always assign defineProps to const**
2. **Always use props object in templates and computed**
3. **Never assume external dependencies are configured**
4. **Use optional chaining and null checks**
5. **Design components to be self-contained**

These practices will prevent similar issues in future Vue 3 projects.

---

**Last Updated:** January 2024  
**Version:** 1.0.0

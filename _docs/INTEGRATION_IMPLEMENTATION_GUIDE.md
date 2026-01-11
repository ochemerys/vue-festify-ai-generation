# Frontend-Backend Integration Implementation Guide

## Overview

This guide provides step-by-step instructions to connect your Vue 3 frontend to the Fastify backend and PostgreSQL database.

**Estimated Time**: 6-8 hours  
**Difficulty**: Intermediate  
**Prerequisites**: Node.js 18+, Docker, npm/pnpm

---

## Phase 1: Environment Setup (30 minutes)

### Step 1.1: Create Environment Files

#### Backend Environment (.env)

Create `/inventory-management/.env`:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=mysecretpassword
DB_DATABASE=org_inventory

# Server Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production-12345
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

#### Frontend Environment (.env.local)

Create `/inventory-management/apps/frontend/.env.local`:

```bash
# API Configuration
VITE_API_URL=http://localhost:3000

# App Configuration
VITE_APP_NAME=Inventory Management System
VITE_APP_VERSION=1.0.0
```

### Step 1.2: Verify Docker Setup

```bash
# Check if Docker is running
docker --version

# Check docker-compose
docker-compose --version
```

---

## Phase 2: Database Setup (20 minutes)

### Step 2.1: Start PostgreSQL Container

```bash
cd /home/oleks/Development/CODE_GEN/vue-festify-ai-generation

# Start the database
docker-compose up -d postgres

# Verify it's running
docker-compose ps
```

### Step 2.2: Initialize Database

```bash
cd inventory-management/packages/db

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run migrations (if any exist)
npm run migration:run

# Seed initial data
npm run db:seed
```

**Expected Output**:
```
Database has been seeded with an admin user.
Email: admin@example.com
Password: password123
```

### Step 2.3: Verify Database Connection

```bash
# Connect to PostgreSQL
docker exec -it postgres-container psql -U postgres -d org_inventory

# List tables
\dt

# Check users table
SELECT * FROM users;

# Exit
\q
```

---

## Phase 3: Backend Setup (30 minutes)

### Step 3.1: Install Dependencies

```bash
cd inventory-management/apps/backend

npm install
```

### Step 3.2: Verify Backend Configuration

Check that `src/server.ts` has:
- ✅ CORS enabled
- ✅ Swagger documentation
- ✅ All routes registered
- ✅ Health check endpoint

### Step 3.3: Start Backend Server

```bash
npm run dev
```

**Expected Output**:
```
Server running at http://localhost:3000
API Documentation available at http://localhost:3000/documentation
Swagger UI opened in default browser
```

### Step 3.4: Test Backend Health

```bash
# In another terminal
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-15T10:30:00.000Z","version":"1.0.0","uptime":5.234}
```

### Step 3.5: Test Login Endpoint

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Expected response:
# {"success":true,"data":{"accessToken":"eyJhbGc...","tokenType":"Bearer","expiresIn":86400,"user":{...}}}
```

---

## Phase 4: Frontend Setup (30 minutes)

### Step 4.1: Install Dependencies

```bash
cd inventory-management/apps/frontend

npm install
```

### Step 4.2: Verify API Service Layer

The API service layer has been created at:
```
apps/frontend/src/services/api.ts
```

This file includes:
- ✅ API client with token management
- ✅ All endpoint methods
- ✅ Error handling
- ✅ Token persistence
- ✅ Request/response interceptors

### Step 4.3: Update Main.ts (Optional)

If you want to initialize auth on app startup, update `src/main.ts`:

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { useAuthStore } from './stores/authStoreWithAPI'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth store
const authStore = useAuthStore()
authStore.initializeAuth()
authStore.setupAuthListener()

app.mount('#app')
```

### Step 4.4: Start Frontend Server

```bash
npm run dev
```

**Expected Output**:
```
VITE v7.2.4  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## Phase 5: Integration Testing (1 hour)

### Step 5.1: Test Login Flow

1. Open http://localhost:5173/login
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `password123`
3. Click "Login"

**Expected Behavior**:
- ✅ Request sent to `POST /auth/login`
- ✅ Token stored in localStorage
- ✅ Redirected to dashboard
- ✅ User info displayed in header

### Step 5.2: Verify Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Perform login
4. Check requests:
   - ✅ `POST /auth/login` - 200 OK
   - ✅ Response includes `accessToken`
   - ✅ Token stored in localStorage

### Step 5.3: Test Protected Routes

1. Logout
2. Try to access `/products` directly
3. Should redirect to `/login`

### Step 5.4: Test API Endpoints

#### Get Products
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/products
```

#### Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD-001",
    "name": "Test Product",
    "category": "Electronics",
    "supplier": "Test Supplier",
    "price": 99.99,
    "reorderLevel": 10
  }'
```

---

## Phase 6: Update Components (2 hours)

### Step 6.1: Update LoginPage.vue

Replace the mock login with API call:

```typescript
import { apiClient } from '../services/api'

const handleSubmit = async () => {
  error.value = null
  if (!validateEmail() || !validatePassword()) return
  loading.value = true
  try {
    const result = await apiClient.login(email.value, password.value)

    if (!result.success) {
      error.value = result.error?.message || 'Login failed'
      return
    }

    // Save email if remember me is checked
    if (rememberMe.value) {
      localStorage.setItem('rememberedEmail', email.value)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    // Redirect to dashboard on successful login
    router.push('/')
  } catch (e: any) {
    error.value = e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
```

### Step 6.2: Create Product Store

Create `apps/frontend/src/stores/productStore.ts`:

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '../services/api'
import type { Product } from '../services/api'

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  const fetchProducts = async (page = 1) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.getProducts({
        page,
        pageSize: pageSize.value,
      })

      if (response.success) {
        products.value = response.data
        currentPage.value = response.pagination.page
        total.value = response.pagination.total
      } else {
        error.value = response.error?.message || 'Failed to fetch products'
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch products'
    } finally {
      isLoading.value = false
    }
  }

  const createProduct = async (data: any) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.createProduct(data)
      if (response.success) {
        products.value.unshift(response.data)
        return { success: true }
      } else {
        error.value = response.error?.message || 'Failed to create product'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to create product'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateProduct = async (id: string, data: any) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.updateProduct(id, data)
      if (response.success) {
        const index = products.value.findIndex(p => p.id === id)
        if (index !== -1) {
          products.value[index] = response.data
        }
        return { success: true }
      } else {
        error.value = response.error?.message || 'Failed to update product'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to update product'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const deleteProduct = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await apiClient.deleteProduct(id)
      products.value = products.value.filter(p => p.id !== id)
      return { success: true }
    } catch (e: any) {
      error.value = e.message || 'Failed to delete product'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    products,
    isLoading,
    error,
    currentPage,
    pageSize,
    total,
    totalPages,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  }
})
```

### Step 6.3: Update ProductsListPage.vue

```typescript
import { useProductStore } from '../stores/productStore'

const productStore = useProductStore()

onMounted(() => {
  productStore.fetchProducts()
})

const handleCreateProduct = async (data: any) => {
  const result = await productStore.createProduct(data)
  if (result.success) {
    // Show success message
  }
}
```

---

## Phase 7: Create Additional Stores (2 hours)

### Step 7.1: Inventory Store

Create `apps/frontend/src/stores/inventoryStore.ts` following the same pattern as productStore.

### Step 7.2: Order Store

Create `apps/frontend/src/stores/orderStore.ts` following the same pattern.

### Step 7.3: User Store

Create `apps/frontend/src/stores/userStore.ts` for user management.

---

## Phase 8: Testing & Debugging (1 hour)

### Step 8.1: Enable Network Logging

Add to `src/services/api.ts`:

```typescript
private async request<T>(...) {
  // ... existing code ...
  
  console.log(`[API] ${options.method || 'GET'} ${endpoint}`)
  
  try {
    const response = await fetch(...)
    console.log(`[API] Response:`, response.status, response.statusText)
    // ... rest of code ...
  }
}
```

### Step 8.2: Test All Endpoints

Use Swagger UI at http://localhost:3000/documentation to test:
- ✅ Authentication endpoints
- ✅ Product endpoints
- ✅ Inventory endpoints
- ✅ Order endpoints
- ✅ User endpoints

### Step 8.3: Check Browser Console

Look for:
- ✅ No CORS errors
- ✅ No 401 Unauthorized errors
- ✅ Proper token in Authorization header
- ✅ Correct API responses

### Step 8.4: Verify localStorage

In DevTools Console:
```javascript
// Check stored token
localStorage.getItem('auth_token')

// Check stored user
localStorage.getItem('current_user')

// Clear if needed
localStorage.clear()
```

---

## Common Issues & Solutions

### Issue 1: CORS Error

**Error**: `Access to XMLHttpRequest at 'http://localhost:3000/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution**:
1. Verify CORS is enabled in `backend/src/server.ts`
2. Check `CORS_ORIGIN` in `.env`
3. Restart backend server

### Issue 2: 401 Unauthorized

**Error**: `{"success":false,"error":"Invalid credentials"}`

**Solution**:
1. Verify credentials: `admin@example.com` / `password123`
2. Check database was seeded: `npm run db:seed`
3. Verify JWT_SECRET is set in `.env`

### Issue 3: Token Not Persisting

**Error**: Logged out after page refresh

**Solution**:
1. Check localStorage is enabled
2. Verify token is saved: `localStorage.getItem('auth_token')`
3. Check `initializeAuth()` is called in main.ts

### Issue 4: API URL Not Found

**Error**: `Failed to fetch` or `404 Not Found`

**Solution**:
1. Verify `VITE_API_URL` in `.env.local`
2. Check backend is running on port 3000
3. Test with curl: `curl http://localhost:3000/health`

### Issue 5: Database Connection Failed

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
1. Verify Docker container is running: `docker-compose ps`
2. Check database credentials in `.env`
3. Restart container: `docker-compose restart postgres`

---

## Verification Checklist

- [ ] Database running and seeded
- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] API service layer created
- [ ] Auth store updated with API calls
- [ ] Login works with real credentials
- [ ] Token stored in localStorage
- [ ] Protected routes redirect to login
- [ ] Products can be fetched from API
- [ ] Products can be created via API
- [ ] Products can be updated via API
- [ ] Products can be deleted via API
- [ ] No CORS errors in console
- [ ] No 401 errors after login
- [ ] Swagger documentation accessible

---

## Next Steps

1. **Create remaining stores** (Inventory, Orders, Users)
2. **Update all components** to use API stores
3. **Implement error handling** with user-friendly messages
4. **Add loading states** to all async operations
5. **Implement pagination** in list views
6. **Add form validation** on frontend
7. **Implement caching** for frequently accessed data
8. **Add request debouncing** for search/filter
9. **Implement token refresh** logic
10. **Add comprehensive testing** (unit, integration, e2e)

---

## Production Deployment

Before deploying to production:

- [ ] Change JWT_SECRET to a strong random value
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS origins
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Setup error tracking (Sentry, etc.)
- [ ] Configure database backups
- [ ] Setup monitoring and alerts
- [ ] Document API endpoints
- [ ] Create deployment guide

---

## Support & Resources

- **Backend Docs**: http://localhost:3000/documentation
- **Frontend Repo**: `/inventory-management/apps/frontend`
- **Backend Repo**: `/inventory-management/apps/backend`
- **Database Repo**: `/inventory-management/packages/db`
- **Contracts**: `/inventory-management/packages/contracts`

---

## Summary

You now have:
1. ✅ API service layer for frontend-backend communication
2. ✅ Updated auth store with real authentication
3. ✅ Database seeded with initial data
4. ✅ Backend API endpoints ready
5. ✅ Frontend components ready to be updated

**Next Action**: Start Phase 6 - Update Components to use the new API service layer.

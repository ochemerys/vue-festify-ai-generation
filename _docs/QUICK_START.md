# Quick Start: Frontend-Backend Integration

## TL;DR - Get Running in 10 Minutes

### Prerequisites
- Docker installed
- Node.js 18+ installed
- Terminal/Command prompt

### Step 1: Start Database (2 min)
```bash
cd /home/oleks/Development/CODE_GEN/vue-festify-ai-generation
docker-compose up -d postgres
```

### Step 2: Seed Database (3 min)
```bash
cd inventory-management/packages/db
npm install
npm run db:seed
```

### Step 3: Start Backend (2 min)
```bash
cd ../apps/backend
npm install
npm run dev
```
✅ Backend running at http://localhost:3000

### Step 4: Start Frontend (2 min)
```bash
cd ../frontend
npm install
npm run dev
```
✅ Frontend running at http://localhost:5173

### Step 5: Test Login (1 min)
1. Go to http://localhost:5173/login
2. Email: `admin@example.com`
3. Password: `password123`
4. Click Login

---

## What's Ready

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ Ready | All endpoints implemented |
| Database | ✅ Ready | PostgreSQL with TypeORM |
| Frontend UI | ✅ Ready | Vue 3 components created |
| API Service Layer | ✅ Ready | Created in `src/services/api.ts` |
| Auth Integration | ⚠️ Partial | Mock auth, needs update |
| Data Stores | ⚠️ Partial | Need to be created |
| Component Integration | ⚠️ Partial | Need to use API stores |

---

## What Needs to Be Done

### Priority 1 (Critical)
- [ ] Update auth store to use API service
- [ ] Create product store
- [ ] Update ProductsListPage to use store

### Priority 2 (High)
- [ ] Create inventory store
- [ ] Create order store
- [ ] Create user store
- [ ] Update all pages to use stores

### Priority 3 (Medium)
- [ ] Add error handling UI
- [ ] Add loading states
- [ ] Implement pagination
- [ ] Add form validation

---

## Key Files

### New Files Created
```
apps/frontend/src/services/api.ts          # API client (NEW)
apps/frontend/src/stores/authStoreWithAPI.ts  # Updated auth (NEW)
```

### Files to Update
```
apps/frontend/src/stores/authStore.ts      # Replace with API version
apps/frontend/src/pages/LoginPage.vue      # Use API client
apps/frontend/src/pages/ProductsListPage.vue  # Use product store
apps/frontend/src/pages/InventoryListPage.vue # Use inventory store
apps/frontend/src/pages/OrderListPage.vue  # Use order store
```

### Configuration Files
```
.env                                       # Backend config
apps/frontend/.env.local                   # Frontend config
```

---

## API Endpoints Available

### Authentication
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token
- `GET /auth/permissions` - Get permissions

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Inventory
- `GET /api/inventory` - List inventory
- `POST /api/inventory/adjust` - Adjust inventory

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order

### Purchase Orders
- `GET /api/purchase-orders` - List POs
- `POST /api/purchase-orders` - Create PO

### Users
- `GET /users` - List users
- `POST /users` - Create user
- `PUT /users/:id` - Update user

---

## Test Credentials

```
Email: admin@example.com
Password: password123
Role: ADMIN
```

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

### Database connection failed
```bash
# Check if container is running
docker-compose ps

# View logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Frontend can't reach backend
```bash
# Check VITE_API_URL in .env.local
cat apps/frontend/.env.local

# Should be: VITE_API_URL=http://localhost:3000
```

### Login fails
```bash
# Verify database was seeded
docker exec postgres-container psql -U postgres -d org_inventory -c "SELECT * FROM users;"

# Should show admin user
```

---

## Next Steps

1. **Update Auth Store** (30 min)
   - Replace mock login with API call
   - Test login flow

2. **Create Product Store** (1 hour)
   - Implement CRUD operations
   - Update ProductsListPage

3. **Create Other Stores** (2 hours)
   - Inventory store
   - Order store
   - User store

4. **Update Components** (2 hours)
   - Replace mock data with API calls
   - Add error handling
   - Add loading states

5. **Testing** (1 hour)
   - Test all CRUD operations
   - Test error scenarios
   - Test authentication flow

---

## Useful Commands

```bash
# Start everything
docker-compose up -d postgres
cd inventory-management/packages/db && npm run db:seed
cd ../apps/backend && npm run dev
# In another terminal:
cd inventory-management/apps/frontend && npm run dev

# Test API
curl http://localhost:3000/health
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# View database
docker exec -it postgres-container psql -U postgres -d org_inventory

# View logs
docker-compose logs -f postgres
docker-compose logs -f backend  # if using docker for backend

# Stop everything
docker-compose down
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vue 3)                        │
│                   http://localhost:5173                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages (LoginPage, ProductsListPage, etc.)          │  │
│  │  ↓                                                   │  │
│  │  Stores (authStore, productStore, etc.)             │  │
│  │  ↓                                                   │  │
│  │  API Service (api.ts)                               │  │
│  └──────────────────��───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Fastify)                         │
│                   http://localhost:3000                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes (auth, products, inventory, orders, etc.)   │  │
│  │  ↓                                                   │  │
│  │  Services (business logic)                          │  │
│  │  ↓                                                   │  │
│  │  TypeORM Repositories                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                      │
│                   localhost:5432                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables: users, products, inventory, orders, etc.   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Success Indicators

✅ You'll know it's working when:
1. Backend starts without errors
2. Frontend loads at http://localhost:5173
3. Login page appears
4. Can login with admin@example.com / password123
5. Redirected to dashboard after login
6. Token appears in localStorage
7. Network tab shows API requests
8. No CORS errors in console

---

## Support

For detailed information, see:
- `INTEGRATION_ANALYSIS.md` - Full analysis and recommendations
- `INTEGRATION_IMPLEMENTATION_GUIDE.md` - Step-by-step implementation
- Backend Swagger: http://localhost:3000/documentation

---

**Status**: Ready to integrate ✅  
**Estimated Time**: 6-8 hours  
**Difficulty**: Intermediate  

Start with Step 1 above!

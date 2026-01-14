# API Coverage Report

This report validates whether the frontend's API client methods (apps/frontend/src/services/api.ts) are supported by backend routes (apps/backend/src/routes). It flags mismatches and missing endpoints and provides remediation notes.

Legend
- Covered: Endpoint exists on backend with matching method and path.
- Partial: Endpoint exists but differs in method/path/shape.
- Missing: No backend route found.
- Unknown: Backend not confirmed from provided code context.

Summary
- Products: Covered
- Orders: Partial (update route mismatch)
- Inventory: Partial (endpoints present but exact names not fully confirmed)
- Purchase Orders: Covered
- Reports: Covered
- Auth: Partial (login exists, others unconfirmed)
- Users: Missing
- Health: Unknown

Details by Domain

Auth
- Frontend
  - POST /auth/login -> Status: Covered (backend auth.ts defines LoginRequestSchema and handlers; login endpoint present)
  - POST /auth/logout -> Status: Unknown/Partial (not visible in backend snippets)
  - POST /auth/refresh -> Status: Unknown/Partial (not visible)
  - GET /auth/permissions -> Status: Unknown/Partial (not visible)
- Backend
  - apps/backend/src/routes/auth.ts: local Zod schemas for login/create/update; endpoints for create/update user exist; logout/refresh/permissions not confirmed in provided content
- Notes
  - If logout/refresh/permissions are needed, implement them or adjust frontend.

Products
- Frontend
  - GET /api/products (filters) -> Covered
  - GET /api/products/:id -> Covered
  - GET /api/products/sku/:sku -> Covered
  - POST /api/products -> Covered
  - PUT /api/products/:id -> Covered
  - PATCH /api/products/:id/deactivate -> Covered
  - DELETE /api/products/:id -> Covered
- Backend
  - apps/backend/src/routes/products.ts defines all of the above.
- Notes
  - Backend uses contracts for Create/Update; list responses not validated against contract schemas.

Inventory
- Frontend
  - GET /api/inventory -> Partial (backend file exists; index endpoint not confirmed here)
  - GET /api/inventory/product/:productId -> Partial (not confirmed)
  - POST /api/inventory/adjust -> Partial (likely exists given Transaction/Reserve schemas, but not confirmed)
- Backend
  - apps/backend/src/routes/inventory.ts exists; shows TransactionSchema, ReserveInventorySchema, zod usage. Exact routes not fully listed in provided snippets.
- Notes
  - Confirm route names and add GET list/by-product and POST adjust endpoints if missing.

Orders
- Frontend
  - GET /api/orders -> Covered
  - GET /api/orders/:id -> Covered
  - POST /api/orders -> Covered
  - PUT /api/orders/:id -> Missing/Partial (backend uses PUT /api/orders/:id/status)
  - POST /api/orders/:id/items -> Covered
  - DELETE /api/orders/:id/items/:itemId -> Covered
- Backend
  - apps/backend/src/routes/orders.ts defines GET list, GET by id, POST create, PUT /:id/status, POST add items, DELETE remove item, plus GET /api/orders/summary.
- Notes
  - Update route mismatch: frontend should call PUT /api/orders/:id/status or backend should add PUT /api/orders/:id that proxies to status update.

Purchase Orders
- Frontend
  - GET /api/purchase-orders -> Covered
  - GET /api/purchase-orders/:id -> Covered
  - POST /api/purchase-orders -> Covered
  - PUT /api/purchase-orders/:id -> Covered (backend update present)
- Backend
  - apps/backend/src/routes/purchase-orders.ts defines CRUD and filters.
- Notes
  - Validation mismatches (cuid, notes length) exist but endpoints are present.

Reports
- Frontend
  - GET /api/reports -> Covered
- Backend
  - apps/backend/src/routes/reports.ts defines date-range filtered reports endpoint.

Users
- Frontend
  - GET /users -> Missing
  - GET /users/:id -> Missing
  - POST /users -> Missing
  - PUT /users/:id -> Missing
  - PATCH /users/:id/deactivate -> Missing
  - PATCH /users/:id/reactivate -> Missing
- Backend
  - No users router found under apps/backend/src/routes in provided structure. User management appears interwoven with auth; a dedicated /users router not detected.

Health
- Frontend
  - GET /health -> Unknown
- Backend
  - Health route typically in server.ts or init.ts; not confirmed in the provided route files. Likely present but unverified.

Gap Remediation Checklist
- Auth
  - Add /auth/logout, /auth/refresh, /auth/permissions if required by frontend; otherwise remove or adapt frontend calls.
- Orders
  - Option A: Update frontend to use PUT /api/orders/:id/status with { status, notes? }.
  - Option B: Add PUT /api/orders/:id route in backend that maps to status update.
- Inventory
  - Ensure these routes exist:
    - GET /api/inventory (list with pagination)
    - GET /api/inventory/product/:productId
    - POST /api/inventory/adjust
- Users
  - Implement a users router providing CRUD and activation endpoints under /users, or update frontend to stop calling these until implemented.
- Health
  - Confirm a GET /health endpoint is registered and returns an object matching HealthCheckResponseSchema or the frontend expectation.

Verification Notes
- This report is based on static code inspection of the repository structure and available snippets. For absolute confirmation, run the backend and test endpoints or search route registrations in server.ts/init.ts for exact paths.

Generated by API coverage analysis.

# Contracts Schema Comparison: Frontend vs Backend

This report analyzes whether the frontend and backend follow the same Zod schemas defined under inventory-management/packages/contracts/src. It lists usage per domain (API, Product, Order, Inventory, Purchase Order), highlights mismatches, and provides remediation guidance.

Scope
- Contracts (canonical): inventory-management/packages/contracts/src
  - api.ts
  - product.ts
  - order.ts
  - inventory.ts
  - purchase-order.ts
- Backend usage: inventory-management/apps/backend/src/routes/*.ts
- Frontend usage: inventory-management/apps/frontend/src/**/*

Summary
- Backend partially uses shared contracts via @inventory/contracts in products and orders routes for request validation. Other backend routes define ad-hoc Zod schemas or rely on JSON schema in Fastify schema definitions.
- Frontend imports types ApiResponse, PaginatedResponse, AuthToken from @inventory/contracts in services/api.ts but declares its own interfaces for Product and request payloads, not using the types inferred from Zod schemas.
- Several concrete mismatches exist between backend routes and contracts (e.g., transaction quantity non-negative vs positive, missing cuid validation, enum sources). The frontend diverges from contracts by redefining types and not using contract types for Product, Orders, etc.

Details

API (api.ts)
- Canonical:
  - AuthResponseSchema: { success, data: AuthToken, error?: ApiError, timestamp }
  - AuthToken: { accessToken, refreshToken?, expiresIn, tokenType }
  - Generic ApiResponse<T> and PaginatedResponse<T> types exported.
- Backend usage:
  - Auth routes not shown using shared schemas; they define local Zod schemas (LoginRequestSchema, CreateUserRequestSchema, UpdateUserRequestSchema). Responses shaped as { success, data?, error? } but not validated against contract schemas.
- Frontend usage:
  - Imports ApiResponse, PaginatedResponse, AuthToken from contracts.
  - Defines its own LoginResponse (includes user object { id, email, firstName, lastName, role }) in addition to token fields. This shape is not present in AuthToken or AuthResponse in contracts, indicating either extended backend response or divergence.

Product (product.ts)
- Canonical highlights:
  - Product.id: z.string().cuid()
  - description: string.max(1000).nullable() in Product, optional in Create/Update payloads
  - cost: number.positive() required in Create, optional in Update
  - reorderLevel: int.nonnegative() default(10)
  - timestamps: createdAt/updatedAt are Date
  - ProductFilters accepts string query params transformed to numbers for min/max price and pagination defaults; returns page>=1 and pageSize>=1.
  - Responses include success boolean and optional error message.
- Backend products route:
  - Uses CreateProductRequestSchema and UpdateProductRequestSchema from contracts for body validation. Good alignment.
  - Query filtering is manual. Fastify schema describes querystring numbers, but code parses query as strings and performs parseFloat/parseInt. Contracts' ProductFiltersSchema expects strings transformed to numbers; however, backend does not parse via ProductFiltersSchema for GET /api/products, instead does ad-hoc parsing. Potential mismatch if contracts change.
  - Response JSON schemas are manually declared; not validated with ProductResponse/ProductListResponse schemas.
  - createdAt/updatedAt returned as strings (date-time). Contracts use Date type in ProductSchema. This is an expected transport vs model difference; still, you might add transport schemas in contracts or mark Date as ISO string.
- Frontend:
  - Defines Product interface with createdAt/updatedAt as string, description optional (not nullable), cost optional. This differs from ProductSchema which has description nullable and cost required (in entity), though CreateProductRequest requires cost and response schema includes cost optional. Mismatch risk:
    - Contract ProductSchema mandates cost required; frontend marks it optional.
    - Contract ProductSchema description is nullable; frontend makes it optional.

Order (order.ts)
- Canonical highlights:
  - OrderStatus enum and schema: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, RETURNED
  - OrderItem has id?, orderId?, productId (cuid), quantity int positive, unitPrice positive, subtotal positive
  - Order contains shippingAddress, notes nullable, timestamps Date.
  - CreateOrderRequest uses OrderItemSchema.omit({ id, orderId }) and requires shippingAddress.
  - UpdateOrderStatusRequest: { status: OrderStatus, notes? }
  - Filters include status?, customerId?, startDate/endDate as Date, pagination defaults 1/10.
- Backend orders route:
  - Imports CreateOrderRequestSchema, UpdateOrderStatusRequestSchema, OrderFiltersSchema from contracts and uses them. Good alignment.
  - Also defines a local OrderItemSchema with productId: string (no cuid), quantity positive int, unitPrice positive for /:id/items. Divergence: contracts require cuid on productId.
  - GET /api/orders returns pagination fields total, page, pageSize consistent with contracts' list response, but not validated against OrderListResponseSchema.
- Frontend:
  - api.ts uses any for order payloads and responses; no contract types used. Cannot verify alignment; risk of drift.

Inventory (inventory.ts)
- Canonical highlights:
  - InventoryTransactionType enum: PURCHASE, SALE, ADJUSTMENT, RETURN, DAMAGE, TRANSFER
  - InventoryTransaction.quantity: int positive
  - CreateTransactionRequest.quantity: int positive
  - InventoryAdjustmentRequest.newQuantity int nonnegative
  - InventoryLevel fields and timestamps as Date
  - LowStockAlert includes sku and productName
- Backend inventory route:
  - Local TransactionSchema: quantity: z.number().int() (can be negative) vs contracts require positive; type: local enum literal with same values (OK), productId: z.string() (no cuid). Divergence from contracts.
  - ReserveInventorySchema similarly uses productId: string.
- Frontend:
  - api.ts adjustInventory uses type 'IN' | 'OUT' | 'ADJUSTMENT' which does not match contracts' InventoryTransactionType (PURCHASE, SALE, ADJUSTMENT, RETURN, DAMAGE, TRANSFER). Divergence.

Purchase Order (purchase-order.ts)
- Canonical highlights:
  - POStatus enum with six values
  - CreatePurchaseOrderRequest requires supplierId cuid, expectedDate string->Date transform, items with productId cuid
  - Filters status: POStatus, supplierId optional, start/endDate string->Date, paging defaults
  - GoodsReceiptRequest items with productId cuid
- Backend purchase-orders route:
  - Local CreatePurchaseOrderRequestSchema aligns structurally but uses: supplierId: string (not cuid), item.productId: string (not cuid), notes: string().optional() (contracts limit max length 1000). Status enum literal matches contracts, filters match types and defaulting, goods receipt matches but again productId string (not cuid). Divergences: missing cuid constraints, missing max length on notes.
- Frontend:
  - api.ts uses any for purchase order payloads/responses; not validated against contracts.

Frontend imports and type usage
- The only contract imports found: services/api.ts imports ApiResponse, PaginatedResponse, AuthToken. All domain shapes (Product, Order, etc.) are custom or any, not from contracts. Therefore, the frontend is not enforcing schema alignment and can drift.

Backend imports and validation
- products.ts and orders.ts import and use key request schemas from contracts. Other routes define local schemas and deviate from contracts in several fields (cuid, positivity, enum mapping).

Actionable Mismatch List
1) Inventory route
   - quantity: contracts require int().positive(); backend allows int() (could be negative or zero).
   - productId: contracts use z.string().cuid(); backend uses z.string().
   - type: backend uses literal enum array identical to contracts; recommend importing InventoryTransactionTypeSchema.
2) Orders route (/api/orders/:id/items)
   - Local OrderItemSchema: productId: z.string() vs contracts productId cuid.
   - Consider importing OrderItemSchema.omit({ id, orderId, subtotal }) and computing subtotal server-side.
3) Purchase orders route
   - supplierId/productId fields should use cuid() validators.
   - notes fields should have max(1000) per contracts.
   - Consider importing CreatePurchaseOrderRequestSchema, PurchaseOrderFiltersSchema, GoodsReceiptRequestSchema from contracts.
4) Products route (GET /api/products)
   - Querystring parsing and validation should use ProductFiltersSchema.parse(request.query). Currently manual parse; may diverge from defaulting rules.
   - Response shapes are defined via JSON schema; consider validating via ProductListResponseSchema.
5) Frontend services/api.ts
   - Product interface differs: cost is optional but contracts ProductSchema has cost required; description optional vs contracts nullable. Consider importing Product type from contracts and using ApiResponse<Product> etc.
   - Adjust inventory uses types 'IN' | 'OUT' | 'ADJUSTMENT' which do not exist in contracts. Align with InventoryTransactionType.
   - Order/purchase order methods use any payloads; replace with contract types (CreateOrderRequest, UpdateOrderStatusRequest, CreatePurchaseOrderRequest, etc.).
   - Use PaginatedResponse<Product> with Product from contracts.
6) Auth responses
   - Frontend LoginResponse extends token with user object; contracts AuthToken does not include user. If backend actually returns user, update contracts to include it or adapt frontend to use AuthResponse from contracts and a separate endpoint for user profile.

Recommendations
- Backend
  - Replace local zod literals with imports from @inventory/contracts where available.
  - Enforce cuid() where contracts define it.
  - Use .positive() where required by contracts; prevent zero/negative quantities in inventory transactions.
  - Parse query params using the corresponding FiltersSchema from contracts.
- Frontend
  - Import domain types directly from @inventory/contracts and remove divergent interfaces.
  - Align inventory transaction type to InventoryTransactionType (PURCHASE, SALE, ADJUSTMENT, RETURN, DAMAGE, TRANSFER) or update contracts if the business logic prefers IN/OUT.
  - Replace any with specific contract types for payloads and responses.
- Contracts
  - Consider representing transport date-time fields as string().datetime() in response schemas or add DTO-level schemas to avoid Date vs string mismatch debates.
  - If Login should return user, add it to contracts (e.g., AuthenticatedUser and include in AuthResponse).

Compliance Matrix (High level)
- Products
  - Backend: requests aligned; filters/response not validated by contract. Minor drift risk.
  - Frontend: type shape diverges (cost optional, description optional instead of nullable). Needs alignment.
- Orders
  - Backend: creation/filters/status aligned; add-items uses local schema with weaker validation. Partial alignment.
  - Frontend: untyped any for most endpoints. Not aligned.
- Inventory
  - Backend: local schemas conflict with contracts on quantity positivity, cuid. Not aligned.
  - Frontend: uses custom types (IN/OUT/ADJUSTMENT). Not aligned.
- Purchase Orders
  - Backend: local schemas mostly mirror contracts but do not enforce cuid and notes max length. Partial alignment.
  - Frontend: any types. Not aligned.
- API/Auth
  - Backend: not using contract schemas; unknown response alignment.
  - Frontend: uses ApiResponse, PaginatedResponse, AuthToken types; LoginResponse differs.

Next steps for remediation
- Backend
  - products.ts: Add ProductFiltersSchema.parse(request.query). Consider using ProductListResponseSchema for response validation in tests.
  - inventory.ts: Import InventoryTransactionTypeSchema and CreateTransactionRequestSchema/InventoryAdjustmentRequestSchema and enforce positive quantities and cuid IDs.
  - orders.ts: For adding items, import OrderItemSchema.omit({ id: true, orderId: true, subtotal: true }).
  - purchase-orders.ts: Import CreatePurchaseOrderRequestSchema, PurchaseOrderFiltersSchema, GoodsReceiptRequestSchema.
- Frontend
  - Replace interfaces in services/api.ts with imports: Product, CreateProductRequest, UpdateProductRequest, Order, CreateOrderRequest, UpdateOrderStatusRequest, PurchaseOrder, CreatePurchaseOrderRequest, etc.
  - Update adjustInventory types to use InventoryTransactionType.
  - Where dates are ISO strings, consider mapping Contract types to transport DTOs or update contracts to string().datetime().

Generated by schema comparison automation.

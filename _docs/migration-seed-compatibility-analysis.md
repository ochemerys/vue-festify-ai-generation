# Migration and Seed Compatibility Analysis

## Overview
This document analyzes the compatibility between the database migration file and the seed data to identify any mismatches or issues.

## Analysis Date
Generated: 2024

## Files Analyzed
- **Migration**: `packages/db/src/migrations/1767480398655-NewMigration.ts`
- **Seed**: `packages/db/src/seed.ts`
- **Entities**: `packages/db/src/entities/*.entity.ts`

---

## ✅ Compatible Tables

### 1. **users** Table
**Migration Schema:**
- id (uuid, PK)
- email (varchar, unique)
- password (varchar)
- firstName (varchar)
- lastName (varchar)
- createdAt (timestamp)
- updatedAt (timestamp)

**Entity Schema:**
- ✅ All migration fields present
- ⚠️ **MISMATCH**: Entity has `role` (varchar) field - **MISSING in migration**
- ⚠️ **MISMATCH**: Entity has `isActive` (boolean) field - **MISSING in migration**

**Seed Data Usage:**
- Seeds 4 users with email, firstName, lastName, password, **role**, **isActive**
- **ISSUE**: Seed tries to set `role` and `isActive` fields that don't exist in migration

---

### 2. **suppliers** Table
**Migration Schema:**
- id (uuid, PK)
- name (varchar)
- contactName (varchar, nullable)
- email (varchar, nullable)
- phone (varchar, nullable)
- address (text, nullable)
- isActive (boolean, default true)
- createdAt (timestamp)
- updatedAt (timestamp)

**Entity Schema:**
- ✅ Fully compatible

**Seed Data Usage:**
- ✅ Seeds 4 suppliers - all fields match

---

### 3. **products** Table
**Migration Schema:**
- id (uuid, PK)
- sku (varchar, unique)
- name (varchar)
- description (text, nullable)
- category (varchar)
- supplier (varchar)
- price (numeric 10,2)
- cost (numeric 10,2, nullable)
- reorderLevel (integer, default 0)
- isActive (boolean, default true)
- createdAt (timestamp)
- updatedAt (timestamp)

**Entity Schema:**
- ✅ Fully compatible

**Seed Data Usage:**
- ✅ Seeds 25 products - all fields match

---

### 4. **inventory_levels** Table
**Migration Schema:**
- productId (uuid, PK, FK to products)
- currentQuantity (integer, default 0)
- reservedQuantity (integer, default 0)
- availableQuantity (integer, default 0)
- createdAt (timestamp)
- updatedAt (timestamp)

**Entity Schema:**
- ✅ All migration fields present
- ⚠️ **MISMATCH**: Entity has `lastRestockDate` (timestamp, nullable) - **MISSING in migration**

**Seed Data Usage:**
- Seeds inventory for all products
- **ISSUE**: Seed sets `lastRestockDate` field that doesn't exist in migration

---

### 5. **orders** Table
**Migration Schema:**
- id (uuid, PK)
- orderNumber (varchar)
- customerName (varchar)
- customerEmail (varchar, nullable)
- shippingAddress (text, nullable)
- totalAmount (numeric 10,2)
- status (enum: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, RETURNED)
- createdBy (uuid, FK to users)
- createdAt (timestamp)
- updatedAt (timestamp)

**Entity Schema:**
- ✅ All migration fields present
- ⚠️ **MISMATCH**: Entity has `customerId` (uuid, nullable) - **MISSING in migration**
- ⚠️ **MISMATCH**: Entity has `customerPhone` (varchar, nullable) - **MISSING in migration**
- ⚠️ **MISMATCH**: Entity has `notes` (text, nullable) - **MISSING in migration**
- ⚠️ **MISMATCH**: Entity has `shippedAt` (timestamp, nullable) - **MISSING in migration**
- ⚠️ **MISMATCH**: Entity has `deliveredAt` (timestamp, nullable) - **MISSING in migration**

**Seed Data Usage:**
- Seeds 20 orders
- **ISSUE**: Seed sets `customerId`, `customerPhone`, `notes`, `shippedAt`, `deliveredAt` fields that don't exist in migration

---

### 6. **order_items** Table
**Migration Schema:**
- id (uuid, PK)
- orderId (uuid, FK to orders)
- productId (uuid, FK to products)
- quantity (integer)
- unitPrice (numeric 10,2)
- subtotal (numeric 10,2)

**Entity Schema:**
- ✅ Fully compatible

**Seed Data Usage:**
- ✅ Seeds order items for all orders - all fields match

---

### 7. **purchase_orders** Table
**Migration Schema:**
- id (uuid, PK)
- poNumber (varchar)
- supplierId (uuid, FK to suppliers)
- totalAmount (numeric 10,2)
- status (enum: DRAFT, SUBMITTED, CONFIRMED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED)
- expectedDeliveryDate (date, nullable)
- actualDeliveryDate (date, nullable)
- createdBy (uuid, FK to users)
- createdAt (timestamp)
- updatedAt (timestamp)

**Entity Schema:**
- ✅ All migration fields present
- ⚠️ **MISMATCH**: Entity uses `expectedDate` instead of `expectedDeliveryDate`
- ⚠️ **MISMATCH**: Entity uses `receivedDate` instead of `actualDeliveryDate`
- ⚠️ **MISMATCH**: Entity has `notes` (text, nullable) - **MISSING in migration**

**Seed Data Usage:**
- Seeds 12 purchase orders
- **ISSUE**: Seed uses `expectedDate` and `receivedDate` instead of migration's `expectedDeliveryDate` and `actualDeliveryDate`
- **ISSUE**: Seed sets `notes` field that doesn't exist in migration

---

### 8. **purchase_order_items** Table
**Migration Schema:**
- id (uuid, PK)
- purchaseOrderId (uuid, FK to purchase_orders)
- productId (uuid, FK to products)
- quantity (integer)
- unitPrice (numeric 10,2)
- subtotal (numeric 10,2)
- receivedQuantity (integer, default 0)

**Entity Schema:**
- ✅ Fully compatible

**Seed Data Usage:**
- ✅ Seeds purchase order items - all fields match

---

### 9. **goods_receipts** Table
**Migration Schema:**
- id (uuid, PK)
- purchaseOrderId (uuid, FK to purchase_orders)
- receiptNumber (varchar)
- receivedBy (uuid, FK to users)
- notes (text, nullable)
- receivedAt (timestamp, default now())

**Entity Schema:**
- ✅ All migration fields present
- ⚠️ **MISMATCH**: Entity uses `receivedDate` instead of `receivedAt`
- ⚠️ **MISMATCH**: Entity missing `receivedBy` field
- ⚠️ **MISMATCH**: Entity has `createdAt` field not in migration

**Seed Data Usage:**
- Seeds goods receipts for received purchase orders
- **ISSUE**: Seed uses `receivedDate` instead of migration's `receivedAt`
- **ISSUE**: Seed doesn't set `receivedBy` field required by migration

---

### 10. **inventory_transactions** Table
**Migration Schema:**
- id (uuid, PK)
- productId (uuid, FK to products)
- inventoryLevelId (uuid, FK to inventory_levels)
- type (enum: PURCHASE, SALE, ADJUSTMENT, RETURN, DAMAGE, TRANSFER)
- quantity (integer)
- reason (varchar, nullable)
- createdBy (uuid, FK to users, nullable)
- createdAt (timestamp)

**Entity Schema:**
- ✅ All migration fields present except:
- ⚠️ **MISMATCH**: Entity missing `inventoryLevelId` field
- ���️ **MISMATCH**: Entity uses `reference` instead of `reason`
- ⚠️ **MISMATCH**: Entity uses `notes` instead of `reason`

**Seed Data Usage:**
- Seeds inventory transactions for orders
- **ISSUE**: Seed uses `reference` and `notes` instead of migration's `reason`
- **ISSUE**: Seed doesn't set `inventoryLevelId` field required by migration

---

### 11. **stock_alerts** Table
**Migration Schema:**
- id (uuid, PK)
- productId (uuid, FK to products)
- alertType (varchar)
- currentStock (integer)
- threshold (integer)
- isResolved (boolean, default false)
- createdAt (timestamp)
- resolvedAt (timestamp, nullable)

**Entity Schema:**
- ✅ All migration fields present except:
- ⚠️ **MISMATCH**: Entity missing `alertType` field
- ⚠️ **MISMATCH**: Entity uses `currentQuantity` instead of `currentStock`
- ⚠️ **MISMATCH**: Entity uses `reorderLevel` instead of `threshold`
- ⚠️ **MISMATCH**: Entity has `updatedAt` field not in migration

**Seed Data Usage:**
- Seeds stock alerts for low stock products
- **ISSUE**: Seed uses `currentQuantity` and `reorderLevel` instead of migration's `currentStock` and `threshold`
- **ISSUE**: Seed doesn't set `alertType` field required by migration

---

## 🔴 Critical Issues Summary

### High Priority (Will Cause Seed Failures)

1. **users table**
   - Missing columns: `role`, `isActive`
   - Impact: Seed will fail when trying to insert users

2. **orders table**
   - Missing columns: `customerId`, `customerPhone`, `notes`, `shippedAt`, `deliveredAt`
   - Impact: Seed will fail when trying to insert orders

3. **purchase_orders table**
   - Column name mismatch: `expectedDate` vs `expectedDeliveryDate`, `receivedDate` vs `actualDeliveryDate`
   - Missing column: `notes`
   - Impact: Seed will fail when trying to insert purchase orders

4. **goods_receipts table**
   - Column name mismatch: `receivedDate` vs `receivedAt`
   - Missing column in entity: `receivedBy`
   - Impact: Seed will fail when trying to insert goods receipts

5. **inventory_levels table**
   - Missing column: `lastRestockDate`
   - Impact: Seed will fail when trying to set lastRestockDate

6. **inventory_transactions table**
   - Missing column in entity: `inventoryLevelId`
   - Column name mismatch: `reference`/`notes` vs `reason`
   - Impact: Seed will fail due to missing required field

7. **stock_alerts table**
   - Missing column in entity: `alertType`
   - Column name mismatch: `currentQuantity` vs `currentStock`, `reorderLevel` vs `threshold`
   - Impact: Seed will fail when trying to insert stock alerts

---

## 📋 Recommended Actions

### Option 1: Update Migration to Match Entities (Recommended)
Update the migration file to include all fields used by entities and seed:

1. **users**: Add `role` (varchar) and `isActive` (boolean, default true)
2. **orders**: Add `customerId`, `customerPhone`, `notes`, `shippedAt`, `deliveredAt`
3. **purchase_orders**: Rename columns and add `notes`
4. **goods_receipts**: Rename `receivedAt` to `receivedDate`, add `createdAt`
5. **inventory_levels**: Add `lastRestockDate`
6. **inventory_transactions**: Remove `inventoryLevelId`, rename `reason` to `reference` and add `notes`
7. **stock_alerts**: Remove `alertType`, rename columns, add `updatedAt`

### Option 2: Update Entities and Seed to Match Migration
Update entity files and seed data to match the migration schema.

### Option 3: Hybrid Approach
- Keep essential business logic fields in entities
- Update migration to include all entity fields
- Ensure seed data matches final schema

---

## ✅ Conclusion

**Status**: ❌ **INCOMPATIBLE** - Migration and seed data have significant mismatches

**Severity**: 🔴 **CRITICAL** - Seed will fail to run with current migration

**Recommendation**: Update migration file to include all fields used by entities and seed data (Option 1) to ensure proper database initialization and data seeding.

import "reflect-metadata"
import { AppDataSource } from "./data-source.js"

// Entities
export { User } from "./entities/user.entity.js"
export { Product } from "./entities/product.entity.js";
export { InventoryLevel } from "./entities/inventory-level.entity.js";
export { Order, OrderStatus } from "./entities/order.entity.js";
export { OrderItem } from "./entities/order-item.entity.js";
export { Supplier } from "./entities/supplier.entity.js";
export { PurchaseOrder, PurchaseOrderStatus } from "./entities/purchase-order.entity.js";
export { PurchaseOrderItem } from "./entities/purchase-order-item.entity.js";
export { GoodsReceipt } from "./entities/goods-receipt.entity.js";
export { InventoryTransaction, TransactionType } from "./entities/inventory-transaction.entity.js";
export { StockAlert } from "./entities/stock-alert.entity.js";

// Data source
export { AppDataSource };

/**
 * Order-related contracts for Inventory Management System
 */

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  items: OrderItem[]
  status: OrderStatus
  totalAmount: number
  shippingAddress: string
  notes: string
  createdAt: Date
  updatedAt: Date
  shippedAt?: Date
  deliveredAt?: Date
}

export interface CreateOrderRequest {
  customerId: string
  customerName: string
  items: OrderItem[]
  shippingAddress: string
  notes?: string
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
  notes?: string
}

export interface OrderResponse {
  success: boolean
  data?: Order
  error?: string
}

export interface OrderListResponse {
  success: boolean
  data?: Order[]
  total?: number
  page?: number
  pageSize?: number
  error?: string
}

export interface OrderFilters {
  status?: OrderStatus
  customerId?: string
  startDate?: Date
  endDate?: Date
  page?: number
  pageSize?: number
}

export interface OrderSummary {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  pendingOrders: number
  shippedOrders: number
  deliveredOrders: number
}

export interface OrderSummaryResponse {
  success: boolean
  data?: OrderSummary
  error?: string
}

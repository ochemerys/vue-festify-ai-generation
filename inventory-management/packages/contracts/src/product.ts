/**
 * Product-related contracts for Inventory Management System
 */

export interface Product {
  id: string
  sku: string
  name: string
  description: string
  category: string
  price: number
  cost: number
  quantity: number
  reorderLevel: number
  supplier: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductRequest {
  sku: string
  name: string
  description: string
  category: string
  price: number
  cost: number
  quantity: number
  reorderLevel: number
  supplier: string
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  category?: string
  price?: number
  cost?: number
  reorderLevel?: number
  supplier?: string
}

export interface ProductResponse {
  success: boolean
  data?: Product
  error?: string
}

export interface ProductListResponse {
  success: boolean
  data?: Product[]
  total?: number
  page?: number
  pageSize?: number
  error?: string
}

export interface ProductFilters {
  category?: string
  supplier?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  page?: number
  pageSize?: number
}

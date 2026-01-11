/**
 * API Client Service
 * Handles all HTTP communication with the backend
 */

import type { ApiResponse, PaginatedResponse, AuthToken } from '@inventory/contracts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  tokenType: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

export interface CreateProductRequest {
  sku: string
  name: string
  description?: string
  category: string
  supplier: string
  price: number
  cost?: number
  reorderLevel: number
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  category?: string
  supplier?: string
  price?: number
  cost?: number
  reorderLevel?: number
}

export interface Product {
  id: string
  sku: string
  name: string
  description?: string
  category: string
  supplier: string
  price: number
  cost?: number
  reorderLevel: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

class ApiClient {
  private token: string | null = null
  private refreshToken: string | null = null
  private tokenExpiresAt: number | null = null

  constructor() {
    this.restoreToken()
  }

  /**
   * Restore token from localStorage on initialization
   */
  private restoreToken(): void {
    const savedToken = localStorage.getItem('auth_token')
    const savedRefreshToken = localStorage.getItem('refresh_token')
    const savedExpiresAt = localStorage.getItem('token_expires_at')

    if (savedToken) {
      this.token = savedToken
    }
    if (savedRefreshToken) {
      this.refreshToken = savedRefreshToken
    }
    if (savedExpiresAt) {
      this.tokenExpiresAt = parseInt(savedExpiresAt, 10)
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string, refreshToken?: string, expiresIn?: number): void {
    this.token = token
    localStorage.setItem('auth_token', token)

    if (refreshToken) {
      this.refreshToken = refreshToken
      localStorage.setItem('refresh_token', refreshToken)
    }

    if (expiresIn) {
      this.tokenExpiresAt = Date.now() + expiresIn * 1000
      localStorage.setItem('token_expires_at', this.tokenExpiresAt.toString())
    }
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.token
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null
    this.refreshToken = null
    this.tokenExpiresAt = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) return false
    return Date.now() > this.tokenExpiresAt
  }

  /**
   * Make HTTP request with proper headers and error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add existing headers from options
    if (options.headers) {
      if (typeof options.headers === 'object' && !Array.isArray(options.headers)) {
        Object.assign(headers, options.headers)
      }
    }

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      })

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        this.clearToken()
        // Optionally trigger logout event or redirect to login
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
        throw new Error('Unauthorized - please login again')
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error: ApiError = {
          code: errorData.error?.code || 'UNKNOWN_ERROR',
          message: errorData.error?.message || response.statusText,
          details: errorData.error?.details,
        }
        throw error
      }

      return response.json() as Promise<T>
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network request failed')
    }
  }

  // ============================================================================
  // AUTH ENDPOINTS
  // ============================================================================

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (response.success && response.data) {
      this.setToken(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.expiresIn
      )
    }

    return response
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await this.request<ApiResponse<{ message: string }>>('/auth/logout', {
        method: 'POST',
      })
      this.clearToken()
      return response
    } catch (error) {
      // Clear token even if logout fails
      this.clearToken()
      throw error
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<ApiResponse<{ accessToken: string; expiresIn: number }>> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await this.request<ApiResponse<{ accessToken: string; expiresIn: number }>>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      }
    )

    if (response.success && response.data) {
      this.setToken(response.data.accessToken, undefined, response.data.expiresIn)
    }

    return response
  }

  /**
   * Get user permissions
   */
  async getPermissions(): Promise<ApiResponse<{ role: string; permissions: Record<string, boolean> }>> {
    return this.request('/auth/permissions', { method: 'GET' })
  }

  // ============================================================================
  // PRODUCT ENDPOINTS
  // ============================================================================

  /**
   * Get paginated list of products
   */
  async getProducts(
    params: PaginationParams & {
      category?: string
      supplier?: string
      minPrice?: number
      maxPrice?: number
      search?: string
    } = {}
  ): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params.category) queryParams.append('category', params.category)
    if (params.supplier) queryParams.append('supplier', params.supplier)
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString())
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString())
    if (params.search) queryParams.append('search', params.search)

    const queryString = queryParams.toString()
    const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`

    return this.request<PaginatedResponse<Product>>(endpoint, { method: 'GET' })
  }

  /**
   * Get single product by ID
   */
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>(`/api/products/${id}`, { method: 'GET' })
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(sku: string): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>(`/api/products/sku/${sku}`, { method: 'GET' })
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Deactivate product
   */
  async deactivateProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<ApiResponse<Product>>(`/api/products/${id}/deactivate`, {
      method: 'PATCH',
    })
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    await this.request(`/api/products/${id}`, { method: 'DELETE' })
  }

  // ============================================================================
  // INVENTORY ENDPOINTS
  // ============================================================================

  /**
   * Get inventory levels
   */
  async getInventory(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())

    const queryString = queryParams.toString()
    const endpoint = `/api/inventory${queryString ? `?${queryString}` : ''}`

    return this.request<PaginatedResponse<any>>(endpoint, { method: 'GET' })
  }

  /**
   * Get inventory for specific product
   */
  async getProductInventory(productId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/inventory/product/${productId}`, {
      method: 'GET',
    })
  }

  /**
   * Adjust inventory
   */
  async adjustInventory(
    productId: string,
    data: {
      quantity: number
      type: 'IN' | 'OUT' | 'ADJUSTMENT'
      reason: string
      reference?: string
    }
  ): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/inventory/adjust`, {
      method: 'POST',
      body: JSON.stringify({ productId, ...data }),
    })
  }

  // ============================================================================
  // ORDER ENDPOINTS
  // ============================================================================

  /**
   * Get orders
   */
  async getOrders(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())

    const queryString = queryParams.toString()
    const endpoint = `/api/orders${queryString ? `?${queryString}` : ''}`

    return this.request<PaginatedResponse<any>>(endpoint, { method: 'GET' })
  }

  /**
   * Get single order
   */
  async getOrder(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/orders/${id}`, { method: 'GET' })
  }

  /**
   * Create order
   */
  async createOrder(data: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update order
   */
  async updateOrder(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // ============================================================================
  // PURCHASE ORDER ENDPOINTS
  // ============================================================================

  /**
   * Get purchase orders
   */
  async getPurchaseOrders(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())

    const queryString = queryParams.toString()
    const endpoint = `/api/purchase-orders${queryString ? `?${queryString}` : ''}`

    return this.request<PaginatedResponse<any>>(endpoint, { method: 'GET' })
  }

  /**
   * Get single purchase order
   */
  async getPurchaseOrder(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/purchase-orders/${id}`, { method: 'GET' })
  }

  /**
   * Create purchase order
   */
  async createPurchaseOrder(data: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/api/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update purchase order
   */
  async updatePurchaseOrder(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // ============================================================================
  // REPORT ENDPOINTS
  // ============================================================================

  /**
   * Get reports
   */
  async getReports(params: any = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const queryString = queryParams.toString()
    const endpoint = `/api/reports${queryString ? `?${queryString}` : ''}`

    return this.request<ApiResponse<any>>(endpoint, { method: 'GET' })
  }

  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  /**
   * Get all users
   */
  async getUsers(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())

    const queryString = queryParams.toString()
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`

    return this.request<PaginatedResponse<any>>(endpoint, { method: 'GET' })
  }

  /**
   * Get single user
   */
  async getUser(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/users/${id}`, { method: 'GET' })
  }

  /**
   * Create user
   */
  async createUser(data: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/users/${id}/deactivate`, {
      method: 'PATCH',
    })
  }

  /**
   * Reactivate user
   */
  async reactivateUser(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/users/${id}/reactivate`, {
      method: 'PATCH',
    })
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  /**
   * Check API health
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; uptime: number }>> {
    return this.request<ApiResponse<{ status: string; uptime: number }>>('/health', {
      method: 'GET',
    })
  }

  /**
   * Public method to make custom HTTP requests
   * Useful for endpoints not yet implemented in the client
   */
  async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, options)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

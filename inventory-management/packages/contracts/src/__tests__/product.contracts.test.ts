import { describe, it, expect } from 'vitest'
import {
  ProductSchema,
  CreateProductRequestSchema,
  UpdateProductRequestSchema,
  ProductFiltersSchema,
} from '../product'

describe('Product Contract Validation', () => {
  describe('ProductSchema', () => {
    it('should validate a valid product', () => {
      const validProduct = {
        id: 'prod_123',
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        category: 'Electronics',
        price: 29.99,
        cost: 12.50,
        reorderLevel: 10,
        supplier: 'Tech Supplies Inc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = ProductSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.sku).toBe('PROD-001')
      }
    })

    it('should reject invalid SKU format', () => {
      const invalidProduct = {
        id: 'prod_123',
        sku: '', // Empty SKU
        name: 'Wireless Mouse',
        category: 'Electronics',
        price: 29.99,
        cost: 12.50,
        supplier: 'Tech Supplies Inc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = ProductSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('should reject negative price', () => {
      const invalidProduct = {
        id: 'prod_123',
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        category: 'Electronics',
        price: -10.00, // Negative price
        cost: 12.50,
        supplier: 'Tech Supplies Inc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = ProductSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })
  })

  describe('CreateProductRequestSchema', () => {
    it('should validate a valid create request', () => {
      const validRequest = {
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        category: 'Electronics',
        price: 29.99,
        cost: 12.50,
        reorderLevel: 10,
        supplier: 'Tech Supplies Inc',
      }

      const result = CreateProductRequestSchema.safeParse(validRequest)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const invalidRequest = {
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        // Missing category, price, cost, supplier
      }

      const result = CreateProductRequestSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })

    it('should accept optional description', () => {
      const validRequest = {
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        category: 'Electronics',
        price: 29.99,
        cost: 12.50,
        supplier: 'Tech Supplies Inc',
        // No description
      }

      const result = CreateProductRequestSchema.safeParse(validRequest)
      expect(result.success).toBe(true)
    })
  })

  describe('UpdateProductRequestSchema', () => {
    it('should validate a valid update request', () => {
      const validRequest = {
        name: 'Updated Name',
        price: 34.99,
      }

      const result = UpdateProductRequestSchema.safeParse(validRequest)
      expect(result.success).toBe(true)
    })

    it('should accept partial updates', () => {
      const validRequest = {
        price: 34.99,
        // Only updating price
      }

      const result = UpdateProductRequestSchema.safeParse(validRequest)
      expect(result.success).toBe(true)
    })

    it('should reject invalid price', () => {
      const invalidRequest = {
        price: -10.00, // Negative price
      }

      const result = UpdateProductRequestSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })
  })

  describe('ProductFiltersSchema', () => {
    it('should validate valid filters', () => {
      const validFilters = {
        category: 'Electronics',
        supplier: 'Tech Supplies Inc',
        minPrice: 10.00,
        maxPrice: 50.00,
        search: 'mouse',
        page: 1,
        pageSize: 10,
      }

      const result = ProductFiltersSchema.safeParse(validFilters)
      expect(result.success).toBe(true)
    })

    it('should provide default values', () => {
      const minimalFilters = {}

      const result = ProductFiltersSchema.safeParse(minimalFilters)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.pageSize).toBe(10)
      }
    })

    it('should reject invalid page number', () => {
      const invalidFilters = {
        page: 0, // Must be positive
      }

      const result = ProductFiltersSchema.safeParse(invalidFilters)
      expect(result.success).toBe(false)
    })

    it('should reject invalid page size', () => {
      const invalidFilters = {
        pageSize: -1, // Must be positive
      }

      const result = ProductFiltersSchema.safeParse(invalidFilters)
      expect(result.success).toBe(false)
    })
  })
})
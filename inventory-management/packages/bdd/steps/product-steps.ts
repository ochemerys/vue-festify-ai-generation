import { Given, When, Then, Before, After, DataTable } from '@cucumber/cucumber'
import { expect } from 'chai'
import { CustomWorld } from './world.js'

// Hooks
Before(async function (this: CustomWorld) {
  // Clear test data before each scenario
  this.clearData()
})

After(async function (this: CustomWorld) {
  // Cleanup after each scenario
  // In a real scenario, you might want to clean up test data from the database
})

// Background Steps
Given('the system is initialized', async function (this: CustomWorld) {
  // Verify the API is accessible
  try {
    const response = await this.apiClient.get('/health')
    expect(response.status).to.equal(200)
  } catch (error) {
    throw new Error('System is not initialized or API is not accessible')
  }
})

Given('I am logged in as an admin user', async function (this: CustomWorld) {
  // Mock authentication - in real scenario, this would call login endpoint
  this.authToken = 'mock-admin-token'
  this.currentUser = {
    id: 'admin-1',
    email: 'admin@example.com',
    role: 'ADMIN',
  }
})

Given('I am logged in as an inventory staff member', async function (this: CustomWorld) {
  // Mock authentication for staff
  this.authToken = 'mock-staff-token'
  this.currentUser = {
    id: 'staff-1',
    email: 'staff@example.com',
    role: 'STAFF',
  }
})

// Product Creation Steps
When('I create a product with the following details:', async function (this: CustomWorld, dataTable: DataTable) {
  const productData: Record<string, any> = {}
  
  dataTable.rows().forEach(([field, value]) => {
    // Convert field names to camelCase
    const fieldName = field.charAt(0).toLowerCase() + field.slice(1).replace(/\s+/g, '')
    
    // Parse numeric values
    if (field === 'Price' || field === 'Cost') {
      productData[fieldName] = parseFloat(value)
    } else if (field === 'Reorder Level') {
      productData['reorderLevel'] = parseInt(value)
    } else {
      productData[fieldName] = value
    }
  })

  try {
    this.response = await this.apiClient.post('/api/products', productData)
    if (this.response.status === 201 && this.response.data) {
      this.storeData('createdProduct', this.response.data)
    }
  } catch (error) {
    this.setError(error)
  }
})

When('I attempt to create a product with SKU {string}', async function (this: CustomWorld, sku: string) {
  const productData = {
    sku,
    name: 'Test Product',
    category: 'Test',
    price: 10.0,
    cost: 5.0,
    supplier: 'Test Supplier',
  }

  try {
    this.response = await this.apiClient.post('/api/products', productData)
  } catch (error) {
    this.setError(error)
  }
})

Then('the product should be created successfully', function (this: CustomWorld) {
  expect(this.response?.status).to.equal(201)
  expect(this.response?.data).to.exist
})

Then('the product should have SKU {string}', function (this: CustomWorld, expectedSku: string) {
  const product = this.getData('createdProduct') || this.response?.data
  expect(product).to.exist
  expect(product.sku).to.equal(expectedSku)
})

Then('the product should be marked as active', function (this: CustomWorld) {
  const product = this.getData('createdProduct') || this.response?.data
  expect(product).to.exist
  expect(product.isActive).to.be.true
})

// Product Update Steps
Given('a product exists with SKU {string}', async function (this: CustomWorld, sku: string) {
  // First, try to create the product
  const productData = {
    sku,
    name: 'Test Product',
    description: 'Test Description',
    category: 'Test',
    price: 29.99,
    cost: 15.0,
    supplier: 'Test Supplier',
    reorderLevel: 10,
  }

  const response = await this.apiClient.post('/api/products', productData)
  if (response.status === 201) {
    this.storeData('existingProduct', response.data)
  } else {
    // If creation fails, try to fetch it (might already exist)
    const getResponse = await this.apiClient.get(`/api/products/sku/${sku}`)
    if (getResponse.status === 200) {
      this.storeData('existingProduct', getResponse.data)
    }
  }
})

Given('a product exists with SKU {string} and name {string}', async function (this: CustomWorld, sku: string, name: string) {
  const productData = {
    sku,
    name,
    description: 'Test Description',
    category: 'Test',
    price: 29.99,
    cost: 15.0,
    supplier: 'Test Supplier',
    reorderLevel: 10,
  }

  const response = await this.apiClient.post('/api/products', productData)
  if (response.status === 201) {
    this.storeData('existingProduct', response.data)
  }
})

When('I update the product with:', async function (this: CustomWorld, dataTable: DataTable) {
  const existingProduct = this.getData('existingProduct')
  expect(existingProduct).to.exist

  const updateData: Record<string, any> = {}
  
  dataTable.rows().forEach(([field, value]) => {
    const fieldName = field.charAt(0).toLowerCase() + field.slice(1)
    
    if (field === 'Price') {
      updateData.price = parseFloat(value)
    } else if (field === 'Name') {
      updateData.name = value
    } else {
      updateData[fieldName] = value
    }
  })

  try {
    this.response = await this.apiClient.put(`/api/products/${existingProduct.id}`, updateData)
  } catch (error) {
    this.setError(error)
  }
})

Then('the product should be updated successfully', function (this: CustomWorld) {
  expect(this.response?.status).to.equal(200)
})

Then('the product price should be {float}', function (this: CustomWorld, expectedPrice: number) {
  const product = this.response?.data
  expect(product).to.exist
  expect(product.price).to.equal(expectedPrice)
})

Then('the product name should be {string}', function (this: CustomWorld, expectedName: string) {
  const product = this.response?.data
  expect(product).to.exist
  expect(product.name).to.equal(expectedName)
})

// Product Retrieval Steps
When('I search for product with SKU {string}', async function (this: CustomWorld, sku: string) {
  try {
    this.response = await this.apiClient.get(`/api/products/sku/${sku}`)
  } catch (error) {
    this.setError(error)
  }
})

Then('I should find the product', function (this: CustomWorld) {
  expect(this.response?.status).to.equal(200)
  expect(this.response?.data).to.exist
})

// Product Listing Steps
Given('the following products exist:', async function (this: CustomWorld, dataTable: DataTable) {
  const products: any[] = []
  
  for (const row of dataTable.rows()) {
    const [sku, name, category, price] = row
    const productData = {
      sku,
      name,
      category,
      price: parseFloat(price),
      cost: parseFloat(price) * 0.5,
      supplier: 'Test Supplier',
      reorderLevel: 10,
    }

    const response = await this.apiClient.post('/api/products', productData)
    if (response.status === 201) {
      products.push(response.data)
    }
  }

  this.storeData('createdProducts', products)
})

When('I retrieve all active products', async function (this: CustomWorld) {
  try {
    this.response = await this.apiClient.get('/api/products')
  } catch (error) {
    this.setError(error)
  }
})

Then('I should get {int} products', function (this: CustomWorld, expectedCount: number) {
  expect(this.response?.status).to.equal(200)
  const products = this.response?.data
  expect(products).to.be.an('array')
  expect(products.length).to.be.at.least(expectedCount)
})

Then('the products should include {string}', function (this: CustomWorld, productName: string) {
  const products = this.response?.data
  expect(products).to.be.an('array')
  const found = products.some((p: any) => p.name === productName)
  expect(found).to.be.true
})

// Product Filtering Steps
When('I filter products by category {string}', async function (this: CustomWorld, category: string) {
  try {
    this.response = await this.apiClient.get('/api/products', {
      params: { category },
    })
  } catch (error) {
    this.setError(error)
  }
})

When('I filter products with price between {int} and {int}', async function (this: CustomWorld, minPrice: number, maxPrice: number) {
  try {
    this.response = await this.apiClient.get('/api/products', {
      params: { minPrice, maxPrice },
    })
  } catch (error) {
    this.setError(error)
  }
})

When('I search for products with name containing {string}', async function (this: CustomWorld, searchTerm: string) {
  try {
    this.response = await this.apiClient.get('/api/products', {
      params: { search: searchTerm },
    })
  } catch (error) {
    this.setError(error)
  }
})

// Product Deactivation Steps
When('I deactivate the product', async function (this: CustomWorld) {
  const existingProduct = this.getData('existingProduct')
  expect(existingProduct).to.exist

  try {
    this.response = await this.apiClient.patch(`/api/products/${existingProduct.id}/deactivate`)
  } catch (error) {
    this.setError(error)
  }
})

Then('the product should be marked as inactive', function (this: CustomWorld) {
  expect(this.response?.status).to.equal(200)
  const product = this.response?.data
  expect(product).to.exist
  expect(product.isActive).to.be.false
})

Then('the product should not appear in active product listings', async function (this: CustomWorld) {
  const existingProduct = this.getData('existingProduct')
  const listResponse = await this.apiClient.get('/api/products')
  
  const products = listResponse.data
  const found = products.some((p: any) => p.id === existingProduct.id && p.isActive)
  expect(found).to.be.false
})

// Error Handling Steps
Then('the operation should fail', function (this: CustomWorld) {
  expect(this.response?.status).to.be.at.least(400)
})

Then('I should receive an error message {string}', function (this: CustomWorld, expectedMessage: string) {
  const errorData = this.response?.data
  expect(errorData).to.exist
  expect(errorData.error || errorData.message).to.include(expectedMessage)
})

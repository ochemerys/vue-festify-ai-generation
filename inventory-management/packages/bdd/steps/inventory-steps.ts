import { Given, When, Then, DataTable } from '@cucumber/cucumber'
import { expect } from 'chai'
import { CustomWorld } from './world.js'

// Background Steps
Given('a product {string} with SKU {string} exists', async function (this: CustomWorld, productName: string, sku: string) {
  const productData = {
    sku,
    name: productName,
    description: 'Test product for inventory tracking',
    category: 'Test',
    price: 29.99,
    cost: 15.0,
    supplier: 'Test Supplier',
    reorderLevel: 10,
  }

  const response = await this.apiClient.post('/api/products', productData)
  if (response.status === 201) {
    this.storeData('currentProduct', response.data)
  } else {
    // Try to fetch if already exists
    const getResponse = await this.apiClient.get(`/api/products/sku/${sku}`)
    if (getResponse.status === 200) {
      this.storeData('currentProduct', getResponse.data)
    }
  }
})

Given('the product has {int} current quantity', async function (this: CustomWorld, quantity: number) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  // Set initial inventory level
  const inventoryData = {
    productId: product.id,
    currentQuantity: quantity,
    reservedQuantity: 0,
    availableQuantity: quantity,
  }

  await this.apiClient.post('/api/inventory/levels', inventoryData)
  this.storeData('currentQuantity', quantity)
})

Given('the product has:', async function (this: CustomWorld, dataTable: DataTable) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  const inventoryData: Record<string, number> = {}
  
  dataTable.rows().forEach(([field, value]) => {
    const fieldName = field.replace(/\s+/g, '')
    const camelCaseField = fieldName.charAt(0).toLowerCase() + fieldName.slice(1)
    inventoryData[camelCaseField] = parseInt(value)
  })

  const payload = {
    productId: product.id,
    currentQuantity: inventoryData.currentQuantity || 0,
    reservedQuantity: inventoryData.reservedQuantity || 0,
    availableQuantity: (inventoryData.currentQuantity || 0) - (inventoryData.reservedQuantity || 0),
  }

  await this.apiClient.post('/api/inventory/levels', payload)
  this.storeData('inventoryLevel', payload)
})

// Transaction Recording Steps
When('I record a purchase transaction:', async function (this: CustomWorld, dataTable: DataTable) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  const transactionData: Record<string, any> = {
    productId: product.id,
    type: 'PURCHASE',
  }

  dataTable.rows().forEach(([field, value]) => {
    if (field === 'Quantity') {
      transactionData.quantity = parseInt(value)
    } else if (field === 'Reference') {
      transactionData.reference = value
    } else if (field === 'Notes') {
      transactionData.notes = value
    }
  })

  try {
    this.response = await this.apiClient.post('/api/inventory/transactions', transactionData)
  } catch (error) {
    this.setError(error)
  }
})

When('I record a sale transaction:', async function (this: CustomWorld, dataTable: DataTable) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  const transactionData: Record<string, any> = {
    productId: product.id,
    type: 'SALE',
  }

  dataTable.rows().forEach(([field, value]) => {
    if (field === 'Quantity') {
      transactionData.quantity = parseInt(value)
    } else if (field === 'Reference') {
      transactionData.reference = value
    } else if (field === 'Notes') {
      transactionData.notes = value
    }
  })

  try {
    this.response = await this.apiClient.post('/api/inventory/transactions', transactionData)
  } catch (error) {
    this.setError(error)
  }
})

When('I record an adjustment transaction:', async function (this: CustomWorld, dataTable: DataTable) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  const transactionData: Record<string, any> = {
    productId: product.id,
    type: 'ADJUSTMENT',
  }

  dataTable.rows().forEach(([field, value]) => {
    if (field === 'Quantity') {
      transactionData.quantity = parseInt(value)
    } else if (field === 'Reference') {
      transactionData.reference = value
    } else if (field === 'Notes') {
      transactionData.notes = value
    }
  })

  try {
    this.response = await this.apiClient.post('/api/inventory/transactions', transactionData)
  } catch (error) {
    this.setError(error)
  }
})

When('I record a damage transaction:', async function (this: CustomWorld, dataTable: DataTable) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  const transactionData: Record<string, any> = {
    productId: product.id,
    type: 'DAMAGE',
  }

  dataTable.rows().forEach(([field, value]) => {
    if (field === 'Quantity') {
      transactionData.quantity = parseInt(value)
    } else if (field === 'Reference') {
      transactionData.reference = value
    } else if (field === 'Notes') {
      transactionData.notes = value
    }
  })

  try {
    this.response = await this.apiClient.post('/api/inventory/transactions', transactionData)
  } catch (error) {
    this.setError(error)
  }
})

When('I record a return transaction:', async function (this: CustomWorld, dataTable: DataTable) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  const transactionData: Record<string, any> = {
    productId: product.id,
    type: 'RETURN',
  }

  dataTable.rows().forEach(([field, value]) => {
    if (field === 'Quantity') {
      transactionData.quantity = parseInt(value)
    } else if (field === 'Reference') {
      transactionData.reference = value
    } else if (field === 'Notes') {
      transactionData.notes = value
    }
  })

  try {
    this.response = await this.apiClient.post('/api/inventory/transactions', transactionData)
  } catch (error) {
    this.setError(error)
  }
})

Then('the transaction should be recorded successfully', function (this: CustomWorld) {
  expect(this.response?.status).to.equal(201)
  expect(this.response?.data).to.exist
})

Then('the product quantity should be {int}', async function (this: CustomWorld, expectedQuantity: number) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  const response = await this.apiClient.get(`/api/inventory/levels/${product.id}`)
  expect(response.status).to.equal(200)
  expect(response.data.currentQuantity).to.equal(expectedQuantity)
})

Then('the transaction type should be {string}', function (this: CustomWorld, expectedType: string) {
  const transaction = this.response?.data
  expect(transaction).to.exist
  expect(transaction.type).to.equal(expectedType)
})

// Transaction History Steps
Given('the product has the following transactions:', async function (this: CustomWorld, dataTable: DataTable) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  for (const row of dataTable.rows()) {
    const [type, quantity, reference] = row
    const transactionData = {
      productId: product.id,
      type,
      quantity: parseInt(quantity),
      reference,
    }

    await this.apiClient.post('/api/inventory/transactions', transactionData)
  }
})

When('I retrieve the transaction history for the product', async function (this: CustomWorld) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  try {
    this.response = await this.apiClient.get(`/api/inventory/transactions/product/${product.id}`)
  } catch (error) {
    this.setError(error)
  }
})

Then('I should see {int} transactions', function (this: CustomWorld) {
  expect(this.response?.status).to.equal(200)
  const transactions = this.response?.data
  expect(transactions).to.be.an('array')
  expect(transactions.length).to.equal(3)
})

Then('the transactions should be in chronological order', function (this: CustomWorld) {
  const transactions = this.response?.data
  expect(transactions).to.be.an('array')
  
  for (let i = 1; i < transactions.length; i++) {
    const prevDate = new Date(transactions[i - 1].createdAt)
    const currDate = new Date(transactions[i].createdAt)
    expect(prevDate.getTime()).to.be.at.most(currDate.getTime())
  }
})

Then('the first transaction should be {string}', function (this: CustomWorld, expectedType: string) {
  const transactions = this.response?.data
  expect(transactions).to.be.an('array')
  expect(transactions[0].type).to.equal(expectedType)
})

// Available Quantity Steps
When('I check the available quantity', async function (this: CustomWorld) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  try {
    this.response = await this.apiClient.get(`/api/inventory/levels/${product.id}`)
  } catch (error) {
    this.setError(error)
  }
})

Then('the available quantity should be {int}', function (this: CustomWorld, expectedQuantity: number) {
  expect(this.response?.status).to.equal(200)
  const inventoryLevel = this.response?.data
  expect(inventoryLevel.availableQuantity).to.equal(expectedQuantity)
})

// Reservation Steps
When('I reserve {int} units for an order', async function (this: CustomWorld, quantity: number) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  try {
    this.response = await this.apiClient.post(`/api/inventory/reserve`, {
      productId: product.id,
      quantity,
    })
  } catch (error) {
    this.setError(error)
  }
})

Then('the reserved quantity should be {int}', async function (this: CustomWorld, expectedQuantity: number) {
  const product = this.getData('currentProduct')
  const response = await this.apiClient.get(`/api/inventory/levels/${product.id}`)
  expect(response.data.reservedQuantity).to.equal(expectedQuantity)
})

Then('the current quantity should remain {int}', async function (this: CustomWorld, expectedQuantity: number) {
  const product = this.getData('currentProduct')
  const response = await this.apiClient.get(`/api/inventory/levels/${product.id}`)
  expect(response.data.currentQuantity).to.equal(expectedQuantity)
})

When('I release the reserved inventory', async function (this: CustomWorld) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  try {
    this.response = await this.apiClient.post(`/api/inventory/release`, {
      productId: product.id,
    })
  } catch (error) {
    this.setError(error)
  }
})

// Error Cases
When('I attempt to sell {int} units', async function (this: CustomWorld, quantity: number) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  try {
    this.response = await this.apiClient.post('/api/inventory/transactions', {
      productId: product.id,
      type: 'SALE',
      quantity,
      reference: 'TEST-SALE',
    })
  } catch (error) {
    this.setError(error)
  }
})

// Stock Alerts
When('I check for low stock alerts', async function (this: CustomWorld) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  try {
    this.response = await this.apiClient.get(`/api/inventory/alerts/product/${product.id}`)
  } catch (error) {
    this.setError(error)
  }
})

When('I check for stock alerts', async function (this: CustomWorld) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  try {
    this.response = await this.apiClient.get(`/api/inventory/alerts/product/${product.id}`)
  } catch (error) {
    this.setError(error)
  }
})

Then('a low stock alert should be generated', function (this: CustomWorld) {
  expect(this.response?.status).to.equal(200)
  const alerts = this.response?.data
  expect(alerts).to.be.an('array')
  const lowStockAlert = alerts.find((a: any) => a.alertType === 'LOW_STOCK')
  expect(lowStockAlert).to.exist
})

Then('the alert should indicate {string}', function (this: CustomWorld, expectedMessage: string) {
  const alerts = this.response?.data
  expect(alerts).to.be.an('array')
  expect(alerts.length).to.be.greaterThan(0)
})

Then('an out of stock alert should be generated', function (this: CustomWorld) {
  expect(this.response?.status).to.equal(200)
  const alerts = this.response?.data
  expect(alerts).to.be.an('array')
  const outOfStockAlert = alerts.find((a: any) => a.alertType === 'OUT_OF_STOCK')
  expect(outOfStockAlert).to.exist
})

Then('the alert should be marked as critical', function (this: CustomWorld) {
  const alerts = this.response?.data
  expect(alerts).to.be.an('array')
  expect(alerts.length).to.be.greaterThan(0)
})

// Multi-location inventory (placeholder for future implementation)
Given('the product has inventory at multiple locations:', async function (this: CustomWorld, dataTable: DataTable) {
  // This would be implemented when multi-location support is added
  this.storeData('multiLocationInventory', dataTable.rows())
})

When('I check total inventory', async function (this: CustomWorld) {
  const product = this.getData('currentProduct')
  expect(product).to.exist

  try {
    this.response = await this.apiClient.get(`/api/inventory/levels/${product.id}/total`)
  } catch (error) {
    this.setError(error)
  }
})

Then('the total quantity should be {int}', function (this: CustomWorld, expectedTotal: number) {
  expect(this.response?.status).to.equal(200)
  const data = this.response?.data
  expect(data.totalQuantity).to.equal(expectedTotal)
})

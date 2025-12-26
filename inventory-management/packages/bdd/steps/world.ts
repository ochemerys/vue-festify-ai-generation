import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber'
import axios, { AxiosInstance, AxiosResponse } from 'axios'

export interface TestContext {
  apiClient: AxiosInstance
  response?: AxiosResponse
  error?: any
  authToken?: string
  currentUser?: any
  testData: Map<string, any>
}

export class CustomWorld extends World implements TestContext {
  apiClient: AxiosInstance
  response?: AxiosResponse
  error?: any
  authToken?: string
  currentUser?: any
  testData: Map<string, any>

  constructor(options: IWorldOptions) {
    super(options)
    
    // Initialize API client
    this.apiClient = axios.create({
      baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
      timeout: 5000,
      validateStatus: () => true, // Don't throw on any status code
    })

    // Initialize test data storage
    this.testData = new Map()

    // Add request interceptor for auth
    this.apiClient.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`
      }
      return config
    })
  }

  // Helper methods
  setResponse(response: AxiosResponse) {
    this.response = response
  }

  setError(error: any) {
    this.error = error
  }

  getResponseData() {
    return this.response?.data
  }

  getResponseStatus() {
    return this.response?.status
  }

  storeData(key: string, value: any) {
    this.testData.set(key, value)
  }

  getData(key: string) {
    return this.testData.get(key)
  }

  clearData() {
    this.testData.clear()
    this.response = undefined
    this.error = undefined
  }
}

setWorldConstructor(CustomWorld)

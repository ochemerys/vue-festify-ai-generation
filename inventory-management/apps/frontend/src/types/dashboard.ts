/**
 * Dashboard Component Types
 * 
 * Type definitions for all dashboard-related components and data structures.
 * Ensures type safety across the application.
 */

/**
 * Navigation item for sidebar
 */
export interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
}

/**
 * User profile information
 */
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'staff'
}

/**
 * Metric card data
 */
export interface Metric {
  id: string
  label: string
  value: number | string
  trend?: number
  trendDirection?: 'up' | 'down' | 'neutral'
  isUrgent?: boolean
  loading?: boolean
}

/**
 * Recent order data
 */
export interface Order {
  id: string
  orderNumber: string
  customer: string
  status: 'pending' | 'processing' | 'fulfilled' | 'cancelled'
  total: number
  date: string
}

/**
 * Quick action item
 */
export interface QuickAction {
  id: string
  label: string
  icon: string
  description?: string
}

/**
 * Dashboard metrics aggregated data
 */
export interface DashboardMetrics {
  totalProducts: number
  lowStockCount: number
  criticalStockCount: number
  pendingOrders: number
  pendingPurchaseOrders: number
  totalInventoryValue: number
  fulfillmentRate: number
  supplierPerformance: number
}

/**
 * Low stock alert
 */
export interface LowStockAlert {
  productId: string
  productName: string
  currentQuantity: number
  reorderLevel: number
  sku: string
}

/**
 * Overdue order alert
 */
export interface OverdueOrderAlert {
  orderId: string
  orderNumber: string
  customer: string
  daysOverdue: number
  total: number
}

/**
 * Dashboard page state
 */
export interface DashboardState {
  isLoading: boolean
  error: string | null
  metrics: Metric[]
  recentOrders: Order[]
  quickActions: QuickAction[]
  lowStockAlerts: LowStockAlert[]
  overdueOrderAlerts: OverdueOrderAlert[]
}

/**
 * Responsive breakpoint type
 */
export type Breakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop'

/**
 * Breakpoint configuration
 */
export interface BreakpointConfig {
  mobile: number // < 640px
  tablet: number // 640px - 1024px
  laptop: number // 1024px - 1280px
  desktop: number // > 1280px
}

/**
 * Sidebar state
 */
export interface SidebarState {
  isCollapsed: boolean
  isMobileOpen: boolean
  currentBreakpoint: Breakpoint
}

/**
 * Header state
 */
export interface HeaderState {
  isUserMenuOpen: boolean
  isNotificationMenuOpen: boolean
  notificationCount: number
}

/**
 * Notification item
 */
export interface Notification {
  id: string | number
  message: string
  time: string
  read: boolean
  type?: 'info' | 'warning' | 'error' | 'success'
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * Sort state
 */
export interface SortState {
  field: string
  order: 'asc' | 'desc'
}

/**
 * Filter state
 */
export interface FilterState {
  search?: string
  status?: string
  dateRange?: {
    start: string
    end: string
  }
  [key: string]: any
}

/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  key: keyof T | string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T) => string | number
}

/**
 * Status badge configuration
 */
export interface StatusBadge {
  status: string
  label: string
  color: 'green' | 'blue' | 'yellow' | 'red' | 'gray'
  bgColor: string
  textColor: string
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  dismissible?: boolean
}

/**
 * Loading skeleton configuration
 */
export interface SkeletonConfig {
  lines?: number
  width?: string
  height?: string
  animated?: boolean
}

/**
 * Component props base interface
 */
export interface ComponentProps {
  loading?: boolean
  error?: string | null
  disabled?: boolean
}

/**
 * Component emits base interface
 */
export interface ComponentEmits {
  (e: 'loading', value: boolean): void
  (e: 'error', value: string | null): void
}

/**
 * Trend indicator configuration
 */
export interface TrendIndicator {
  value: number
  direction: 'up' | 'down' | 'neutral'
  color: string
  icon: string
}

/**
 * Card styling configuration
 */
export interface CardConfig {
  variant?: 'default' | 'urgent' | 'success' | 'warning'
  shadow?: 'sm' | 'md' | 'lg'
  padding?: 'sm' | 'md' | 'lg'
  rounded?: 'sm' | 'md' | 'lg'
  border?: boolean
  borderColor?: string
}

/**
 * Dropdown menu item
 */
export interface DropdownItem {
  id: string
  label: string
  icon?: string
  href?: string
  onClick?: () => void
  divider?: boolean
  disabled?: boolean
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string
  path?: string
  current?: boolean
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea'
  required?: boolean
  placeholder?: string
  value?: any
  error?: string
  helpText?: string
  options?: Array<{ label: string; value: any }>
}

/**
 * Form state
 */
export interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
}

/**
 * Toast notification
 */
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Modal configuration
 */
export interface ModalConfig {
  title: string
  content: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  actions?: Array<{
    label: string
    variant?: 'primary' | 'secondary' | 'danger'
    onClick: () => void
  }>
}

/**
 * Responsive grid configuration
 */
export interface GridConfig {
  cols?: {
    mobile: number
    tablet: number
    laptop: number
    desktop: number
  }
  gap?: 'sm' | 'md' | 'lg'
  autoFlow?: 'row' | 'column'
}

/**
 * Icon configuration
 */
export interface IconConfig {
  name: string
  size?: number
  color?: string
  strokeWidth?: number
  ariaHidden?: boolean
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration?: number
  delay?: number
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'
  repeat?: number
}

/**
 * Accessibility configuration
 */
export interface A11yConfig {
  ariaLabel?: string
  ariaDescribedBy?: string
  ariaLabelledBy?: string
  role?: string
  tabIndex?: number
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  dangerColor: string
  warningColor: string
  successColor: string
  infoColor: string
  darkMode?: boolean
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  interceptors?: {
    request?: (config: any) => any
    response?: (response: any) => any
    error?: (error: any) => any
  }
}

/**
 * Store configuration
 */
export interface StoreConfig {
  cacheTimeout?: number
  persistState?: boolean
  devtools?: boolean
}

/**
 * Router configuration
 */
export interface RouterConfig {
  mode?: 'hash' | 'history'
  base?: string
  scrollBehavior?: (to: any, from: any, savedPosition: any) => any
}

/**
 * Application configuration
 */
export interface AppConfig {
  name: string
  version: string
  environment: 'development' | 'staging' | 'production'
  apiUrl: string
  theme: ThemeConfig
  api: ApiClientConfig
  store: StoreConfig
  router: RouterConfig
}

/**
 * Type guards
 */
export const isMetric = (value: any): value is Metric => {
  return (
    typeof value === 'object' &&
    'id' in value &&
    'label' in value &&
    'value' in value
  )
}

export const isOrder = (value: any): value is Order => {
  return (
    typeof value === 'object' &&
    'id' in value &&
    'orderNumber' in value &&
    'customer' in value &&
    'status' in value
  )
}

export const isNavItem = (value: any): value is NavItem => {
  return (
    typeof value === 'object' &&
    'id' in value &&
    'label' in value &&
    'icon' in value &&
    'path' in value
  )
}

export const isUser = (value: any): value is User => {
  return (
    typeof value === 'object' &&
    'id' in value &&
    'name' in value &&
    'email' in value
  )
}

/**
 * Utility types
 */
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Readonly<T> = {
  readonly [K in keyof T]: T[K]
}
export type Partial<T> = {
  [K in keyof T]?: T[K]
}
export type Record<K extends string | number | symbol, T> = {
  [P in K]: T
}

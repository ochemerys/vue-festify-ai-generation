import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from './pages/DashboardPage.vue'
import ProductsListPage from './pages/ProductsListPage.vue'
import InventoryListPage from './pages/InventoryListPage.vue'
import OrderListPage from './pages/OrderListPage.vue'
import PurchaseOrderListPage from './pages/PurchaseOrderListPage.vue'
import ReportsPage from './pages/ReportsPage.vue'
import LoginPage from './pages/LoginPage.vue'
import UsersManagementPage from './pages/UsersManagementPage.vue'
import UserProfilePage from './pages/UserProfilePage.vue'
import UnauthorizedPage from './pages/UnauthorizedPage.vue'
import ForgotPasswordPage from './pages/ForgotPasswordPage.vue'
import SignupPage from './pages/SignupPage.vue'
import { useAuthStore } from './stores/authStore'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardPage
  },
  {
    path: '/products',
    name: 'Products',
    component: ProductsListPage
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: InventoryListPage
  },
  {
    path: '/orders',
    name: 'Orders',
    component: OrderListPage
  },
  {
    path: '/purchase-orders',
    name: 'PurchaseOrders',
    component: PurchaseOrderListPage
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsPage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordPage
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupPage
  },
  {
    path: '/users',
    name: 'Users',
    component: UsersManagementPage
  },
  {
    path: '/users/new',
    name: 'UserCreate',
    component: UserProfilePage
  },
  {
    path: '/users/:id',
    name: 'UserEdit',
    component: UserProfilePage
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: UnauthorizedPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard to protect pages
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const isLoginPage = to.name === 'Login'
  const isForgotPassword = to.name === 'ForgotPassword'
  const isSignup = to.name === 'Signup'
  const isUnauthorizedPage = to.name === 'Unauthorized'

  // Allow access to public pages without authentication
  if (isLoginPage || isForgotPassword || isSignup || isUnauthorizedPage) {
    next()
    return
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    next({ name: 'Login' })
    return
  }

  // Check if user is authorized (active)
  if (!authStore.isUserAuthorized()) {
    next({ name: 'Unauthorized' })
    return
  }

  // Allow access to protected routes
  next()
})

export default router
import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from './pages/DashboardPage.vue'
import ProductsListPage from './pages/ProductsListPage.vue'
import InventoryListPage from './pages/InventoryListPage.vue'
import OrderListPage from './pages/OrderListPage.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
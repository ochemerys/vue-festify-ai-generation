import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from './pages/DashboardPage.vue'
import ProductsListPage from './pages/ProductsListPage.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
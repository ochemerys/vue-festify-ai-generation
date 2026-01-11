import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER'
  active: boolean
}

export const useUserStore = defineStore('user', () => {
  const selectedUser = ref<User | null>(null)

  const setSelectedUser = (user: User | null) => {
    selectedUser.value = user
  }

  const getSelectedUser = () => {
    return selectedUser.value
  }

  const clearSelectedUser = () => {
    selectedUser.value = null
  }

  return {
    selectedUser,
    setSelectedUser,
    getSelectedUser,
    clearSelectedUser
  }
})

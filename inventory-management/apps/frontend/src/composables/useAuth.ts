import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Mock users
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
  },
  {
    id: '2',
    email: 'manager@example.com',
    firstName: 'Manager',
    lastName: 'User',
    role: 'MANAGER',
  },
  {
    id: '3',
    email: 'staff@example.com',
    firstName: 'Staff',
    lastName: 'User',
    role: 'STAFF',
  },
]

/**
 * Mock login function
 * Will be replaced with real API call: apiClient.login()
 */
async function mockLogin(email: string, password: string) {
  await new Promise(resolve => setTimeout(resolve, 500))

  const user = MOCK_USERS.find(u => u.email === email)
  if (!user) {
    throw new Error('User not found')
  }

  if (password.length < 8) {
    throw new Error('Invalid password')
  }

  return {
    success: true,
    data: {
      accessToken: `mock-token-${user.id}-${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: 86400,
      user,
    },
  }
}

/**
 * Mock logout function
 * Will be replaced with real API call: apiClient.logout()
 */
async function mockLogout() {
  await new Promise(resolve => setTimeout(resolve, 300))
  return { success: true }
}

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      mockLogin(email, password),
    onSuccess: () => {
      // Clear all queries on login to fetch fresh data
      queryClient.clear()
    },
  })

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => mockLogout(),
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear()
    },
  })

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
  }
}

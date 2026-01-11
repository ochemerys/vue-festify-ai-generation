import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed } from 'vue'

// Mock users data
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    email: 'manager@example.com',
    firstName: 'Manager',
    lastName: 'User',
    role: 'MANAGER',
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    email: 'staff@example.com',
    firstName: 'Staff',
    lastName: 'User',
    role: 'STAFF',
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    email: 'viewer@example.com',
    firstName: 'Viewer',
    lastName: 'User',
    role: 'VIEWER',
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * Mock API function - simulates fetching users with pagination
 * Will be replaced with real API call: apiClient.getUsers()
 */
async function mockGetUsers(params: { page: number; pageSize: number }) {
  await new Promise(resolve => setTimeout(resolve, 500))

  const { page, pageSize } = params
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = MOCK_USERS.slice(start, end)

  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total: MOCK_USERS.length,
      totalPages: Math.ceil(MOCK_USERS.length / pageSize),
    },
  }
}

/**
 * Mock API function - simulates fetching single user
 * Will be replaced with real API call: apiClient.getUser()
 */
async function mockGetUser(id: string) {
  await new Promise(resolve => setTimeout(resolve, 300))
  const user = MOCK_USERS.find(u => u.id === id)
  return {
    success: !!user,
    data: user,
  }
}

/**
 * Mock API function - simulates creating a user
 * Will be replaced with real API call: apiClient.createUser()
 */
async function mockCreateUser(data: any) {
  await new Promise(resolve => setTimeout(resolve, 300))

  const newUser = {
    id: Date.now().toString(),
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role || 'STAFF',
    isActive: true,
    createdAt: new Date().toISOString(),
  }

  MOCK_USERS.unshift(newUser)
  return { success: true, data: newUser }
}

/**
 * Mock API function - simulates updating a user
 * Will be replaced with real API call: apiClient.updateUser()
 */
async function mockUpdateUser(id: string, data: any) {
  await new Promise(resolve => setTimeout(resolve, 300))

  const user = MOCK_USERS.find(u => u.id === id)
  if (user) {
    Object.assign(user, data)
  }

  return { success: !!user, data: user }
}

/**
 * Mock API function - simulates deactivating a user
 * Will be replaced with real API call: apiClient.deactivateUser()
 */
async function mockDeactivateUser(id: string) {
  await new Promise(resolve => setTimeout(resolve, 300))

  const user = MOCK_USERS.find(u => u.id === id)
  if (user) {
    user.isActive = false
  }

  return { success: !!user, data: user }
}

/**
 * Fetch users with pagination
 */
export function useUsers(page = ref(1), pageSize = ref(10)) {
  const query = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () =>
      mockGetUsers({
        page: page.value,
        pageSize: pageSize.value,
      }),
    staleTime: 1000 * 60 * 5,
  })

  return {
    users: computed(() => {
      if (query.data && 'data' in query.data) {
        return query.data.data || []
      }
      return []
    }),
    pagination: computed(() => {
      if (query.data && 'pagination' in query.data) {
        return query.data.pagination
      }
      return undefined
    }),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}

/**
 * Fetch single user by ID
 */
export function useUser(id: string) {
  const query = useQuery({
    queryKey: ['user', id],
    queryFn: () => mockGetUser(id),
    enabled: !!id,
  })

  return {
    user: computed(() => {
      if (query.data && 'data' in query.data) {
        return query.data.data
      }
      return undefined
    }),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}

/**
 * Create user mutation
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => mockCreateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return {
    createUser: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

/**
 * Update user mutation
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      mockUpdateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
  })

  return {
    updateUser: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

/**
 * Deactivate user mutation
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => mockDeactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
  })

  return {
    deactivateUser: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

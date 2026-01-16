import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref, computed, type Ref } from 'vue'
import { apiClient } from '../services/api'

/**
 * Fetch users with pagination
 */
export function useUsers(
  page: Ref<number> = ref(1),
  pageSize: Ref<number> = ref(10)
) {
  const query = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () =>
      apiClient.getUsers({
        page: page.value,
        pageSize: pageSize.value,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    users: computed(() => query.data.value?.data || []),
    pagination: computed(() => query.data.value?.pagination),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Fetch single user by ID
 */
export function useUser(id: Ref<string> | string) {
  const userId = typeof id === 'string' ? ref(id) : id

  const query = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.getUser(userId.value),
    enabled: computed(() => !!userId.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    user: computed(() => query.data.value?.data),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Create user mutation
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return {
    createUser: mutation.mutate,
    createUserAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

/**
 * Update user mutation
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient.updateUser(id, data),
    onSuccess: (_response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
  })

  return {
    updateUser: mutation.mutate,
    updateUserAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

/**
 * Deactivate user mutation
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => apiClient.deactivateUser(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
  })

  return {
    deactivateUser: mutation.mutate,
    deactivateUserAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

/**
 * Reactivate user mutation
 */
export function useReactivateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => apiClient.reactivateUser(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
  })

  return {
    reactivateUser: mutation.mutate,
    reactivateUserAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

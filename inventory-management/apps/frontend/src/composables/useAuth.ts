import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { apiClient } from '../services/api'

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login(email, password),
    onSuccess: (response) => {
      // Clear all queries on login to fetch fresh data
      queryClient.clear()
      
      // Store user data if needed
      if (response.success && response.data) {
        // You can store user data in a store or local state here
        console.log('Login successful:', response.data.user)
      }
    },
  })

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear()
    },
    onError: () => {
      // Even if logout fails, clear local data
      queryClient.clear()
    },
  })

  return {
    logout: mutation.mutate,
    logoutAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}

/**
 * Refresh token mutation
 */
export function useRefreshToken() {
  const mutation = useMutation({
    mutationFn: () => apiClient.refreshAccessToken(),
  })

  return {
    refreshToken: mutation.mutate,
    refreshTokenAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}

/**
 * Get user permissions
 */
export function usePermissions() {
  const query = useQuery({
    queryKey: ['permissions'],
    queryFn: () => apiClient.getPermissions(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false, // Don't retry if unauthorized
  })

  return {
    permissions: query.data.value?.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated() {
  const token = apiClient.getToken()
  const isExpired = apiClient.isTokenExpired()
  
  return {
    isAuthenticated: !!token && !isExpired,
    token,
    isExpired,
  }
}

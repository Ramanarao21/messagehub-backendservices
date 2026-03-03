import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/api';
import type { LoginCredentials, RegisterCredentials } from '../types/auth.types';

export const AUTH_QUERY_KEY = ['auth', 'user'] as const;

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.getCurrentUser,
    enabled: !!authApi.getToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, { user: data.user });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, { user: data.user });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
    },
  });

  const login = (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  const register = (credentials: RegisterCredentials) => {
    return registerMutation.mutateAsync(credentials);
  };

  const logout = () => {
    return logoutMutation.mutateAsync();
  };

  return {
    user: currentUser?.user,
    isAuthenticated: !!currentUser?.user,
    isLoading: isLoadingUser,
    login,
    register,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};

import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

interface UserStatus {
  userId: string;
  status: 'online' | 'offline';
}

const fetchUserStatus = async (userId: string, token: string): Promise<UserStatus> => {
  const response = await fetch(`${API_BASE_URL}/auth/status/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user status');
  }

  return response.json();
};

export const useUserStatus = (userId: string | undefined, token: string | null) => {
  return useQuery({
    queryKey: ['userStatus', userId],
    queryFn: () => fetchUserStatus(userId!, token!),
    enabled: !!userId && !!token,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });
};

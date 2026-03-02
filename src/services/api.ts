import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

class ApiError extends Error {
  status: number;
  data?: unknown;
  
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'An error occurred', data);
  }

  return data;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setAuthToken(response.token);
    return response;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setAuthToken(response.token);
    return response;
  },

  logout: async (): Promise<void> => {
    await fetchApi('/auth/logout', {
      method: 'POST',
    });
    removeAuthToken();
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    return fetchApi<{ user: User }>('/auth/me');
  },

  getToken: getAuthToken,
  setToken: setAuthToken,
  removeToken: removeAuthToken,
};

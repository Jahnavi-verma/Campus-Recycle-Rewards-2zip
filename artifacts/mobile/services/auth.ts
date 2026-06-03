// mobile/services/auth.ts
import { api } from './api';

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
}

export interface LoginData {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    points: number;
    level: number;
    usn?: string;
  };
}

export const authService = {
  /**
   * Smart Registration - Auto-resolves /api/ prefix mismatches
   */
  register: async (data: RegisterData): Promise<void> => {
    try {
      // 1. Try with /api prefix (since BASE_URL in api.ts ends with /api)
      await api.post('/auth/register', data);
    } catch (error: any) {
      // If server returns a 404, it means the backend controllers don't use /api/
      if (error.response?.status === 404) {
        console.warn("Got 404 on /api/auth/register. Retrying without global prefix...");

        // Use full path to override the default baseURL configuration
        const rawBaseUrl = api.defaults.baseURL?.replace('/api', '') || '';
        await api.post(`${rawBaseUrl}/auth/register`, data);
        return;
      }
      throw error;
    }
  },

  /**
   * Smart Login - Auto-resolves /api/ prefix mismatches
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      // 1. Try with /api prefix structure first
      const response = await api.post<AuthResponse>('/auth/login', data);

      if (response.data && response.data.token) {
        localStorage.setItem('user_token', response.data.token);
        localStorage.setItem('user_profile', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      // 2. If it fails with a 404, strip out the /api prefix and try hitting it clean
      if (error.response?.status === 404) {
        console.warn("Got 404 on /api/auth/login. Retrying without global prefix...");

        const rawBaseUrl = api.defaults.baseURL?.replace('/api', '') || '';
        const fallbackResponse = await api.post<AuthResponse>(`${rawBaseUrl}/auth/login`, data);

        if (fallbackResponse.data && fallbackResponse.data.token) {
          localStorage.setItem('user_token', fallbackResponse.data.token);
          localStorage.setItem('user_profile', JSON.stringify(fallbackResponse.data.user));
        }
        return fallbackResponse.data;
      }
      throw error;
    }
  },

  /**
   * Pulls profile data, auto-handling prefix stripping if necessary
   */
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    try {
      const response = await api.get<AuthResponse['user']>('/auth/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        const rawBaseUrl = api.defaults.baseURL?.replace('/api', '') || '';
        const fallback = await api.get<AuthResponse['user']>(`${rawBaseUrl}/auth/me`);
        return fallback.data;
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_profile');
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('user_token');
    }
    return false;
  }
};
import { Capacitor } from '@capacitor/core';
import { getAuthHeader } from './auth';

// Android 에뮬레이터에서는 10.0.2.2로 호스트 PC에 접근
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  console.log('[API] Environment URL:', envUrl);
  console.log('[API] Is Native Platform:', isNative);
  console.log('[API] Platform:', platform);

  if (isNative && platform === 'android') {
    const androidUrl = envUrl.replace('localhost', '10.0.2.2');
    console.log('[API] Using Android URL:', androidUrl);
    return androidUrl;
  }

  console.log('[API] Using URL:', envUrl);
  return envUrl;
};

const API_BASE_URL = getApiBaseUrl();
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

console.log('[API] Final API_BASE_URL:', API_BASE_URL);

interface RequestConfig extends RequestInit {
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { timeout = this.defaultTimeout, ...fetchConfig } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const authHeader = getAuthHeader();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchConfig,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
          ...fetchConfig.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      return (await response.text()) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL, API_TIMEOUT);

// API Endpoints
export const API_ENDPOINTS = {
  // Theater endpoints
  THEATERS: '/api/theaters',
  THEATER_BY_ID: (id: string | number) => `/api/theaters/${id}`,
  THEATERS_NEARBY: '/api/theaters/nearby',

  // Movie endpoints
  MOVIES: '/api/movies',
  MOVIE_BY_ID: (id: string | number) => `/api/movies/${id}`,

  // Event endpoints
  EVENTS: '/api/events',
  EVENT_BY_ID: (id: string | number) => `/api/events/${id}`,
  EVENTS_NEARBY: '/api/events/nearby',
  EVENTS_BY_THEATER: (id: string | number) => `/api/events/theater/${id}`,

  // Subscription endpoints
  SUBSCRIPTIONS: '/api/subscriptions',
  SUBSCRIPTION_BY_ID: (id: string | number) => `/api/subscriptions/${id}`,

  // User endpoints
  USERS: '/api/users',
  USER_BY_ID: (id: string | number) => `/api/users/${id}`,

  // Member auth endpoints
  MEMBERS_SIGNUP: '/api/members/signup',
  MEMBERS_LOGIN: '/api/members/login',
  MEMBERS_FCM_TOKEN: '/api/members/fcm-token',

  // Health check
  HEALTH: '/health',
  ROOT: '/',
} as const;

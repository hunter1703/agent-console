import { post, get } from './client';

export interface LoginResponse {
  token?: string; // The session cookie might be set directly by backend, but let's keep response extensible
}

export interface ContextResponse {
  requestId: string;
  customerId: string;
  caller: any;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    return post<LoginResponse>('/v1/auth/login', {
      type: 'password',
      username,
      password,
    });
  },
  
  logout: async (): Promise<void> => {
    return post<void>('/v1/auth/logout');
  },

  me: async (): Promise<ContextResponse> => {
    let hasSession = false;
    if (typeof window !== 'undefined') {
      const expiry = localStorage.getItem('sessionExpiry');
      if (expiry && Date.now() < parseInt(expiry, 10)) {
        hasSession = true;
      } else if (expiry) {
        localStorage.removeItem('sessionExpiry');
      }
    }
    return get<ContextResponse>('/v1/auth/me', { retries: hasSession ? 3 : 1 });
  }
};

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { authApi } from '@/lib/api/auth'
import { DEV_CONFIG } from '@/lib/config/env'

export interface AuthState {
  isAuthenticated: boolean
  isChecking: boolean
  
  // Actions
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setAuthenticated: (status: boolean) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      isAuthenticated: false,
      isChecking: true,
      
      login: async (username, password) => {
        await authApi.login(username, password)
        if (typeof window !== 'undefined') {
          // Matches backend IdentityProvider.SESSION_LIFETIME (7 days)
          const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
          localStorage.setItem('sessionExpiry', expiry.toString());
        }
        set({ isAuthenticated: true })
      },
      
      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          console.error('Logout failed:', error)
        } finally {
          if (typeof window !== 'undefined') localStorage.removeItem('sessionExpiry')
          set({ isAuthenticated: false })
        }
      },
      
      setAuthenticated: (status) => set({ isAuthenticated: status, isChecking: false }),
      
      checkAuth: async () => {
        set({ isChecking: true })
        try {
          await authApi.me()
          set({ isAuthenticated: true, isChecking: false })
        } catch (error: any) {
          if (error?.status === 401 || error?.status === 403) {
            if (typeof window !== 'undefined') localStorage.removeItem('sessionExpiry')
          }
          set({ isAuthenticated: false, isChecking: false })
        }
      }
    }),
    {
      name: 'auth-store',
      enabled: DEV_CONFIG.debug,
    }
  )
)

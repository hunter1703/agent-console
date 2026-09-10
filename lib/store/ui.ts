/**
 * UI State Store
 * 
 * Zustand store for managing global UI state including toasts, dialogs,
 * loading states, and other transient UI elements.
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { DEV_CONFIG } from '@/lib/config/env'

// ============================================================================
// Types
// ============================================================================

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
  dismissible?: boolean
}

export interface Dialog {
  id: string
  type: 'confirm' | 'alert' | 'custom'
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  component?: React.ComponentType<any>
  props?: Record<string, unknown>
}

export interface LoadingState {
  id: string
  message?: string
  progress?: number
}

export interface UIState {
  // Toast management
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  
  // Dialog management
  dialogs: Dialog[]
  showDialog: (dialog: Omit<Dialog, 'id'>) => string
  hideDialog: (id: string) => void
  clearDialogs: () => void
  
  // Loading states
  loadingStates: LoadingState[]
  setLoading: (id: string, message?: string, progress?: number) => void
  clearLoading: (id: string) => void
  isLoading: (id?: string) => boolean
  
  // Global UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  
  // Theme and preferences
  reducedMotion: boolean
  setReducedMotion: (reduced: boolean) => void
  
  // Page state
  pageTitle: string
  setPageTitle: (title: string) => void
  
  // Keyboard shortcuts
  shortcutsEnabled: boolean
  setShortcutsEnabled: (enabled: boolean) => void
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      toasts: [],
      dialogs: [],
      loadingStates: [],
      sidebarOpen: false,
      reducedMotion: false,
      pageTitle: 'Agent Console',
      shortcutsEnabled: true,
      
      // Toast actions
      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newToast: Toast = {
          id,
          duration: 5000,
          dismissible: true,
          ...toast,
        }
        
        set((state) => ({
          toasts: [...state.toasts, newToast]
        }))
        
        // Auto-remove toast after duration
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, newToast.duration)
        }
        
        return id
      },
      
      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        }))
      },
      
      clearToasts: () => {
        set({ toasts: [] })
      },
      
      // Dialog actions
      showDialog: (dialog) => {
        const id = `dialog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newDialog: Dialog = {
          id,
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          variant: 'default',
          ...dialog,
        }
        
        set((state) => ({
          dialogs: [...state.dialogs, newDialog]
        }))
        
        return id
      },
      
      hideDialog: (id) => {
        set((state) => ({
          dialogs: state.dialogs.filter(dialog => dialog.id !== id)
        }))
      },
      
      clearDialogs: () => {
        set({ dialogs: [] })
      },
      
      // Loading actions
      setLoading: (id, message, progress) => {
        set((state) => {
          const existingIndex = state.loadingStates.findIndex(loading => loading.id === id)
          const newLoading: LoadingState = { id, message, progress }
          
          if (existingIndex >= 0) {
            // Update existing loading state
            const newLoadingStates = [...state.loadingStates]
            newLoadingStates[existingIndex] = newLoading
            return { loadingStates: newLoadingStates }
          } else {
            // Add new loading state
            return { loadingStates: [...state.loadingStates, newLoading] }
          }
        })
      },
      
      clearLoading: (id) => {
        set((state) => ({
          loadingStates: state.loadingStates.filter(loading => loading.id !== id)
        }))
      },
      
      isLoading: (id) => {
        const state = get()
        if (id) {
          return state.loadingStates.some(loading => loading.id === id)
        }
        return state.loadingStates.length > 0
      },
      
      // Sidebar actions
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open })
      },
      
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },
      
      // Preference actions
      setReducedMotion: (reduced) => {
        set({ reducedMotion: reduced })
      },
      
      // Page actions
      setPageTitle: (title) => {
        set({ pageTitle: title })
        
        // Update document title
        if (typeof document !== 'undefined') {
          document.title = title ? `${title} - Agent Console` : 'Agent Console'
        }
      },
      
      // Keyboard shortcut actions
      setShortcutsEnabled: (enabled) => {
        set({ shortcutsEnabled: enabled })
      },
    }),
    {
      name: 'ui-store',
      enabled: DEV_CONFIG.debug,
    }
  )
)

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook for toast notifications
 */
export function useToasts() {
  const toasts = useUIStore(state => state.toasts)
  const addToast = useUIStore(state => state.addToast)
  const removeToast = useUIStore(state => state.removeToast)
  const clearToasts = useUIStore(state => state.clearToasts)

  // addToast/removeToast/clearToasts are stable Zustand action references, but the
  // convenience wrappers below were previously recreated as new closures on every render.
  // Consumers that put `error`/etc. in a useEffect dependency array would then re-run that
  // effect on every render — and if the effect (or a sibling) triggers a re-render via
  // addToast, that's an infinite loop. Memoized separately from `toasts` (which legitimately
  // changes on every add/remove) so the action identities stay stable across toast updates.
  const actions = useMemo(() => ({
    addToast,
    removeToast,
    clearToasts,

    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),

    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message }),

    warning: (title: string, message?: string) =>
      addToast({ type: 'warning', title, message }),

    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message }),
  }), [addToast, removeToast, clearToasts])

  return { toasts, ...actions }
}

/**
 * Hook for dialog management
 */
export function useDialogs() {
  const dialogs = useUIStore(state => state.dialogs)
  const showDialog = useUIStore(state => state.showDialog)
  const hideDialog = useUIStore(state => state.hideDialog)
  const clearDialogs = useUIStore(state => state.clearDialogs)
  
  return {
    dialogs,
    showDialog,
    hideDialog,
    clearDialogs,
    
    // Convenience methods
    confirm: (
      title: string, 
      message?: string, 
      onConfirm?: () => void | Promise<void>
    ) => showDialog({
      type: 'confirm',
      title,
      message,
      onConfirm,
    }),
    
    alert: (title: string, message?: string) => 
      showDialog({
        type: 'alert',
        title,
        message,
      }),
    
    danger: (
      title: string, 
      message?: string, 
      onConfirm?: () => void | Promise<void>
    ) => showDialog({
      type: 'confirm',
      title,
      message,
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm,
    }),
  }
}

/**
 * Hook for loading states
 */
export function useLoading() {
  const loadingStates = useUIStore(state => state.loadingStates)
  const setLoading = useUIStore(state => state.setLoading)
  const clearLoading = useUIStore(state => state.clearLoading)
  const isLoading = useUIStore(state => state.isLoading)
  
  return {
    loadingStates,
    setLoading,
    clearLoading,
    isLoading,
    
    // Convenience methods
    withLoading: async <T>(
      id: string,
      promise: Promise<T>,
      message?: string
    ): Promise<T> => {
      try {
        setLoading(id, message)
        return await promise
      } finally {
        clearLoading(id)
      }
    },
  }
}
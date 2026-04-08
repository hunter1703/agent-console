/**
 * UI Store
 * 
 * Manages global UI state (sidebar, theme, modals, cursor, sound).
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SidebarView = 'agents' | 'chats'
export type ModalType = 'createAgent' | 'editAgent' | 'deleteAgent' | 'createSession' | null

interface UIState {
  // Sidebar state
  sidebarView: SidebarView
  sidebarCollapsed: boolean
  sidebarOpen: boolean // Mobile only
  
  // Modal state
  activeModal: ModalType
  modalData: any | null
  
  // UI preferences
  customCursorEnabled: boolean
  soundEnabled: boolean
  
  // Actions
  setSidebarView: (view: SidebarView) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  
  openModal: (modal: ModalType, data?: any) => void
  closeModal: () => void
  
  setCustomCursorEnabled: (enabled: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      sidebarView: 'chats',
      sidebarCollapsed: false,
      sidebarOpen: false,
      
      activeModal: null,
      modalData: null,
      
      customCursorEnabled: true,
      soundEnabled: true,
      
      // Actions
      setSidebarView: (view) => set({ sidebarView: view }),
      
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      openModal: (modal, data = null) => set({ 
        activeModal: modal, 
        modalData: data 
      }),
      
      closeModal: () => set({ 
        activeModal: null, 
        modalData: null 
      }),
      
      setCustomCursorEnabled: (enabled) => set({ 
        customCursorEnabled: enabled 
      }),
      
      setSoundEnabled: (enabled) => set({ 
        soundEnabled: enabled 
      }),
    }),
    {
      name: 'agent-console-ui',
      partialize: (state) => ({
        sidebarView: state.sidebarView,
        sidebarCollapsed: state.sidebarCollapsed,
        customCursorEnabled: state.customCursorEnabled,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
)

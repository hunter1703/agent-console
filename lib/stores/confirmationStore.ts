/**
 * Confirmation State Management
 * Zustand store for tracking confirmation requests
 * 
 * Based on design.md specification
 */

import { create } from 'zustand'
import type { ConfirmationRequest } from '@/types/confirmation'

interface ConfirmationState {
  confirmations: Map<string, ConfirmationRequest>
  pendingCount: number
  
  // Actions
  addConfirmation: (confirmation: ConfirmationRequest) => void
  updateConfirmation: (confirmationId: string, status: 'confirmed' | 'rejected', answer?: string) => void
  getPendingConfirmations: () => ConfirmationRequest[]
  getAllConfirmations: () => ConfirmationRequest[]
  clearConfirmations: () => void
}

export const useConfirmationStore = create<ConfirmationState>((set, get) => ({
  confirmations: new Map(),
  pendingCount: 0,
  
  addConfirmation: (confirmation) => {
    const state = get()
    // Idempotent: if already present, don't add again or double-count pending
    if (state.confirmations.has(confirmation.id)) return
    const newConfirmations = new Map(state.confirmations)
    newConfirmations.set(confirmation.id, confirmation)
    set({
      confirmations: newConfirmations,
      pendingCount: confirmation.status === 'pending'
        ? state.pendingCount + 1
        : state.pendingCount,
    })
  },
  
  updateConfirmation: (confirmationId, status, answer) => {
    const state = get()
    const confirmation = state.confirmations.get(confirmationId)
    
    if (!confirmation) return
    
    const wasPending = confirmation.status === 'pending'
    const newConfirmations = new Map(state.confirmations)
    
    newConfirmations.set(confirmationId, {
      ...confirmation,
      status,
      answer,
      confirmedAt: new Date().toISOString(),
    })
    
    set({
      confirmations: newConfirmations,
      pendingCount: wasPending 
        ? Math.max(0, state.pendingCount - 1)
        : state.pendingCount,
    })
  },
  
  getPendingConfirmations: () => {
    return Array.from(get().confirmations.values())
      .filter((c) => c.status === 'pending')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  },
  
  getAllConfirmations: () => {
    return Array.from(get().confirmations.values())
  },
  
  clearConfirmations: () => {
    set({
      confirmations: new Map(),
      pendingCount: 0,
    })
  },
}))

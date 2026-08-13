/**
 * Interrupt State Management
 * Zustand store for tracking interrupt requests
 * 
 * Based on design.md specification
 */

import { create } from 'zustand'
import type { InterruptRequest } from '@/types/interrupt'

interface InterruptState {
  interrupts: Map<string, InterruptRequest>
  pendingCount: number
  
  // Actions
  addInterrupt: (interrupt: InterruptRequest) => void
  updateInterrupt: (interruptId: string, status: 'resolved' | 'rejected', answer?: string) => void
  getPendingInterrupts: () => InterruptRequest[]
  getAllInterrupts: () => InterruptRequest[]
  clearInterrupts: () => void
}

export const useInterruptStore = create<InterruptState>((set, get) => ({
  interrupts: new Map(),
  pendingCount: 0,
  
  addInterrupt: (interrupt) => {
    const state = get()
    // Idempotent: if already present, don't add again or double-count pending
    if (state.interrupts.has(interrupt.id)) return
    const newInterrupts = new Map(state.interrupts)
    newInterrupts.set(interrupt.id, interrupt)
    set({
      interrupts: newInterrupts,
      pendingCount: interrupt.status === 'pending'
        ? state.pendingCount + 1
        : state.pendingCount,
    })
  },
  
  updateInterrupt: (interruptId, status, answer) => {
    const state = get()
    const interrupt = state.interrupts.get(interruptId)
    
    if (!interrupt) return
    
    const wasPending = interrupt.status === 'pending'
    const newInterrupts = new Map(state.interrupts)
    
    newInterrupts.set(interruptId, {
      ...interrupt,
      status,
      answer,
      resolvedAt: new Date().toISOString(),
    })
    
    set({
      interrupts: newInterrupts,
      pendingCount: wasPending 
        ? Math.max(0, state.pendingCount - 1)
        : state.pendingCount,
    })
  },
  
  getPendingInterrupts: () => {
    return Array.from(get().interrupts.values())
      .filter((c) => c.status === 'pending')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  },
  
  getAllInterrupts: () => {
    return Array.from(get().interrupts.values())
  },
  
  clearInterrupts: () => {
    set({
      interrupts: new Map(),
      pendingCount: 0,
    })
  },
}))

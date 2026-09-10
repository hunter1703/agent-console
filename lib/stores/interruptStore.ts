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
  /** Clears only the interrupts belonging to one session — see clearInterrupts's caveat:
   * this store isn't session-partitioned, so the unscoped clear discards every open tab's
   * pending interrupts, not just the one the user is looking at. */
  clearInterruptsForSession: (sessionId: string) => void
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

  clearInterruptsForSession: (sessionId) => {
    const state = get()
    let removedPending = 0
    const remaining = new Map(state.interrupts)
    for (const [id, interrupt] of state.interrupts) {
      if (interrupt.sessionId !== sessionId) continue
      if (interrupt.status === 'pending') removedPending++
      remaining.delete(id)
    }
    if (removedPending === 0 && remaining.size === state.interrupts.size) return
    set({
      interrupts: remaining,
      pendingCount: Math.max(0, state.pendingCount - removedPending),
    })
  },
}))

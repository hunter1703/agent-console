/**
 * Temporary Chat Store
 * 
 * Manages temporary chat mode for privacy and testing.
 * Chats in temporary mode don't save to backend.
 */

import { create } from 'zustand';

interface TemporaryChatState {
  // Temporary mode flag
  temporaryMode: boolean;
  
  // Temporary sessions (not saved to backend)
  temporarySessions: Record<string, any>;
  
  // Actions
  enableTemporaryMode: () => void;
  disableTemporaryMode: () => void;
  toggleTemporaryMode: () => void;
  
  // Session management
  addTemporarySession: (sessionId: string, session: any) => void;
  removeTemporarySession: (sessionId: string) => void;
  getTemporarySession: (sessionId: string) => any | null;
  clearAllTemporarySessions: () => void;
  
  // Getters
  isTemporarySession: (sessionId: string) => boolean;
}

export const useTemporaryChat = create<TemporaryChatState>((set, get) => ({
  temporaryMode: false,
  temporarySessions: {},

  enableTemporaryMode: () => {
    set({ temporaryMode: true });
    console.log('Temporary chat mode enabled - changes will not be saved');
  },

  disableTemporaryMode: () => {
    set({ temporaryMode: false });
    console.log('Temporary chat mode disabled');
  },

  toggleTemporaryMode: () => {
    set((state) => {
      const newMode = !state.temporaryMode;
      console.log(
        newMode
          ? 'Temporary chat mode enabled - changes will not be saved'
          : 'Temporary chat mode disabled'
      );
      return { temporaryMode: newMode };
    });
  },

  addTemporarySession: (sessionId: string, session: any) => {
    set((state) => ({
      temporarySessions: {
        ...state.temporarySessions,
        [sessionId]: session,
      },
    }));
  },

  removeTemporarySession: (sessionId: string) => {
    set((state) => {
      const { [sessionId]: removed, ...remaining } = state.temporarySessions;
      return { temporarySessions: remaining };
    });
  },

  getTemporarySession: (sessionId: string) => {
    const state = get();
    return state.temporarySessions[sessionId] || null;
  },

  clearAllTemporarySessions: () => {
    set({ temporarySessions: {} });
  },

  isTemporarySession: (sessionId: string) => {
    const state = get();
    return sessionId in state.temporarySessions;
  },
}));

/**
 * Hook to check if should save to backend
 */
export function useShouldSaveToBackend(sessionId: string): boolean {
  const temporaryMode = useTemporaryChat((state) => state.temporaryMode);
  const isTemporarySession = useTemporaryChat((state) =>
    state.isTemporarySession(sessionId)
  );

  // Don't save if in temporary mode or if it's a temporary session
  return !temporaryMode && !isTemporarySession;
}

/**
 * Non-hook version to check if should save to backend
 * Use this in non-component contexts (like store actions)
 */
export function shouldSaveToBackend(sessionId: string): boolean {
  const state = useTemporaryChat.getState();
  const temporaryMode = state.temporaryMode;
  const isTemporarySession = state.isTemporarySession(sessionId);
  
  // Don't save if in temporary mode or if it's a temporary session
  return !temporaryMode && !isTemporarySession;
}

/**
 * Wrapper for API calls that respects temporary mode
 */
export async function saveIfNotTemporary<T>(
  sessionId: string,
  saveFn: () => Promise<T>
): Promise<T | null> {
  if (useShouldSaveToBackend(sessionId)) {
    return saveFn();
  }

  console.log('Skipping save - temporary mode enabled');
  return null;
}

/**
 * Auto-Save Utilities
 * 
 * Debounced auto-save for sessions and other data.
 * Based on Open WebUI's auto-save pattern.
 */

import { useSettings } from '@/lib/store/settings';

type SaveFunction<T> = (data: T) => Promise<void>;

/**
 * Create a debounced auto-save function
 */
export function createAutoSave<T>(
  saveFunction: SaveFunction<T>,
  delayMs: number = 1000
) {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingData: T | null = null;
  let isSaving = false;

  const save = async (data: T) => {
    pendingData = data;

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    timeoutId = setTimeout(async () => {
      if (pendingData && !isSaving) {
        isSaving = true;
        try {
          await saveFunction(pendingData);
          console.log('Auto-save completed');
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          isSaving = false;
          pendingData = null;
        }
      }
    }, delayMs);
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    pendingData = null;
  };

  const flush = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (pendingData && !isSaving) {
      isSaving = true;
      try {
        await saveFunction(pendingData);
        console.log('Auto-save flushed');
      } catch (error) {
        console.error('Auto-save flush failed:', error);
      } finally {
        isSaving = false;
        pendingData = null;
      }
    }
  };

  return { save, cancel, flush };
}

/**
 * Hook for auto-save with settings integration
 */
export function useAutoSave<T>(
  saveFunction: SaveFunction<T>,
  enabled: boolean = true
) {
  const { autoSave, autoSaveDelay } = useSettings((state) => ({
    autoSave: state.autoSave,
    autoSaveDelay: state.autoSaveDelay,
  }));

  const autoSaver = createAutoSave(
    saveFunction,
    autoSaveDelay
  );

  return {
    save: (data: T) => {
      if (enabled && autoSave) {
        autoSaver.save(data);
      }
    },
    cancel: autoSaver.cancel,
    flush: autoSaver.flush,
  };
}

/**
 * Session auto-save hook
 */
export function useSessionAutoSave(
  sessionId: string,
  updateSession: (sessionId: string, updates: any) => Promise<void>
) {
  return useAutoSave(
    (updates) => updateSession(sessionId, updates),
    true
  );
}

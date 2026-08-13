/**
 * Settings Store
 * 
 * User preferences and application settings with persistence.
 * Based on Open WebUI's settings management pattern.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Settings {
  // UI Settings
  theme: 'light' | 'dark' | 'system';
  sidebarWidth: number;
  fontSize: 'small' | 'medium' | 'large';
  highContrastMode: boolean;
  
  // Behavior Settings
  ctrlEnterToSend: boolean;
  autoSave: boolean;
  autoSaveDelay: number; // milliseconds
  streamingChunkSize: number;
  splitLargeDeltas: boolean;
  
  // Feature Flags
  enablePlanning: boolean;
  enableToolExecution: boolean;
  enableInterrupts: boolean;
  enableScrollPagination: boolean;
  
  // Model Settings
  defaultModelId?: string;
  temperature: number;
  maxTokens: number;
  
  // Experimental
  enableVirtualScrolling: boolean;
  enableImageCompression: boolean;
  imageCompressionQuality: number;
}

interface SettingsState extends Settings {
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  // UI
  theme: 'system',
  sidebarWidth: 260,
  fontSize: 'medium',
  highContrastMode: false,
  
  // Behavior
  ctrlEnterToSend: false,
  autoSave: true,
  autoSaveDelay: 1000,
  streamingChunkSize: 3,
  splitLargeDeltas: true,
  
  // Features
  enablePlanning: true,
  enableToolExecution: true,
  enableInterrupts: true,
  enableScrollPagination: false,
  
  // Model
  temperature: 0.7,
  maxTokens: 4096,
  
  // Experimental
  enableVirtualScrolling: false,
  enableImageCompression: true,
  imageCompressionQuality: 0.8,
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      updateSettings: (updates: Partial<Settings>) => {
        set((state) => ({ ...state, ...updates }));
      },
      
      resetSettings: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'agent-console-settings',
      version: 1,
    }
  )
);

// Convenience hooks
export function useTheme() {
  return useSettings((state) => state.theme);
}

export function useFontSize() {
  return useSettings((state) => state.fontSize);
}

export function useAutoSave() {
  return useSettings((state) => ({
    enabled: state.autoSave,
    delay: state.autoSaveDelay,
  }));
}

export function useStreamingSettings() {
  return useSettings((state) => ({
    chunkSize: state.streamingChunkSize,
    splitLargeDeltas: state.splitLargeDeltas,
  }));
}

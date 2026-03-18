/**
 * Centralized State Management
 * Inspired by open-webui's Svelte store pattern, implemented with Zustand
 */

import { create } from 'zustand';
import { AgentConfig } from '@/models/Agent';
import { SessionSummary } from '@/lib/api';
import { AgentEvent } from '@/models/Events';

// ============================================================================
// Agent Store
// ============================================================================

interface AgentStore {
    agents: AgentConfig[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    total: number;

    // Actions
    setAgents: (agents: AgentConfig[], hasMore: boolean, total: number) => void;
    addAgent: (agent: AgentConfig) => void;
    updateAgent: (id: string, updates: Partial<AgentConfig>) => void;
    removeAgent: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clear: () => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
    agents: [],
    loading: false,
    error: null,
    hasMore: false,
    total: 0,

    setAgents: (agents, hasMore, total) => set({ agents, hasMore, total, loading: false, error: null }),
    addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
    updateAgent: (id, updates) =>
        set((state) => ({
            agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),
    removeAgent: (id) => set((state) => ({ agents: state.agents.filter((a) => a.id !== id) })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error, loading: false }),
    clear: () => set({ agents: [], loading: false, error: null, hasMore: false, total: 0 }),
}));

// ============================================================================
// Model Store
// ============================================================================

export interface ModelConfig {
    id: string;
    name: string;
    provider: string;
    type: string;
    capabilities?: string[];
    metadata?: Record<string, any>;
}

interface ModelStore {
    models: ModelConfig[];
    loading: boolean;
    error: string | null;

    // Actions
    setModels: (models: ModelConfig[]) => void;
    addModel: (model: ModelConfig) => void;
    updateModel: (id: string, updates: Partial<ModelConfig>) => void;
    removeModel: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clear: () => void;
}

export const useModelStore = create<ModelStore>((set) => ({
    models: [],
    loading: false,
    error: null,

    setModels: (models) => set({ models, loading: false, error: null }),
    addModel: (model) => set((state) => ({ models: [...state.models, model] })),
    updateModel: (id, updates) =>
        set((state) => ({
            models: state.models.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),
    removeModel: (id) => set((state) => ({ models: state.models.filter((m) => m.id !== id) })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error, loading: false }),
    clear: () => set({ models: [], loading: false, error: null }),
}));

// ============================================================================
// Session Store
// ============================================================================

interface SessionStore {
    sessions: SessionSummary[];
    currentSessionId: string | null;
    currentThreadId: string | null;
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    total: number;

    // Actions
    setSessions: (sessions: SessionSummary[], hasMore: boolean, total: number) => void;
    addSession: (session: SessionSummary) => void;
    updateSession: (id: string, updates: Partial<SessionSummary>) => void;
    removeSession: (id: string) => void;
    setCurrentSession: (sessionId: string | null, threadId?: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clear: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
    sessions: [],
    currentSessionId: null,
    currentThreadId: null,
    loading: false,
    error: null,
    hasMore: false,
    total: 0,

    setSessions: (sessions, hasMore, total) => set({ sessions, hasMore, total, loading: false, error: null }),
    addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
    updateSession: (id, updates) =>
        set((state) => ({
            sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),
    removeSession: (id) => set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) })),
    setCurrentSession: (sessionId, threadId) =>
        set({ currentSessionId: sessionId, currentThreadId: threadId ?? sessionId ?? null }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error, loading: false }),
    clear: () =>
        set({
            sessions: [],
            currentSessionId: null,
            currentThreadId: null,
            loading: false,
            error: null,
            hasMore: false,
            total: 0,
        }),
}));

// ============================================================================
// Chat State Store
// ============================================================================

export interface Correction {
    correctionType: string;
    code: string;
    message: string;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    kind?: 'text' | 'planning' | 'thought' | 'correction';
    planning?: any;
    isStreaming?: boolean;
    thoughts?: string[];
    thinkingDurationSecs?: number;
    corrections?: Correction[];
}

interface ChatStateStore {
    messages: Message[];
    events: AgentEvent[];
    isStreaming: boolean;
    isPaused: boolean;
    pauseInfo: {
        paused: boolean;
        reason?: string;
        prompt?: string;
        options: string[];
    } | null;
    currentRunId: string | null;
    abortController: AbortController | null;

    // Actions
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    removeMessage: (id: string) => void;
    setEvents: (events: AgentEvent[]) => void;
    addEvent: (event: AgentEvent) => void;
    setIsStreaming: (streaming: boolean) => void;
    setIsPaused: (paused: boolean) => void;
    setPauseInfo: (pauseInfo: any) => void;
    setCurrentRunId: (runId: string | null) => void;
    setAbortController: (controller: AbortController | null) => void;
    clearMessages: () => void;
    clearEvents: () => void;
    clear: () => void;
}

export const useChatStateStore = create<ChatStateStore>((set) => ({
    messages: [],
    events: [],
    isStreaming: false,
    isPaused: false,
    pauseInfo: null,
    currentRunId: null,
    abortController: null,

    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    updateMessage: (id, updates) =>
        set((state) => ({
            messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),
    removeMessage: (id) => set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),
    setEvents: (events) => set({ events }),
    addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
    setIsStreaming: (streaming) => set({ isStreaming: streaming }),
    setIsPaused: (paused) => set({ isPaused: paused }),
    setPauseInfo: (pauseInfo) => set({ pauseInfo }),
    setCurrentRunId: (runId) => set({ currentRunId: runId }),
    setAbortController: (controller) => set({ abortController: controller }),
    clearMessages: () => set({ messages: [] }),
    clearEvents: () => set({ events: [] }),
    clear: () =>
        set({
            messages: [],
            events: [],
            isStreaming: false,
            isPaused: false,
            pauseInfo: null,
            currentRunId: null,
            abortController: null,
        }),
}));

// ============================================================================
// UI State Store
// ============================================================================

interface UIStateStore {
    // Sidebar
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;

    // Modals & Dialogs
    showSettings: boolean;
    showSessionsPanel: boolean;
    showConfirmDialog: boolean;
    confirmDialogConfig: {
        title: string;
        message: string;
        confirmLabel?: string;
        cancelLabel?: string;
        onConfirm?: () => void;
        onCancel?: () => void;
    } | null;

    // Toast notifications
    toasts: Array<{
        id: string;
        type: 'success' | 'error' | 'info' | 'warning';
        message: string;
        duration?: number;
    }>;

    // Theme
    theme: 'light' | 'dark' | 'system';

    // Actions
    setSidebarOpen: (open: boolean) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;
    setShowSettings: (show: boolean) => void;
    setShowSessionsPanel: (show: boolean) => void;
    setShowConfirmDialog: (show: boolean, config?: any) => void;
    addToast: (toast: Omit<UIStateStore['toasts'][0], 'id'>) => void;
    removeToast: (id: string) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIStateStore>((set, get) => ({
    sidebarOpen: false,
    sidebarCollapsed: false,
    showSettings: false,
    showSessionsPanel: false,
    showConfirmDialog: false,
    confirmDialogConfig: null,
    toasts: [],
    theme: 'system',

    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setShowSettings: (show) => set({ showSettings: show }),
    setShowSessionsPanel: (show) => set({ showSessionsPanel: show }),
    setShowConfirmDialog: (show, config) =>
        set({ showConfirmDialog: show, confirmDialogConfig: config || null }),
    addToast: (toast) =>
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
        })),
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    setTheme: (theme) => set({ theme }),
}));

// ============================================================================
// Utility Store Hooks
// ============================================================================

/**
 * Combined hook for chat-related state
 * Use this in chat components for convenient access to all chat state
 */
export function useChat() {
    const {
        messages,
        events,
        isStreaming,
        isPaused,
        pauseInfo,
        currentRunId,
        abortController,
        addMessage,
        updateMessage,
        setMessages,
        addEvent,
        setEvents,
        setIsStreaming,
        setIsPaused,
        setPauseInfo,
        setCurrentRunId,
        setAbortController,
        clearMessages,
        clearEvents,
    } = useChatStateStore();

    const { currentSessionId, currentThreadId, setCurrentSession } = useSessionStore();

    return {
        // State
        messages,
        events,
        isStreaming,
        isPaused,
        pauseInfo,
        currentRunId,
        abortController,
        currentSessionId,
        currentThreadId,

        // Actions
        addMessage,
        updateMessage,
        setMessages,
        addEvent,
        setEvents,
        setIsStreaming,
        setIsPaused,
        setPauseInfo,
        setCurrentRunId,
        setAbortController,
        clearMessages,
        clearEvents,
        setCurrentSession,
    };
}

/**
 * Combined hook for agent-related state
 */
export function useAgents() {
    const {
        agents,
        loading,
        error,
        hasMore,
        total,
        setAgents,
        addAgent,
        updateAgent,
        removeAgent,
        setLoading,
        setError,
        clear,
    } = useAgentStore();

    const { models, setModels, addModel, updateModel, removeModel } = useModelStore();

    return {
        // Agents
        agents,
        agentsLoading: loading,
        agentsError: error,
        agentsHasMore: hasMore,
        agentsTotal: total,
        setAgents,
        addAgent,
        updateAgent,
        removeAgent,
        setAgentsLoading: setLoading,
        setAgentsError: setError,
        clearAgents: clear,

        // Models
        models,
        setModels,
        addModel,
        updateModel,
        removeModel,
    };
}

/**
 * Combined hook for UI state
 */
export function useUI() {
    const {
        sidebarOpen,
        sidebarCollapsed,
        showSettings,
        showSessionsPanel,
        showConfirmDialog,
        confirmDialogConfig,
        toasts,
        theme,
        setSidebarOpen,
        setSidebarCollapsed,
        toggleSidebar,
        setShowSettings,
        setShowSessionsPanel,
        setShowConfirmDialog,
        addToast,
        removeToast,
        setTheme,
    } = useUIStore();

    return {
        sidebarOpen,
        sidebarCollapsed,
        showSettings,
        showSessionsPanel,
        showConfirmDialog,
        confirmDialogConfig,
        toasts,
        theme,
        setSidebarOpen,
        setSidebarCollapsed,
        toggleSidebar,
        setShowSettings,
        setShowSessionsPanel,
        setShowConfirmDialog,
        addToast,
        removeToast,
        setTheme,
    };
}

/**
 * Pagination Store
 * 
 * Manages pagination state for chat history and other paginated content.
 * Enables scroll-based pagination for infinite scrolling.
 */

import { create } from 'zustand';

export interface PaginationState {
  currentPage: number;
  hasMore: boolean;
  isLoading: boolean;
  totalCount?: number;
}

interface PaginationStore {
  // Session pagination states
  sessionPagination: Record<string, PaginationState>;
  
  // Actions
  initializePagination: (key: string, totalCount?: number) => void;
  setPaginationState: (key: string, state: Partial<PaginationState>) => void;
  nextPage: (key: string) => void;
  resetPagination: (key: string) => void;
  clearAllPagination: () => void;
  
  // Getters
  getPaginationState: (key: string) => PaginationState;
  canLoadMore: (key: string) => boolean;
}

const defaultPaginationState: PaginationState = {
  currentPage: 1,
  hasMore: true,
  isLoading: false,
};

export const usePagination = create<PaginationStore>((set, get) => ({
  sessionPagination: {},

  initializePagination: (key: string, totalCount?: number) => {
    set((state) => ({
      sessionPagination: {
        ...state.sessionPagination,
        [key]: {
          ...defaultPaginationState,
          totalCount,
        },
      },
    }));
  },

  setPaginationState: (key: string, state: Partial<PaginationState>) => {
    set((prevState) => ({
      sessionPagination: {
        ...prevState.sessionPagination,
        [key]: {
          ...prevState.sessionPagination[key],
          ...state,
        },
      },
    }));
  },

  nextPage: (key: string) => {
    set((state) => {
      const current = state.sessionPagination[key];
      if (!current) return state;

      return {
        sessionPagination: {
          ...state.sessionPagination,
          [key]: {
            ...current,
            currentPage: current.currentPage + 1,
          },
        },
      };
    });
  },

  resetPagination: (key: string) => {
    set((state) => ({
      sessionPagination: {
        ...state.sessionPagination,
        [key]: defaultPaginationState,
      },
    }));
  },

  clearAllPagination: () => {
    set({ sessionPagination: {} });
  },

  getPaginationState: (key: string) => {
    const state = get();
    return state.sessionPagination[key] || defaultPaginationState;
  },

  canLoadMore: (key: string) => {
    const state = get();
    const pagination = state.sessionPagination[key];
    return pagination ? pagination.hasMore && !pagination.isLoading : false;
  },
}));

// Convenience hooks
export function useSessionPagination(sessionId: string) {
  const state = usePagination((s) => s.sessionPagination[sessionId]);
  const setPaginationState = usePagination((s) => s.setPaginationState);
  const nextPage = usePagination((s) => s.nextPage);
  const canLoadMore = usePagination((s) => s.canLoadMore);

  return {
    state: state || defaultPaginationState,
    setPaginationState: (updates: Partial<PaginationState>) =>
      setPaginationState(sessionId, updates),
    nextPage: () => nextPage(sessionId),
    canLoadMore: canLoadMore(sessionId),
  };
}

import { create } from 'zustand';
import {
  AppState,
  Profile,
  HealthLog,
  UserStats,
  RecordingState,
  ClarificationRequest,
  ExtractedItem,
} from '../types';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  logs: [],
  stats: null,
  recordingState: 'idle' as RecordingState,
  currentTranscript: null,
  processingError: null,
  pendingClarification: null,
  pendingItems: [],
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  setUser: (user: Profile | null) =>
    set({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
    }),

  setLogs: (logs: HealthLog[]) => set({ logs }),

  addLog: (log: HealthLog) =>
    set((state) => ({
      logs: [log, ...state.logs],
    })),

  updateLog: (id: string, updates: Partial<HealthLog>) =>
    set((state) => ({
      logs: state.logs.map((log) =>
        log.id === id ? { ...log, ...updates } : log
      ),
    })),

  deleteLog: (id: string) =>
    set((state) => ({
      logs: state.logs.filter((log) => log.id !== id),
    })),

  setStats: (stats: UserStats | null) => set({ stats }),

  setRecordingState: (recordingState: RecordingState) =>
    set({ recordingState }),

  setCurrentTranscript: (currentTranscript: string | null) =>
    set({ currentTranscript }),

  setProcessingError: (processingError: string | null) =>
    set({ processingError }),

  setPendingClarification: (pendingClarification: ClarificationRequest | null) =>
    set({ pendingClarification }),

  setPendingItems: (pendingItems: ExtractedItem[]) => set({ pendingItems }),

  reset: () => set(initialState),
}));

// Selectors
export const selectUser = (state: AppState) => state.user;
export const selectIsAuthenticated = (state: AppState) => state.isAuthenticated;
export const selectLogs = (state: AppState) => state.logs;
export const selectStats = (state: AppState) => state.stats;
export const selectRecordingState = (state: AppState) => state.recordingState;
export const selectCurrentTranscript = (state: AppState) =>
  state.currentTranscript;
export const selectProcessingError = (state: AppState) =>
  state.processingError;
export const selectPendingClarification = (state: AppState) =>
  state.pendingClarification;
export const selectPendingItems = (state: AppState) => state.pendingItems;

// Get logs by date
export const selectLogsByDate = (date: string) => (state: AppState) =>
  state.logs.filter((log) => log.logged_at.startsWith(date));

// Get logs grouped by category
export const selectLogsByCategory = (state: AppState) => {
  const grouped: Record<string, HealthLog[]> = {};
  state.logs.forEach((log) => {
    if (!grouped[log.category]) {
      grouped[log.category] = [];
    }
    grouped[log.category].push(log);
  });
  return grouped;
};

// Get today's logs
export const selectTodaysLogs = (state: AppState) => {
  const today = new Date().toISOString().split('T')[0];
  return state.logs.filter((log) => log.logged_at.startsWith(today));
};

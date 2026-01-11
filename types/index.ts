// HealthVoice Type Definitions

export type Category =
  | 'voeding'
  | 'supplement'
  | 'beweging'
  | 'slaap'
  | 'welzijn'
  | 'overig';

export const CATEGORY_LABELS: Record<Category, { dutch: string; english: string; emoji: string }> = {
  voeding: { dutch: 'Voeding', english: 'Nutrition', emoji: '🍎' },
  supplement: { dutch: 'Supplement', english: 'Supplement', emoji: '💊' },
  beweging: { dutch: 'Beweging', english: 'Movement', emoji: '🏃' },
  slaap: { dutch: 'Slaap', english: 'Sleep', emoji: '😴' },
  welzijn: { dutch: 'Welzijn', english: 'Wellbeing', emoji: '💚' },
  overig: { dutch: 'Overig', english: 'Other', emoji: '📝' },
};

// Muted, elegant category colors matching Renaissance-inspired design
export const CATEGORY_COLORS: Record<Category, string> = {
  voeding: '#4D7C0F',      // Olive green
  supplement: '#7E22CE',   // Deep purple
  beweging: '#B45309',     // Warm amber
  slaap: '#1E40AF',        // Deep blue
  welzijn: '#BE185D',      // Rose
  overig: '#57534E',       // Stone
};

// Background tints for category cards (subtle, warm)
export const CATEGORY_BG_COLORS: Record<Category, string> = {
  voeding: 'rgba(77, 124, 15, 0.06)',
  supplement: 'rgba(126, 34, 206, 0.06)',
  beweging: 'rgba(180, 83, 9, 0.06)',
  slaap: 'rgba(30, 64, 175, 0.06)',
  welzijn: 'rgba(190, 24, 93, 0.06)',
  overig: 'rgba(87, 83, 78, 0.06)',
};

// Content types per category
export interface NutritionContent {
  items: string[];
  meal_type?: 'ontbijt' | 'lunch' | 'diner' | 'snack' | 'drank';
  quantity?: string;
  calories?: number;
}

export interface SupplementContent {
  name: string;
  dosage?: string;
  unit?: string;
  quantity?: number;
}

export interface MovementContent {
  activity: string;
  duration_minutes?: number;
  intensity?: 'licht' | 'matig' | 'intens';
  distance_km?: number;
}

export interface SleepContent {
  duration_hours?: number;
  quality?: 'slecht' | 'matig' | 'goed' | 'uitstekend';
  notes?: string;
}

export interface WellbeingContent {
  type: 'energie' | 'mood' | 'stress' | 'symptoom' | 'algemeen';
  level?: number; // 1-10
  description?: string;
}

export interface OtherContent {
  description: string;
}

export type HealthLogContent =
  | NutritionContent
  | SupplementContent
  | MovementContent
  | SleepContent
  | WellbeingContent
  | OtherContent;

// Database types
export interface Profile {
  id: string;
  created_at: string;
  display_name: string | null;
  preferences: {
    categories: Category[];
    apple_health_sync: boolean;
    weekly_digest: boolean;
  };
}

export interface HealthLog {
  id: string;
  user_id: string;
  created_at: string;
  logged_at: string;
  raw_transcript: string;
  audio_duration_ms: number | null;
  category: Category;
  subcategory: string | null;
  content: HealthLogContent;
  confidence_score: number;
  was_edited: boolean;
  apple_health_synced: boolean;
}

export interface ExtractionLog {
  id: string;
  health_log_id: string;
  created_at: string;
  raw_transcript: string | null;
  llm_response: object | null;
  extraction_time_ms: number | null;
  confidence_details: object | null;
}

export interface UserStats {
  user_id: string;
  updated_at: string;
  current_streak: number;
  longest_streak: number;
  total_logs: number;
  category_counts: Record<Category, number>;
  word_frequency: Record<string, number>;
}

// AI Extraction types
export interface ExtractedItem {
  category: Category;
  subcategory: string | null;
  content: HealthLogContent;
  confidence: number;
  original_text: string;
}

export interface ClarificationRequest {
  field: string;
  question: string;
}

export interface ExtractionResult {
  items: ExtractedItem[];
  needs_clarification: ClarificationRequest | null;
}

// Recording states
export type RecordingState = 'idle' | 'recording' | 'processing' | 'success' | 'error';

// Store types
export interface AppState {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logs: HealthLog[];
  stats: UserStats | null;

  // Recording state
  recordingState: RecordingState;
  currentTranscript: string | null;
  processingError: string | null;

  // Clarification state
  pendingClarification: ClarificationRequest | null;
  pendingItems: ExtractedItem[];

  // Actions
  setUser: (user: Profile | null) => void;
  setLogs: (logs: HealthLog[]) => void;
  addLog: (log: HealthLog) => void;
  updateLog: (id: string, updates: Partial<HealthLog>) => void;
  deleteLog: (id: string) => void;
  setStats: (stats: UserStats | null) => void;
  setRecordingState: (state: RecordingState) => void;
  setCurrentTranscript: (transcript: string | null) => void;
  setProcessingError: (error: string | null) => void;
  setPendingClarification: (clarification: ClarificationRequest | null) => void;
  setPendingItems: (items: ExtractedItem[]) => void;
  reset: () => void;
}

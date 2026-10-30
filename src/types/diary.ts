export type MoodType = 'happy' | 'calm' | 'excited' | 'neutral' | 'sad' | 'stressed';

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: MoodType;
  tags: string[];
  isFavorite: boolean;
  entryDate: string;   // YYYY-MM-DD
  entryTime: string;   // HH:mm
  photos: string[];    // local URIs or base64
  wordCount: number;
  createdAt: string;   // ISO string
  updatedAt: string;   // ISO string
}

export type ThemeName = 'warm' | 'lavender' | 'midnight' | 'white';

export interface ThemeColors {
  name: ThemeName;
  background: string;
  surface: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentLight: string;
  accentHover: string;
  tabBarBg: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
  danger: string;
  success: string;
  warning: string;
  isDark: boolean;
}

export interface SecuritySettings {
  isPinEnabled: boolean;
  pinHash: string | null;
  pinSalt: string | null;
  isBiometricEnabled: boolean;
  autoLockMinutes: number; // 0 = immediately, 1, 5, 15
  securityQuestion: string;
  securityAnswerHash: string | null;
}

export interface MoodStat {
  mood: MoodType;
  label: string;
  count: number;
  percentage: number;
  color: string;
  emoji: string;
}

export interface FilterOptions {
  searchQuery?: string;
  mood?: MoodType | 'all';
  tag?: string;
  onlyFavorites?: boolean;
  startDate?: string;
  endDate?: string;
}

export type AiProvider = 'offline' | 'gemini' | 'openai';

export interface AiSettings {
  isEnabled: boolean;
  provider: AiProvider;
  apiKey: string;
  autoDetectMood: boolean;
  modelName?: string;
}

export interface AiReflection {
  sentiment: string;
  empathyResponse: string;
  followUpQuestion: string;
  suggestedTags: string[];
  suggestedMood: MoodType;
  keyLesson?: string;
}

export interface MindfulDigest {
  periodTitle: string;
  chapterTitle: string;
  overview: string;
  highsAndWins: string[];
  growthObservations: string[];
  mindfulMotto: string;
  dominantMood: MoodType;
  entriesAnalyzed: number;
}


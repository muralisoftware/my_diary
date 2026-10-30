import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiaryEntry } from '../types/diary';

const ENTRIES_KEY = '@personal_diary_entries_v1';
const DRAFT_KEY = '@personal_diary_draft_v1';
const PREFS_KEY = '@personal_diary_preferences_v1';

// Initial sample entries to give the user a warm, populated mindful journal out of the box
const SAMPLE_ENTRIES: DiaryEntry[] = [
  {
    id: 'sample-entry-1',
    title: 'Morning Walk by the Waterfront',
    content: 'Woke up early before sunrise and walked down to the lake. The mist was rising softly above the calm water, and the air was crisp. I took ten deep breaths, put my phone away in my pocket, and just listened to the morning birds. Feeling centered, refreshed, and ready for whatever the day brings.',
    mood: 'calm',
    tags: ['mindfulness', 'morning', 'nature'],
    isFavorite: true,
    entryDate: new Date().toISOString().split('T')[0], // Today
    entryTime: '07:15',
    photos: [],
    wordCount: 64,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'sample-entry-2',
    title: 'Breakthrough on the New Project',
    content: 'Finally solved the architectural hurdle that had been bugging me all week! Sat down with a warm cup of Earl Grey tea, mapped out the clean layers on paper first, and everything fell into place smoothly. Celebrated with homemade pasta in the evening.',
    mood: 'excited',
    tags: ['work', 'creativity', 'achievement'],
    isFavorite: false,
    entryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    entryTime: '18:40',
    photos: [],
    wordCount: 46,
    createdAt: new Date(Date.now() - 86400000 - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 - 3600000 * 3).toISOString(),
  },
  {
    id: 'sample-entry-3',
    title: 'Quiet Sunday Reading & Baking Bread',
    content: 'Spent the afternoon baking sourdough. The kitchen smelled wonderful of warm crust and yeast. Read three chapters of "The Sound of a Wild Snail Eating" on the balcony as sunlight filtered through the bamboo blinds. Simple days like this are my true recharge.',
    mood: 'happy',
    tags: ['gratitude', 'reading', 'home'],
    isFavorite: true,
    entryDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
    entryTime: '15:20',
    photos: [],
    wordCount: 52,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sample-entry-4',
    title: 'Managing Heavy Workloads and Resetting',
    content: 'Felt a wave of overwhelm around noon with back-to-back meetings and deadlines piling up. Instead of powering through frantically, I stopped, closed my eyes for 10 minutes, and made a single prioritized checklist. One step at a time is enough.',
    mood: 'stressed',
    tags: ['work', 'reflection', 'self-care'],
    isFavorite: false,
    entryDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], // 3 days ago
    entryTime: '20:10',
    photos: [],
    wordCount: 47,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'sample-entry-5',
    title: 'Reflections from Previous Season',
    content: 'Looking at how quickly the months pass by. Placed fresh eucalyptus in the ceramic vase by my desk. Life feels steadier now. Grateful for good health and loving friends.',
    mood: 'calm',
    tags: ['gratitude', 'reflection'],
    isFavorite: true,
    entryDate: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], // 7 days ago
    entryTime: '21:30',
    photos: [],
    wordCount: 33,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export const initStorage = async (): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(ENTRIES_KEY);
    if (!raw) {
      await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(SAMPLE_ENTRIES));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

export const getRawEntries = async (): Promise<DiaryEntry[]> => {
  try {
    const raw = await AsyncStorage.getItem(ENTRIES_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as DiaryEntry[];
  } catch (error) {
    console.error('Error reading raw entries:', error);
    return [];
  }
};

export const saveRawEntries = async (entries: DiaryEntry[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving raw entries:', error);
    throw error;
  }
};

export const getSavedDraft = async (): Promise<{ title: string; content: string; mood: string; tags: string[] } | null> => {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveDraft = async (draft: { title: string; content: string; mood: string; tags: string[] } | null): Promise<void> => {
  try {
    if (draft === null) {
      await AsyncStorage.removeItem(DRAFT_KEY);
    } else {
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  } catch (error) {
    console.error('Error saving draft:', error);
  }
};

export const getPreference = async (key: string, defaultValue: string = ''): Promise<string> => {
  try {
    const raw = await AsyncStorage.getItem(`${PREFS_KEY}_${key}`);
    return raw !== null ? raw : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setPreference = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${PREFS_KEY}_${key}`, value);
  } catch (error) {
    console.error(`Error setting preference ${key}:`, error);
  }
};

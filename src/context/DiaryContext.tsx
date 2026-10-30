import React, { createContext, useContext, useEffect, useState } from 'react';
import { DiaryEntry, MoodType } from '../types/diary';
import { diaryRepository } from '../database/diaryRepository';
import { initStorage } from '../database/db';

interface DiaryContextType {
  entries: DiaryEntry[];
  isLoading: boolean;
  streak: { currentStreak: number; longestStreak: number; totalEntries: number };
  monthlyCount: number;
  datesWithEntries: Record<string, { count: number; moods: MoodType[] }>;
  todayMood: MoodType | null;
  refreshEntries: () => Promise<void>;
  createEntry: (data: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) => Promise<DiaryEntry>;
  updateEntry: (id: string, data: Partial<Omit<DiaryEntry, 'id' | 'createdAt'>>) => Promise<DiaryEntry | null>;
  deleteEntry: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  
  // Navigation / Modal triggers
  activeEntry: DiaryEntry | null;
  setActiveEntry: (entry: DiaryEntry | null) => void;
  isEditorOpen: boolean;
  editingEntry: DiaryEntry | null;
  openEditor: (entry?: DiaryEntry) => void;
  closeEditor: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isPinModalOpen: boolean;
  setIsPinModalOpen: (open: boolean) => void;
}

const DiaryContext = createContext<DiaryContextType>({
  entries: [],
  isLoading: true,
  streak: { currentStreak: 0, longestStreak: 0, totalEntries: 0 },
  monthlyCount: 0,
  datesWithEntries: {},
  todayMood: null,
  refreshEntries: async () => {},
  createEntry: async () => ({} as DiaryEntry),
  updateEntry: async () => null,
  deleteEntry: async () => false,
  toggleFavorite: async () => false,
  activeEntry: null,
  setActiveEntry: () => {},
  isEditorOpen: false,
  editingEntry: null,
  openEditor: () => {},
  closeEditor: () => {},
  isSearchOpen: false,
  setIsSearchOpen: () => {},
  isPinModalOpen: false,
  setIsPinModalOpen: () => {},
});

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, totalEntries: 0 });
  const [monthlyCount, setMonthlyCount] = useState<number>(0);
  const [datesWithEntries, setDatesWithEntries] = useState<Record<string, { count: number; moods: MoodType[] }>>({});
  
  // Modals state
  const [activeEntry, setActiveEntry] = useState<DiaryEntry | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  const refreshEntries = async () => {
    try {
      await initStorage();
      const all = await diaryRepository.getAll();
      setEntries(all);

      const streakData = await diaryRepository.getWritingStreak();
      setStreak(streakData);

      const mCount = await diaryRepository.getMonthlyCount();
      setMonthlyCount(mCount);

      const dMap = await diaryRepository.getDatesWithEntries();
      setDatesWithEntries(dMap);
    } catch (e) {
      console.error('Error refreshing diary entries:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshEntries();
  }, []);

  const openEditor = (entry?: DiaryEntry) => {
    setEditingEntry(entry || null);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingEntry(null);
  };

  const createEntry = async (data: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>): Promise<DiaryEntry> => {
    const created = await diaryRepository.create(data);
    await refreshEntries();
    return created;
  };

  const updateEntry = async (id: string, data: Partial<Omit<DiaryEntry, 'id' | 'createdAt'>>): Promise<DiaryEntry | null> => {
    const updated = await diaryRepository.update(id, data);
    await refreshEntries();
    if (activeEntry && activeEntry.id === id && updated) {
      setActiveEntry(updated);
    }
    return updated;
  };

  const deleteEntry = async (id: string): Promise<boolean> => {
    const success = await diaryRepository.delete(id);
    if (success) {
      if (activeEntry && activeEntry.id === id) {
        setActiveEntry(null);
      }
      await refreshEntries();
    }
    return success;
  };

  const toggleFavorite = async (id: string): Promise<boolean> => {
    const isFav = await diaryRepository.toggleFavorite(id);
    await refreshEntries();
    if (activeEntry && activeEntry.id === id) {
      setActiveEntry({ ...activeEntry, isFavorite: isFav });
    }
    return isFav;
  };

  // Determine today's mood from today's latest entry
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find((e) => e.entryDate === todayStr);
  const todayMood = todayEntry ? todayEntry.mood : null;

  return (
    <DiaryContext.Provider
      value={{
        entries,
        isLoading,
        streak,
        monthlyCount,
        datesWithEntries,
        todayMood,
        refreshEntries,
        createEntry,
        updateEntry,
        deleteEntry,
        toggleFavorite,
        activeEntry,
        setActiveEntry,
        isEditorOpen,
        editingEntry,
        openEditor,
        closeEditor,
        isSearchOpen,
        setIsSearchOpen,
        isPinModalOpen,
        setIsPinModalOpen,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
};

export const useDiary = () => useContext(DiaryContext);

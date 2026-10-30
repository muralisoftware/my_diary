import { DiaryEntry, FilterOptions, MoodStat, MoodType } from '../types/diary';
import { MOODS, MOOD_LIST } from '../constants/moods';
import { getRawEntries, saveRawEntries } from './db';

export const diaryRepository = {
  async getAll(): Promise<DiaryEntry[]> {
    const entries = await getRawEntries();
    return entries.sort((a, b) => {
      // Sort newest first by entryDate then entryTime
      if (a.entryDate !== b.entryDate) {
        return b.entryDate.localeCompare(a.entryDate);
      }
      return b.entryTime.localeCompare(a.entryTime);
    });
  },

  async getById(id: string): Promise<DiaryEntry | null> {
    const entries = await getRawEntries();
    return entries.find((e) => e.id === id) || null;
  },

  async create(data: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'> & { id?: string }): Promise<DiaryEntry> {
    const entries = await getRawEntries();
    const now = new Date();
    const wordCount = data.content.trim() ? data.content.trim().split(/\s+/).length : 0;
    
    const newEntry: DiaryEntry = {
      id: data.id || `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title.trim() || 'Untitled Reflection',
      content: data.content,
      mood: data.mood,
      tags: data.tags || [],
      isFavorite: !!data.isFavorite,
      entryDate: data.entryDate || now.toISOString().split('T')[0],
      entryTime: data.entryTime || now.toTimeString().substring(0, 5),
      photos: data.photos || [],
      wordCount,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    entries.unshift(newEntry);
    await saveRawEntries(entries);
    return newEntry;
  },

  async update(id: string, data: Partial<Omit<DiaryEntry, 'id' | 'createdAt'>>): Promise<DiaryEntry | null> {
    const entries = await getRawEntries();
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const current = entries[index];
    const newContent = data.content !== undefined ? data.content : current.content;
    const wordCount = newContent.trim() ? newContent.trim().split(/\s+/).length : 0;

    const updatedEntry: DiaryEntry = {
      ...current,
      ...data,
      wordCount,
      updatedAt: new Date().toISOString(),
    };

    entries[index] = updatedEntry;
    await saveRawEntries(entries);
    return updatedEntry;
  },

  async delete(id: string): Promise<boolean> {
    const entries = await getRawEntries();
    const filtered = entries.filter((e) => e.id !== id);
    if (filtered.length === entries.length) return false;
    await saveRawEntries(filtered);
    return true;
  },

  async toggleFavorite(id: string): Promise<boolean> {
    const entries = await getRawEntries();
    const entry = entries.find((e) => e.id === id);
    if (!entry) return false;
    entry.isFavorite = !entry.isFavorite;
    entry.updatedAt = new Date().toISOString();
    await saveRawEntries(entries);
    return entry.isFavorite;
  },

  async search(options: FilterOptions): Promise<DiaryEntry[]> {
    const all = await this.getAll();
    return all.filter((entry) => {
      // Keyword search in title, content, or tags
      if (options.searchQuery && options.searchQuery.trim()) {
        const query = options.searchQuery.toLowerCase().trim();
        const matchTitle = entry.title.toLowerCase().includes(query);
        const matchContent = entry.content.toLowerCase().includes(query);
        const matchTags = entry.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchContent && !matchTags) return false;
      }

      // Mood filter
      if (options.mood && options.mood !== 'all' && entry.mood !== options.mood) {
        return false;
      }

      // Tag filter
      if (options.tag && !entry.tags.includes(options.tag)) {
        return false;
      }

      // Favorite filter
      if (options.onlyFavorites && !entry.isFavorite) {
        return false;
      }

      // Date range filter
      if (options.startDate && entry.entryDate < options.startDate) {
        return false;
      }
      if (options.endDate && entry.entryDate > options.endDate) {
        return false;
      }

      return true;
    });
  },

  async getRecent(limit: number = 5): Promise<DiaryEntry[]> {
    const all = await this.getAll();
    return all.slice(0, limit);
  },

  async getByDate(dateStr: string): Promise<DiaryEntry[]> {
    const all = await this.getAll();
    return all.filter((e) => e.entryDate === dateStr);
  },

  async getDatesWithEntries(): Promise<Record<string, { count: number; moods: MoodType[] }>> {
    const all = await this.getAll();
    const map: Record<string, { count: number; moods: MoodType[] }> = {};
    for (const entry of all) {
      if (!map[entry.entryDate]) {
        map[entry.entryDate] = { count: 0, moods: [] };
      }
      map[entry.entryDate].count += 1;
      if (!map[entry.entryDate].moods.includes(entry.mood)) {
        map[entry.entryDate].moods.push(entry.mood);
      }
    }
    return map;
  },

  async getWritingStreak(): Promise<{ currentStreak: number; longestStreak: number; totalEntries: number }> {
    const all = await this.getAll();
    if (all.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalEntries: 0 };
    }

    // Unique sorted dates
    const dateSet = new Set(all.map((e) => e.entryDate));
    const sortedDates = Array.from(dateSet).sort().reverse(); // Newest first

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    let checkDate = new Date();

    // Check if user wrote today or yesterday to continue streak
    if (sortedDates.includes(todayStr)) {
      currentStreak = 1;
      checkDate = new Date(Date.now() - 86400000);
    } else if (sortedDates.includes(yesterday)) {
      currentStreak = 1;
      checkDate = new Date(Date.now() - 86400000 * 2);
    } else {
      return { currentStreak: 0, longestStreak: calculateLongestStreak(sortedDates), totalEntries: all.length };
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        currentStreak += 1;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, calculateLongestStreak(sortedDates)),
      totalEntries: all.length,
    };
  },

  async getMonthlyCount(yearMonthStr?: string): Promise<number> {
    const all = await this.getAll();
    const target = yearMonthStr || new Date().toISOString().substring(0, 7); // YYYY-MM
    return all.filter((e) => e.entryDate.startsWith(target)).length;
  },

  async getMoodAnalytics(): Promise<{ stats: MoodStat[]; dominantMood: MoodType | null; totalMoodEntries: number }> {
    const all = await this.getAll();
    const counts: Record<MoodType, number> = {
      happy: 0,
      calm: 0,
      excited: 0,
      neutral: 0,
      sad: 0,
      stressed: 0,
    };

    all.forEach((entry) => {
      if (counts[entry.mood] !== undefined) {
        counts[entry.mood] += 1;
      }
    });

    const total = all.length;
    let dominantMood: MoodType | null = null;
    let maxCount = -1;

    const stats: MoodStat[] = MOOD_LIST.map((meta) => {
      const count = counts[meta.type];
      if (count > maxCount && count > 0) {
        maxCount = count;
        dominantMood = meta.type;
      }
      return {
        mood: meta.type,
        label: meta.label,
        emoji: meta.emoji,
        color: meta.color,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });

    return {
      stats,
      dominantMood,
      totalMoodEntries: total,
    };
  },

  async getOnThisDay(monthDayStr?: string): Promise<DiaryEntry[]> {
    const all = await this.getAll();
    const target = monthDayStr || new Date().toISOString().substring(5, 10); // MM-DD
    const todayYear = new Date().getFullYear();

    return all.filter((entry) => {
      const entryMonthDay = entry.entryDate.substring(5, 10);
      const entryYear = parseInt(entry.entryDate.substring(0, 4), 10);
      return entryMonthDay === target && entryYear < todayYear;
    });
  },

  async getAllTags(): Promise<{ tag: string; count: number }[]> {
    const all = await this.getAll();
    const map: Record<string, number> = {};
    all.forEach((e) => {
      e.tags.forEach((t) => {
        const clean = t.trim().toLowerCase();
        if (clean) {
          map[clean] = (map[clean] || 0) + 1;
        }
      });
    });

    return Object.entries(map)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  },
};

function calculateLongestStreak(sortedDatesDesc: string[]): number {
  if (sortedDatesDesc.length === 0) return 0;
  const sortedAsc = [...sortedDatesDesc].sort();
  let max = 1;
  let current = 1;

  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = new Date(sortedAsc[i - 1]);
    const curr = new Date(sortedAsc[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      current += 1;
      max = Math.max(max, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }

  return max;
}

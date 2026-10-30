import { DiaryEntry } from '../types/diary';
import { getRawEntries, saveRawEntries } from '../database/db';

export interface BackupPayload {
  version: '1.0';
  exportedAt: string;
  appName: 'My Diary';
  totalEntries: number;
  entries: DiaryEntry[];
}

export const exportService = {
  async generateBackupJson(): Promise<string> {
    const entries = await getRawEntries();
    const payload: BackupPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'My Diary',
      totalEntries: entries.length,
      entries,
    };
    return JSON.stringify(payload, null, 2);
  },

  async restoreFromJson(jsonString: string): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const parsed = JSON.parse(jsonString) as BackupPayload;
      if (!parsed || !Array.isArray(parsed.entries)) {
        return { success: false, count: 0, error: 'Invalid backup structure. Missing "entries" list.' };
      }

      // Basic validation of entries
      const validEntries: DiaryEntry[] = [];
      for (const item of parsed.entries) {
        if (item.id && item.title && item.content !== undefined && item.entryDate) {
          validEntries.push({
            id: String(item.id),
            title: String(item.title),
            content: String(item.content),
            mood: item.mood || 'calm',
            tags: Array.isArray(item.tags) ? item.tags : [],
            isFavorite: !!item.isFavorite,
            entryDate: String(item.entryDate),
            entryTime: item.entryTime || '12:00',
            photos: Array.isArray(item.photos) ? item.photos : [],
            wordCount: item.wordCount || 0,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString(),
          });
        }
      }

      if (validEntries.length === 0) {
        return { success: false, count: 0, error: 'No valid journal entries found in backup file.' };
      }

      // Merge or replace
      await saveRawEntries(validEntries);
      return { success: true, count: validEntries.length };
    } catch (e: any) {
      return { success: false, count: 0, error: e?.message || 'Failed to parse JSON file' };
    }
  },

  async generatePrintableMarkdown(): Promise<string> {
    const entries = await getRawEntries();
    let text = `# My Diary — Complete Journal Archive\n`;
    text += `*Generated on ${new Date().toLocaleDateString()} — Total Entries: ${entries.length}*\n\n---\n\n`;

    entries.forEach((entry) => {
      text += `## ${entry.title}\n`;
      text += `**Date:** ${entry.entryDate} at ${entry.entryTime} | **Mood:** ${entry.mood.toUpperCase()} ${entry.isFavorite ? '★ Favorite' : ''}\n`;
      if (entry.tags && entry.tags.length > 0) {
        text += `**Tags:** ${entry.tags.map((t) => `#${t}`).join(' ')}\n`;
      }
      text += `\n${entry.content}\n\n---\n\n`;
    });

    return text;
  },
};

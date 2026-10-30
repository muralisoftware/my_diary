import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { Header } from '../components/common/Header';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { OnThisDayCard } from '../components/calendar/OnThisDayCard';
import { DiaryCard } from '../components/diary/DiaryCard';
import { diaryRepository } from '../database/diaryRepository';
import { DiaryEntry } from '../types/diary';
import { Calendar as CalendarIcon, Plus } from 'lucide-react-native';

export const CalendarScreen: React.FC = () => {
  const { theme } = useTheme();
  const { datesWithEntries, openEditor, setActiveEntry } = useDiary();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [dayEntries, setDayEntries] = useState<DiaryEntry[]>([]);
  const [onThisDayEntries, setOnThisDayEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    (async () => {
      const entries = await diaryRepository.getByDate(selectedDate);
      setDayEntries(entries);

      // Load On This Day memories for today's month & day
      const memoryMonthDay = selectedDate.substring(5, 10);
      const memories = await diaryRepository.getOnThisDay(memoryMonthDay);
      setOnThisDayEntries(memories);
    })();
  }, [selectedDate, datesWithEntries]);

  const formatSelectedHeader = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleWriteForSelectedDate = () => {
    openEditor({
      id: '',
      title: '',
      content: '',
      mood: 'calm',
      tags: [],
      isFavorite: false,
      entryDate: selectedDate,
      entryTime: new Date().toTimeString().substring(0, 5),
      photos: [],
      wordCount: 0,
      createdAt: '',
      updatedAt: '',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Calendar & Memories" showSearch={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Interactive Month Calendar */}
        <CalendarGrid
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          datesWithEntries={datesWithEntries}
        />

        {/* On This Day Flashcard */}
        <OnThisDayCard
          entries={onThisDayEntries}
          onSelectEntry={(entry) => setActiveEntry(entry)}
        />

        {/* Selected Date Header & Entries */}
        <View style={styles.dateHeaderRow}>
          <View style={styles.dateTitleContainer}>
            <CalendarIcon size={16} color={theme.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.dateTitle, { color: theme.text }]}>
              {formatSelectedHeader(selectedDate)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleWriteForSelectedDate}
            style={[styles.addBtn, { backgroundColor: theme.accentLight }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Plus size={15} color={theme.accent} />
            <Text style={[styles.addBtnText, { color: theme.accent }]}>Write</Text>
          </TouchableOpacity>
        </View>

        {dayEntries.length === 0 ? (
          <View
            style={[
              styles.emptyDayBox,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={[styles.emptyDayTitle, { color: theme.text }]}>
              No diary entry for this date
            </Text>
            <Text style={[styles.emptyDayDesc, { color: theme.textSecondary }]}>
              Take a quiet moment to write about your thoughts or memories from this day.
            </Text>
            <TouchableOpacity
              onPress={handleWriteForSelectedDate}
              style={[styles.writeDayBtn, { backgroundColor: theme.accent }]}
            >
              <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.writeDayBtnText}>Write for {selectedDate}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          dayEntries.map((entry) => (
            <DiaryCard
              key={entry.id}
              entry={entry}
              onPress={() => setActiveEntry(entry)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 3,
  },
  emptyDayBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyDayTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyDayDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  writeDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  writeDayBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { diaryRepository } from '../database/diaryRepository';
import { DiaryEntry, MoodType } from '../types/diary';
import { MOOD_LIST } from '../constants/moods';
import { DiaryCard } from '../components/diary/DiaryCard';
import { Search, X, Star, Filter } from 'lucide-react-native';

export const SearchModal: React.FC = () => {
  const { theme } = useTheme();
  const { isSearchOpen, setIsSearchOpen, setActiveEntry } = useDiary();

  const [query, setQuery] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<MoodType | 'all'>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [results, setResults] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    if (isSearchOpen) {
      (async () => {
        const found = await diaryRepository.search({
          searchQuery: query,
          mood: selectedMood,
          onlyFavorites,
        });
        setResults(found);
      })();
    }
  }, [query, selectedMood, onlyFavorites, isSearchOpen]);

  const handleClose = () => {
    setIsSearchOpen(false);
    setQuery('');
    setSelectedMood('all');
    setOnlyFavorites(false);
  };

  return (
    <Modal
      visible={isSearchOpen}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top Search Input Bar */}
        <View style={[styles.searchBarHeader, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.isDark ? '#232933' : '#F6F0E6',
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <Search size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Search thoughts, reflections, tags..."
              placeholderTextColor={theme.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={handleClose} style={styles.cancelBtn}>
            <Text style={[styles.cancelBtnText, { color: theme.accent }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Filters Scroll Row */}
        <View style={[styles.filterBar, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {/* Favorites Toggle */}
            <TouchableOpacity
              onPress={() => setOnlyFavorites(!onlyFavorites)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: onlyFavorites ? '#F59E0B' : theme.isDark ? '#232933' : '#F4EEE5',
                  borderColor: onlyFavorites ? '#F59E0B' : theme.cardBorder,
                },
              ]}
            >
              <Star size={13} color={onlyFavorites ? '#FFFFFF' : '#F59E0B'} fill={onlyFavorites ? '#FFFFFF' : '#F59E0B'} style={{ marginRight: 4 }} />
              <Text style={[styles.filterPillText, { color: onlyFavorites ? '#FFFFFF' : theme.text }]}>
                Favorites
              </Text>
            </TouchableOpacity>

            {/* All Moods Pill */}
            <TouchableOpacity
              onPress={() => setSelectedMood('all')}
              style={[
                styles.filterPill,
                {
                  backgroundColor: selectedMood === 'all' ? theme.accent : theme.isDark ? '#232933' : '#F4EEE5',
                  borderColor: selectedMood === 'all' ? theme.accent : theme.cardBorder,
                },
              ]}
            >
              <Text style={[styles.filterPillText, { color: selectedMood === 'all' ? '#FFFFFF' : theme.text }]}>
                All Moods
              </Text>
            </TouchableOpacity>

            {/* Mood options */}
            {MOOD_LIST.map((m) => {
              const isSelected = selectedMood === m.type;
              return (
                <TouchableOpacity
                  key={m.type}
                  onPress={() => setSelectedMood(isSelected ? 'all' : m.type)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isSelected ? m.color : theme.isDark ? '#232933' : '#F4EEE5',
                      borderColor: isSelected ? m.color : theme.cardBorder,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 13, marginRight: 4 }}>{m.emoji}</Text>
                  <Text style={[styles.filterPillText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Results List */}
        <ScrollView contentContainerStyle={styles.resultsContent}>
          <Text style={[styles.resultCountText, { color: theme.textMuted }]}>
            Found {results.length} {results.length === 1 ? 'entry' : 'entries'}
          </Text>

          {results.length === 0 ? (
            <View style={styles.emptyState}>
              <Filter size={36} color={theme.textMuted} style={{ marginBottom: 10 }} />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No matching entries
              </Text>
              <Text style={[styles.emptyStateDesc, { color: theme.textSecondary }]}>
                Try adjusting your search terms or relaxing mood and favorite filters.
              </Text>
            </View>
          ) : (
            results.map((entry) => (
              <DiaryCard
                key={entry.id}
                entry={entry}
                onPress={() => {
                  handleClose();
                  setActiveEntry(entry);
                }}
              />
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  cancelBtn: {
    marginLeft: 12,
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  filterBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultsContent: {
    padding: 16,
    paddingBottom: 40,
  },
  resultCountText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyStateDesc: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { DiaryEntry } from '../../types/diary';
import { MoodBadge } from '../common/MoodBadge';
import { History, Calendar } from 'lucide-react-native';

interface OnThisDayCardProps {
  entries: DiaryEntry[];
  onSelectEntry: (entry: DiaryEntry) => void;
}

export const OnThisDayCard: React.FC<OnThisDayCardProps> = ({ entries, onSelectEntry }) => {
  const { theme } = useTheme();

  if (!entries || entries.length === 0) {
    return null;
  }

  const primary = entries[0];
  const year = primary.entryDate.substring(0, 4);
  const yearsAgo = new Date().getFullYear() - parseInt(year, 10);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.isDark ? '#232933' : '#F7F3EA',
          borderColor: theme.isDark ? '#323B4A' : '#EBE0D0',
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <History size={14} color={theme.accent} />
          <Text style={[styles.badgeText, { color: theme.accent }]}>
            ON THIS DAY {yearsAgo > 0 ? `(${yearsAgo} YEAR${yearsAgo > 1 ? 'S' : ''} AGO)` : ''}
          </Text>
        </View>
        <MoodBadge mood={primary.mood} size="sm" />
      </View>

      <Text style={[styles.entryTitle, { color: theme.text }]}>
        {primary.title}
      </Text>

      <Text style={[styles.entrySnippet, { color: theme.textSecondary }]} numberOfLines={2}>
        {primary.content}
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectEntry(primary)}
        style={[styles.readBtn, { borderColor: theme.accent }]}
      >
        <Calendar size={13} color={theme.accent} style={{ marginRight: 6 }} />
        <Text style={[styles.readBtnText, { color: theme.accent }]}>
          Revisit Memory ({primary.entryDate})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  entrySnippet: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  readBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

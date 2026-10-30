import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DiaryEntry } from '../../types/diary';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { MoodBadge } from '../common/MoodBadge';
import { Star, Clock } from 'lucide-react-native';

interface DiaryCardProps {
  entry: DiaryEntry;
  onPress: () => void;
}

export const DiaryCard: React.FC<DiaryCardProps> = ({ entry, onPress }) => {
  const { theme } = useTheme();
  const { toggleFavorite } = useDiary();

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          shadowColor: theme.isDark ? '#000' : '#8C5A3C',
        },
      ]}
    >
      {/* Top Meta Row */}
      <View style={styles.topRow}>
        <View style={styles.dateGroup}>
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {formatDate(entry.entryDate)}
          </Text>
          <View style={styles.timeGroup}>
            <Clock size={11} color={theme.textMuted} />
            <Text style={[styles.timeText, { color: theme.textMuted }]}>{entry.entryTime}</Text>
          </View>
        </View>

        <View style={styles.actionsGroup}>
          <MoodBadge mood={entry.mood} size="sm" />
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(entry.id);
            }}
            style={styles.starBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Star
              size={18}
              color={entry.isFavorite ? '#F59E0B' : theme.textMuted}
              fill={entry.isFavorite ? '#F59E0B' : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
        {entry.title}
      </Text>

      {/* Snippet */}
      <Text style={[styles.content, { color: theme.textSecondary }]} numberOfLines={3}>
        {entry.content}
      </Text>

      {/* Bottom Footer (Tags & Word count) */}
      <View style={styles.footer}>
        <View style={styles.tagsContainer}>
          {entry.tags.slice(0, 3).map((tag, i) => (
            <View
              key={i}
              style={[
                styles.tagPill,
                { backgroundColor: theme.isDark ? '#262E3B' : '#F6F0E6' },
              ]}
            >
              <Text style={[styles.tagText, { color: theme.textSecondary }]}>#{tag}</Text>
            </View>
          ))}
          {entry.tags.length > 3 && (
            <Text style={[styles.extraTagsText, { color: theme.textMuted }]}>
              +{entry.tags.length - 3}
            </Text>
          )}
        </View>

        <Text style={[styles.wordCount, { color: theme.textMuted }]}>
          {entry.wordCount} words
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  timeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    marginLeft: 3,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starBtn: {
    marginLeft: 10,
    padding: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EBE3D7',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  extraTagsText: {
    fontSize: 11,
  },
  wordCount: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 8,
  },
});

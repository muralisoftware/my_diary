import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MoodType } from '../../types/diary';
import { MOOD_LIST } from '../../constants/moods';
import { useTheme } from '../../context/ThemeContext';

interface MoodSelectorProps {
  selectedMood: MoodType;
  onSelect: (mood: MoodType) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelect }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        How are you feeling right now?
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOOD_LIST.map((m) => {
          const isSelected = selectedMood === m.type;
          return (
            <TouchableOpacity
              key={m.type}
              activeOpacity={0.8}
              onPress={() => onSelect(m.type)}
              style={[
                styles.moodItem,
                {
                  backgroundColor: isSelected ? m.bgColor : theme.isDark ? '#222933' : '#F6F0E6',
                  borderColor: isSelected ? m.color : theme.cardBorder,
                  transform: [{ scale: isSelected ? 1.05 : 1 }],
                },
              ]}
            >
              <Text style={styles.emoji}>{m.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  {
                    color: isSelected ? m.color : theme.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  scrollContent: {
    paddingVertical: 4,
    paddingRight: 10,
  },
  moodItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginRight: 8,
    minWidth: 64,
  },
  emoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
  },
});

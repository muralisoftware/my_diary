import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MoodType } from '../../types/diary';
import { MOODS } from '../../constants/moods';

interface MoodBadgeProps {
  mood: MoodType;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const MoodBadge: React.FC<MoodBadgeProps> = ({ mood, showLabel = true, size = 'md' }) => {
  const meta = MOODS[mood] || MOODS.calm;

  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { paddingV: 3, paddingH: 8, fontSize: 11, emojiSize: 12 };
      case 'lg':
        return { paddingV: 7, paddingH: 14, fontSize: 14, emojiSize: 16 };
      default:
        return { paddingV: 4, paddingH: 10, fontSize: 12, emojiSize: 13 };
    }
  };

  const dims = getDimensions();

  return (
    <View style={[styles.container, { backgroundColor: meta.bgColor, paddingVertical: dims.paddingV, paddingHorizontal: dims.paddingH }]}>
      <Text style={{ fontSize: dims.emojiSize, marginRight: showLabel ? 4 : 0 }}>{meta.emoji}</Text>
      {showLabel && (
        <Text style={[styles.label, { color: meta.color, fontSize: dims.fontSize }]}>
          {meta.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
  },
});

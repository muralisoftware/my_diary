import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { X } from 'lucide-react-native';

interface TagChipProps {
  label: string;
  onRemove?: () => void;
  onPress?: () => void;
  isSelected?: boolean;
}

export const TagChip: React.FC<TagChipProps> = ({ label, onRemove, onPress, isSelected }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? theme.accent : theme.isDark ? '#252C37' : '#F2ECE4',
          borderColor: isSelected ? theme.accent : theme.cardBorder,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: isSelected ? '#FFFFFF' : theme.textSecondary,
          },
        ]}
      >
        #{label}
      </Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={12} color={theme.textMuted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  removeBtn: {
    marginLeft: 4,
  },
});

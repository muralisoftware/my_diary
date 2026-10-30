import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getRandomPrompt, WritingPrompt } from '../../constants/prompts';
import { Lightbulb, RefreshCw, PenLine } from 'lucide-react-native';

interface WritingPromptCardProps {
  onUsePrompt: (prompt: WritingPrompt) => void;
}

export const WritingPromptCard: React.FC<WritingPromptCardProps> = ({ onUsePrompt }) => {
  const { theme } = useTheme();
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt>(getRandomPrompt());

  const handleRefresh = () => {
    let next = getRandomPrompt();
    while (next.id === currentPrompt.id) {
      next = getRandomPrompt();
    }
    setCurrentPrompt(next);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.isDark ? '#232A35' : '#F6EFE6',
          borderColor: theme.isDark ? '#333D4D' : '#EBDCCB',
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Lightbulb size={16} color={theme.accent} />
          <Text style={[styles.badgeText, { color: theme.accent }]}>DAILY INSPIRATION</Text>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          style={styles.refreshBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="New prompt"
        >
          <RefreshCw size={14} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.promptText, { color: theme.text }]}>
        "{currentPrompt.prompt}"
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onUsePrompt(currentPrompt)}
        style={[styles.useButton, { backgroundColor: theme.accent }]}
      >
        <PenLine size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.useButtonText}>Reflect on This</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  refreshBtn: {
    padding: 4,
  },
  promptText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 12,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { Header } from '../components/common/Header';
import { DiaryCard } from '../components/diary/DiaryCard';
import { WritingPromptCard } from '../components/diary/WritingPromptCard';
import { MoodBadge } from '../components/common/MoodBadge';
import { WritingPrompt } from '../constants/prompts';
import { PenTool, Calendar, BookOpen, Smile, BookHeart } from 'lucide-react-native';

interface HomeScreenProps {
  onNavigateToCalendar: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToCalendar }) => {
  const { theme } = useTheme();
  const {
    entries,
    streak,
    monthlyCount,
    todayMood,
    openEditor,
    setActiveEntry,
  } = useDiary();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const recentEntries = entries.slice(0, 5);

  const handleUsePrompt = (prompt: WritingPrompt) => {
    openEditor({
      id: '',
      title: `Reflection: ${prompt.prompt.substring(0, 30)}...`,
      content: `${prompt.starter}\n\n`,
      mood: 'calm',
      tags: ['reflection', prompt.category],
      isFavorite: false,
      entryDate: new Date().toISOString().split('T')[0],
      entryTime: new Date().toTimeString().substring(0, 5),
      photos: [],
      wordCount: 0,
      createdAt: '',
      updatedAt: '',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="My Diary"
        subtitle={todayFormatted}
        showSearch={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Greeting & Action Banner */}
        <View
          style={[
            styles.heroBanner,
            {
              backgroundColor: theme.surface,
              borderColor: theme.cardBorder,
              shadowColor: theme.isDark ? '#000' : '#8C5A3C',
            },
          ]}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.greetingText, { color: theme.textSecondary }]}>
                {getGreeting()}
              </Text>
              <Text style={[styles.heroTitle, { color: theme.text }]}>
                Your Mindful Space
              </Text>
            </View>

            {todayMood ? (
              <View style={styles.todayMoodContainer}>
                <Text style={[styles.moodLabelSmall, { color: theme.textMuted }]}>
                  Today's Mood
                </Text>
                <MoodBadge mood={todayMood} size="sm" />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => openEditor()}
                style={[styles.noMoodChip, { backgroundColor: theme.accentLight }]}
              >
                <Smile size={14} color={theme.accent} />
                <Text style={[styles.noMoodText, { color: theme.accent }]}>Log Mood</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Monthly Stats Strip */}
          <View style={[styles.statsStrip, { backgroundColor: theme.isDark ? '#232A35' : '#F6F0E6' }]}>
            <View style={styles.statItem}>
              <BookOpen size={14} color={theme.accent} />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {monthlyCount} {monthlyCount === 1 ? 'entry' : 'entries'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>this month</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

            <View style={styles.statItem}>
              <BookHeart size={14} color={theme.accent} />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {streak.totalEntries} total
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>memories</Text>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => openEditor()}
            style={[styles.writeButton, { backgroundColor: theme.accent }]}
          >
            <PenTool size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.writeButtonText}>Write Today's Diary</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Writing Prompt */}
        <WritingPromptCard onUsePrompt={handleUsePrompt} />

        {/* Section Header: Recent Entries */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Entries
          </Text>
          <TouchableOpacity
            onPress={onNavigateToCalendar}
            style={styles.calendarLink}
          >
            <Calendar size={14} color={theme.accent} style={{ marginRight: 4 }} />
            <Text style={[styles.calendarLinkText, { color: theme.accent }]}>
              Calendar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Entries List or Empty State */}
        {recentEntries.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <BookOpen size={36} color={theme.textMuted} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No diary entries yet
            </Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              Every great journey begins with a single reflection. Write what is on your mind today.
            </Text>
            <TouchableOpacity
              onPress={() => openEditor()}
              style={[styles.emptyActionBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.emptyActionBtnText}>Write First Entry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentEntries.map((entry) => (
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
  heroBanner: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  todayMoodContainer: {
    alignItems: 'flex-end',
  },
  moodLabelSmall: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  noMoodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  noMoodText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsStrip: {
    flexDirection: 'row',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
    marginRight: 4,
  },
  statLabel: {
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 18,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  writeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  calendarLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
    maxWidth: 280,
  },
  emptyActionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

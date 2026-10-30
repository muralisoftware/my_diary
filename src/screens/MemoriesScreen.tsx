import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { Header } from '../components/common/Header';
import { DiaryCard } from '../components/diary/DiaryCard';
import { diaryRepository } from '../database/diaryRepository';
import { MoodStat, MoodType, MindfulDigest } from '../types/diary';
import { MOODS } from '../constants/moods';
import { aiService } from '../services/aiService';
import {
  Heart,
  Star,
  Activity,
  BookType,
  BarChart2,
  Hash,
  BookOpen,
  Sparkle,
  Compass,
  Quote,
  RefreshCw,
} from 'lucide-react-native';

export const MemoriesScreen: React.FC = () => {
  const { theme } = useTheme();
  const { entries, streak, setActiveEntry } = useDiary();

  const [moodStats, setMoodStats] = useState<MoodStat[]>([]);
  const [dominantMood, setDominantMood] = useState<MoodType | null>(null);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [digest, setDigest] = useState<MindfulDigest | null>(null);
  const [isDigestLoading, setIsDigestLoading] = useState<boolean>(false);

  const handleGenerateDigest = async () => {
    setIsDigestLoading(true);
    try {
      const result = await aiService.generateMindfulDigest(entries);
      setDigest(result);
    } catch (e) {
      console.error('Error generating digest:', e);
    } finally {
      setIsDigestLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const analytics = await diaryRepository.getMoodAnalytics();
      setMoodStats(analytics.stats);
      setDominantMood(analytics.dominantMood);

      const allTags = await diaryRepository.getAllTags();
      setTags(allTags);

      if (entries.length > 0) {
        const result = await aiService.generateMindfulDigest(entries);
        setDigest(result);
      }
    })();
  }, [entries]);

  const favoriteEntries = entries.filter((e) => e.isFavorite);
  const filteredEntries = activeTagFilter
    ? entries.filter((e) => e.tags.includes(activeTagFilter))
    : favoriteEntries;

  const totalWords = entries.reduce((acc, curr) => acc + curr.wordCount, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Memories & Insights" showSearch={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Dominant Mood & Emotional Wellness Banner */}
        <View
          style={[
            styles.insightBanner,
            {
              backgroundColor: theme.surface,
              borderColor: theme.cardBorder,
              shadowColor: theme.isDark ? '#000' : '#8C5A3C',
            },
          ]}
        >
          <View style={styles.bannerHeader}>
            <View style={styles.badgeRow}>
              <Activity size={16} color={theme.accent} />
              <Text style={[styles.badgeText, { color: theme.accent }]}>
                MOOD REFLECTION
              </Text>
            </View>
            <BarChart2 size={16} color={theme.textMuted} />
          </View>

          {dominantMood && MOODS[dominantMood] ? (
            <View style={styles.dominantRow}>
              <Text style={styles.dominantEmoji}>{MOODS[dominantMood].emoji}</Text>
              <View style={styles.dominantTextContainer}>
                <Text style={[styles.dominantTitle, { color: theme.text }]}>
                  Dominant Mood: {MOODS[dominantMood].label}
                </Text>
                <Text style={[styles.dominantSubtitle, { color: theme.textSecondary }]}>
                  {MOODS[dominantMood].description}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.noMoodNotice, { color: theme.textSecondary }]}>
              Log your daily reflections to see your emotional patterns emerge.
            </Text>
          )}

          {/* Breakdown percentage bars */}
          <View style={styles.barsContainer}>
            {moodStats.map((stat) => (
              <View key={stat.mood} style={styles.barItem}>
                <View style={styles.barLabels}>
                  <Text style={[styles.barEmojiLabel, { color: theme.text }]}>
                    {stat.emoji} {stat.label}
                  </Text>
                  <Text style={[styles.barPercentText, { color: theme.textSecondary }]}>
                    {stat.count} ({stat.percentage}%)
                  </Text>
                </View>

                {/* Progress track */}
                <View style={[styles.progressTrack, { backgroundColor: theme.isDark ? '#262D38' : '#F1E9DE' }]}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: stat.color,
                        width: `${Math.max(stat.percentage, stat.count > 0 ? 5 : 0)}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Writing Lifetime Stats */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <BookOpen size={18} color={theme.accent} />
            <Text style={[styles.statBigNum, { color: theme.text }]}>
              {entries.length}
            </Text>
            <Text style={[styles.statLabelSmall, { color: theme.textMuted }]}>
              Total Reflections
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <Heart size={18} color="#EF4444" />
            <Text style={[styles.statBigNum, { color: theme.text }]}>
              {favoriteEntries.length}
            </Text>
            <Text style={[styles.statLabelSmall, { color: theme.textMuted }]}>
              Saved Memories
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <BookType size={18} color="#F59E0B" />
            <Text style={[styles.statBigNum, { color: theme.text }]}>
              {totalWords}
            </Text>
            <Text style={[styles.statLabelSmall, { color: theme.textMuted }]}>
              Words Written
            </Text>
          </View>
        </View>

        {/* Mindful Digest & Chapter Synthesis */}
        <View
          style={[
            styles.digestCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              shadowColor: theme.isDark ? '#000' : '#8C5A3C',
            },
          ]}
        >
          <View style={styles.digestTopHeader}>
            <View style={styles.digestBadgeRow}>
              <View style={[styles.digestIconBox, { backgroundColor: theme.accentLight }]}>
                <Sparkle size={15} color={theme.accent} />
              </View>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={[styles.digestSubHead, { color: theme.accent }]}>
                  {digest?.periodTitle || 'MINDFUL DIGEST'}
                </Text>
                <Text style={[styles.digestMainTitle, { color: theme.text }]} numberOfLines={1}>
                  {digest?.chapterTitle || 'Reflections on Your Path'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleGenerateDigest}
              disabled={isDigestLoading}
              style={[styles.refreshDigestBtn, { backgroundColor: theme.isDark ? '#262D38' : '#F6F0E6' }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RefreshCw size={14} color={theme.text} />
            </TouchableOpacity>
          </View>

          {isDigestLoading ? (
            <Text style={[styles.digestLoadingText, { color: theme.textSecondary }]}>
              Synthesizing emotional patterns and mindful growth...
            </Text>
          ) : digest ? (
            <View style={styles.digestBody}>
              <Text style={[styles.digestOverview, { color: theme.text }]}>
                {digest.overview}
              </Text>

              {digest.highsAndWins.length > 0 && (
                <View style={styles.digestBulletSection}>
                  <Text style={[styles.digestBulletTitle, { color: theme.accent }]}>
                    ✨ Highlights & Gratitude
                  </Text>
                  {digest.highsAndWins.map((win, idx) => (
                    <View key={idx} style={styles.digestBulletRow}>
                      <Text style={[styles.bulletDot, { color: theme.accent }]}>•</Text>
                      <Text style={[styles.bulletText, { color: theme.textSecondary }]}>
                        {win}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {digest.growthObservations.length > 0 && (
                <View style={styles.digestBulletSection}>
                  <Text style={[styles.digestBulletTitle, { color: theme.accent }]}>
                    🌱 Growth Observations
                  </Text>
                  {digest.growthObservations.map((obs, idx) => (
                    <View key={idx} style={styles.digestBulletRow}>
                      <Text style={[styles.bulletDot, { color: theme.accent }]}>•</Text>
                      <Text style={[styles.bulletText, { color: theme.textSecondary }]}>
                        {obs}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {digest.mindfulMotto ? (
                <View
                  style={[
                    styles.digestMottoBox,
                    {
                      backgroundColor: theme.isDark ? '#202633' : '#F7F3EB',
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <Quote size={16} color={theme.accent} style={{ marginBottom: 4 }} />
                  <Text style={[styles.digestMottoText, { color: theme.text }]}>
                    {digest.mindfulMotto}
                  </Text>
                </View>
              ) : null}

              <Text style={[styles.digestFooterNote, { color: theme.textMuted }]}>
                100% on-device AI synthesis from {digest.entriesAnalyzed} journal reflection{digest.entriesAnalyzed === 1 ? '' : 's'}
              </Text>
            </View>
          ) : (
            <Text style={[styles.digestOverview, { color: theme.textSecondary }]}>
              Write at least one journal entry to generate your personalized Mindful Digest.
            </Text>
          )}
        </View>

        {/* Tags Cloud */}
        {tags.length > 0 && (
          <View
            style={[
              styles.tagsCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <View style={styles.tagsHeader}>
              <Hash size={16} color={theme.accent} />
              <Text style={[styles.tagsCardTitle, { color: theme.text }]}>
                Journal Topics & Tags
              </Text>
            </View>

            <View style={styles.tagsWrap}>
              <TouchableOpacity
                onPress={() => setActiveTagFilter(null)}
                style={[
                  styles.tagPillFilter,
                  {
                    backgroundColor: activeTagFilter === null ? theme.accent : theme.isDark ? '#262D38' : '#F4EEE5',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tagPillFilterText,
                    { color: activeTagFilter === null ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  All Favorites
                </Text>
              </TouchableOpacity>

              {tags.map((item) => {
                const isSelected = activeTagFilter === item.tag;
                return (
                  <TouchableOpacity
                    key={item.tag}
                    onPress={() => setActiveTagFilter(isSelected ? null : item.tag)}
                    style={[
                      styles.tagPillFilter,
                      {
                        backgroundColor: isSelected ? theme.accent : theme.isDark ? '#262D38' : '#F4EEE5',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagPillFilterText,
                        { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      #{item.tag} ({item.count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Filtered or Favorite Memories List */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Star size={18} color="#F59E0B" fill="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {activeTagFilter ? `Entries tagged #${activeTagFilter}` : 'Starred Memories'}
            </Text>
          </View>
        </View>

        {filteredEntries.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Star size={32} color={theme.textMuted} />
            <Text style={[styles.emptyBoxTitle, { color: theme.text }]}>
              {activeTagFilter ? `No entries with #${activeTagFilter}` : 'No starred memories yet'}
            </Text>
            <Text style={[styles.emptyBoxDesc, { color: theme.textSecondary }]}>
              Tap the star icon on any diary entry to keep your most meaningful reflections here.
            </Text>
          </View>
        ) : (
          filteredEntries.map((entry) => (
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
  insightBanner: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  dominantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dominantEmoji: {
    fontSize: 34,
    marginRight: 12,
  },
  dominantTextContainer: {
    flex: 1,
  },
  dominantTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  dominantSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  noMoodNotice: {
    fontSize: 13,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  barsContainer: {
    marginTop: 6,
  },
  barItem: {
    marginBottom: 10,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barEmojiLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  barPercentText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statBigNum: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
  },
  statLabelSmall: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  tagsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagsCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagPillFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  tagPillFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 6,
  },
  emptyBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyBoxTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyBoxDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  digestCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  digestTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  digestBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  digestIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digestSubHead: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  digestMainTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 1,
  },
  refreshDigestBtn: {
    padding: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  digestLoadingText: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  digestBody: {
    paddingTop: 4,
  },
  digestOverview: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  digestBulletSection: {
    marginBottom: 12,
  },
  digestBulletTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  digestBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bulletDot: {
    fontSize: 14,
    lineHeight: 18,
    marginRight: 6,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  digestMottoBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginTop: 6,
    marginBottom: 12,
  },
  digestMottoText: {
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  digestFooterNote: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
});

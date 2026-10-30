import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Share,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { MoodBadge } from '../components/common/MoodBadge';
import { TagChip } from '../components/common/TagChip';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AiCompanionModal } from '../components/diary/AiCompanionModal';
import { aiService } from '../services/aiService';
import { AiReflection } from '../types/diary';
import {
  ArrowLeft,
  Edit3,
  Star,
  Share2,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  Sparkle,
} from 'lucide-react-native';

export const DiaryDetailModal: React.FC = () => {
  const { theme } = useTheme();
  const {
    activeEntry,
    setActiveEntry,
    openEditor,
    toggleFavorite,
    deleteEntry,
    updateEntry,
  } = useDiary();

  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiReflection, setAiReflection] = useState<AiReflection | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  if (!activeEntry) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleShare = async () => {
    try {
      const message = `${activeEntry.title}\n\n${activeEntry.entryDate} • Mood: ${activeEntry.mood.toUpperCase()}\n\n${activeEntry.content}\n\n— Written in My Diary`;
      await Share.share({ message });
    } catch (e) {
      console.error('Error sharing entry:', e);
    }
  };

  const handleDeleteConfirm = async () => {
    await deleteEntry(activeEntry.id);
    setConfirmDelete(false);
    setActiveEntry(null);
  };

  const handleOpenAiReflection = async () => {
    setShowAiModal(true);
    setIsAiLoading(true);
    try {
      const reflection = await aiService.getReflection(activeEntry);
      setAiReflection(reflection);
    } catch (e) {
      console.error('Failed to get AI reflection:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyTagsFromAi = async (newTags: string[]) => {
    const merged = [...activeEntry.tags];
    let changed = false;
    for (const t of newTags) {
      if (!merged.includes(t)) {
        merged.push(t);
        changed = true;
      }
    }
    if (changed) {
      await updateEntry(activeEntry.id, { tags: merged });
      setActiveEntry({ ...activeEntry, tags: merged });
    }
  };

  return (
    <Modal
      visible={!!activeEntry}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setActiveEntry(null)}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top Header Bar */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
          <TouchableOpacity
            onPress={() => setActiveEntry(null)}
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            {/* Mindful AI Reflection button */}
            <TouchableOpacity
              onPress={handleOpenAiReflection}
              style={[styles.aiHeaderBtn, { backgroundColor: theme.accentLight }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Sparkle size={14} color={theme.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.aiHeaderBtnText, { color: theme.accent }]}>Reflect</Text>
            </TouchableOpacity>

            {/* Favorite button */}
            <TouchableOpacity
              onPress={() => toggleFavorite(activeEntry.id)}
              style={styles.iconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Star
                size={20}
                color={activeEntry.isFavorite ? '#F59E0B' : theme.textMuted}
                fill={activeEntry.isFavorite ? '#F59E0B' : 'transparent'}
              />
            </TouchableOpacity>

            {/* Share button */}
            <TouchableOpacity
              onPress={handleShare}
              style={styles.iconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Share2 size={19} color={theme.text} />
            </TouchableOpacity>

            {/* Edit button */}
            <TouchableOpacity
              onPress={() => {
                const toEdit = { ...activeEntry };
                setActiveEntry(null);
                openEditor(toEdit);
              }}
              style={styles.iconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Edit3 size={19} color={theme.accent} />
            </TouchableOpacity>

            {/* Delete button */}
            <TouchableOpacity
              onPress={() => setConfirmDelete(true)}
              style={styles.iconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={19} color={theme.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Delete Confirmation Popup */}
        <ConfirmDialog
          visible={confirmDelete}
          title="Delete Reflection?"
          message="Are you sure you want to permanently delete this diary entry? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmType="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(false)}
        />

        {/* Main Journal Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Metadata Row */}
          <View style={styles.metaRow}>
            <View style={styles.dateRow}>
              <Calendar size={13} color={theme.textMuted} style={{ marginRight: 5 }} />
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                {formatDate(activeEntry.entryDate)}
              </Text>
              <Clock size={12} color={theme.textMuted} style={{ marginLeft: 10, marginRight: 4 }} />
              <Text style={[styles.timeText, { color: theme.textMuted }]}>
                {activeEntry.entryTime}
              </Text>
            </View>

            <MoodBadge mood={activeEntry.mood} size="md" />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>
            {activeEntry.title}
          </Text>

          {/* Tags */}
          {activeEntry.tags && activeEntry.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {activeEntry.tags.map((t, idx) => (
                <TagChip key={idx} label={t} />
              ))}
            </View>
          )}

          {/* Separator Line */}
          <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

          {/* Body Reading View */}
          <Text style={[styles.bodyText, { color: theme.text }]}>
            {activeEntry.content}
          </Text>

          {/* Mindful AI Reflection Invitation Card */}
          <TouchableOpacity
            onPress={handleOpenAiReflection}
            style={[
              styles.aiCompanionPromptCard,
              {
                backgroundColor: theme.isDark ? '#232936' : '#F6F0E6',
                borderColor: theme.cardBorder,
              },
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.aiCardHeader}>
              <View style={[styles.aiSparkleBadge, { backgroundColor: theme.accentLight }]}>
                <Sparkle size={18} color={theme.accent} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.aiCardTitle, { color: theme.text }]}>
                  Mindful AI Reflection
                </Text>
                <Text style={[styles.aiCardSubtitle, { color: theme.textSecondary }]}>
                  Empathy, emotional validation & mindful questions
                </Text>
              </View>
            </View>
            <View style={[styles.aiCardActionBtn, { backgroundColor: theme.accent }]}>
              <Sparkle size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.aiCardActionBtnText}>Read Compassionate Reflection</Text>
            </View>
          </TouchableOpacity>

          {/* Bottom Word Count Footer */}
          <View style={styles.bottomStats}>
            <BookOpen size={14} color={theme.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.statsText, { color: theme.textMuted }]}>
              {activeEntry.wordCount} words • Written in privacy
            </Text>
          </View>
        </ScrollView>

        {/* AI Reflection Companion Modal */}
        <AiCompanionModal
          visible={showAiModal}
          reflection={aiReflection}
          isLoading={isAiLoading}
          onClose={() => setShowAiModal(false)}
          onApplyTags={handleApplyTagsFromAi}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: 8,
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmDeleteBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  confirmDeleteText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmDeleteBtns: {
    flexDirection: 'row',
  },
  confirmBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  scrollContent: {
    padding: 22,
    paddingBottom: 50,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 30,
    letterSpacing: 0.2,
  },
  bottomStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DDD',
  },
  statsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  aiHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
  },
  aiHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  aiCompanionPromptCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginVertical: 18,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiSparkleBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  aiCardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  aiCardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  aiCardActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

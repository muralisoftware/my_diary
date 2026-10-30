import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AiReflection } from '../../types/diary';
import { MoodBadge } from '../common/MoodBadge';
import { Sparkle, Heart, HelpCircle, Lightbulb, X, Tag } from 'lucide-react-native';

interface AiCompanionModalProps {
  visible: boolean;
  reflection: AiReflection | null;
  isLoading?: boolean;
  onClose: () => void;
  onApplyTags?: (tags: string[]) => void;
}

export const AiCompanionModal: React.FC<AiCompanionModalProps> = ({
  visible,
  reflection,
  isLoading = false,
  onClose,
  onApplyTags,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.surface }]}>
        {/* Top Header */}
        <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.aiBadgeIcon, { backgroundColor: theme.accentLight }]}>
              <Heart size={18} color={theme.accent} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Mindful AI Companion
              </Text>
              <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
                Compassionate reflection & deeper insight
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Reflecting on your words with mindful care...
            </Text>
          </View>
        ) : reflection ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Tone & Sentiment Pill */}
            <View style={styles.topMetaRow}>
              <MoodBadge mood={reflection.suggestedMood} size="md" />
              <View style={[styles.sentimentPill, { backgroundColor: theme.isDark ? '#262D38' : '#F6F0E6' }]}>
                <Text style={[styles.sentimentText, { color: theme.textSecondary }]}>
                  {reflection.sentiment}
                </Text>
              </View>
            </View>

            {/* Empathetic Validation Box */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.isDark ? '#222834' : '#F9F6F0',
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Heart size={16} color={theme.accent} />
                <Text style={[styles.cardTag, { color: theme.accent }]}>
                  EMPATHIC REFLECTION
                </Text>
              </View>
              <Text style={[styles.empathyText, { color: theme.text }]}>
                "{reflection.empathyResponse}"
              </Text>
            </View>

            {/* Follow-up Question for Deeper Introspection */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.accent,
                  borderWidth: 1.5,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <HelpCircle size={16} color={theme.accent} />
                <Text style={[styles.cardTag, { color: theme.accent }]}>
                  GENTLE INQUIRY
                </Text>
              </View>
              <Text style={[styles.questionText, { color: theme.text }]}>
                {reflection.followUpQuestion}
              </Text>
              <Text style={[styles.questionHint, { color: theme.textMuted }]}>
                Take a quiet breath and let this question sit with you.
              </Text>
            </View>

            {/* Key Life Lesson Motto */}
            {reflection.keyLesson ? (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.isDark ? '#262A1F' : '#FEFCE8',
                    borderColor: '#FDE047',
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Lightbulb size={16} color="#CA8A04" />
                  <Text style={[styles.cardTag, { color: '#CA8A04' }]}>
                    PHILOSOPHICAL MOTTO
                  </Text>
                </View>
                <Text style={[styles.lessonText, { color: theme.isDark ? '#FEF08A' : '#854D0E' }]}>
                  {reflection.keyLesson}
                </Text>
              </View>
            ) : null}

            {/* Suggested Topic Tags */}
            {reflection.suggestedTags && reflection.suggestedTags.length > 0 && onApplyTags && (
              <View style={styles.tagsSection}>
                <View style={styles.tagsHeader}>
                  <Tag size={14} color={theme.textMuted} />
                  <Text style={[styles.tagsSectionTitle, { color: theme.textSecondary }]}>
                    Suggested Reflection Tags
                  </Text>
                </View>
                <View style={styles.tagsList}>
                  {reflection.suggestedTags.map((tag, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.tagPill,
                        { backgroundColor: theme.isDark ? '#262D38' : '#F1EBE1' },
                      ]}
                    >
                      <Text style={[styles.tagText, { color: theme.text }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Bottom Done Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onClose}
              style={[styles.doneBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.doneBtnText}>Save Reflection & Close</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : null}
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiBadgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sentimentPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  sentimentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTag: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  empathyText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionHint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  lessonText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  doneBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { MoodType, DiaryEntry } from '../types/diary';
import { MoodSelector } from '../components/diary/MoodSelector';
import { TagChip } from '../components/common/TagChip';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { getSavedDraft, saveDraft } from '../database/db';
import { aiService } from '../services/aiService';
import {
  X,
  Check,
  Trash2,
  Plus,
  Calendar,
  Clock,
  RotateCcw,
  Sparkle,
  Lightbulb,
  Compass,
  Smile,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';

export const EditorModal: React.FC = () => {
  const { theme } = useTheme();
  const {
    isEditorOpen,
    editingEntry,
    closeEditor,
    createEntry,
    updateEntry,
    deleteEntry,
  } = useDiary();

  const isEditing = !!(editingEntry && editingEntry.id);

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [mood, setMood] = useState<MoodType>('calm');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
  const [entryDate, setEntryDate] = useState<string>('');
  const [entryTime, setEntryTime] = useState<string>('');
  const [hasDraftNotice, setHasDraftNotice] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Mindful AI states
  const [aiToastMsg, setAiToastMsg] = useState<string | null>(null);
  const [activeAiHelper, setActiveAiHelper] = useState<'continue' | 'reframe' | 'lesson' | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiHelperLoading, setIsAiHelperLoading] = useState<boolean>(false);

  // Initialize fields when editor opens
  useEffect(() => {
    if (isEditorOpen) {
      if (editingEntry && editingEntry.id) {
        // Editing existing entry
        setTitle(editingEntry.title);
        setContent(editingEntry.content);
        setMood(editingEntry.mood);
        setTags([...editingEntry.tags]);
        setEntryDate(editingEntry.entryDate);
        setEntryTime(editingEntry.entryTime);
        setHasDraftNotice(false);
      } else if (editingEntry && !editingEntry.id) {
        // New entry with prefilled data (e.g. from prompt or calendar date)
        setTitle(editingEntry.title || '');
        setContent(editingEntry.content || '');
        setMood(editingEntry.mood || 'calm');
        setTags([...editingEntry.tags]);
        setEntryDate(editingEntry.entryDate || new Date().toISOString().split('T')[0]);
        setEntryTime(editingEntry.entryTime || new Date().toTimeString().substring(0, 5));
        setHasDraftNotice(false);
      } else {
        // Brand new entry - check for saved drafts
        const now = new Date();
        setEntryDate(now.toISOString().split('T')[0]);
        setEntryTime(now.toTimeString().substring(0, 5));
        setMood('calm');
        setTags([]);

        (async () => {
          const draft = await getSavedDraft();
          if (draft && (draft.title || draft.content)) {
            setHasDraftNotice(true);
          } else {
            setTitle('');
            setContent('');
            setHasDraftNotice(false);
          }
        })();
      }
    }
  }, [isEditorOpen, editingEntry]);

  // Autosave draft for new entries
  useEffect(() => {
    if (isEditorOpen && !isEditing) {
      const timer = setTimeout(() => {
        if (title.trim() || content.trim()) {
          saveDraft({ title, content, mood, tags });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [title, content, mood, tags, isEditorOpen, isEditing]);

  const handleRestoreDraft = async () => {
    const draft = await getSavedDraft();
    if (draft) {
      setTitle(draft.title || '');
      setContent(draft.content || '');
      setMood((draft.mood as MoodType) || 'calm');
      setTags(draft.tags || []);
      setHasDraftNotice(false);
    }
  };

  const handleDiscardDraft = async () => {
    await saveDraft(null);
    setHasDraftNotice(false);
    setTitle('');
    setContent('');
  };

  const handleAddTag = () => {
    const clean = newTagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!content.trim() && !title.trim()) {
      return;
    }

    if (isEditing && editingEntry?.id) {
      await updateEntry(editingEntry.id, {
        title: title.trim() || 'Untitled Reflection',
        content,
        mood,
        tags,
        entryDate,
        entryTime,
      });
    } else {
      await createEntry({
        title: title.trim() || 'Untitled Reflection',
        content,
        mood,
        tags,
        isFavorite: false,
        entryDate,
        entryTime,
        photos: [],
      });
      // Clear saved draft once committed
      await saveDraft(null);
    }

    closeEditor();
  };

  const handleDelete = async () => {
    if (editingEntry?.id) {
      await deleteEntry(editingEntry.id);
      setShowDeleteConfirm(false);
      closeEditor();
    }
  };

  const handleAutoDetectMoodAndTags = () => {
    if (!content.trim() && !title.trim()) {
      setAiToastMsg('Write a few words first so AI can sense your mood.');
      setTimeout(() => setAiToastMsg(null), 3000);
      return;
    }

    const result = aiService.detectMoodAndTags(content, title);
    setMood(result.mood);

    // Merge detected tags without duplicates
    const merged = [...tags];
    let addedCount = 0;
    for (const t of result.tags) {
      if (!merged.includes(t)) {
        merged.push(t);
        addedCount++;
      }
    }
    setTags(merged);

    const moodName = result.mood.charAt(0).toUpperCase() + result.mood.slice(1);
    setAiToastMsg(`Sensed mood: ${moodName}${addedCount > 0 ? ` • +${addedCount} tags suggested` : ''}`);
    setTimeout(() => setAiToastMsg(null), 3500);
  };

  const handleOpenAiHelper = async (type: 'continue' | 'reframe' | 'lesson') => {
    if (activeAiHelper === type) {
      setActiveAiHelper(null);
      setAiSuggestions([]);
      return;
    }

    setActiveAiHelper(type);
    setIsAiHelperLoading(true);
    try {
      const suggestions = await aiService.getWritingHelp(content, title, type);
      setAiSuggestions(suggestions);
    } catch {
      setAiSuggestions(['Keep writing from the heart — every word is a step forward.']);
    } finally {
      setIsAiHelperLoading(false);
    }
  };

  const handleApplyAiSuggestion = (suggestion: string) => {
    // Append to content cleanly
    const cleanSuggestion = suggestion.replace(/^"|"$/g, '');
    setContent((prev) => {
      const prefix = prev.trim() ? `${prev.trim()}\n\n` : '';
      return `${prefix}${cleanSuggestion}`;
    });
    setActiveAiHelper(null);
    setAiSuggestions([]);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <Modal
      visible={isEditorOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeEditor}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: theme.surface }]}
      >
        {/* Top Action Bar */}
        <View style={[styles.navBar, { borderBottomColor: theme.cardBorder }]}>
          <TouchableOpacity
            onPress={closeEditor}
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={22} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: theme.text }]}>
            {isEditing ? 'Edit Entry' : 'New Entry'}
          </Text>

          <View style={styles.rightNavActions}>
            {isEditing && (
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(true)}
                style={[styles.iconBtn, { marginRight: 8 }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={20} color={theme.danger} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: theme.accent }]}
            >
              <Check size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delete Confirmation Popup */}
        <ConfirmDialog
          visible={showDeleteConfirm}
          title="Delete Reflection?"
          message="Are you sure you want to permanently delete this diary entry? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmType="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Draft Notice if any */}
          {hasDraftNotice && (
            <View
              style={[
                styles.draftNotice,
                { backgroundColor: theme.accentLight, borderColor: theme.accent },
              ]}
            >
              <View style={styles.draftNoticeTop}>
                <RotateCcw size={16} color={theme.accent} />
                <Text style={[styles.draftNoticeTitle, { color: theme.accent }]}>
                  Unsaved Draft Found
                </Text>
              </View>
              <Text style={[styles.draftNoticeDesc, { color: theme.textSecondary }]}>
                You have an unfinished journal entry from earlier. Would you like to restore it?
              </Text>
              <View style={styles.draftBtnsRow}>
                <TouchableOpacity
                  onPress={handleRestoreDraft}
                  style={[styles.draftBtn, { backgroundColor: theme.accent }]}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 12 }}>
                    Restore Draft
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDiscardDraft}
                  style={[styles.draftBtn, { borderColor: theme.cardBorder, borderWidth: 1 }]}
                >
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    Discard
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Date & Time pill row */}
          <View style={styles.dateTimeRow}>
            <View style={[styles.infoPill, { backgroundColor: theme.isDark ? '#232933' : '#F6F0E6' }]}>
              <Calendar size={13} color={theme.textSecondary} />
              <Text style={[styles.infoPillText, { color: theme.textSecondary }]}>
                {entryDate}
              </Text>
            </View>

            <View style={[styles.infoPill, { backgroundColor: theme.isDark ? '#232933' : '#F6F0E6' }]}>
              <Clock size={13} color={theme.textSecondary} />
              <Text style={[styles.infoPillText, { color: theme.textSecondary }]}>
                {entryTime}
              </Text>
            </View>
          </View>

          {/* Mood Selector Strip & AI Detect Button */}
          <View style={styles.moodSectionHeader}>
            <Text style={[styles.sectionMiniLabel, { color: theme.textSecondary }]}>
              How are you feeling?
            </Text>
            <TouchableOpacity
              onPress={handleAutoDetectMoodAndTags}
              style={[
                styles.aiDetectBtn,
                { backgroundColor: theme.accentLight, borderColor: theme.accent },
              ]}
              activeOpacity={0.7}
            >
              <Sparkle size={12} color={theme.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.aiDetectBtnText, { color: theme.accent }]}>
                Auto-Detect
              </Text>
            </TouchableOpacity>
          </View>

          {aiToastMsg && (
            <View
              style={[
                styles.aiToastPill,
                {
                  backgroundColor: theme.isDark ? '#2B2735' : '#F3E8FF',
                  borderColor: theme.accent,
                },
              ]}
            >
              <Sparkle size={13} color={theme.accent} style={{ marginRight: 6 }} />
              <Text style={[styles.aiToastText, { color: theme.accent }]}>
                {aiToastMsg}
              </Text>
            </View>
          )}

          <MoodSelector selectedMood={mood} onSelect={setMood} />

          {/* Entry Title Input */}
          <TextInput
            style={[
              styles.titleInput,
              {
                color: theme.text,
                borderBottomColor: theme.cardBorder,
              },
            ]}
            placeholder="Title of your reflection..."
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Tags Section */}
          <View style={styles.tagsArea}>
            <View style={styles.tagChipsList}>
              {tags.map((tag, idx) => (
                <TagChip
                  key={idx}
                  label={tag}
                  onRemove={() => handleRemoveTag(idx)}
                />
              ))}

              {isAddingTag ? (
                <View style={styles.addTagInputRow}>
                  <TextInput
                    style={[
                      styles.tagInput,
                      {
                        color: theme.text,
                        borderColor: theme.accent,
                        backgroundColor: theme.background,
                      },
                    ]}
                    placeholder="tag name..."
                    placeholderTextColor={theme.textMuted}
                    value={newTagInput}
                    onChangeText={setNewTagInput}
                    autoFocus
                    onSubmitEditing={handleAddTag}
                  />
                  <TouchableOpacity onPress={handleAddTag} style={styles.addTagConfirmBtn}>
                    <Check size={14} color={theme.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsAddingTag(false)} style={styles.addTagCancelBtn}>
                    <X size={14} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsAddingTag(true)}
                  style={[
                    styles.newTagBtn,
                    { borderColor: theme.cardBorder, backgroundColor: theme.background },
                  ]}
                >
                  <Plus size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.newTagText, { color: theme.textSecondary }]}>
                    Add Tag
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Mindful Writing Helpers Toolbar */}
          <View style={styles.aiHelperToolbar}>
            <View style={styles.aiHelperHeader}>
              <Lightbulb size={13} color={theme.accent} style={{ marginRight: 5 }} />
              <Text style={[styles.aiHelperTitle, { color: theme.textSecondary }]}>
                Mindful Prompts:
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiHelperChipsRow}>
              <TouchableOpacity
                onPress={() => handleOpenAiHelper('continue')}
                style={[
                  styles.aiHelperChip,
                  activeAiHelper === 'continue'
                    ? { backgroundColor: theme.accent, borderColor: theme.accent }
                    : { borderColor: theme.cardBorder, backgroundColor: theme.card },
                ]}
              >
                <Compass
                  size={12}
                  color={activeAiHelper === 'continue' ? '#FFFFFF' : theme.accent}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.aiHelperChipText,
                    { color: activeAiHelper === 'continue' ? '#FFFFFF' : theme.text },
                  ]}
                >
                  Overcome Block
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleOpenAiHelper('reframe')}
                style={[
                  styles.aiHelperChip,
                  activeAiHelper === 'reframe'
                    ? { backgroundColor: theme.accent, borderColor: theme.accent }
                    : { borderColor: theme.cardBorder, backgroundColor: theme.card },
                ]}
              >
                <Smile
                  size={12}
                  color={activeAiHelper === 'reframe' ? '#FFFFFF' : theme.accent}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.aiHelperChipText,
                    { color: activeAiHelper === 'reframe' ? '#FFFFFF' : theme.text },
                  ]}
                >
                  Gratitude Reframe
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleOpenAiHelper('lesson')}
                style={[
                  styles.aiHelperChip,
                  activeAiHelper === 'lesson'
                    ? { backgroundColor: theme.accent, borderColor: theme.accent }
                    : { borderColor: theme.cardBorder, backgroundColor: theme.card },
                ]}
              >
                <Sparkle
                  size={12}
                  color={activeAiHelper === 'lesson' ? '#FFFFFF' : theme.accent}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.aiHelperChipText,
                    { color: activeAiHelper === 'lesson' ? '#FFFFFF' : theme.text },
                  ]}
                >
                  1-Sentence Lesson
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* AI Helper Suggestions Panel */}
          {activeAiHelper && (
            <View
              style={[
                styles.aiSuggestionTray,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.accent,
                },
              ]}
            >
              <View style={styles.aiSuggestionHeader}>
                <Text style={[styles.aiSuggestionHeadText, { color: theme.accent }]}>
                  {activeAiHelper === 'continue'
                    ? '💡 Thought Expanders'
                    : activeAiHelper === 'reframe'
                    ? '🌱 Mindful Reframe'
                    : '🎯 Life Lesson'}
                </Text>
                <TouchableOpacity onPress={() => setActiveAiHelper(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={14} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {isAiHelperLoading ? (
                <Text style={[styles.aiSuggestionLoading, { color: theme.textSecondary }]}>
                  Listening closely to your reflection...
                </Text>
              ) : (
                aiSuggestions.map((suggestion, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleApplyAiSuggestion(suggestion)}
                    style={[
                      styles.aiSuggestionItem,
                      { borderBottomColor: theme.cardBorder },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.aiSuggestionPromptText, { color: theme.text }]}>
                      {suggestion}
                    </Text>
                    <Text style={[styles.aiTapToInsert, { color: theme.accent }]}>
                      + Tap to insert into journal
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Content Writing Area */}
          <TextInput
            style={[
              styles.contentInput,
              {
                color: theme.text,
                backgroundColor: theme.isDark ? '#1C222B' : '#FAF8F4',
                borderColor: theme.cardBorder,
              },
            ]}
            placeholder="Write your thoughts freely, private and peaceful..."
            placeholderTextColor={theme.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          {/* Footer Stats */}
          <View style={styles.counterRow}>
            <Text style={[styles.counterText, { color: theme.textMuted }]}>
              {wordCount} words • {charCount} characters
            </Text>
            {!isEditing && (title.trim() || content.trim()) && (
              <Text style={[styles.autoSaveNotice, { color: theme.success }]}>
                Draft auto-saved
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 6,
  },
  rightNavActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  draftNotice: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  draftNoticeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  draftNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  draftNoticeDesc: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 16,
  },
  draftBtnsRow: {
    flexDirection: 'row',
  },
  draftBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  infoPillText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  tagsArea: {
    marginBottom: 14,
  },
  tagChipsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  addTagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 12,
    width: 100,
  },
  addTagConfirmBtn: {
    padding: 6,
  },
  addTagCancelBtn: {
    padding: 6,
  },
  newTagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 6,
  },
  newTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  contentInput: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 280,
    marginBottom: 12,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  autoSaveNotice: {
    fontSize: 11,
    fontWeight: '600',
  },
  moodSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionMiniLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiDetectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  aiDetectBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  aiToastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  aiToastText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  aiHelperToolbar: {
    marginBottom: 10,
  },
  aiHelperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiHelperTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  aiHelperChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiHelperChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
  },
  aiHelperChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  aiSuggestionTray: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  aiSuggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
  },
  aiSuggestionHeadText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  aiSuggestionLoading: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  aiSuggestionItem: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  aiSuggestionPromptText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 3,
  },
  aiTapToInsert: {
    fontSize: 11,
    fontWeight: '700',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Modal,
  Share,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSecurity } from '../context/SecurityContext';
import { useDiary } from '../context/DiaryContext';
import { Header } from '../components/common/Header';
import { exportService } from '../services/exportService';
import { aiService } from '../services/aiService';
import { ThemeName, AiSettings, AiProvider } from '../types/diary';
import {
  Palette,
  Shield,
  Download,
  Upload,
  Lock,
  Fingerprint,
  FileText,
  Clock,
  Info,
  Check,
  X,
  AlertCircle,
  Sparkle,
  Key,
  Cpu,
  Globe,
  Eye,
  EyeOff,
} from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const { theme, themeName, setThemeName } = useTheme();
  const { settings, lockApp, refreshSettings } = useSecurity();
  const { setIsPinModalOpen, refreshEntries } = useDiary();

  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [markdownModalOpen, setMarkdownModalOpen] = useState<boolean>(false);
  const [markdownText, setMarkdownText] = useState<string>('');

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState<AiSettings>({
    isEnabled: true,
    provider: 'offline',
    apiKey: '',
    autoDetectMood: true,
    modelName: 'gemini-1.5-flash',
  });
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [aiSaveSuccess, setAiSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const saved = await aiService.getSettings();
      setAiConfig(saved);
      setApiKeyInput(saved.apiKey || '');
    })();
  }, []);

  const handleUpdateAiSettings = async (updates: Partial<AiSettings>) => {
    const updated = { ...aiConfig, ...updates };
    setAiConfig(updated);
    await aiService.saveSettings(updated);
    setAiSaveSuccess(true);
    setTimeout(() => setAiSaveSuccess(false), 2500);
  };

  const handleSaveApiKey = async () => {
    await handleUpdateAiSettings({ apiKey: apiKeyInput.trim() });
  };

  const themesList: { id: ThemeName; title: string; desc: string; sampleBg: string; sampleAccent: string }[] = [
    {
      id: 'white',
      title: 'Pure White',
      desc: 'Crisp white canvas, high contrast, clean modern look',
      sampleBg: '#FFFFFF',
      sampleAccent: '#6D28D9',
    },
    {
      id: 'warm',
      title: 'Warm Journal',
      desc: 'Cream paper, sepia typography, mindful feel',
      sampleBg: '#FAF7F0',
      sampleAccent: '#8C5A3C',
    },
    {
      id: 'lavender',
      title: 'Calm Lavender',
      desc: 'Soft lilac pastel, peaceful violet accents',
      sampleBg: '#F6F4FB',
      sampleAccent: '#7B52BE',
    },
    {
      id: 'midnight',
      title: 'Midnight Diary',
      desc: 'Deep dark slate, subtle gold for night writing',
      sampleBg: '#111418',
      sampleAccent: '#E5B25D',
    },
  ];

  const handleExportJson = async () => {
    try {
      const jsonStr = await exportService.generateBackupJson();
      await Share.share({
        title: 'My Diary Backup (JSON)',
        message: jsonStr,
      });
    } catch (e) {
      console.error('Error sharing JSON backup:', e);
    }
  };

  const handleOpenMarkdownView = async () => {
    const md = await exportService.generatePrintableMarkdown();
    setMarkdownText(md);
    setMarkdownModalOpen(true);
  };

  const handleRestoreJson = async () => {
    setStatusMsg(null);
    if (!jsonInput.trim()) {
      setStatusMsg({ text: 'Please paste a valid JSON backup payload.', isError: true });
      return;
    }

    const res = await exportService.restoreFromJson(jsonInput);
    if (res.success) {
      await refreshEntries();
      setStatusMsg({ text: `Successfully restored ${res.count} journal entries!`, isError: false });
      setTimeout(() => {
        setImportModalOpen(false);
        setJsonInput('');
        setStatusMsg(null);
      }, 1200);
    } else {
      setStatusMsg({ text: res.error || 'Failed to restore.', isError: true });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Settings" showSearch={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section 1: Themes */}
        <View style={styles.sectionHeader}>
          <Palette size={16} color={theme.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Aesthetic Themes
          </Text>
        </View>

        <View style={styles.themesGrid}>
          {themesList.map((t) => {
            const isSelected = themeName === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                activeOpacity={0.8}
                onPress={() => setThemeName(t.id)}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: isSelected ? theme.accent : theme.cardBorder,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.themeCardTop}>
                  <View style={[styles.colorPreview, { backgroundColor: t.sampleBg, borderColor: t.sampleAccent }]}>
                    <View style={[styles.colorAccentDot, { backgroundColor: t.sampleAccent }]} />
                  </View>
                  <View style={styles.themeInfo}>
                    <Text style={[styles.themeTitle, { color: theme.text }]}>
                      {t.title}
                    </Text>
                    <Text style={[styles.themeDesc, { color: theme.textSecondary }]}>
                      {t.desc}
                    </Text>
                  </View>
                </View>

                {isSelected && (
                  <View style={[styles.activeBadge, { backgroundColor: theme.accent }]}>
                    <Check size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 2: Privacy & PIN Lock */}
        <View style={styles.sectionHeader}>
          <Shield size={16} color={theme.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Privacy & Security
          </Text>
        </View>

        <View
          style={[
            styles.settingsBox,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                PIN Passcode Lock
              </Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                {settings.isPinEnabled ? 'Protected with 4-digit PIN' : 'Not configured'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setIsPinModalOpen(true)}
              style={[styles.manageBtn, { backgroundColor: theme.accentLight }]}
            >
              <Lock size={13} color={theme.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.manageBtnText, { color: theme.accent }]}>
                {settings.isPinEnabled ? 'Modify' : 'Setup'}
              </Text>
            </TouchableOpacity>
          </View>

          {settings.isPinEnabled && (
            <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.cardBorder, paddingTop: 12 }]}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Immediate Lock
                </Text>
                <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                  Lock diary immediately right now
                </Text>
              </View>

              <TouchableOpacity
                onPress={lockApp}
                style={[styles.manageBtn, { backgroundColor: theme.isDark ? '#262D38' : '#F6F0E6' }]}
              >
                <Text style={[styles.manageBtnText, { color: theme.text }]}>Lock Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Section 3: Data Sovereignty & Offline Backups */}
        <View style={styles.sectionHeader}>
          <Download size={16} color={theme.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Offline Backup & Export
          </Text>
        </View>

        <View
          style={[
            styles.settingsBox,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          {/* JSON Export */}
          <TouchableOpacity
            onPress={handleExportJson}
            style={styles.actionRow}
          >
            <View style={styles.actionRowLeft}>
              <Download size={18} color={theme.accent} style={{ marginRight: 12 }} />
              <View>
                <Text style={[styles.actionRowTitle, { color: theme.text }]}>
                  Export Full Journal (JSON)
                </Text>
                <Text style={[styles.actionRowDesc, { color: theme.textSecondary }]}>
                  Backup your thoughts into a portable, machine-readable file
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.cardBorder }]} />

          {/* Printable Markdown */}
          <TouchableOpacity
            onPress={handleOpenMarkdownView}
            style={styles.actionRow}
          >
            <View style={styles.actionRowLeft}>
              <FileText size={18} color={theme.accent} style={{ marginRight: 12 }} />
              <View>
                <Text style={[styles.actionRowTitle, { color: theme.text }]}>
                  View as Printable Text
                </Text>
                <Text style={[styles.actionRowDesc, { color: theme.textSecondary }]}>
                  Read your whole diary as a continuous book or copy to notes
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: theme.cardBorder }]} />

          {/* JSON Restore */}
          <TouchableOpacity
            onPress={() => setImportModalOpen(true)}
            style={styles.actionRow}
          >
            <View style={styles.actionRowLeft}>
              <Upload size={18} color={theme.accent} style={{ marginRight: 12 }} />
              <View>
                <Text style={[styles.actionRowTitle, { color: theme.text }]}>
                  Restore from JSON Backup
                </Text>
                <Text style={[styles.actionRowDesc, { color: theme.textSecondary }]}>
                  Import previous entries back onto this device
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: Mindful AI Diary Companion */}
        <View style={styles.sectionHeader}>
          <Sparkle size={16} color={theme.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Mindful AI Companion
          </Text>
        </View>

        <View
          style={[
            styles.settingsBox,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          {/* Enable AI Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Enable AI Companion
              </Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Empathetic reflections, writing prompts & mood detection
              </Text>
            </View>
            <Switch
              value={aiConfig.isEnabled}
              onValueChange={(val) => handleUpdateAiSettings({ isEnabled: val })}
              trackColor={{ false: theme.cardBorder, true: theme.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          {aiConfig.isEnabled && (
            <>
              <View style={[styles.rowDivider, { backgroundColor: theme.cardBorder }]} />

              {/* Auto Detect Mood Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    Auto-Detect Mood & Topics
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Sense emotions and tag topics as you write
                  </Text>
                </View>
                <Switch
                  value={aiConfig.autoDetectMood}
                  onValueChange={(val) => handleUpdateAiSettings({ autoDetectMood: val })}
                  trackColor={{ false: theme.cardBorder, true: theme.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.rowDivider, { backgroundColor: theme.cardBorder }]} />

              {/* Intelligence Provider Selection */}
              <View style={styles.aiProviderSection}>
                <Text style={[styles.aiProviderSectionTitle, { color: theme.text }]}>
                  AI Intelligence Engine
                </Text>

                {/* Option 1: 100% Offline (Default) */}
                <TouchableOpacity
                  onPress={() => handleUpdateAiSettings({ provider: 'offline' })}
                  style={[
                    styles.aiProviderCard,
                    aiConfig.provider === 'offline' && {
                      borderColor: theme.accent,
                      backgroundColor: theme.accentLight,
                    },
                    { borderColor: theme.cardBorder },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.aiProviderTop}>
                    <Cpu size={16} color={aiConfig.provider === 'offline' ? theme.accent : theme.textSecondary} />
                    <Text style={[styles.aiProviderName, { color: theme.text }]}>
                      100% On-Device (Offline & Private)
                    </Text>
                    {aiConfig.provider === 'offline' && (
                      <Check size={16} color={theme.accent} style={{ marginLeft: 'auto' }} />
                    )}
                  </View>
                  <Text style={[styles.aiProviderDesc, { color: theme.textSecondary }]}>
                    Runs entirely on your device with zero internet connection or remote tracking. 100% free and private.
                  </Text>
                </TouchableOpacity>

                {/* Option 2: Cloud Gemini */}
                <TouchableOpacity
                  onPress={() => handleUpdateAiSettings({ provider: 'gemini' })}
                  style={[
                    styles.aiProviderCard,
                    aiConfig.provider === 'gemini' && {
                      borderColor: theme.accent,
                      backgroundColor: theme.accentLight,
                    },
                    { borderColor: theme.cardBorder },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.aiProviderTop}>
                    <Globe size={16} color={aiConfig.provider === 'gemini' ? theme.accent : theme.textSecondary} />
                    <Text style={[styles.aiProviderName, { color: theme.text }]}>
                      Google Gemini Cloud LLM
                    </Text>
                    {aiConfig.provider === 'gemini' && (
                      <Check size={16} color={theme.accent} style={{ marginLeft: 'auto' }} />
                    )}
                  </View>
                  <Text style={[styles.aiProviderDesc, { color: theme.textSecondary }]}>
                    Use your personal Google Gemini API key for deep generative responses.
                  </Text>
                </TouchableOpacity>

                {/* API Key Input (if Gemini selected) */}
                {aiConfig.provider === 'gemini' && (
                  <View style={styles.apiKeyBox}>
                    <Text style={[styles.apiKeyLabel, { color: theme.text }]}>
                      Gemini API Key
                    </Text>
                    <View style={[styles.apiKeyInputRow, { borderColor: theme.cardBorder, backgroundColor: theme.background }]}>
                      <Key size={15} color={theme.textMuted} style={{ marginRight: 8 }} />
                      <TextInput
                        style={[styles.apiKeyInput, { color: theme.text }]}
                        placeholder="Enter your AI Studio API key..."
                        placeholderTextColor={theme.textMuted}
                        value={apiKeyInput}
                        onChangeText={setApiKeyInput}
                        secureTextEntry={!showApiKey}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        {showApiKey ? (
                          <EyeOff size={16} color={theme.textMuted} />
                        ) : (
                          <Eye size={16} color={theme.textMuted} />
                        )}
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={handleSaveApiKey}
                      style={[styles.saveKeyBtn, { backgroundColor: theme.accent }]}
                    >
                      <Text style={styles.saveKeyBtnText}>Save API Key</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}

          {aiSaveSuccess && (
            <View style={styles.aiSavedBanner}>
              <Check size={14} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.aiSavedBannerText}>AI Settings updated successfully</Text>
            </View>
          )}
        </View>

        {/* Section 4: About & Privacy Pledge */}
        <View style={styles.sectionHeader}>
          <Info size={16} color={theme.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Privacy Guarantee
          </Text>
        </View>

        <View
          style={[
            styles.privacyCard,
            { backgroundColor: theme.isDark ? '#202630' : '#F6F1E8', borderColor: theme.cardBorder },
          ]}
        >
          <Text style={[styles.privacyTitle, { color: theme.text }]}>
            100% Offline & Private by Design
          </Text>
          <Text style={[styles.privacyBody, { color: theme.textSecondary }]}>
            • No accounts, logins, or remote servers.{'\n'}
            • No analytics, telemetry, or behavioral tracking.{'\n'}
            • All database records and encryption keys remain exclusively on your personal device.
          </Text>
          <Text style={[styles.versionText, { color: theme.textMuted }]}>
            My Diary v1.0.0 • Mindful Journaling
          </Text>
        </View>
      </ScrollView>

      {/* JSON Restore Modal */}
      <Modal
        visible={importModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setImportModalOpen(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.cardBorder }]}>
            <TouchableOpacity onPress={() => setImportModalOpen(false)}>
              <X size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Restore from Backup</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>
              Paste your exported JSON backup payload below:
            </Text>

            <TextInput
              style={[
                styles.jsonTextarea,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.cardBorder,
                  color: theme.text,
                },
              ]}
              multiline
              textAlignVertical="top"
              placeholder='{"version": "1.0", "entries": [...]}'
              placeholderTextColor={theme.textMuted}
              value={jsonInput}
              onChangeText={setJsonInput}
            />

            {statusMsg && (
              <View
                style={[
                  styles.statusAlert,
                  {
                    backgroundColor: statusMsg.isError ? '#FEE2E2' : '#DCFCE7',
                    borderColor: statusMsg.isError ? theme.danger : theme.success,
                  },
                ]}
              >
                {statusMsg.isError ? (
                  <AlertCircle size={15} color={theme.danger} style={{ marginRight: 6 }} />
                ) : (
                  <Check size={15} color={theme.success} style={{ marginRight: 6 }} />
                )}
                <Text style={{ color: statusMsg.isError ? theme.danger : theme.success, fontSize: 13 }}>
                  {statusMsg.text}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleRestoreJson}
              style={[styles.modalActionBtn, { backgroundColor: theme.accent }]}
            >
              <Upload size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                Validate & Restore Entries
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Printable Markdown Modal */}
      <Modal
        visible={markdownModalOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setMarkdownModalOpen(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.cardBorder }]}>
            <TouchableOpacity onPress={() => setMarkdownModalOpen(false)}>
              <X size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Printable Journal Archive</Text>
            <TouchableOpacity
              onPress={async () => {
                await Share.share({ message: markdownText });
              }}
            >
              <Download size={18} color={theme.accent} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={[styles.archiveText, { color: theme.text }]}>
              {markdownText}
            </Text>
          </ScrollView>
        </View>
      </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  themesGrid: {
    marginBottom: 16,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  themeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorPreview: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  colorAccentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  themeInfo: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  themeDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  activeBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  settingsBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    paddingVertical: 10,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionRowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionRowDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    marginVertical: 4,
  },
  privacyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  privacyBody: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalContent: {
    padding: 20,
  },
  modalDesc: {
    fontSize: 13,
    marginBottom: 12,
  },
  jsonTextarea: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 13,
    minHeight: 200,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  statusAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  archiveText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  aiProviderSection: {
    padding: 16,
  },
  aiProviderSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiProviderCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  aiProviderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiProviderName: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  aiProviderDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
    paddingLeft: 24,
  },
  apiKeyBox: {
    marginTop: 10,
    paddingTop: 10,
  },
  apiKeyLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  apiKeyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  apiKeyInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 2,
  },
  saveKeyBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  saveKeyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  aiSavedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  aiSavedBannerText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
});

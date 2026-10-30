import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSecurity } from '../context/SecurityContext';
import { useDiary } from '../context/DiaryContext';
import { securityService } from '../services/securityService';
import { Lock, ShieldCheck, X, Check, AlertCircle } from 'lucide-react-native';

export const PinSetupModal: React.FC = () => {
  const { theme } = useTheme();
  const { settings, refreshSettings } = useSecurity();
  const { isPinModalOpen, setIsPinModalOpen } = useDiary();

  const scrollViewRef = useRef<ScrollView>(null);

  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [question, setQuestion] = useState<string>(
    settings.securityQuestion || 'What was your childhood nickname?'
  );
  const [answer, setAnswer] = useState<string>('');
  const [disableCurrentPin, setDisableCurrentPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const questionsList = [
    'What was your childhood nickname?',
    'What was the name of your first pet?',
    'In what city did you grow up?',
    'What was your favorite book growing up?',
    'What is your mother’s maiden name?',
  ];

  const handleSavePin = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (pin.length !== 4) {
      setErrorMessage('PIN must be exactly 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setErrorMessage('PINs do not match. Please re-enter.');
      return;
    }
    if (!answer.trim()) {
      setErrorMessage('Please provide a recovery answer in case you forget your PIN.');
      return;
    }

    const ok = await securityService.setupPin(pin, question, answer);
    if (ok) {
      await refreshSettings();
      setSuccessMessage('PIN lock successfully enabled!');
      setTimeout(() => {
        setIsPinModalOpen(false);
        setPin('');
        setConfirmPin('');
        setAnswer('');
        setSuccessMessage('');
      }, 900);
    } else {
      setErrorMessage('Failed to configure PIN.');
    }
  };

  const handleDisablePin = async () => {
    setErrorMessage('');
    if (disableCurrentPin.length !== 4) {
      setErrorMessage('Enter your current 4-digit PIN to disable.');
      return;
    }

    const ok = await securityService.disablePin(disableCurrentPin);
    if (ok) {
      await refreshSettings();
      setSuccessMessage('PIN lock disabled.');
      setTimeout(() => {
        setIsPinModalOpen(false);
        setDisableCurrentPin('');
        setSuccessMessage('');
      }, 900);
    } else {
      setErrorMessage('Incorrect current PIN.');
    }
  };

  return (
    <Modal
      visible={isPinModalOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsPinModalOpen(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        style={[styles.container, { backgroundColor: theme.surface }]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
          <TouchableOpacity
            onPress={() => setIsPinModalOpen(false)}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            {settings.isPinEnabled ? 'PIN Security Settings' : 'Setup App PIN Lock'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Banner */}
          <View
            style={[
              styles.statusBanner,
              {
                backgroundColor: settings.isPinEnabled
                  ? theme.isDark ? '#1C3124' : '#E8F5E9'
                  : theme.isDark ? '#262D38' : '#F6F0E6',
                borderColor: settings.isPinEnabled ? theme.success : theme.cardBorder,
              },
            ]}
          >
            <ShieldCheck
              size={24}
              color={settings.isPinEnabled ? theme.success : theme.accent}
            />
            <View style={styles.statusTextContainer}>
              <Text
                style={[
                  styles.statusTitle,
                  { color: settings.isPinEnabled ? theme.success : theme.text },
                ]}
              >
                {settings.isPinEnabled ? 'Diary is Protected by PIN' : 'Diary is Currently Unlocked'}
              </Text>
              <Text style={[styles.statusDesc, { color: theme.textSecondary }]}>
                {settings.isPinEnabled
                  ? 'Your entries are locked whenever you open or switch back to the app.'
                  : 'Set a 4-digit passcode to keep your thoughts private.'}
              </Text>
            </View>
          </View>

          {errorMessage ? (
            <View style={[styles.alertBox, { backgroundColor: '#FEE2E2', borderColor: theme.danger }]}>
              <AlertCircle size={16} color={theme.danger} style={{ marginRight: 6 }} />
              <Text style={[styles.alertText, { color: theme.danger }]}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={[styles.alertBox, { backgroundColor: '#DCFCE7', borderColor: theme.success }]}>
              <Check size={16} color={theme.success} style={{ marginRight: 6 }} />
              <Text style={[styles.alertText, { color: theme.success }]}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Form to Set or Change PIN */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {settings.isPinEnabled ? 'Change PIN or Security Question' : 'Set New 4-Digit PIN'}
            </Text>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              New 4-Digit Passcode:
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder="••••"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              value={pin}
              onChangeText={setPin}
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Confirm Passcode:
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder="••••"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              value={confirmPin}
              onChangeText={setConfirmPin}
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 10 }]}>
              Recovery Question (in case you forget PIN):
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questionsScroll}>
              {questionsList.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setQuestion(q)}
                  style={[
                    styles.qPill,
                    {
                      backgroundColor: question === q ? theme.accent : theme.isDark ? '#262D38' : '#F6F0E6',
                      borderColor: question === q ? theme.accent : theme.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.qPillText, { color: question === q ? '#FFFFFF' : theme.textSecondary }]}>
                    {q}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Your Security Answer:
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder="Answer to recover PIN if forgotten"
              placeholderTextColor={theme.textMuted}
              value={answer}
              onChangeText={setAnswer}
              autoCapitalize="none"
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ y: 320, animated: true });
                }, 200);
              }}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSavePin}
              style={[styles.actionBtn, { backgroundColor: theme.accent }]}
            >
              <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnText}>
                {settings.isPinEnabled ? 'Update PIN Security' : 'Enable PIN Protection'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Option to Disable PIN if already active */}
          {settings.isPinEnabled && (
            <View style={[styles.disableSection, { borderTopColor: theme.cardBorder }]}>
              <Text style={[styles.disableTitle, { color: theme.danger }]}>
                Turn Off PIN Protection
              </Text>
              <Text style={[styles.disableDesc, { color: theme.textSecondary }]}>
                To remove passcode protection, enter your current 4-digit PIN:
              </Text>

              <TextInput
                style={[styles.input, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                placeholder="Current PIN"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                value={disableCurrentPin}
                onChangeText={setDisableCurrentPin}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 200);
                }}
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDisablePin}
                style={[styles.disableBtn, { borderColor: theme.danger }]}
              >
                <Text style={[styles.disableBtnText, { color: theme.danger }]}>
                  Disable PIN Lock
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
  },
  questionsScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  qPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8,
  },
  qPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  disableSection: {
    borderTopWidth: 1,
    paddingTop: 20,
  },
  disableTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  disableDesc: {
    fontSize: 12,
    marginBottom: 10,
  },
  disableBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disableBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

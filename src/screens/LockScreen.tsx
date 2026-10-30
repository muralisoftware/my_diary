import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useSecurity } from '../context/SecurityContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, Fingerprint, Delete, HelpCircle, ShieldCheck } from 'lucide-react-native';

export const LockScreen: React.FC = () => {
  const { theme } = useTheme();
  const { unlockWithPin, unlockWithBiometric, settings, resetPinWithRecovery } = useSecurity();

  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isRecoveryOpen, setIsRecoveryOpen] = useState<boolean>(false);
  const [recoveryAnswer, setRecoveryAnswer] = useState<string>('');
  const [newRecoveryPin, setNewRecoveryPin] = useState<string>('');
  const [recoveryError, setRecoveryError] = useState<string>('');

  const handleKeyPress = async (digit: string) => {
    if (enteredPin.length >= 4) return;
    const newPin = enteredPin + digit;
    setEnteredPin(newPin);
    setErrorMessage('');

    if (newPin.length === 4) {
      const success = await unlockWithPin(newPin);
      if (!success) {
        setErrorMessage('Incorrect PIN. Please try again.');
        setTimeout(() => {
          setEnteredPin('');
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    if (enteredPin.length > 0) {
      setEnteredPin(enteredPin.slice(0, -1));
      setErrorMessage('');
    }
  };

  const handleBiometricPress = async () => {
    const success = await unlockWithBiometric();
    if (!success) {
      setErrorMessage('Biometric authentication failed. Use PIN.');
    }
  };

  const handlePerformRecovery = async () => {
    if (!recoveryAnswer.trim()) {
      setRecoveryError('Please enter your recovery answer.');
      return;
    }
    if (newRecoveryPin.length !== 4) {
      setRecoveryError('New PIN must be exactly 4 digits.');
      return;
    }

    const success = await resetPinWithRecovery(recoveryAnswer, newRecoveryPin);
    if (success) {
      setIsRecoveryOpen(false);
      setRecoveryAnswer('');
      setNewRecoveryPin('');
      setRecoveryError('');
      setErrorMessage('');
    } else {
      setRecoveryError('Incorrect recovery answer. Please check spelling.');
    }
  };

  const keypadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['bio', '0', 'del'],
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* App Logo & Branding */}
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="cover"
        />

        <Text style={[styles.title, { color: theme.text }]}>My Diary</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Your private thoughts are protected
        </Text>

        {/* 4-Digit PIN Indicators */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = enteredPin.length > index;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    borderColor: theme.accent,
                    backgroundColor: isFilled ? theme.accent : 'transparent',
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Error message */}
        <Text style={[styles.errorText, { color: theme.danger }]}>
          {errorMessage || ' '}
        </Text>

        {/* Numerical Keypad */}
        <View style={styles.keypad}>
          {keypadNumbers.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.keypadRow}>
              {row.map((item) => {
                if (item === 'bio') {
                  if (settings.isBiometricEnabled) {
                    return (
                      <TouchableOpacity
                        key={item}
                        onPress={handleBiometricPress}
                        style={styles.keypadButton}
                      >
                        <Fingerprint size={24} color={theme.accent} />
                      </TouchableOpacity>
                    );
                  }
                  return <View key={item} style={styles.keypadButton} />;
                }

                if (item === 'del') {
                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={handleDelete}
                      style={styles.keypadButton}
                    >
                      <Delete size={22} color={theme.text} />
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.7}
                    onPress={() => handleKeyPress(item)}
                    style={[
                      styles.keypadButton,
                      styles.numberButton,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.numberText, { color: theme.text }]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Forgot PIN Recovery Link */}
        <TouchableOpacity
          onPress={() => setIsRecoveryOpen(true)}
          style={styles.forgotBtn}
        >
          <HelpCircle size={14} color={theme.textMuted} style={{ marginRight: 5 }} />
          <Text style={[styles.forgotText, { color: theme.textMuted }]}>
            Forgot PIN?
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recovery Modal */}
      <Modal
        visible={isRecoveryOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsRecoveryOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.recoveryCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View style={styles.recoveryHeader}>
              <ShieldCheck size={24} color={theme.accent} />
              <Text style={[styles.recoveryTitle, { color: theme.text }]}>
                PIN Recovery
              </Text>
            </View>

            <Text style={[styles.recoveryQuestionLabel, { color: theme.textSecondary }]}>
              Security Question:
            </Text>
            <Text style={[styles.recoveryQuestion, { color: theme.text }]}>
              {settings.securityQuestion}
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.cardBorder,
                  color: theme.text,
                },
              ]}
              placeholder="Enter your security answer"
              placeholderTextColor={theme.textMuted}
              value={recoveryAnswer}
              onChangeText={setRecoveryAnswer}
              autoCapitalize="none"
            />

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.cardBorder,
                  color: theme.text,
                },
              ]}
              placeholder="Enter new 4-digit PIN"
              placeholderTextColor={theme.textMuted}
              value={newRecoveryPin}
              onChangeText={setNewRecoveryPin}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />

            {recoveryError ? (
              <Text style={[styles.modalError, { color: theme.danger }]}>
                {recoveryError}
              </Text>
            ) : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsRecoveryOpen(false)}
                style={[styles.modalBtn, { borderColor: theme.cardBorder, borderWidth: 1 }]}
              >
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePerformRecovery}
                style={[styles.modalBtn, { backgroundColor: theme.accent }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Reset PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 76,
    height: 76,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#7B52BE',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 10,
  },
  errorText: {
    fontSize: 13,
    height: 20,
    marginBottom: 16,
    fontWeight: '500',
  },
  keypad: {
    width: '100%',
    marginBottom: 24,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  keypadButton: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButton: {
    borderRadius: 34,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  numberText: {
    fontSize: 24,
    fontWeight: '600',
  },
  forgotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  recoveryCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  recoveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  recoveryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  recoveryQuestionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  recoveryQuestion: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  modalError: {
    fontSize: 12,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
});

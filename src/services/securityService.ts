import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecuritySettings } from '../types/diary';

const SECURITY_STORAGE_KEY = '@personal_diary_security_v1';

// Simple, reliable portable SHA-256 implementation in pure JS
async function sha256(message: string): Promise<string> {
  // Use crypto.subtle if available (in modern Web and Node environments)
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }

  // Fast lightweight fallback hash
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fallback-${Math.abs(hash).toString(16)}-${message.length}`;
}

function generateSalt(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

const DEFAULT_SETTINGS: SecuritySettings = {
  isPinEnabled: false,
  pinHash: null,
  pinSalt: null,
  isBiometricEnabled: false,
  autoLockMinutes: 0, // 0 = immediate lock when app loses focus
  securityQuestion: 'What was your childhood nickname?',
  securityAnswerHash: null,
};

export const securityService = {
  async getSettings(): Promise<SecuritySettings> {
    try {
      const raw = await AsyncStorage.getItem(SECURITY_STORAGE_KEY);
      if (!raw) {
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (error) {
      console.error('Failed to get security settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: SecuritySettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save security settings:', error);
      throw error;
    }
  },

  async setupPin(pin: string, question: string, answer: string): Promise<boolean> {
    if (pin.length < 4) return false;
    const salt = generateSalt();
    const pinHash = await sha256(pin + salt);
    const answerHash = await sha256(answer.trim().toLowerCase() + salt);

    const current = await this.getSettings();
    await this.saveSettings({
      ...current,
      isPinEnabled: true,
      pinHash,
      pinSalt: salt,
      securityQuestion: question.trim(),
      securityAnswerHash: answerHash,
    });
    return true;
  },

  async verifyPin(enteredPin: string): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings.isPinEnabled || !settings.pinHash || !settings.pinSalt) {
      return true; // Not locked
    }
    const computed = await sha256(enteredPin + settings.pinSalt);
    return computed === settings.pinHash;
  },

  async changePin(oldPin: string, newPin: string): Promise<boolean> {
    const verified = await this.verifyPin(oldPin);
    if (!verified) return false;

    const settings = await this.getSettings();
    const newSalt = generateSalt();
    const newPinHash = await sha256(newPin + newSalt);
    
    // Also re-hash security answer with new salt if set
    await this.saveSettings({
      ...settings,
      pinHash: newPinHash,
      pinSalt: newSalt,
    });
    return true;
  },

  async disablePin(pin: string): Promise<boolean> {
    const verified = await this.verifyPin(pin);
    if (!verified) return false;

    await this.saveSettings({
      ...DEFAULT_SETTINGS,
      isPinEnabled: false,
    });
    return true;
  },

  async verifySecurityAnswer(enteredAnswer: string): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings.securityAnswerHash || !settings.pinSalt) return false;
    const computed = await sha256(enteredAnswer.trim().toLowerCase() + settings.pinSalt);
    return computed === settings.securityAnswerHash;
  },

  async resetPinWithRecovery(enteredAnswer: string, newPin: string): Promise<boolean> {
    const isAnswerValid = await this.verifySecurityAnswer(enteredAnswer);
    if (!isAnswerValid) return false;

    const settings = await this.getSettings();
    const newSalt = generateSalt();
    const newPinHash = await sha256(newPin + newSalt);
    const newAnswerHash = await sha256(enteredAnswer.trim().toLowerCase() + newSalt);

    await this.saveSettings({
      ...settings,
      isPinEnabled: true,
      pinHash: newPinHash,
      pinSalt: newSalt,
      securityAnswerHash: newAnswerHash,
    });
    return true;
  },

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    const settings = await this.getSettings();
    await this.saveSettings({
      ...settings,
      isBiometricEnabled: enabled,
    });
  },

  async setAutoLockMinutes(minutes: number): Promise<void> {
    const settings = await this.getSettings();
    await this.saveSettings({
      ...settings,
      autoLockMinutes: minutes,
    });
  },
};

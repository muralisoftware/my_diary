import React, { createContext, useContext, useEffect, useState } from 'react';
import { SecuritySettings } from '../types/diary';
import { securityService } from '../services/securityService';

interface SecurityContextType {
  isLocked: boolean;
  isLoading: boolean;
  settings: SecuritySettings;
  failedAttempts: number;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  lockApp: () => void;
  refreshSettings: () => Promise<void>;
  resetPinWithRecovery: (answer: string, newPin: string) => Promise<boolean>;
}

const defaultSettings: SecuritySettings = {
  isPinEnabled: false,
  pinHash: null,
  pinSalt: null,
  isBiometricEnabled: false,
  autoLockMinutes: 0,
  securityQuestion: 'What was your childhood nickname?',
  securityAnswerHash: null,
};

const SecurityContext = createContext<SecurityContextType>({
  isLocked: false,
  isLoading: true,
  settings: defaultSettings,
  failedAttempts: 0,
  unlockWithPin: async () => false,
  unlockWithBiometric: async () => false,
  lockApp: () => {},
  refreshSettings: async () => {},
  resetPinWithRecovery: async () => false,
});

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);

  const refreshSettings = async () => {
    try {
      const s = await securityService.getSettings();
      setSettings(s);
      if (s.isPinEnabled && s.pinHash) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    } catch (e) {
      console.error('Failed to init security settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const unlockWithPin = async (pin: string): Promise<boolean> => {
    const isValid = await securityService.verifyPin(pin);
    if (isValid) {
      setIsLocked(false);
      setFailedAttempts(0);
      return true;
    } else {
      setFailedAttempts((prev) => prev + 1);
      return false;
    }
  };

  const unlockWithBiometric = async (): Promise<boolean> => {
    // Biometric mock/fallback for web and native
    if (settings.isBiometricEnabled) {
      setIsLocked(false);
      setFailedAttempts(0);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    if (settings.isPinEnabled && settings.pinHash) {
      setIsLocked(true);
    }
  };

  const resetPinWithRecovery = async (answer: string, newPin: string): Promise<boolean> => {
    const success = await securityService.resetPinWithRecovery(answer, newPin);
    if (success) {
      await refreshSettings();
      setIsLocked(false);
      setFailedAttempts(0);
      return true;
    }
    return false;
  };

  return (
    <SecurityContext.Provider
      value={{
        isLocked,
        isLoading,
        settings,
        failedAttempts,
        unlockWithPin,
        unlockWithBiometric,
        lockApp,
        refreshSettings,
        resetPinWithRecovery,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => useContext(SecurityContext);

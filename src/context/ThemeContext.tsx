import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, ThemeName } from '../types/diary';
import { THEMES } from '../constants/theme';

const THEME_STORAGE_KEY = '@personal_diary_theme_mode';

interface ThemeContextType {
  themeName: ThemeName;
  theme: ThemeColors;
  setThemeName: (name: ThemeName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  themeName: 'warm',
  theme: THEMES.warm,
  setThemeName: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeNameState] = useState<ThemeName>('warm');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored && (stored === 'warm' || stored === 'lavender' || stored === 'midnight' || stored === 'white')) {
          setThemeNameState(stored);
        }
      } catch (e) {
        console.error('Error loading saved theme:', e);
      }
    })();
  }, []);

  const setThemeName = async (name: ThemeName) => {
    setThemeNameState(name);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
    } catch (e) {
      console.error('Error saving theme preference:', e);
    }
  };

  const theme = THEMES[themeName] || THEMES.warm;

  return (
    <ThemeContext.Provider value={{ themeName, theme, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

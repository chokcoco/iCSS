'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, getStoredTheme, applyTheme, initializeTheme } from '../lib/theme';
import { Language, getStoredLanguage, setStoredLanguage } from '../lib/language';
import { getTranslation, Translations } from '../lib/translations';

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [language, setLanguageState] = useState<Language>('zh');

  useEffect(() => {
    try {
      // 初始化主题和语言
      initializeTheme();
      setThemeState(getStoredTheme());
      setLanguageState(getStoredLanguage());
    } catch (error) {
      console.warn('Failed to initialize theme/language:', error);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      applyTheme(newTheme);
    } catch (error) {
      console.warn('Failed to set theme:', error);
    }
  };

  const setLanguage = (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      setStoredLanguage(newLanguage);
    } catch (error) {
      console.warn('Failed to set language:', error);
    }
  };

  const t = (key: keyof Translations): string => {
    return getTranslation(language, key);
  };

  const contextValue: AppContextType = {
    theme,
    setTheme,
    language,
    setLanguage,
    t
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 
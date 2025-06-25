export type Language = 'zh' | 'en';

export interface LanguageConfig {
  name: string;
  value: Language;
  flag: string;
}

export const languages: LanguageConfig[] = [
  {
    name: '中文',
    value: 'zh',
    flag: '🇨🇳'
  },
  {
    name: 'English',
    value: 'en',
    flag: '🇺🇸'
  }
];

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'zh';
  return (localStorage.getItem('language') as Language) || 'zh';
}

export function setStoredLanguage(language: Language) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('language', language);
} 
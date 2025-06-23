export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  name: string;
  value: Theme;
  icon: string;
}

export const themes: ThemeConfig[] = [
  {
    name: '亮色',
    value: 'light',
    icon: '☀️'
  },
  {
    name: '暗色',
    value: 'dark',
    icon: '🌙'
  },
  {
    name: '跟随系统',
    value: 'system',
    icon: '💻'
  }
];

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  const systemTheme = getSystemTheme();
  
  // 移除所有主题类
  root.classList.remove('light', 'dark');
  
  // 应用主题
  if (theme === 'system') {
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
  
  // 保存到 localStorage
  localStorage.setItem('theme', theme);
}

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) || 'system';
}

export function initializeTheme() {
  const theme = getStoredTheme();
  applyTheme(theme);
  
  // 监听系统主题变化
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (getStoredTheme() === 'system') {
        applyTheme('system');
      }
    });
  }
} 
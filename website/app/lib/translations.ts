import { Language } from './language';

export interface Translations {
  // 通用
  loading: string;
  error: string;
  back: string;
  next: string;
  prev: string;
  search: string;
  category: string;
  all: string;
  
  // 首页
  title: string;
  description: string;
  keywords: string;
  viewOnGitHub: string;
  lastArticle: string;
  noMoreArticles: string;
  
  // 文章详情页
  articleNotFound: string;
  loadFailed: string;
  returnHome: string;
  viewFullContent: string;
  nextArticle: string;
  prevArticle: string;
  returnList: string;
  viewInCodePen: string;
  
  // 主题
  light: string;
  dark: string;
  system: string;
  theme: string;
  
  // 语言
  language: string;
  chinese: string;
  english: string;
}

export const translations: Record<Language, Translations> = {
  zh: {
    // 通用
    loading: '加载中...',
    error: '错误',
    back: '返回',
    next: '下一个',
    prev: '上一个',
    search: '搜索',
    category: '分类',
    all: '全部',
    
    // 首页
    title: 'iCSS - CSS 奇技淫巧',
    description: 'CSS 奇技淫巧，在这里，都有。本 Repo 围绕 CSS/Web动画 展开，谈一些有趣的话题，内容天马行空，想到什么说什么。',
    keywords: 'CSS, 动画, 前端, 技巧, 奇技淫巧',
    viewOnGitHub: '在 GitHub 中查看',
    lastArticle: '已经是最后一篇文章了',
    noMoreArticles: '没有更多文章了',
    
    // 文章详情页
    articleNotFound: '文章不存在',
    loadFailed: '加载失败',
    returnHome: '返回首页',
    viewFullContent: '在 GitHub 中查看完整内容',
    nextArticle: '下一篇文章',
    prevArticle: '上一篇文章',
    returnList: '返回列表',
    viewInCodePen: '在 CodePen 中查看完整代码',
    
    // 主题
    light: '亮色',
    dark: '暗色',
    system: '跟随系统',
    theme: '主题',
    
    // 语言
    language: '语言',
    chinese: '中文',
    english: 'English'
  },
  en: {
    // 通用
    loading: 'Loading...',
    error: 'Error',
    back: 'Back',
    next: 'Next',
    prev: 'Previous',
    search: 'Search',
    category: 'Category',
    all: 'All',
    
    // 首页
    title: 'iCSS - CSS Tricks',
    description: 'CSS tricks and techniques. This repo focuses on CSS/Web animations, discussing interesting topics with creative content.',
    keywords: 'CSS, Animation, Frontend, Tricks, Techniques',
    viewOnGitHub: 'View on GitHub',
    lastArticle: 'This is the last article',
    noMoreArticles: 'No more articles',
    
    // 文章详情页
    articleNotFound: 'Article not found',
    loadFailed: 'Load failed',
    returnHome: 'Return to Home',
    viewFullContent: 'View full content on GitHub',
    nextArticle: 'Next Article',
    prevArticle: 'Previous Article',
    returnList: 'Return to List',
    viewInCodePen: 'View full code on CodePen',
    
    // 主题
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    theme: 'Theme',
    
    // 语言
    language: 'Language',
    chinese: '中文',
    english: 'English'
  }
};

export function getTranslation(language: Language, key: keyof Translations): string {
  return translations[language][key];
} 
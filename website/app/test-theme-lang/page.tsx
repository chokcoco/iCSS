'use client';

import { useApp } from '../contexts/AppContext';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';

export default function TestThemeLangPage() {
  const { t, theme, language } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                主题和语言测试
              </h1>
            </div>
            
            {/* 主题和语言切换 */}
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 当前状态 */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              当前状态
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  当前主题
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {theme === 'light' && '☀️ 亮色主题'}
                  {theme === 'dark' && '🌙 暗色主题'}
                  {theme === 'system' && '💻 跟随系统'}
                </p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  当前语言
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {language === 'zh' && '🇨🇳 中文'}
                  {language === 'en' && '🇺🇸 English'}
                </p>
              </div>
            </div>
          </div>

          {/* 翻译测试 */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              翻译测试
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  通用翻译
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>加载中: {t('loading')}</div>
                  <div>错误: {t('error')}</div>
                  <div>返回: {t('back')}</div>
                  <div>搜索: {t('search')}</div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  首页翻译
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>标题: {t('title')}</div>
                  <div>描述: {t('description')}</div>
                  <div>在 GitHub 中查看: {t('viewOnGitHub')}</div>
                  <div>没有更多文章: {t('noMoreArticles')}</div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  文章详情页翻译
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>文章不存在: {t('articleNotFound')}</div>
                  <div>加载失败: {t('loadFailed')}</div>
                  <div>返回首页: {t('returnHome')}</div>
                  <div>下一篇文章: {t('nextArticle')}</div>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  主题和语言翻译
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>主题: {t('theme')}</div>
                  <div>亮色: {t('light')}</div>
                  <div>暗色: {t('dark')}</div>
                  <div>跟随系统: {t('system')}</div>
                  <div>语言: {t('language')}</div>
                  <div>中文: {t('chinese')}</div>
                  <div>English: {t('english')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 样式测试 */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              样式测试
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  标题样式
                </h3>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  H1 标题
                </h1>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  H2 标题
                </h2>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  H3 标题
                </h3>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  文本样式
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  这是普通文本，支持暗色主题。
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  这是次要文本，支持暗色主题。
                </p>
                <p className="text-primary-600 dark:text-primary-400 mb-2">
                  这是链接文本，支持暗色主题。
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  按钮样式
                </h3>
                <div className="flex flex-wrap gap-4">
                  <button className="btn-primary">
                    主要按钮
                  </button>
                  <button className="btn-secondary">
                    次要按钮
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  输入框样式
                </h3>
                <input
                  type="text"
                  placeholder="输入框占位符"
                  className="input w-full max-w-md"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  代码样式
                </h3>
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                  console.log(&apos;Hello World&apos;);
                </code>
              </div>
            </div>
          </div>

          {/* 颜色测试 */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              颜色测试
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
                  Primary
                </h4>
                <p className="text-primary-700 dark:text-primary-300 text-sm">
                  主要颜色
                </p>
              </div>
              <div className="p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
                <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                  Secondary
                </h4>
                <p className="text-secondary-700 dark:text-secondary-300 text-sm">
                  次要颜色
                </p>
              </div>
              <div className="p-4 bg-muted-50 dark:bg-muted-900/20 rounded-lg">
                <h4 className="font-semibold text-muted-900 dark:text-muted-100 mb-2">
                  Muted
                </h4>
                <p className="text-muted-700 dark:text-muted-300 text-sm">
                  静音颜色
                </p>
              </div>
              <div className="p-4 bg-accent-50 dark:bg-accent-900/20 rounded-lg">
                <h4 className="font-semibold text-accent-900 dark:text-accent-100 mb-2">
                  Accent
                </h4>
                <p className="text-accent-700 dark:text-accent-300 text-sm">
                  强调颜色
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
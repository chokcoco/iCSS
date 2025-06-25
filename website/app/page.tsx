'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ExternalLink, Calendar, User, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from './contexts/AppContext';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';

interface Article {
  id: number;
  title: string;
  url: string;
  image?: string;
  category?: string;
  created_at: string;
  author: string;
  comments: number;
  reactions: number;
}

export default function HomePage() {
  const { t } = useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 获取文章数据
  const fetchArticles = async (page: number = 1, append: boolean = false) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '12'
      });
      
      if (selectedCategory !== '全部') {
        params.append('category', selectedCategory);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();
      console.log('Articles API response:', data);

      // 检查是否有错误信息
      if (data.error) {
        console.error('API returned error:', data.error);
        setError(data.error);
        setLoading(false);
        return;
      }

      // 确保数据格式正确
      const articles = Array.isArray(data.articles) ? data.articles : [];
      const pagination = data.pagination || { hasNext: false };
      console.log('Processed articles:', articles.length, 'pagination:', pagination);

      if (append) {
        setArticles(prev => [...prev, ...articles]);
      } else {
        setArticles(articles);
      }
      
      setHasMore(pagination.hasNext);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      setError('网络连接失败，请检查网络后重试');
      setLoading(false);
    }
  };

  // 获取分类数据
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      console.log('Categories API response:', data);
      // API 直接返回数组，不是 { categories: [...] } 格式
      const categoriesData = Array.isArray(data) ? data : [];
      console.log('Processed categories:', categoriesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories(['全部']); // 设置默认值
    }
  };

  useEffect(() => {
    fetchArticles(1, false);
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchArticles(1, false);
  }, [selectedCategory, searchTerm]);

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchArticles(nextPage, true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('error')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => fetchArticles(1, false)}
            className="btn-primary"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                iCSS
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                CSS 奇技淫巧
              </span>
            </div>
            
            {/* 主题和语言切换 */}
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选 */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input pl-10 appearance-none cursor-pointer"
              >
                <option value="全部">{t('all')}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <Link href={`/article/${article.id}`}>
                <div className="p-6">
                  {/* 文章配图 */}
                  {article.image && (
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  {/* 文章信息 */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">#{article.id}</span>
                      {article.category && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {article.category}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {article.title}
                    </h2>
                    
                    {/* 文章元信息 */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(article.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.reactions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* 外部链接 */}
              <div className="px-6 pb-4">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t('viewOnGitHub')}</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 加载更多 */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? t('loading') : '加载更多'}
            </button>
          </div>
        )}

        {/* 没有更多文章 */}
        {!hasMore && articles.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">{t('noMoreArticles')}</p>
          </div>
        )}
      </div>
    </div>
  );
} 
 
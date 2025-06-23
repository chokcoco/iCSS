'use client';

import { useState, useEffect } from 'react';

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

interface ArticlesResponse {
  articles: Article[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function TestAPIPage() {
  const [articles, setArticles] = useState<ArticlesResponse | null>(null);
  const [categories, setCategories] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAPIs = async () => {
      try {
        setLoading(true);
        setError(null);

        // 测试文章 API
        const articlesRes = await fetch('/api/articles');
        const articlesData = await articlesRes.json();
        setArticles(articlesData);

        // 测试分类 API
        const categoriesRes = await fetch('/api/categories');
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);

      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    testAPIs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API 测试页面</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>错误：</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 文章 API 测试 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">文章 API 测试</h2>
            {articles ? (
              <div>
                <div className="mb-4">
                  <strong>状态：</strong> 
                  <span className="text-green-600 ml-2">✅ 成功</span>
                </div>
                <div className="mb-4">
                  <strong>文章数量：</strong> {articles.articles?.length || 0}
                </div>
                <div className="mb-4">
                  <strong>分页信息：</strong>
                  <pre className="bg-gray-100 p-2 rounded text-sm mt-2 overflow-auto">
                    {JSON.stringify(articles.pagination, null, 2)}
                  </pre>
                </div>
                {articles.articles && articles.articles.length > 0 && (
                  <div>
                    <strong>第一篇文章：</strong>
                    <div className="bg-gray-100 p-2 rounded text-sm mt-2">
                      <div><strong>ID：</strong> {articles.articles[0].id}</div>
                      <div><strong>标题：</strong> {articles.articles[0].title}</div>
                      <div><strong>分类：</strong> {articles.articles[0].category || '无'}</div>
                      <div><strong>作者：</strong> {articles.articles[0].author}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-600">❌ 获取失败</div>
            )}
          </div>

          {/* 分类 API 测试 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">分类 API 测试</h2>
            {categories ? (
              <div>
                <div className="mb-4">
                  <strong>状态：</strong> 
                  <span className="text-green-600 ml-2">✅ 成功</span>
                </div>
                <div className="mb-4">
                  <strong>分类数量：</strong> {categories.length}
                </div>
                <div className="mb-4">
                  <strong>分类列表：</strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((category: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-600">❌ 获取失败</div>
            )}
          </div>
        </div>

        {/* 原始数据 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">原始数据</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">文章 API 响应：</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(articles, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">分类 API 响应：</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(categories, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
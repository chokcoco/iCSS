'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Calendar, User, Eye, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import CodeBlock from '../../components/CodeBlock';
import { useApp } from '../../contexts/AppContext';

interface Article {
  id: number;
  title: string;
  url: string;
  image?: string;
  category?: string;
}

interface IssueData {
  body: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  comments: number;
  reactions: {
    total_count: number;
  };
}

// 解析 Markdown 内容
const parseMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [];
  
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentCodeBlock = '';
  let inCodeBlock = false;
  let codeLanguage = '';
  let inList = false;
  let listItems: React.ReactNode[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 检测代码块开始
    if (line.startsWith('```')) {
      // 结束当前列表
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={`ul-${i}`} className="mb-4 pl-6 list-disc">
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }
      
      if (!inCodeBlock) {
        // 开始代码块
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim() || 'text';
        currentCodeBlock = '';
      } else {
        // 结束代码块
        inCodeBlock = false;
        if (currentCodeBlock.trim()) {
          // 检测是否是 CodePen 格式
          const isCodePen = codeLanguage === 'codepen' || 
                           currentCodeBlock.includes('<!-- CodePen Demo -->') ||
                           currentCodeBlock.includes('<!-- HTML -->') ||
                           currentCodeBlock.includes('<!-- CSS -->') ||
                           currentCodeBlock.includes('<!-- JavaScript -->');
          
          elements.push(
            <CodeBlock key={`code-${i}`} language={isCodePen ? 'codepen' : codeLanguage}>
              {currentCodeBlock.trim()}
            </CodeBlock>
          );
        }
        currentCodeBlock = '';
        continue;
      }
    } else if (inCodeBlock) {
      // 在代码块内
      currentCodeBlock += line + '\n';
    } else {
      // 普通文本处理
      if (line.trim() === '') {
        // 结束当前列表
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`ul-${i}`} className="mb-4 pl-6 list-disc">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(<br key={`br-${i}`} />);
      } else if (line.startsWith('### ')) {
        // 结束当前列表
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`ul-${i}`} className="mb-4 pl-6 list-disc">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h3 key={`h3-${i}`} className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-6 mb-4">
            {parseInlineMarkdown(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        // 结束当前列表
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`ul-${i}`} className="mb-4 pl-6 list-disc">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h2 key={`h2-${i}`} className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-4">
            {parseInlineMarkdown(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        // 结束当前列表
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`ul-${i}`} className="mb-4 pl-6 list-disc">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h1 key={`h1-${i}`} className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-4">
            {parseInlineMarkdown(line.slice(2))}
          </h1>
        );
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        inList = true;
        listItems.push(
          <li key={`li-${i}`} className="mb-1">
            {parseInlineMarkdown(line.slice(2))}
          </li>
        );
      } else {
        // 结束当前列表
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`ul-${i}`} className="mb-4 pl-6 list-disc">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        
        // 检查是否是独立的 CodePen 链接
        const codepenLinkMatch = line.match(/^\[([^\]]+)\]\((https:\/\/codepen\.io\/[^\/]+\/pen\/[^\/\?]+(?:\?[^\/]*)?)\)$/);
        if (codepenLinkMatch) {
          console.log('Found standard CodePen link:', codepenLinkMatch[2]);
          const [, linkText, url] = codepenLinkMatch;
          const codepenMatch = url.match(/codepen\.io\/([^\/]+)\/pen\/([^\/\?]+)/);
          if (codepenMatch) {
            const [, username, penId] = codepenMatch;
            console.log('Extracted CodePen:', username, penId);
            elements.push(
              <div key={`codepen-block-${i}`} className="my-6">
                <iframe
                  src={`https://codepen.io/${username}/embed/${penId}?default-tab=result`}
                  className="w-full h-96 border-0 rounded-lg"
                  title={`CodePen: ${linkText}`}
                  loading="lazy"
                  allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
                <div className="mt-2 text-center">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
                  >
                    在 CodePen 中查看完整代码 →
                  </a>
                </div>
              </div>
            );
            continue; // 跳过后续的 p 标签处理
          }
        }
        
        // 检查是否是独立的 CodePen 链接（@ 开头格式）
        const codepenAtLinkMatch = line.match(/^@(https:\/\/codepen\.io\/[^\/]+\/pen\/[^\/\?]+(?:\?[^\/]*)?)/);
        if (codepenAtLinkMatch) {
          console.log('Found @ CodePen link:', codepenAtLinkMatch[1]);
          const [, url] = codepenAtLinkMatch;
          const codepenMatch = url.match(/codepen\.io\/([^\/]+)\/pen\/([^\/\?]+)/);
          if (codepenMatch) {
            const [, username, penId] = codepenMatch;
            console.log('Extracted CodePen:', username, penId);
            elements.push(
              <div key={`codepen-at-block-${i}`} className="my-6">
                <iframe
                  src={`https://codepen.io/${username}/embed/${penId}?default-tab=result`}
                  className="w-full h-96 border-0 rounded-lg"
                  title={`CodePen Demo`}
                  loading="lazy"
                  allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
                <div className="mt-2 text-center">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
                  >
                    在 CodePen 中查看完整代码 →
                  </a>
                </div>
              </div>
            );
            continue; // 跳过后续的 p 标签处理
          }
        }
        
        // 检查是否包含 CodePen 链接（行内链接）
        const inlineCodepenMatch = line.match(/\[([^\]]+)\]\((https:\/\/codepen\.io\/[^\/]+\/pen\/[^\/\?]+(?:\?[^\/]*)?)\)/);
        if (inlineCodepenMatch) {
          console.log('Found inline CodePen link:', inlineCodepenMatch[2]);
          const [, linkText, url] = inlineCodepenMatch;
          const codepenMatch = url.match(/codepen\.io\/([^\/]+)\/pen\/([^\/\?]+)/);
          if (codepenMatch) {
            const [, username, penId] = codepenMatch;
            console.log('Extracted inline CodePen:', username, penId);
            elements.push(
              <div key={`codepen-inline-${i}`} className="my-6">
                <iframe
                  src={`https://codepen.io/${username}/embed/${penId}?default-tab=result`}
                  className="w-full h-96 border-0 rounded-lg"
                  title={`CodePen: ${linkText}`}
                  loading="lazy"
                  allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
                <div className="mt-2 text-center">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
                  >
                    在 CodePen 中查看完整代码 →
                  </a>
                </div>
              </div>
            );
            continue; // 跳过后续的 p 标签处理
          }
        }
        
        // 检查是否包含 CodePen 链接（@ 开头格式，行内）
        const inlineCodepenAtMatch = line.match(/@(https:\/\/codepen\.io\/[^\/]+\/pen\/[^\/\?]+(?:\?[^\/]*)?)/);
        if (inlineCodepenAtMatch) {
          const [, url] = inlineCodepenAtMatch;
          const codepenMatch = url.match(/codepen\.io\/([^\/]+)\/pen\/([^\/\?]+)/);
          if (codepenMatch) {
            const [, username, penId] = codepenMatch;
            elements.push(
              <div key={`codepen-at-inline-${i}`} className="my-6">
                <iframe
                  src={`https://codepen.io/${username}/embed/${penId}?default-tab=result`}
                  className="w-full h-96 border-0 rounded-lg"
                  title={`CodePen Demo`}
                  loading="lazy"
                  allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
                <div className="mt-2 text-center">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
                  >
                    在 CodePen 中查看完整代码 →
                  </a>
                </div>
              </div>
            );
            continue; // 跳过后续的 p 标签处理
          }
        }
        
        elements.push(
          <p key={`p-${i}`} className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">
            {parseInlineMarkdown(line)}
          </p>
        );
      }
    }
  }
  
  // 处理未闭合的列表
  if (inList && listItems.length > 0) {
    elements.push(
      <ul key="ul-final" className="mb-4 pl-6 list-disc">
        {listItems}
      </ul>
    );
  }
  
  // 处理未闭合的代码块
  if (inCodeBlock && currentCodeBlock.trim()) {
    // 检测是否是 CodePen 格式
    const isCodePen = codeLanguage === 'codepen' || 
                     currentCodeBlock.includes('<!-- CodePen Demo -->') ||
                     currentCodeBlock.includes('<!-- HTML -->') ||
                     currentCodeBlock.includes('<!-- CSS -->') ||
                     currentCodeBlock.includes('<!-- JavaScript -->');
    
    elements.push(
      <CodeBlock key="code-final" language={isCodePen ? 'codepen' : codeLanguage}>
        {currentCodeBlock.trim()}
      </CodeBlock>
    );
  }
  
  return elements;
};

// 解析行内 Markdown
const parseInlineMarkdown = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let currentText = '';
  let i = 0;
  
  while (i < text.length) {
    // 处理 HTML 图片标签 <img ...>
    if (text.slice(i, i + 4) === '<img') {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      i += 4;
      let imgTag = '<img';
      let inQuotes = false;
      let quoteChar = '';
      
      while (i < text.length) {
        const char = text[i];
        imgTag += char;
        
        if ((char === '"' || char === "'") && !inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar && inQuotes) {
          inQuotes = false;
        } else if (char === '>' && !inQuotes) {
          i++;
          break;
        }
        i++;
      }
      
      // 解析 img 标签属性
      const srcMatch = imgTag.match(/src\s*=\s*["']([^"']+)["']/);
      const altMatch = imgTag.match(/alt\s*=\s*["']([^"']+)["']/);
      const widthMatch = imgTag.match(/width\s*=\s*["']?(\d+)["']?/);
      
      if (srcMatch) {
        const src = srcMatch[1];
        const alt = altMatch ? altMatch[1] : '';
        const width = widthMatch ? widthMatch[1] : undefined;
        
        parts.push(
          <img 
            key={`html-img-${i}`} 
            src={src} 
            alt={alt} 
            width={width}
            className="max-w-full h-auto rounded-lg my-4" 
          />
        );
      } else {
        parts.push(imgTag);
      }
    }
    // 处理 Markdown 图片 ![alt](url)
    else if (text.slice(i, i + 2) === '![') {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      i += 2;
      let altText = '';
      while (i < text.length && text[i] !== ']') {
        altText += text[i];
        i++;
      }
      if (i < text.length && text[i] === ']' && text[i + 1] === '(') {
        i += 2;
        let url = '';
        while (i < text.length && text[i] !== ')') {
          url += text[i];
          i++;
        }
        if (i < text.length) {
          parts.push(
            <img 
              key={`img-${i}`} 
              src={url} 
              alt={altText} 
              className="max-w-full h-auto rounded-lg my-4" 
            />
          );
          i++;
        } else {
          parts.push(`![${altText}](${url}`);
        }
      } else {
        parts.push(`![${altText}`);
      }
    }
    // 处理 @ 开头的 CodePen 链接
    else if (text[i] === '@' && text.slice(i + 1, i + 8) === 'https://') {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      i++; // 跳过 @
      let url = '';
      while (i < text.length && text[i] !== ' ' && text[i] !== '\n' && text[i] !== '\t') {
        url += text[i];
        i++;
      }
      
      // 检查是否是 CodePen 链接
      const codepenMatch = url.match(/codepen\.io\/([^\/]+)\/pen\/([^\/\?]+)/);
      if (codepenMatch) {
        // CodePen 链接应该在 parseMarkdown 中处理，这里只返回普通链接
        parts.push(
          <a 
            key={`at-link-${i}`} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary-600 hover:text-primary-700 underline"
          >
            {url}
          </a>
        );
      } else {
        parts.push(
          <a 
            key={`at-link-${i}`} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary-600 hover:text-primary-700 underline"
          >
            {url}
          </a>
        );
      }
    }
    // 处理链接 [text](url)
    else if (text[i] === '[') {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      i++;
      let linkText = '';
      while (i < text.length && text[i] !== ']') {
        linkText += text[i];
        i++;
      }
      if (i < text.length && text[i] === ']' && text[i + 1] === '(') {
        i += 2;
        let url = '';
        while (i < text.length && text[i] !== ')') {
          url += text[i];
          i++;
        }
        if (i < text.length) {
          // 检查是否是 CodePen 链接
          const codepenMatch = url.match(/codepen\.io\/([^\/]+)\/pen\/([^\/\?]+)/);
          if (codepenMatch) {
            // CodePen 链接应该在 parseMarkdown 中处理，这里只返回普通链接
            parts.push(
              <a 
                key={`link-${i}`} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary-600 hover:text-primary-700 underline"
              >
                {linkText}
              </a>
            );
          } else {
            parts.push(
              <a 
                key={`link-${i}`} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary-600 hover:text-primary-700 underline"
              >
                {linkText}
              </a>
            );
          }
          i++;
        } else {
          parts.push(`[${linkText}](${url}`);
        }
      } else {
        parts.push(`[${linkText}`);
      }
    }
    // 处理粗体 **text**
    else if (text.slice(i, i + 2) === '**') {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      i += 2;
      let boldText = '';
      while (i < text.length && text.slice(i, i + 2) !== '**') {
        boldText += text[i];
        i++;
      }
      if (i < text.length) {
        parts.push(<strong key={`bold-${i}`} className="font-bold">{boldText}</strong>);
        i += 2;
      } else {
        parts.push(`**${boldText}`);
      }
    }
    // 处理斜体 *text*
    else if (text[i] === '*') {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      i++;
      let italicText = '';
      while (i < text.length && text[i] !== '*') {
        italicText += text[i];
        i++;
      }
      if (i < text.length) {
        parts.push(<em key={`italic-${i}`} className="italic">{italicText}</em>);
        i++;
      } else {
        parts.push(`*${italicText}`);
      }
    }
    // 处理行内代码 `code`
    else if (text[i] === '`') {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      i++;
      let codeText = '';
      while (i < text.length && text[i] !== '`') {
        codeText += text[i];
        i++;
      }
      if (i < text.length) {
        parts.push(
          <code key={`code-${i}`} className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
            {codeText}
          </code>
        );
        i++;
      } else {
        parts.push(`\`${codeText}`);
      }
    } else {
      currentText += text[i];
      i++;
    }
  }
  
  if (currentText) {
    parts.push(currentText);
  }
  
  return parts.length === 1 ? parts[0] : parts;
};

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useApp();
  const [article, setArticle] = useState<Article | null>(null);
  const [issueData, setIssueData] = useState<IssueData | null>(null);
  const [nextArticle, setNextArticle] = useState<Article | null>(null);
  const [prevArticle, setPrevArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticleData = async () => {
      try {
        setLoading(true);
        const id = params.id as string;
        
        // 直接从单个文章 API 获取基本信息
        const articleRes = await fetch(`/api/articles/${id}`);
        const articleData = await articleRes.json();
        
        if (!articleData || !articleData.body) {
          setError(t('articleNotFound'));
          return;
        }
        
        // 构造文章基本信息
        const currentArticle: Article = {
          id: parseInt(id),
          title: articleData.title || `文章 #${id}`,
          url: `https://github.com/chokcoco/iCSS/issues/${id}`,
          image: articleData.image,
          category: articleData.category
        };
        
        setArticle(currentArticle);
        setIssueData(articleData);
        
        // 获取所有文章用于导航
        const articlesRes = await fetch('/api/articles?per_page=100');
        const articlesData = await articlesRes.json();
        
        if (articlesData.articles && Array.isArray(articlesData.articles)) {
          const currentIndex = articlesData.articles.findIndex((a: Article) => a.id === parseInt(id));
          
          // 获取下一篇文章
          if (currentIndex !== -1 && currentIndex < articlesData.articles.length - 1) {
            setNextArticle(articlesData.articles[currentIndex + 1]);
          }
          
          // 获取上一篇文章
          if (currentIndex !== -1 && currentIndex > 0) {
            setPrevArticle(articlesData.articles[currentIndex - 1]);
          }
        }
        
      } catch (err) {
        console.error('加载文章详情失败:', err);
        setError(t('loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadArticleData();
    }
  }, [params.id, t]);

  const goBack = () => {
    router.back();
  };

  const goToNextArticle = () => {
    if (nextArticle) {
      router.push(`/article/${nextArticle.id}`);
    }
  };

  const goToPrevArticle = () => {
    if (prevArticle) {
      router.push(`/article/${prevArticle.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('articleNotFound')}</h1>
          <button
            onClick={goBack}
            className="btn-primary"
          >
            {t('returnHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部导航 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={goBack}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('back')}</span>
            </button>
            <div className="flex items-center space-x-4">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                <span>{t('viewFullContent')}</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* 文章头部 */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">#{article.id}</span>
                  {article.category && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {article.category}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {article.title}
                </h1>
                
                {/* 文章元信息 */}
                {issueData && (
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{issueData.user?.login}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(issueData.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{issueData.reactions?.total_count || 0} 赞</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 文章配图 */}
          {article.image && (
            <div className="relative h-64 md:h-96 overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* 文章内容 */}
          <div className="p-6">
            {issueData?.body ? (
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div className="markdown-content">
                  {parseMarkdown(issueData.body)}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
              </div>
            )}
          </div>

          {/* 底部操作 */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={goBack}
                  className="btn-secondary"
                >
                  {t('returnList')}
                </button>
                {prevArticle && (
                  <button
                    onClick={goToPrevArticle}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('prevArticle')}</span>
                  </button>
                )}
              </div>
              {nextArticle ? (
                <button
                  onClick={goToNextArticle}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>{t('nextArticle')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('lastArticle')}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
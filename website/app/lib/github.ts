import { cache } from './cache';

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  comments: number;
  reactions: {
    total_count: number;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
}

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

export class GitHubAPI {
  private static readonly REPO_OWNER = 'chokcoco';
  private static readonly REPO_NAME = 'iCSS';
  private static readonly BASE_URL = 'https://api.github.com';
  
  // 获取 GitHub Token
  private static getGitHubToken(): string | undefined {
    return process.env.GITHUB_TOKEN;
  }
  
  // 构建请求头
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'iCSS-Website'
    };
    
    const token = this.getGitHubToken();
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    return headers;
  }
  
  // 从 issue 内容中提取图片
  private static extractImageFromBody(body: string): string | undefined {
    if (!body) return undefined;
    
    // 匹配 Markdown 图片 ![alt](url)
    const markdownImageMatch = body.match(/!\[.*?\]\((https?:\/\/[^)]+\.(?:png|jpg|jpeg|gif|webp))\)/);
    if (markdownImageMatch) {
      return markdownImageMatch[1];
    }
    
    // 匹配 HTML 图片标签 <img src="...">
    const htmlImageMatch = body.match(/<img[^>]+src\s*=\s*["'](https?:\/\/[^"']+\.(?:png|jpg|jpeg|gif|webp))["'][^>]*>/);
    if (htmlImageMatch) {
      return htmlImageMatch[1];
    }
    
    return undefined;
  }
  
  // 从 issue 内容中提取分类
  private static extractCategoryFromBody(body: string): string | undefined {
    if (!body) return undefined;
    
    // 匹配标题中的分类标记，如 【动画】、【布局】等
    const categoryMatch = body.match(/【([^】]+)】/);
    if (categoryMatch) {
      return categoryMatch[1];
    }
    
    // 匹配标签中的分类
    const tagMatch = body.match(/标签[：:]\s*([^\n\r]+)/);
    if (tagMatch) {
      return tagMatch[1].trim();
    }
    
    return undefined;
  }
  
  // 转换 GitHub issue 为文章格式
  private static transformIssueToArticle(issue: GitHubIssue): Article {
    const image = this.extractImageFromBody(issue.body);
    const category = this.extractCategoryFromBody(issue.body);
    
    return {
      id: issue.number,
      title: issue.title,
      url: `https://github.com/${this.REPO_OWNER}/${this.REPO_NAME}/issues/${issue.number}`,
      image,
      category,
      created_at: issue.created_at,
      author: issue.user.login,
      comments: issue.comments,
      reactions: issue.reactions.total_count
    };
  }
  
  // 获取所有 issues
  static async getIssues(page: number = 1, perPage: number = 30): Promise<Article[]> {
    const cacheKey = `issues_${page}_${perPage}`;
    const cached = cache.get<Article[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const url = `${this.BASE_URL}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/issues?state=open&sort=created&direction=desc&page=${page}&per_page=${perPage}`;
      
      const response = await this.fetchWithRetry(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        console.error(`GitHub API error: ${response.status} - ${response.statusText}`);
        // 如果是限流错误，返回空数组而不是抛出错误
        if (response.status === 403) {
          console.error('GitHub API rate limit exceeded');
          return [];
        }
        return [];
      }
      
      const issues: GitHubIssue[] = await response.json();
      
      // 调试：打印每个 issue 的作者和标题
      console.log('GitHub issues user:', issues.map(i => ({user: i.user.login, title: i.title})));
      
      if (!Array.isArray(issues)) {
        console.error('GitHub API returned non-array issues:', issues);
        return [];
      }
      
      console.log('issues', issues);

      // 过滤掉非文章类型的 issue（如 bug 报告等）
      const articleIssues = issues.filter(issue => {
        // 只排除明显的非文章内容
        const excludeKeywords = ['bug', '问题', '建议', '求助', 'question', 'help', 'error'];
        const hasExcludeKeyword = excludeKeywords.some(keyword => 
          issue.title.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // 排除用户不是 chokcoco 的 issue（通常是用户提问）
        const isAuthor = issue.user.login === 'chokcoco';
        
        return !hasExcludeKeyword && isAuthor;
      });
      
      console.log('Filtered issues count:', articleIssues.length);
      console.log('Filtered issues:', articleIssues.map(i => ({user: i.user.login, title: i.title})));
      
      const articles = articleIssues.map(issue => this.transformIssueToArticle(issue));
      
      console.log('Transformed articles count:', articles.length);
      console.log('Transformed articles:', articles.map(a => ({id: a.id, title: a.title})));
      
      // 缓存结果（30分钟）
      cache.set(cacheKey, articles, 30 * 60 * 1000);
      
      return articles;
    } catch (error) {
      console.error('Error fetching issues from GitHub:', error);
      return [];
    }
  }
  
  // 获取单个 issue 详情
  static async getIssue(issueNumber: number): Promise<{
    title: string;
    body: string;
    created_at: string;
    user: { login: string; avatar_url: string };
    comments: number;
    reactions: { total_count: number };
    image?: string;
    category?: string;
  }> {
    const cacheKey = `issue_${issueNumber}`;
    const cached = cache.get<{
      title: string;
      body: string;
      created_at: string;
      user: { login: string; avatar_url: string };
      comments: number;
      reactions: { total_count: number };
      image?: string;
      category?: string;
    }>(cacheKey);
    
    if (cached) {
      console.log('Using cached issue data for:', issueNumber);
      return cached;
    }
    
    try {
      const url = `${this.BASE_URL}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/issues/${issueNumber}`;
      console.log('Fetching issue from:', url);
      
      const response = await this.fetchWithRetry(url, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        console.error(`GitHub API error: ${response.status} - ${response.statusText}`);
        if (response.status === 403) {
          console.error('GitHub API rate limit exceeded');
          throw new Error('GitHub API rate limit exceeded');
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const issue: GitHubIssue = await response.json();
      console.log('Fetched issue data:', { 
        number: issue.number, 
        title: issue.title, 
        bodyLength: issue.body?.length || 0 
      });
      
      const image = this.extractImageFromBody(issue.body);
      const category = this.extractCategoryFromBody(issue.body);
      
      const result = {
        title: issue.title,
        body: issue.body || '',
        created_at: issue.created_at,
        user: issue.user,
        comments: issue.comments,
        reactions: issue.reactions,
        image,
        category
      };
      
      // 缓存结果（60分钟）
      cache.set(cacheKey, result, 60 * 60 * 1000);
      
      return result;
    } catch (error) {
      console.error('Error fetching issue from GitHub:', error);
      throw error;
    }
  }
  
  // 获取所有文章（分页获取）
  static async getAllArticles(): Promise<Article[]> {
    const cacheKey = 'all_articles';
    const cached = cache.get<Article[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const allArticles: Article[] = [];
    let page = 1;
    const perPage = 100; // GitHub API 最大支持 100
    
    try {
      while (true) {
        const articles = await this.getIssues(page, perPage);
        
        if (!Array.isArray(articles) || articles.length === 0) {
          break; // 没有更多数据
        }
        
        allArticles.push(...articles);
        
        if (articles.length < perPage) {
          break; // 最后一页
        }
        
        page++;
        
        // 限制最大页数，避免无限循环
        if (page > 20) {
          break;
        }
      }
      
      // 缓存结果（120分钟）
      cache.set(cacheKey, allArticles, 120 * 60 * 1000);
      
      return allArticles;
    } catch (error) {
      console.error('Error fetching all articles:', error);
      // 返回空数组而不是抛出错误
      return [];
    }
  }
  
  // 带重试的 fetch 函数
  private static async fetchWithRetry(url: string, options: RequestInit, retries: number = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok || response.status === 403) {
          return response;
        }
        // 如果不是 403 错误，等待后重试
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 递增延迟
        }
      } catch (error) {
        console.error(`Fetch attempt ${i + 1} failed:`, error);
        if (i === retries - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error(`Failed after ${retries} retries`);
  }
} 
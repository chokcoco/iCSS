import { NextRequest, NextResponse } from 'next/server';
import { GitHubAPI } from '@/app/lib/github';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '30');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    // 获取所有文章
    const allArticles = await GitHubAPI.getAllArticles();
    
    // 确保 allArticles 是数组
    if (!Array.isArray(allArticles)) {
      console.error('GitHub API returned non-array data:', allArticles);
      return NextResponse.json({
        articles: [],
        pagination: {
          page,
          perPage,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        error: '数据格式错误'
      });
    }
    
    // 如果文章列表为空，可能是API限流或网络问题
    if (allArticles.length === 0) {
      console.warn('No articles returned from GitHub API, possible rate limiting');
      return NextResponse.json({
        articles: [],
        pagination: {
          page,
          perPage,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        error: '暂时无法获取文章数据，请稍后再试'
      });
    }
    
    // 应用分类过滤
    let filteredArticles = allArticles;
    if (category && category !== '全部') {
      filteredArticles = allArticles.filter(article => 
        article.category === category
      );
    }
    
    // 应用搜索过滤
    if (search) {
      const searchLower = search.toLowerCase();
      filteredArticles = filteredArticles.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        (article.category && article.category.toLowerCase().includes(searchLower))
      );
    }
    
    // 应用分页
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);
    
    // 计算分页信息
    const total = filteredArticles.length;
    const totalPages = Math.ceil(total / perPage);
    
    return NextResponse.json({
      articles: paginatedArticles,
      pagination: {
        page,
        perPage,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({
      articles: [],
      pagination: {
        page: 1,
        perPage: 30,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      },
      error: '获取文章数据失败，请稍后再试'
    }, { status: 200 });
  }
} 
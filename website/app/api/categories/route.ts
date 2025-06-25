import { NextResponse } from 'next/server';
import { GitHubAPI } from '@/app/lib/github';

export async function GET() {
  try {
    // 获取所有文章
    const allArticles = await GitHubAPI.getAllArticles();
    
    // 确保 allArticles 是数组
    if (!Array.isArray(allArticles)) {
      console.error('GitHub API returned non-array data:', allArticles);
      return NextResponse.json(['全部'], { status: 200 });
    }
    
    // 提取所有分类
    const categories = new Set<string>();
    allArticles.forEach(article => {
      if (article.category) {
        categories.add(article.category);
      }
    });
    
    // 转换为数组并排序
    const categoryList = Array.from(categories).sort();
    
    // 添加"全部"选项
    categoryList.unshift('全部');
    
    return NextResponse.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    // 返回默认分类列表，避免前端报错
    return NextResponse.json(['全部'], { status: 200 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { GitHubAPI } from '@/app/lib/github';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const issueNumber = parseInt(id);
    
    if (isNaN(issueNumber)) {
      return NextResponse.json(
        { error: '无效的文章 ID' }, 
        { status: 400 }
      );
    }
    
    const issueData = await GitHubAPI.getIssue(issueNumber);
    
    return NextResponse.json(issueData);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: '获取文章详情失败' }, 
      { status: 500 }
    );
  }
} 
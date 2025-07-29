import axios from 'axios';
import Database from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InspirationFetcher {
  constructor() {
    this.baseURL = 'https://api.github.com/repos/chokcoco/CSS-Inspiration';
    this.rawURL = 'https://raw.githubusercontent.com/chokcoco/CSS-Inspiration/master';
    this.dbPath = path.join(__dirname, '../data/icss.db');
    this.dataDir = path.join(__dirname, '../data');
    
    // GitHub Token
    this.githubToken = process.env.GITHUB_TOKEN;
    if (!this.githubToken) {
      console.warn('⚠️ No GITHUB_TOKEN found in environment variables. API rate limits will be restricted.');
    }
    
    // 确保数据目录存在
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // 初始化数据库连接
    this.db = new Database.Database(this.dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err);
        process.exit(1);
      }
    });

    // CSS-Inspiration 分类映射
    this.categoryMapping = {
      '3d': '3D 效果',
      'animation': '动画效果',
      'background': '背景效果',
      'blendmode': '混合模式',
      'border': '边框效果',
      'clippath': '裁剪路径',
      'cssdoodle': 'CSS-doodle',
      'filter': '滤镜效果',
      'layout': '布局技术',
      'others': '综合技巧',
      'pesudo': '伪类/伪元素',
      'shadow': '阴影效果',
      'svg': 'SVG 技术',
      'text': '文字效果'
    };

    this.initializeDatabase();
  }

  initializeDatabase() {
    console.log('🔧 Initializing CSS-Inspiration tables...');
    
    // CSS-Inspiration 项目表
    const createInspirationTableSQL = `
      CREATE TABLE IF NOT EXISTS css_inspiration (
        id INTEGER PRIMARY KEY,
        category TEXT NOT NULL,
        filename TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        html_content TEXT,
        css_content TEXT,
        demo_url TEXT,
        source_url TEXT,
        tags TEXT,
        difficulty_level TEXT,
        browser_support TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        search_content TEXT,
        UNIQUE(category, filename)
      )
    `;

    // 代码片段表（用于存储提取的代码块）
    const createCodeSnippetsTableSQL = `
      CREATE TABLE IF NOT EXISTS code_snippets (
        id INTEGER PRIMARY KEY,
        inspiration_id INTEGER,
        snippet_type TEXT, -- 'html', 'css', 'javascript'
        code_content TEXT,
        line_start INTEGER,
        line_end INTEGER,
        description TEXT,
        FOREIGN KEY(inspiration_id) REFERENCES css_inspiration(id)
      )
    `;

    // Demo 样式表（用于存储完整的可运行 demo）
    const createDemoStylesTableSQL = `
      CREATE TABLE IF NOT EXISTS demo_styles (
        id INTEGER PRIMARY KEY,
        inspiration_id INTEGER,
        complete_html TEXT,
        complete_css TEXT,
        preview_image TEXT,
        is_interactive BOOLEAN DEFAULT 0,
        performance_notes TEXT,
        FOREIGN KEY(inspiration_id) REFERENCES css_inspiration(id)
      )
    `;

    this.db.serialize(() => {
      this.db.run(createInspirationTableSQL)
          .run(createCodeSnippetsTableSQL)
          .run(createDemoStylesTableSQL);
      
      console.log('✅ CSS-Inspiration database tables initialized');
    });
  }

  async fetchDirectoryContents(category) {
    console.log(`📂 Fetching contents for category: ${category}`);
    
    try {
      const response = await axios.get(`${this.baseURL}/contents/${category}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'iCSS-MCP-Server',
          ...(this.githubToken && { 'Authorization': `token ${this.githubToken}` })
        }
      });

      const files = response.data.filter(item => 
        item.type === 'file' && item.name.endsWith('.md')
      );

      console.log(`   📝 Found ${files.length} markdown files in ${category}`);
      return files;
    } catch (error) {
      console.error(`❌ Error fetching ${category} contents:`, error.message);
      return [];
    }
  }

  async fetchFileContent(filePath) {
    try {
      const response = await axios.get(`${this.rawURL}/${filePath}`, {
        headers: {
          'User-Agent': 'iCSS-MCP-Server',
          ...(this.githubToken && { 'Authorization': `token ${this.githubToken}` })
        }
      });

      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching file ${filePath}:`, error.message);
      return null;
    }
  }

  parseMarkdownContent(content, category, filename) {
    const lines = content.split('\n');
    let title = '';
    let description = '';
    let htmlContent = '';
    let cssContent = '';
    let currentSection = '';
    let codeBlock = [];
    let isInCodeBlock = false;
    let codeBlockType = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 提取标题
      if (line.startsWith('## ') && !title) {
        title = line.replace('## ', '').trim();
        continue;
      }

      // 检测代码块开始
      if (line.startsWith('```')) {
        if (!isInCodeBlock) {
          // 开始代码块
          isInCodeBlock = true;
          codeBlockType = line.replace('```', '').trim() || 'text';
          codeBlock = [];
        } else {
          // 结束代码块
          isInCodeBlock = false;
          const code = codeBlock.join('\n');
          
          if (codeBlockType === 'html' || codeBlockType.includes('html')) {
            htmlContent += code + '\n\n';
          } else if (codeBlockType === 'css' || codeBlockType.includes('css')) {
            cssContent += code + '\n\n';
          }
          
          codeBlock = [];
          codeBlockType = '';
        }
        continue;
      }

      // 收集代码块内容
      if (isInCodeBlock) {
        codeBlock.push(line);
        continue;
      }

      // 收集描述信息
      if (!isInCodeBlock && line.trim() && !line.startsWith('#')) {
        if (!description && title) {
          description += line + ' ';
        }
      }
    }

    // 如果没有找到标题，使用文件名
    if (!title) {
      title = filename.replace('.md', '').replace(/-/g, ' ');
    }

    // 生成标签
    const tags = this.generateTags(title, description, cssContent, category);

    // 评估难度级别
    const difficultyLevel = this.assessDifficulty(cssContent, htmlContent);

    // 评估浏览器支持
    const browserSupport = this.assessBrowserSupport(cssContent);

    return {
      title: title.trim(),
      description: description.trim().substring(0, 500),
      htmlContent: htmlContent.trim(),
      cssContent: cssContent.trim(),
      tags: JSON.stringify(tags),
      difficultyLevel,
      browserSupport: JSON.stringify(browserSupport)
    };
  }

  generateTags(title, description, cssContent, category) {
    const tags = [this.categoryMapping[category] || category];
    
    // 从 CSS 内容中提取关键属性
    const cssProperties = [
      'transform', 'animation', 'transition', 'background', 'border',
      'box-shadow', 'clip-path', 'mask', 'filter', 'grid', 'flex',
      'position', 'pseudo', ':hover', ':before', ':after'
    ];

    cssProperties.forEach(prop => {
      if (cssContent.toLowerCase().includes(prop)) {
        tags.push(prop);
      }
    });

    // 从标题和描述中提取关键词
    const keywords = [
      '动画', '效果', '布局', '渐变', '阴影', '3D', '响应式', 
      'Loading', '按钮', '卡片', '导航', '菜单'
    ];

    const text = (title + ' ' + description).toLowerCase();
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        tags.push(keyword);
      }
    });

    return [...new Set(tags)]; // 去重
  }

  assessDifficulty(cssContent, htmlContent) {
    let complexity = 0;
    
    // 基于 CSS 复杂度评估
    const advancedProperties = [
      '@keyframes', 'transform3d', 'perspective', 'clip-path',
      'mask', 'filter', 'mix-blend-mode', 'calc(', 'var(',
      'custom-property', '@property'
    ];

    advancedProperties.forEach(prop => {
      if (cssContent.includes(prop)) {
        complexity += 2;
      }
    });

    // 基于嵌套和选择器复杂度
    const selectorComplexity = (cssContent.match(/::?[\w-]+/g) || []).length;
    complexity += Math.floor(selectorComplexity / 5);

    // 基于动画复杂度
    const animationCount = (cssContent.match(/@keyframes/g) || []).length;
    complexity += animationCount * 3;

    if (complexity < 5) return '初级';
    if (complexity < 10) return '中级';
    return '高级';
  }

  assessBrowserSupport(cssContent) {
    const support = {
      chrome: '完全支持',
      firefox: '完全支持',
      safari: '完全支持',
      edge: '完全支持',
      ie: '不支持'
    };

    // 检查新特性
    const modernFeatures = {
      'clip-path': { safari: '部分支持', ie: '不支持' },
      'mask': { safari: '需要前缀', ie: '不支持' },
      '@property': { firefox: '部分支持', safari: '部分支持', ie: '不支持' },
      'backdrop-filter': { firefox: '部分支持', ie: '不支持' },
      'grid': { ie: '部分支持' },
      'custom-property': { ie: '不支持' }
    };

    Object.entries(modernFeatures).forEach(([feature, limitations]) => {
      if (cssContent.includes(feature)) {
        Object.assign(support, limitations);
      }
    });

    return support;
  }

  async saveToDatabase(category, filename, parsedContent) {
    const insertSQL = `
      INSERT OR REPLACE INTO css_inspiration 
      (category, filename, title, description, html_content, css_content, 
       demo_url, source_url, tags, difficulty_level, browser_support, 
       search_content, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const sourceUrl = `https://github.com/chokcoco/CSS-Inspiration/blob/master/${category}/${filename}`;
    const demoUrl = `https://chokcoco.github.io/CSS-Inspiration/${category}/${filename.replace('.md', '.html')}`;
    
    const searchContent = [
      parsedContent.title,
      parsedContent.description,
      category,
      this.categoryMapping[category] || category,
      ...JSON.parse(parsedContent.tags)
    ].join(' ');

    return new Promise((resolve, reject) => {
      this.db.run(
        insertSQL,
        [
          category,
          filename,
          parsedContent.title,
          parsedContent.description,
          parsedContent.htmlContent,
          parsedContent.cssContent,
          demoUrl,
          sourceUrl,
          parsedContent.tags,
          parsedContent.difficultyLevel,
          parsedContent.browserSupport,
          searchContent
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async extractAndSaveCodeSnippets(inspirationId, htmlContent, cssContent) {
    if (!htmlContent && !cssContent) return;

    const snippets = [];
    
    if (htmlContent) {
      snippets.push({
        inspiration_id: inspirationId,
        snippet_type: 'html',
        code_content: htmlContent,
        description: 'HTML 结构代码'
      });
    }

    if (cssContent) {
      // 分割 CSS 代码块
      const cssBlocks = cssContent.split(/\/\*[\s\S]*?\*\/|\/\/.*$/gm)
        .filter(block => block.trim());
      
      cssBlocks.forEach((block, index) => {
        if (block.trim()) {
          snippets.push({
            inspiration_id: inspirationId,
            snippet_type: 'css',
            code_content: block.trim(),
            description: `CSS 样式代码块 ${index + 1}`
          });
        }
      });
    }

    const insertSnippetSQL = `
      INSERT INTO code_snippets 
      (inspiration_id, snippet_type, code_content, description)
      VALUES (?, ?, ?, ?)
    `;

    for (const snippet of snippets) {
      await new Promise((resolve, reject) => {
        this.db.run(
          insertSnippetSQL,
          [snippet.inspiration_id, snippet.snippet_type, snippet.code_content, snippet.description],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

  async generateCompleteDemo(inspirationId, title, htmlContent, cssContent) {
    if (!cssContent) return;

    const completeHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
        }
        
        ${cssContent}
    </style>
</head>
<body>
    ${htmlContent || '<div class="demo-container">CSS Demo</div>'}
</body>
</html>`;

    const insertDemoSQL = `
      INSERT OR REPLACE INTO demo_styles 
      (inspiration_id, complete_html, complete_css, is_interactive)
      VALUES (?, ?, ?, ?)
    `;

    const isInteractive = cssContent.includes(':hover') || 
                          cssContent.includes('animation') || 
                          cssContent.includes('transition');

    await new Promise((resolve, reject) => {
      this.db.run(
        insertDemoSQL,
        [inspirationId, completeHTML, cssContent, isInteractive ? 1 : 0],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async fetchAllInspirations() {
    console.log('🚀 Starting to fetch CSS-Inspiration repository contents...');
    
    try {
      // 获取所有分类目录
      const categories = Object.keys(this.categoryMapping);
      let totalProcessed = 0;

      for (const category of categories) {
        console.log(`\n📁 Processing category: ${category} (${this.categoryMapping[category]})`);
        
        const files = await this.fetchDirectoryContents(category);
        
        for (const file of files) {
          try {
            console.log(`   📄 Processing: ${file.name}`);
            
            const filePath = `${category}/${file.name}`;
            const content = await this.fetchFileContent(filePath);
            
            if (content) {
              const parsedContent = this.parseMarkdownContent(content, category, file.name);
              
              if (parsedContent.title) {
                const inspirationId = await this.saveToDatabase(category, file.name, parsedContent);
                
                // 保存代码片段
                await this.extractAndSaveCodeSnippets(
                  inspirationId, 
                  parsedContent.htmlContent, 
                  parsedContent.cssContent
                );
                
                // 生成完整的演示页面
                await this.generateCompleteDemo(
                  inspirationId,
                  parsedContent.title,
                  parsedContent.htmlContent,
                  parsedContent.cssContent
                );
                
                totalProcessed++;
                console.log(`     ✅ Saved: ${parsedContent.title}`);
              }
            }
            
            // 添加延迟以避免速率限制
            await new Promise(resolve => setTimeout(resolve, 500));
            
          } catch (error) {
            console.error(`     ❌ Error processing ${file.name}:`, error.message);
            continue;
          }
        }
      }

      console.log(`\n🎉 CSS-Inspiration import completed! Processed ${totalProcessed} demos.`);
      this.generateStats();
      
    } catch (error) {
      console.error('❌ Error fetching CSS-Inspiration:', error.message);
    }
  }

  generateStats() {
    console.log('\n📊 CSS-Inspiration Statistics:');
    
    this.db.all(`
      SELECT 
        category, 
        COUNT(*) as count,
        difficulty_level
      FROM css_inspiration 
      GROUP BY category, difficulty_level
      ORDER BY category, difficulty_level
    `, (err, rows) => {
      if (err) {
        console.error('Error generating stats:', err);
        return;
      }

      const stats = {};
      rows.forEach(row => {
        if (!stats[row.category]) {
          stats[row.category] = {};
        }
        stats[row.category][row.difficulty_level] = row.count;
      });

      Object.entries(stats).forEach(([category, difficulties]) => {
        const total = Object.values(difficulties).reduce((sum, count) => sum + count, 0);
        console.log(`   ${this.categoryMapping[category] || category}: ${total} 个案例`);
        Object.entries(difficulties).forEach(([level, count]) => {
          console.log(`     - ${level}: ${count} 个`);
        });
      });

      // 总体统计
      this.db.get('SELECT COUNT(*) as total FROM css_inspiration', (err, row) => {
        if (!err && row) {
          console.log(`\n   📈 总计: ${row.total} 个 CSS 演示案例`);
        }
        
        console.log('\n🎉 CSS-Inspiration 数据导入完成!');
        process.exit(0);
      });
    });
  }

  close() {
    this.db.close();
  }
}

// 运行脚本
const fetcher = new InspirationFetcher();
fetcher.fetchAllInspirations().catch(console.error);

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n⏹️ Shutting down...');
  fetcher.close();
  process.exit(0);
}); 
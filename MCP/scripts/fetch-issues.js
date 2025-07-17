import axios from 'axios';
import Database from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IssuesFetcher {
  constructor() {
    this.baseURL = 'https://api.github.com/repos/chokcoco/iCSS/issues';
    this.dbPath = path.join(__dirname, '../data/icss.db');
    this.dataDir = path.join(__dirname, '../data');
    
    // 检查 GitHub token
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
    
    this.labelCategories = {
      // 核心技术类标签
      core_tech: [
        'CSS Layout',      // CSS 布局
        'CSS Function',    // CSS 函数
        'CSS-Houdini',    // CSS Houdini API
        'CSS Variable',    // CSS 变量
        'CSS 新特性',      // CSS 新特性
        'Modern CSS',      // 现代 CSS
        'CSS-doodle'      // CSS-doodle
      ],

      // 视觉效果类标签
      visual_effects: [
        'Background',      // 背景效果
        'Border',         // 边框效果
        'Shadow',         // 阴影效果
        'Shape',          // 形状效果
        '混合模式',        // 混合模式
        '滤镜',           // 滤镜效果
        'clip-path',      // 裁剪路径
        'Mask',           // 遮罩效果
        '3D 效果',        // 3D 效果
        '图片效果',        // 图片处理
        '文字效果',        // 文字效果
        '边框效果'         // 边框特效
      ],

      // 动画类标签
      animation: [
        '动效',           // 动态效果
        '动画',           // 动画效果
        '特殊交互'        // 特殊交互效果
      ],

      // 技术实现类标签
      implementation: [
        'SVG',           // SVG 技术
        '伪类',          // CSS 伪类
        '性能',          // 性能优化
        '技巧',          // 技术技巧
        '奇技淫巧',       // 特殊技巧
        '浏览器特性'      // 浏览器特性
      ],

      // 用户体验类标签
      ux: [
        '可访问性',       // 可访问性
        '用户体验',       // UX
        '设计'           // 设计相关
      ],

      // 内容类型标签
      content_type: [
        '翻译',          // 翻译文章
        '面试',          // 面试相关
        'Bug'           // 问题修复
      ]
    };

    // 标签权重配置
    this.labelWeights = {
      // 核心技术标签权重较高
      'CSS Layout': 1.5,
      'CSS Function': 1.5,
      'CSS-Houdini': 1.6,
      'CSS Variable': 1.4,
      'CSS 新特性': 1.6,
      'Modern CSS': 1.5,
      
      // 视觉效果标签权重
      'Background': 1.2,
      'Border': 1.2,
      'Shadow': 1.2,
      'Shape': 1.3,
      '混合模式': 1.4,
      '滤镜': 1.3,
      'clip-path': 1.4,
      'Mask': 1.4,
      
      // 动画相关标签权重
      '动效': 1.3,
      '动画': 1.3,
      '特殊交互': 1.4,
      '3D 效果': 1.5,
      
      // 实现技巧标签权重
      'SVG': 1.4,
      '伪类': 1.2,
      '性能': 1.5,
      '技巧': 1.1,
      '奇技淫巧': 1.3,
      
      // 用户体验标签权重
      '可访问性': 1.4,
      '用户体验': 1.3,
      '设计': 1.2
    };

    // 标签关系映射
    this.labelRelations = {
      // 相关技术映射
      'CSS Layout': ['CSS Function', 'CSS Variable'],
      'CSS-Houdini': ['CSS 新特性', 'Modern CSS'],
      'Background': ['混合模式', '滤镜', 'clip-path', 'Mask'],
      'Border': ['clip-path', 'Shape', '边框效果'],
      '动画': ['动效', '特殊交互', '3D 效果'],
      'SVG': ['Shape', 'Mask', 'clip-path'],
      
      // 应用场景映射
      '性能': ['Modern CSS', 'CSS-Houdini'],
      '可访问性': ['用户体验', '设计'],
      '特殊交互': ['用户体验', '动效']
    };
    
    this.initializeDatabase();
  }

  initializeDatabase() {
    // 原有的 issues 表
    const createIssuesTableSQL = `
      CREATE TABLE IF NOT EXISTS issues (
        id INTEGER PRIMARY KEY,
        number INTEGER UNIQUE,
        title TEXT NOT NULL,
        body TEXT,
        html_url TEXT,
        labels TEXT,
        created_at TEXT,
        updated_at TEXT,
        search_content TEXT
      )
    `;

    // 标签分类表
    const createLabelCategoriesTableSQL = `
      CREATE TABLE IF NOT EXISTS label_categories (
        id INTEGER PRIMARY KEY,
        label TEXT UNIQUE,
        category TEXT,
        description TEXT,
        usage_count INTEGER DEFAULT 0,
        last_used TEXT
      )
    `;

    // 标签关系表（记录标签之间的关联）
    const createLabelRelationsTableSQL = `
      CREATE TABLE IF NOT EXISTS label_relations (
        id INTEGER PRIMARY KEY,
        label1 TEXT,
        label2 TEXT,
        cooccurrence_count INTEGER DEFAULT 0,
        correlation_score REAL,
        last_updated TEXT,
        UNIQUE(label1, label2)
      )
    `;

    // 文章标签映射表（用于快速查询）
    const createArticleLabelsTableSQL = `
      CREATE TABLE IF NOT EXISTS article_labels (
        id INTEGER PRIMARY KEY,
        issue_number INTEGER,
        label TEXT,
        category TEXT,
        weight REAL DEFAULT 1.0,
        FOREIGN KEY(issue_number) REFERENCES issues(number)
      )
    `;

    // 标签层级关系表
    const createLabelHierarchyTableSQL = `
      CREATE TABLE IF NOT EXISTS label_hierarchy (
        id INTEGER PRIMARY KEY,
        parent_label TEXT,
        child_label TEXT,
        relation_type TEXT,
        UNIQUE(parent_label, child_label)
      )
    `;

    this.db.serialize(() => {
      this.db.run(createIssuesTableSQL)
          .run(createLabelCategoriesTableSQL)
          .run(createLabelRelationsTableSQL)
          .run(createArticleLabelsTableSQL)
          .run(createLabelHierarchyTableSQL);
      
      // 初始化标签分类
      this.initializeLabelCategories();
    });
  }

  async initializeLabelCategories() {
    // 预定义的标签分类和描述
    const labelDescriptions = {
      // 核心技术类
      'CSS Layout': 'CSS 布局技术和方法',
      'CSS Function': 'CSS 函数使用和技巧',
      'CSS-Houdini': 'CSS Houdini API 相关技术',
      'CSS Variable': 'CSS 变量使用和应用',
      'CSS 新特性': '最新的 CSS 特性和用法',
      'Modern CSS': '现代 CSS 技术和方法',
      'CSS-doodle': 'CSS-doodle 绘图技术',
      
      // 视觉效果类
      'Background': '背景相关的效果和技巧',
      'Border': '边框相关的效果和技巧',
      'Shadow': '阴影效果实现方法',
      'Shape': '图形形状相关技术',
      '混合模式': '混合模式效果实现',
      '滤镜': '滤镜效果实现和应用',
      'clip-path': '裁剪路径技术和应用',
      'Mask': '遮罩效果实现方法',
      '3D 效果': '3D 效果实现技术',
      '图片效果': '图片处理和效果实现',
      '文字效果': '文字特效和排版技巧',
      '边框效果': '特殊边框效果实现',
      
      // 动画类
      '动效': '动态效果实现方法',
      '动画': '动画效果实现技术',
      '特殊交互': '特殊交互效果实现',
      
      // 技术实现类
      'SVG': 'SVG 图形和动画技术',
      '伪类': 'CSS 伪类使用技巧',
      '性能': 'CSS 性能优化方法',
      '技巧': 'CSS 使用技巧和方法',
      '奇技淫巧': '特殊效果实现技巧',
      '浏览器特性': '浏览器特性和兼容性',
      
      // 用户体验类
      '可访问性': '可访问性优化方法',
      '用户体验': '用户体验优化技巧',
      '设计': 'CSS 设计相关技术'
    };

    // 插入预定义的标签分类
    const insertSQL = `
      INSERT OR REPLACE INTO label_categories (label, category, description)
      VALUES (?, ?, ?)
    `;

    for (const [category, labels] of Object.entries(this.labelCategories)) {
      for (const label of labels) {
        await new Promise((resolve, reject) => {
          this.db.run(
            insertSQL,
            [label, category, labelDescriptions[label] || `${category}类标签`],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }
  }

  async analyzeLabelRelations(issues) {
    console.log('📊 Analyzing label relations...');
    
    const labelPairs = new Map();
    const labelCounts = new Map();
    
    // 收集标签共现信息
    for (const issue of issues) {
      try {
        const labels = Array.isArray(issue.labels)
          ? issue.labels.map(label => typeof label === 'string' ? label : label.name)
          : JSON.parse(issue.labels || '[]');
        
        // 更新单个标签计数
        labels.forEach(label => {
          labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
        });
        
        // 更新标签对的共现计数
        for (let i = 0; i < labels.length; i++) {
          for (let j = i + 1; j < labels.length; j++) {
            const pair = [labels[i], labels[j]].sort().join('->');
            labelPairs.set(pair, (labelPairs.get(pair) || 0) + 1);
          }
        }
      } catch (error) {
        console.error(`Error processing labels for issue #${issue.number}:`, error);
        continue;
      }
    }

    // 计算相关性分数并更新数据库
    const updateRelationSQL = `
      INSERT OR REPLACE INTO label_relations 
      (label1, label2, cooccurrence_count, correlation_score, last_updated)
      VALUES (?, ?, ?, ?, datetime('now'))
    `;

    for (const [pair, count] of labelPairs.entries()) {
      try {
        const [label1, label2] = pair.split('->');
        const correlation = count / Math.sqrt(labelCounts.get(label1) * labelCounts.get(label2));
        
        await new Promise((resolve, reject) => {
          this.db.run(
            updateRelationSQL,
            [label1, label2, count, correlation],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      } catch (error) {
        console.error(`Error saving relation for pair ${pair}:`, error);
        continue;
      }
    }
    
    console.log(`✅ Analyzed ${labelPairs.size} label relationships`);
  }

  async analyzeArticleLabels(issue) {
    try {
      const labels = Array.isArray(issue.labels) 
        ? issue.labels.map(label => typeof label === 'string' ? label : label.name)
        : JSON.parse(issue.labels || '[]');
      
      const content = issue.body || '';
      
      // 获取标签分类信息
      const labelInfo = await Promise.all(
        labels.map(label => 
          new Promise((resolve, reject) => {
            this.db.get(
              'SELECT category FROM label_categories WHERE label = ?',
              [label],
              (err, row) => {
                if (err) reject(err);
                else resolve({
                  label,
                  category: row ? row.category : 'uncategorized'
                });
              }
            );
          })
        )
      );

      // 计算标签权重
      const weights = this.calculateLabelWeights(labels, content);
      
      // 保存到数据库
      const insertSQL = `
        INSERT OR REPLACE INTO article_labels 
        (issue_number, label, category, weight)
        VALUES (?, ?, ?, ?)
      `;

      for (const {label, category} of labelInfo) {
        await new Promise((resolve, reject) => {
          this.db.run(
            insertSQL,
            [issue.number, label, category, weights[label] || 1.0],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    } catch (error) {
      console.error(`Error analyzing labels for issue #${issue.number}:`, error);
      // 继续处理下一个文章，而不是中断整个过程
      return;
    }
  }

  calculateLabelWeights(labels, content) {
    const weights = {};
    
    for (const label of labels) {
      // 基础权重
      let weight = this.labelWeights[label] || 1.0;
      
      // 基于内容相关度调整权重
      const labelRegex = new RegExp(label, 'gi');
      const matches = content.match(labelRegex) || [];
      weight += matches.length * 0.1;
      
      // 基于标签位置调整权重
      if (content.toLowerCase().includes(label.toLowerCase())) {
        const firstIndex = content.toLowerCase().indexOf(label.toLowerCase());
        if (firstIndex < content.length * 0.2) {
          weight += 0.3; // 在文章开头出现的标签更重要
        }
      }
      
      // 基于代码示例调整权重
      const codeBlocks = content.match(/```[^`]+```/g) || [];
      for (const block of codeBlocks) {
        if (block.toLowerCase().includes(label.toLowerCase())) {
          weight += 0.2; // 在代码示例中出现的标签更重要
        }
      }
      
      // 基于标签关系调整权重
      if (this.labelRelations[label]) {
        const relatedLabels = this.labelRelations[label];
        const presentRelatedLabels = relatedLabels.filter(rel => 
          labels.includes(rel)
        );
        weight += presentRelatedLabels.length * 0.1; // 相关标签共现提升权重
      }
      
      weights[label] = weight;
    }
    
    return weights;
  }

  async buildLabelHierarchy() {
    console.log('🌳 Building label hierarchy...');
    
    // 基于预定义的分类构建层级关系
    for (const [category, labels] of Object.entries(this.labelCategories)) {
      // 将分类作为父节点
      for (const label of labels) {
        await new Promise((resolve, reject) => {
          this.db.run(
            `INSERT OR REPLACE INTO label_hierarchy (parent_label, child_label, relation_type)
             VALUES (?, ?, ?)`,
            [category, label, 'category'],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }
    
    // 基于标签共现关系构建关联
    const relatedLabelsSQL = `
      SELECT label1, label2, correlation_score
      FROM label_relations
      WHERE correlation_score > 0.5
      ORDER BY correlation_score DESC
    `;
    
    this.db.all(relatedLabelsSQL, [], async (err, rows) => {
      if (err) {
        console.error('Error building label hierarchy:', err);
        return;
      }
      
      for (const row of rows) {
        await new Promise((resolve, reject) => {
          this.db.run(
            `INSERT OR REPLACE INTO label_hierarchy (parent_label, child_label, relation_type)
             VALUES (?, ?, ?)`,
            [row.label1, row.label2, 'related'],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    });
  }

  async saveAnalysisToDatabase(issueNumber, analysis) {
    const insertSQL = `
      INSERT OR REPLACE INTO article_analysis 
      (issue_number, css_properties, techniques, complexity_level, 
       browser_support, use_cases, code_snippets, demo_links, related_articles)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.db.run(
        insertSQL,
        [
          issueNumber,
          analysis.css_properties,
          analysis.techniques,
          analysis.complexity_level,
          analysis.browser_support,
          analysis.use_cases,
          analysis.code_snippets,
          analysis.demo_links,
          analysis.related_articles
        ],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async saveIssuesToDatabase(issues) {
    console.log('💾 Saving and analyzing issues...');
    
    const insertSQL = `
      INSERT OR REPLACE INTO issues 
      (number, title, body, html_url, labels, created_at, updated_at, search_content)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let savedCount = 0;
    
    for (const issue of issues) {
      if (issue.pull_request) continue;

      try {
        const labels = Array.isArray(issue.labels)
          ? JSON.stringify(issue.labels.map(label => typeof label === 'string' ? label : label.name))
          : issue.labels;
          
        const searchContent = this.createSearchContent(issue);

        // 保存基本信息
        await new Promise((resolve, reject) => {
          this.db.run(
            insertSQL,
            [
              issue.number,
              issue.title,
              issue.body || '',
              issue.html_url,
              labels,
              issue.created_at,
              issue.updated_at,
              searchContent
            ],
            async function(err) {
              if (err) {
                console.error(`Error saving issue #${issue.number}:`, err);
                reject(err);
              } else {
                try {
                  // 分析并保存标签信息
                  await this.analyzeArticleLabels(issue);
                  savedCount++;
                  resolve();
                } catch (analysisErr) {
                  console.error(`Error analyzing issue #${issue.number}:`, analysisErr);
                  reject(analysisErr);
                }
              }
            }.bind(this)
          );
        });

        if (savedCount % 10 === 0) {
          console.log(`   📝 Processed ${savedCount} articles...`);
        }
      } catch (error) {
        console.error(`Error processing issue #${issue.number}:`, error);
        continue;
      }
    }

    // 分析标签关系
    await this.analyzeLabelRelations(issues);
    
    // 构建标签层级
    await this.buildLabelHierarchy();
    
    console.log(`✅ Successfully saved and analyzed ${savedCount} articles`);
    await this.generateLabelStatistics();
  }

  async updateRelatedArticles() {
    console.log('🔄 Updating article relations...');
    
    // 获取所有文章的分析数据
    const articles = await new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          i.number,
          i.title,
          a.css_properties,
          a.techniques,
          a.complexity_level
        FROM issues i
        JOIN article_analysis a ON i.number = a.issue_number
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // 计算文章间的相关性
    for (const article of articles) {
      const related = articles
        .filter(other => other.number !== article.number)
        .map(other => {
          const score = this.calculateRelationScore(article, other);
          return { number: other.number, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)  // 取前5个最相关的文章
        .map(r => r.number);

      // 更新相关文章
      await this.saveAnalysisToDatabase(article.number, {
        ...article,
        related_articles: JSON.stringify(related)
      });
    }
  }

  calculateRelationScore(article1, article2) {
    let score = 0;
    
    // 比较 CSS 属性相似度
    const props1 = new Set(JSON.parse(article1.css_properties));
    const props2 = new Set(JSON.parse(article2.css_properties));
    const commonProps = new Set([...props1].filter(x => props2.has(x)));
    score += commonProps.size * 2;
    
    // 比较技术相似度
    const techs1 = new Set(JSON.parse(article1.techniques));
    const techs2 = new Set(JSON.parse(article2.techniques));
    const commonTechs = new Set([...techs1].filter(x => techs2.has(x)));
    score += commonTechs.size * 3;
    
    // 考虑难度级别
    if (article1.complexity_level === article2.complexity_level) {
      score += 1;
    }
    
    return score;
  }

  generateEnhancedStats() {
    console.log('\n📊 Enhanced Database Statistics:');
    
    // 技术分布统计
    this.db.all(`
      SELECT 
        techniques,
        COUNT(*) as count
      FROM article_analysis
      GROUP BY techniques
      ORDER BY count DESC
      LIMIT 10
    `, (err, techRows) => {
      if (err) {
        console.error('Error getting technique stats:', err);
        return;
      }

      console.log('\n🛠️ Top Techniques Distribution:');
      techRows.forEach((row, index) => {
        const techs = JSON.parse(row.techniques);
        console.log(`   ${index + 1}. ${techs.join(', ')} (${row.count} articles)`);
      });

      // 难度级别分布
      this.db.all(`
        SELECT 
          complexity_level,
          COUNT(*) as count
        FROM article_analysis
        GROUP BY complexity_level
        ORDER BY count DESC
      `, (err, complexityRows) => {
        if (err) {
          console.error('Error getting complexity stats:', err);
          return;
        }

        console.log('\n📈 Complexity Level Distribution:');
        complexityRows.forEach(row => {
          console.log(`   ${row.complexity_level}: ${row.count} articles`);
        });

        console.log('\n🎉 Enhanced analysis completed!');
        process.exit(0);
      });
    });
  }

  async fetchAllIssues() {
    console.log('🚀 Starting to fetch iCSS repository issues...');
    
    let page = 1;
    let allIssues = [];
    const perPage = 100; // GitHub API maximum

    try {
      while (true) {
        console.log(`📄 Fetching page ${page}...`);
        
        const response = await axios.get(this.baseURL, {
          params: {
            state: 'all', // 获取所有状态的issues
            per_page: perPage,
            page: page,
            sort: 'updated',
            direction: 'desc'
          },
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'iCSS-MCP-Server',
            ...(this.githubToken && { 'Authorization': `token ${this.githubToken}` })
          }
        });

        const issues = response.data;
        
        if (issues.length === 0) {
          console.log('✅ No more issues found');
          break;
        }

        console.log(`   📝 Found ${issues.length} issues on page ${page}`);
        allIssues = allIssues.concat(issues);
        
        // GitHub API rate limiting
        if (issues.length < perPage) {
          break;
        }
        
        page++;
        
        // 添加延迟以避免速率限制
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`🎉 Total issues fetched: ${allIssues.length}`);
      await this.saveIssuesToDatabase(allIssues);
      
    } catch (error) {
      if (error.response?.status === 403) {
        console.error('❌ GitHub API rate limit exceeded. Please set GITHUB_TOKEN environment variable.');
        console.error('Visit https://github.com/settings/tokens to generate a token.');
        process.exit(1);
      }
      console.error('❌ Error fetching issues:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  }

  createSearchContent(issue) {
    // 更好地处理标签
    const labels = Array.isArray(issue.labels) 
      ? issue.labels
          .map(label => typeof label === 'string' ? label : label.name)
          .join(' ')
      : '';
    
    const body = issue.body || '';
    
    // 移除markdown语法，提取纯文本用于搜索
    const cleanBody = body
      .replace(/```[\s\S]*?```/g, ' ') // 移除代码块
      .replace(/`([^`]+)`/g, '$1') // 移除行内代码
      .replace(/[#*_~]/g, '') // 移除markdown格式
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
      .replace(/\s+/g, ' ') // 标准化空白字符
      .trim();

    // 构建更丰富的搜索内容
    const searchContent = [
      issue.title,
      labels,
      cleanBody,
      // 添加标签的不同组合形式，以提高匹配率
      ...labels.split(' ').filter(Boolean),
      // 为某些常见的组合词添加变体
      labels.includes('奇技淫巧') ? '技巧 奇技' : '',
      labels.includes('动画') ? '动效 特效' : '',
      labels.includes('特殊交互') ? '交互 动效' : ''
    ].filter(Boolean).join(' ');

    return searchContent.substring(0, 1000); // 限制长度
  }

  generateStats() {
    this.db.all('SELECT COUNT(*) as total FROM issues', (err, rows) => {
      if (err) {
        console.error('Error generating stats:', err);
        return;
      }

      console.log('\n📊 Database Statistics:');
      console.log(`   Total articles: ${rows[0].total}`);

      // 标签统计
      this.db.all(`
        SELECT labels, COUNT(*) as count 
        FROM issues 
        WHERE labels IS NOT NULL AND labels != '[]'
        GROUP BY labels 
        ORDER BY count DESC 
        LIMIT 10
      `, (err, labelRows) => {
        if (err) {
          console.error('Error getting label stats:', err);
          return;
        }

        console.log('\n🏷️ Top 10 Label Combinations:');
        labelRows.forEach((row, index) => {
          const labels = JSON.parse(row.labels);
          console.log(`   ${index + 1}. ${labels.join(', ')} (${row.count} articles)`);
        });

        console.log('\n🎉 Database update completed!');
        process.exit(0);
      });
    });
  }

  close() {
    this.db.close();
  }

  analyzeCodePatterns(content) {
    const patterns = [];
    const codeBlocks = content.match(/```[^`]+```/g) || [];
    
    codeBlocks.forEach((block, index) => {
      const cleanCode = block.replace(/```(css|html|javascript)?\n/g, '').replace(/```$/g, '');
      
      // 分析动画模式
      if (cleanCode.includes('@keyframes') || cleanCode.includes('animation')) {
        patterns.push({
          pattern_name: `animation_pattern_${index}`,
          pattern_type: 'animation',
          code_snippet: cleanCode,
          explanation: this.analyzeAnimationPattern(cleanCode),
          use_cases: JSON.stringify(['transitions', 'hover effects', 'loading indicators']),
          performance_notes: this.analyzeAnimationPerformance(cleanCode),
          browser_support: this.getAnimationBrowserSupport(cleanCode)
        });
      }
      
      // 分析布局模式
      if (cleanCode.includes('grid') || cleanCode.includes('flex')) {
        patterns.push({
          pattern_name: `layout_pattern_${index}`,
          pattern_type: 'layout',
          code_snippet: cleanCode,
          explanation: this.analyzeLayoutPattern(cleanCode),
          use_cases: JSON.stringify(['responsive layouts', 'card layouts', 'centering']),
          performance_notes: this.analyzeLayoutPerformance(cleanCode),
          browser_support: this.getLayoutBrowserSupport(cleanCode)
        });
      }
    });
    
    return patterns;
  }

  analyzeAnimationPattern(code) {
    const analysis = [];
    
    if (code.includes('transform')) {
      analysis.push('使用 transform 实现动画，性能优良');
    }
    if (code.includes('opacity')) {
      analysis.push('使用 opacity 实现淡入淡出效果');
    }
    if (code.includes('will-change')) {
      analysis.push('使用 will-change 优化动画性能');
    }
    
    return analysis.join('. ');
  }

  analyzeAnimationPerformance(code) {
    const notes = [];
    
    // 检查是否使用 GPU 加速
    if (code.includes('transform3d') || code.includes('translateZ')) {
      notes.push('使用 3D 变换触发 GPU 加速');
    }
    
    // 检查是否有性能优化
    if (code.includes('will-change')) {
      notes.push('使用 will-change 提示浏览器优化');
    }
    
    // 检查动画属性
    if (code.includes('left') || code.includes('top')) {
      notes.push('警告：使用定位属性动画可能触发重排');
    }
    
    return notes.join('. ');
  }

  getAnimationBrowserSupport(code) {
    const support = {
      chrome: '支持',
      firefox: '支持',
      safari: '支持',
      edge: '支持',
      ie: '部分支持'
    };
    
    // 检查新特性支持
    if (code.includes('@property') || code.includes('backdrop-filter')) {
      support.safari = '部分支持';
      support.ie = '不支持';
    }
    
    // 检查动画特性
    if (code.includes('animation') || code.includes('@keyframes')) {
      support.ie = 'IE10+ 需要前缀';
    }
    
    return JSON.stringify(support);
  }

  analyzeLayoutPattern(code) {
    const analysis = [];
    
    if (code.includes('grid')) {
      analysis.push('使用 Grid 布局实现复杂的二维布局');
    }
    if (code.includes('flex')) {
      analysis.push('使用 Flexbox 实现灵活的一维布局');
    }
    if (code.includes('calc')) {
      analysis.push('使用 calc() 进行动态计算');
    }
    
    return analysis.join('. ');
  }

  analyzeLayoutPerformance(code) {
    const notes = [];
    
    // 检查 Flexbox 性能
    if (code.includes('flex')) {
      notes.push('Flexbox 在大量元素时可能影响性能');
    }
    
    // 检查 Grid 性能
    if (code.includes('grid')) {
      notes.push('Grid 布局在复杂嵌套时可能影响性能');
    }
    
    // 检查动态布局
    if (code.includes('calc')) {
      notes.push('calc() 在频繁计算时可能影响性能');
    }
    
    return notes.join('. ');
  }

  getLayoutBrowserSupport(code) {
    const support = {
      chrome: '完全支持',
      firefox: '完全支持',
      safari: '完全支持',
      edge: '完全支持',
      ie: '部分支持'
    };
    
    // Grid 支持
    if (code.includes('grid')) {
      support.ie = '不支持 Grid';
    }
    
    // Flexbox 支持
    if (code.includes('flex')) {
      support.ie = 'IE11 部分支持 Flexbox';
    }
    
    return JSON.stringify(support);
  }

  analyzePerformance(content, cssProperties) {
    const properties = JSON.parse(cssProperties);
    
    return {
      gpu_accelerated: this.checkGPUAcceleration(properties),
      paint_complexity: this.analyzePaintComplexity(properties),
      layout_triggers: this.checkLayoutTriggers(properties),
      memory_impact: this.analyzeMemoryImpact(properties),
      optimization_tips: JSON.stringify(this.generateOptimizationTips(properties))
    };
  }

  checkGPUAcceleration(properties) {
    return properties.some(p => 
      p.includes('transform3d') || 
      p.includes('translateZ') || 
      p.includes('will-change')
    );
  }

  analyzePaintComplexity(properties) {
    let complexity = 'low';
    
    if (properties.some(p => p.includes('box-shadow') || p.includes('text-shadow'))) {
      complexity = 'medium';
    }
    if (properties.some(p => p.includes('filter') || p.includes('backdrop-filter'))) {
      complexity = 'high';
    }
    
    return complexity;
  }

  checkLayoutTriggers(properties) {
    const layoutProperties = ['width', 'height', 'padding', 'margin', 'position', 'top', 'left', 'right', 'bottom'];
    return properties.some(p => layoutProperties.includes(p));
  }

  analyzeMemoryImpact(properties) {
    let impact = 'low';
    
    if (properties.some(p => p.includes('background-image'))) {
      impact = 'medium';
    }
    if (properties.some(p => p.includes('filter') || p.includes('backdrop-filter'))) {
      impact = 'high';
    }
    
    return impact;
  }

  generateOptimizationTips(properties) {
    const tips = [];
    
    if (this.checkLayoutTriggers(properties)) {
      tips.push('考虑使用 transform 替代改变位置和尺寸的属性');
    }
    if (properties.some(p => p.includes('box-shadow'))) {
      tips.push('大面积阴影考虑使用 filter: drop-shadow() 优化性能');
    }
    if (properties.some(p => p.includes('@keyframes'))) {
      tips.push('长动画考虑使用 requestAnimationFrame 实现');
    }
    
    return tips;
  }

  analyzeCSSPropertyCategories(properties) {
    return properties.map(prop => ({
      property_name: prop,
      category: this.getCSSPropertyCategory(prop),
      sub_category: this.getCSSPropertySubCategory(prop),
      description: this.getPropertyDescription(prop),
      performance_impact: this.getPropertyPerformanceImpact(prop),
      best_practices: JSON.stringify(this.getPropertyBestPractices(prop)),
      common_pitfalls: JSON.stringify(this.getPropertyCommonPitfalls(prop)),
      browser_notes: this.getPropertyBrowserNotes(prop)
    }));
  }

  getCSSPropertyCategory(prop) {
    if (prop.match(/margin|padding|width|height|position|top|left|right|bottom|float|clear|display/)) {
      return 'layout';
    }
    if (prop.match(/color|background|border|box-shadow|opacity|filter/)) {
      return 'visual';
    }
    if (prop.match(/animation|transition|transform/)) {
      return 'animation';
    }
    if (prop.match(/font|text|line-height|letter-spacing/)) {
      return 'typography';
    }
    return 'other';
  }

  getCSSPropertySubCategory(prop) {
    if (prop.includes('flex')) return 'flexbox';
    if (prop.includes('grid')) return 'grid';
    if (prop.includes('animation')) return 'keyframe-animation';
    if (prop.includes('transition')) return 'transition';
    if (prop.includes('transform')) return 'transform';
    return 'basic';
  }

  getPropertyDescription(prop) {
    // 这里可以添加更多属性的描述
    const descriptions = {
      'flex': 'Flexbox 布局的核心属性，用于设置弹性布局',
      'grid': 'Grid 布局的核心属性，用于设置网格布局',
      'animation': '用于设置动画效果的属性',
      'transform': '用于元素的 2D 或 3D 转换',
      // ... 更多属性描述
    };
    return descriptions[prop] || `CSS ${prop} 属性`;
  }

  getPropertyPerformanceImpact(prop) {
    const highImpact = ['box-shadow', 'text-shadow', 'filter', 'backdrop-filter'];
    const mediumImpact = ['border-radius', 'opacity', 'transform'];
    
    if (highImpact.some(p => prop.includes(p))) return 'high';
    if (mediumImpact.some(p => prop.includes(p))) return 'medium';
    return 'low';
  }

  getPropertyBestPractices(prop) {
    const practices = [];
    
    if (prop.includes('animation')) {
      practices.push('使用 transform 和 opacity 实现动画');
      practices.push('添加 will-change 提示');
    }
    if (prop.includes('transform')) {
      practices.push('使用 3D transform 触发 GPU 加速');
      practices.push('合理使用 will-change');
    }
    
    return practices;
  }

  getPropertyCommonPitfalls(prop) {
    const pitfalls = [];
    
    if (prop.includes('animation')) {
      pitfalls.push('过度使用可能导致性能问题');
      pitfalls.push('没有提供回退方案');
    }
    if (prop.includes('flex')) {
      pitfalls.push('嵌套使用可能导致性能问题');
      pitfalls.push('未考虑浏览器前缀');
    }
    
    return pitfalls;
  }

  getPropertyBrowserNotes(prop) {
    const notes = [];
    
    if (prop.includes('@property')) {
      notes.push('Chrome 85+, Safari 15.4+');
    }
    if (prop.includes('backdrop-filter')) {
      notes.push('需要注意浏览器兼容性');
    }
    
    return notes.join('. ');
  }

  async saveCodePatterns(issueNumber, patterns) {
    const insertSQL = `
      INSERT OR REPLACE INTO code_patterns 
      (issue_number, pattern_name, pattern_type, code_snippet, explanation, use_cases, performance_notes, browser_support)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const pattern of patterns) {
      await new Promise((resolve, reject) => {
        this.db.run(
          insertSQL,
          [
            issueNumber,
            pattern.pattern_name,
            pattern.pattern_type,
            pattern.code_snippet,
            pattern.explanation,
            pattern.use_cases,
            pattern.performance_notes,
            pattern.browser_support
          ],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

  async savePropertyCategories(categories) {
    const insertSQL = `
      INSERT OR REPLACE INTO property_categories 
      (property_name, category, sub_category, description, performance_impact, best_practices, common_pitfalls, browser_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const category of categories) {
      await new Promise((resolve, reject) => {
        this.db.run(
          insertSQL,
          [
            category.property_name,
            category.category,
            category.sub_category,
            category.description,
            category.performance_impact,
            category.best_practices,
            category.common_pitfalls,
            category.browser_notes
          ],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

  async savePerformanceAnalysis(issueNumber, analysis) {
    const insertSQL = `
      INSERT OR REPLACE INTO performance_analysis 
      (issue_number, gpu_accelerated, paint_complexity, layout_triggers, memory_impact, optimization_tips)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await new Promise((resolve, reject) => {
      this.db.run(
        insertSQL,
        [
          issueNumber,
          analysis.gpu_accelerated,
          analysis.paint_complexity,
          analysis.layout_triggers,
          analysis.memory_impact,
          analysis.optimization_tips
        ],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async generateLabelStatistics() {
    console.log('\n📊 Label Statistics:');
    
    // 标签使用统计
    this.db.all(`
      SELECT 
        l.label,
        l.category,
        COUNT(al.issue_number) as usage_count,
        AVG(al.weight) as avg_weight
      FROM label_categories l
      LEFT JOIN article_labels al ON l.label = al.label
      GROUP BY l.label, l.category
      ORDER BY usage_count DESC
    `, [], (err, rows) => {
      if (err) {
        console.error('Error generating label stats:', err);
        return;
      }

      console.log('\n🏷️ Label Usage by Category:');
      const byCategory = {};
      rows.forEach(row => {
        if (!byCategory[row.category]) {
          byCategory[row.category] = [];
        }
        byCategory[row.category].push({
          label: row.label,
          count: row.usage_count,
          weight: row.avg_weight
        });
      });

      Object.entries(byCategory).forEach(([category, labels]) => {
        console.log(`\n${category}:`);
        labels.forEach(({label, count, weight}) => {
          console.log(`   ${label}: ${count} articles (avg weight: ${weight?.toFixed(2) || 0})`);
        });
      });

      // 标签关系统计
      this.db.all(`
        SELECT 
          label1,
          label2,
          cooccurrence_count,
          correlation_score
        FROM label_relations
        WHERE correlation_score > 0.3
        ORDER BY correlation_score DESC
        LIMIT 10
      `, [], (err, relations) => {
        if (err) {
          console.error('Error getting label relations:', err);
          return;
        }

        console.log('\n🔗 Strong Label Correlations:');
        relations.forEach(rel => {
          console.log(`   ${rel.label1} <-> ${rel.label2}: ${rel.correlation_score.toFixed(2)} (${rel.cooccurrence_count} co-occurrences)`);
        });

        console.log('\n🎉 Label analysis completed!');
        process.exit(0);
      });
    });
  }
}

// 运行脚本
const fetcher = new IssuesFetcher();
fetcher.fetchAllIssues().catch(console.error);

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n⏹️ Shutting down...');
  fetcher.close();
  process.exit(0);
}); 
import axios from 'axios';
import Database from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IssuesFetcher {
  constructor() {
    this.baseURL = 'https://api.github.com/repos/chokcoco/iCSS/issues';
    this.dbPath = path.join(__dirname, '../data/icss.db');
    this.dataDir = path.join(__dirname, '../data');
    
    // 确保数据目录存在
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    this.db = new Database.Database(this.dbPath);
    this.initializeDatabase();
  }

  initializeDatabase() {
    const createTableSQL = `
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

    this.db.run(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Database table ready');
      }
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
            'User-Agent': 'iCSS-MCP-Server'
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
      console.error('❌ Error fetching issues:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  }

  async saveIssuesToDatabase(issues) {
    console.log('💾 Saving issues to database...');
    
    const insertSQL = `
      INSERT OR REPLACE INTO issues 
      (number, title, body, html_url, labels, created_at, updated_at, search_content)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let savedCount = 0;
    
    for (const issue of issues) {
      // 过滤掉 Pull Requests (GitHub Issues API 也会返回 PRs)
      if (issue.pull_request) {
        continue;
      }

      const labels = JSON.stringify(issue.labels.map(label => label.name));
      const searchContent = this.createSearchContent(issue);

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
          function(err) {
            if (err) {
              console.error(`Error saving issue #${issue.number}:`, err);
              reject(err);
            } else {
              savedCount++;
              resolve();
            }
          }
        );
      });
    }

    console.log(`✅ Successfully saved ${savedCount} issues to database`);
    this.generateStats();
  }

  createSearchContent(issue) {
    // 创建用于搜索的内容，包含标题、正文和标签
    const labels = issue.labels.map(label => label.name).join(' ');
    const body = issue.body || '';
    
    // 移除markdown语法，提取纯文本用于搜索
    const cleanBody = body
      .replace(/```[\s\S]*?```/g, ' ') // 移除代码块
      .replace(/`([^`]+)`/g, '$1') // 移除行内代码
      .replace(/[#*_~]/g, '') // 移除markdown格式
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
      .replace(/\s+/g, ' ') // 标准化空白字符
      .trim();

    return `${issue.title} ${labels} ${cleanBody}`.substring(0, 1000);
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
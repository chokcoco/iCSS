#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import Database from 'sqlite3';
import Fuse from 'fuse.js';
import { marked } from 'marked';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// 调试模式检测
const isDebugMode = process.env.NODE_ENV === 'development' || process.env.DEBUG;
const debugLog = (...args) => {
  if (isDebugMode) {
    console.error(`[DEBUG ${new Date().toISOString()}]`, ...args);
  }
};

class IcssServer {
  constructor() {
    debugLog('🚀 Initializing iCSS MCP Server in debug mode');
    
    this.server = new Server(
      {
        name: 'icss-mcp-server',
        version: '1.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.db = null;
    this.searchEngine = null;
    this.isReady = false;
    this.dbInitFailed = false;
    this.setupDatabase();
    this.setupHandlers();
  }

  setupDatabase() {
    debugLog('📂 Setting up database connection...');
    // 更健壮的数据库路径
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dbPath = path.join(__dirname, 'data', 'icss.db');
    debugLog(`📍 Database path: ${dbPath}`);
    this.db = new Database.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err);
        this.dbInitFailed = true;
      } else {
        debugLog('✅ Connected to SQLite database');
        this.initializeDatabase();
      }
    });
  }

  initializeDatabase() {
    debugLog('🔧 Initializing database tables...');
    
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
        console.error('❌ Error creating table:', err);
        this.dbInitFailed = true;
      } else {
        debugLog('✅ Database table initialized');
        this.loadSearchIndex();
      }
    });
  }

  loadSearchIndex() {
    debugLog('🔍 Loading search index...');
    
    this.db.all('SELECT * FROM issues', (err, rows) => {
      if (err) {
        console.error('❌ Error loading search index:', err);
        this.dbInitFailed = true;
        return;
      }

      debugLog(`📊 Loaded ${rows.length} articles for search index`);

      const fuseOptions = {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'search_content', weight: 0.4 },
          { name: 'labels', weight: 0.2 }
        ],
        threshold: 0.6,  // 提高阈值以允许更多匹配
        includeScore: true,
        includeMatches: true,
        useExtendedSearch: true,  // 启用扩展搜索
        ignoreLocation: true,     // 忽略位置影响
        findAllMatches: true,     // 查找所有匹配项
        minMatchCharLength: 1     // 最小匹配字符长度，有助于中文匹配
      };

      this.searchEngine = new Fuse(rows, fuseOptions);
      this.isReady = true;
      debugLog(`🎉 Search index loaded with ${rows.length} articles - Server ready!`);
      console.error(`✅ iCSS MCP Server ready! (Debug mode: ${isDebugMode})`);
    });
  }

  async waitForReady(timeout = 10000) {
    debugLog(`⏳ Waiting for server to be ready (timeout: ${timeout}ms)`);
    const startTime = Date.now();
    
    while (!this.isReady && !this.dbInitFailed) {
      if (Date.now() - startTime > timeout) {
        debugLog('⚠️ Server initialization timeout');
        throw new McpError(
          ErrorCode.InternalError,
          'Server initialization timeout'
        );
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (this.dbInitFailed) {
      debugLog('❌ Server initialization failed');
      throw new McpError(
        ErrorCode.InternalError,
        'Server initialization failed'
      );
    }
    
    debugLog('✅ Server is ready');
  }

  setupHandlers() {
    debugLog('🔗 Setting up request handlers...');
    
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        debugLog('📋 Received ListTools request');
        await this.waitForReady();
        
        const tools = [
          {
            name: 'search_css_techniques',
            description: 'Search for CSS techniques and solutions from iCSS repository issues',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for CSS techniques (e.g., "flex layout", "animation", "grid")'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 5)',
                  default: 5
                }
              },
              required: ['query']
            }
          },
          {
            name: 'search_css_demos',
            description: 'Search for CSS demo examples from CSS-Inspiration repository with complete code',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for CSS demos (e.g., "animation", "3d effect", "layout")'
                },
                category: {
                  type: 'string',
                  description: 'Filter by category (e.g., "animation", "3d", "layout", "background")'
                },
                difficulty: {
                  type: 'string',
                  description: 'Filter by difficulty level (初级, 中级, 高级)'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 5)',
                  default: 5
                }
              },
              required: ['query']
            }
          },
          {
            name: 'get_css_demo',
            description: 'Get complete demo with HTML and CSS code for a specific CSS-Inspiration example',
            inputSchema: {
              type: 'object',
              properties: {
                demo_id: {
                  type: 'number',
                  description: 'CSS-Inspiration demo ID'
                }
              },
              required: ['demo_id']
            }
          },
          {
            name: 'get_css_article',
            description: 'Get detailed content of a specific CSS article by issue number',
            inputSchema: {
              type: 'object',
              properties: {
                issue_number: {
                  type: 'number',
                  description: 'GitHub issue number of the article'
                }
              },
              required: ['issue_number']
            }
          },
          {
            name: 'list_css_categories',
            description: 'List available CSS technique categories from both iCSS and CSS-Inspiration',
            inputSchema: {
              type: 'object',
              properties: {
                source: {
                  type: 'string',
                  description: 'Filter by source: "icss", "inspiration", or "all" (default: all)'
                }
              }
            }
          },
          {
            name: 'get_random_css_tip',
            description: 'Get a random CSS technique or tip from the collection',
            inputSchema: {
              type: 'object',
              properties: {
                source: {
                  type: 'string',
                  description: 'Source preference: "icss", "inspiration", or "both" (default: both)'
                }
              }
            }
          }
        ];
        
        debugLog(`📋 Returning ${tools.length} tools`);
        return { tools };
      } catch (error) {
        debugLog('❌ Error in ListTools:', error);
        throw error;
      }
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      debugLog(`🔧 Received CallTool request: ${name}`, args);

      try {
        await this.waitForReady();

        let result;
        switch (name) {
          case 'search_css_techniques':
            debugLog(`🔍 Executing search: "${args.query}" (limit: ${args.limit || 5})`);
            result = await this.searchCssTechniques(args.query, args.limit || 5);
            return result;
          
          case 'search_css_demos':
            debugLog(`🎨 Searching CSS demos: "${args.query}" (category: ${args.category || 'all'}, difficulty: ${args.difficulty || 'all'})`);
            result = await this.searchCssDemos(args.query, args.category, args.difficulty, args.limit || 5);
            return result;
          
          case 'get_css_demo':
            debugLog(`🎯 Fetching CSS demo #${args.demo_id}`);
            result = await this.getCssDemo(args.demo_id);
            return result;
          
          case 'get_css_article':
            debugLog(`📖 Fetching article #${args.issue_number}`);
            result = await this.getCssArticle(args.issue_number);
            return result;
          
          case 'list_css_categories':
            debugLog(`🏷️ Listing CSS categories (source: ${args.source || 'all'})`);
            result = await this.listCssCategories(args.source);
            return result;
          
          case 'get_random_css_tip':
            debugLog(`🎲 Getting random CSS tip (source: ${args.source || 'both'})`);
            result = await this.getRandomCssTip(args.source);
            return result;
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        debugLog(`❌ Error in ${name}:`, error);
        throw error;
      }
    });
  }

  async searchCssTechniques(query, limit = 5) {
    debugLog(`[DEBUG] searchCssTechniques called with query: "${query}", limit: ${limit}`);
    debugLog(`[DEBUG] Search engine ready: ${this.isReady}`);
    
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      debugLog(`[DEBUG] Starting search at ${new Date().toISOString()}`);
      
      try {
        // 处理中文搜索词
        const searchTerms = query.split(/\s+/).filter(Boolean);
        let results = [];
        
        // 对每个搜索词分别进行搜索
        searchTerms.forEach(term => {
          const termResults = this.searchEngine.search(term);
          results = results.concat(termResults);
        });
        
        // 去重并按相关度排序
        results = Array.from(new Set(results.map(r => r.item.number)))
          .map(number => results.find(r => r.item.number === number))
          .sort((a, b) => a.score - b.score)
          .slice(0, limit);

        const endTime = Date.now();
        debugLog(`[DEBUG] Search completed in ${endTime - startTime}ms, found ${results.length} results`);
      
        const formattedResults = results.map(result => {
          const item = result.item;
          const matches = result.matches?.map(match => ({
            key: match.key,
            value: match.value.substring(0, 100) + '...'
          })) || [];

          return {
            title: item.title,
            issue_number: item.number,
            url: item.html_url,
            labels: item.labels ? JSON.parse(item.labels) : [],
            score: Math.round((1 - result.score) * 100),
            preview: this.extractPreview(item.body),
            matches: matches
          };
        });

        debugLog(`[DEBUG] Formatted ${formattedResults.length} results, returning response`);

        resolve({
          content: [
            {
              type: 'text',
              text: `Found ${formattedResults.length} CSS techniques for "${query}":\n\n` +
                    formattedResults.map((result, index) => 
                      `${index + 1}. **${result.title}** (Issue #${result.issue_number})\n` +
                      `   💯 Relevance: ${result.score}%\n` +
                      `   🏷️ Tags: ${result.labels.join(', ')}\n` +
                      `   📝 Preview: ${result.preview}\n` +
                      `   🔗 Link: ${result.url}\n`
                    ).join('\n')
            }
          ]
        });
      } catch (error) {
        debugLog(`[DEBUG] Search failed with error:`, error);
        reject(error);
      }
    });
  }

  async getCssArticle(issueNumber) {
    debugLog(`📖 Getting article #${issueNumber}`);
    
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM issues WHERE number = ?',
        [issueNumber],
        (err, row) => {
          if (err) {
            debugLog(`❌ Database error for article #${issueNumber}:`, err);
            reject(err);
            return;
          }

          if (!row) {
            debugLog(`❌ Article #${issueNumber} not found`);
            reject(new Error(`Article with issue number ${issueNumber} not found`));
            return;
          }

          debugLog(`✅ Found article #${issueNumber}: "${row.title}"`);

          const htmlContent = marked(row.body || '');
          const labels = row.labels ? JSON.parse(row.labels) : [];

          resolve({
            content: [
              {
                type: 'text',
                text: `# ${row.title}\n\n` +
                      `**Issue #${row.number}** | **Updated:** ${new Date(row.updated_at).toLocaleDateString()}\n\n` +
                      `**Tags:** ${labels.join(', ')}\n\n` +
                      `**GitHub Link:** ${row.html_url}\n\n` +
                      `---\n\n${row.body}`
              }
            ]
          });
        }
      );
    });
  }

  async searchCssDemos(query, category, difficulty, limit = 5) {
    debugLog(`🎨 Searching CSS demos with query: "${query}"`);
    
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT * FROM css_inspiration 
        WHERE search_content LIKE ?
      `;
      let params = [`%${query}%`];

      if (category) {
        sql += ` AND category = ?`;
        params.push(category);
      }

      if (difficulty) {
        sql += ` AND difficulty_level = ?`;
        params.push(difficulty);
      }

      sql += ` ORDER BY title LIMIT ?`;
      params.push(limit);

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          debugLog('❌ Error searching CSS demos:', err);
          reject(err);
          return;
        }

        debugLog(`✅ Found ${rows.length} CSS demos`);

        const formattedResults = rows.map(row => {
          const tags = JSON.parse(row.tags || '[]');
          const browserSupport = JSON.parse(row.browser_support || '{}');
          
          return {
            id: row.id,
            title: row.title,
            category: row.category,
            difficulty: row.difficulty_level,
            description: row.description,
            tags: tags,
            demo_url: row.demo_url,
            source_url: row.source_url,
            browser_support: browserSupport
          };
        });

        resolve({
          content: [
            {
              type: 'text',
              text: `Found ${formattedResults.length} CSS demos for "${query}":\n\n` +
                    formattedResults.map((demo, index) => 
                      `${index + 1}. **${demo.title}** (ID: ${demo.id})\n` +
                      `   🏷️ Category: ${demo.category} | Difficulty: ${demo.difficulty}\n` +
                      `   📝 ${demo.description}\n` +
                      `   🏆 Tags: ${demo.tags.join(', ')}\n` +
                      `   🔗 Demo: ${demo.demo_url}\n` +
                      `   📁 Source: ${demo.source_url}\n`
                    ).join('\n')
            }
          ]
        });
      });
    });
  }

  async getCssDemo(demoId) {
    debugLog(`🎯 Getting CSS demo #${demoId}`);
    
    return new Promise((resolve, reject) => {
      // 获取基本信息
      this.db.get(
        'SELECT * FROM css_inspiration WHERE id = ?',
        [demoId],
        (err, row) => {
          if (err) {
            debugLog(`❌ Database error for demo #${demoId}:`, err);
            reject(err);
            return;
          }

          if (!row) {
            debugLog(`❌ Demo #${demoId} not found`);
            reject(new Error(`CSS demo with ID ${demoId} not found`));
            return;
          }

          // 获取完整的演示代码
          this.db.get(
            'SELECT * FROM demo_styles WHERE inspiration_id = ?',
            [demoId],
            (err, demoRow) => {
              if (err) {
                debugLog(`❌ Error getting demo styles for #${demoId}:`, err);
                reject(err);
                return;
              }

              debugLog(`✅ Found demo #${demoId}: "${row.title}"`);

              const tags = JSON.parse(row.tags || '[]');
              const browserSupport = JSON.parse(row.browser_support || '{}');

              resolve({
                content: [
                  {
                    type: 'text',
                    text: `# ${row.title}\n\n` +
                          `**Category:** ${row.category} | **Difficulty:** ${row.difficulty_level}\n\n` +
                          `**Description:** ${row.description}\n\n` +
                          `**Tags:** ${tags.join(', ')}\n\n` +
                          `**Browser Support:**\n` +
                          Object.entries(browserSupport).map(([browser, support]) => 
                            `- ${browser}: ${support}`
                          ).join('\n') + '\n\n' +
                          `## HTML Code\n\n\`\`\`html\n${row.html_content || '<div class="demo">Demo</div>'}\n\`\`\`\n\n` +
                          `## CSS Code\n\n\`\`\`css\n${row.css_content}\n\`\`\`\n\n` +
                          (demoRow ? `## Complete Demo\n\n\`\`\`html\n${demoRow.complete_html}\n\`\`\`\n\n` : '') +
                          `**Demo URL:** ${row.demo_url}\n` +
                          `**Source:** ${row.source_url}`
                  }
                ]
              });
            }
          );
        }
      );
    });
  }

  async listCssCategories(source = 'all') {
    debugLog(`🏷️ Listing CSS categories (source: ${source})`);
    
    return new Promise((resolve, reject) => {
      let promises = [];

      // iCSS categories
      if (source === 'all' || source === 'icss') {
        promises.push(
          new Promise((resolve, reject) => {
            this.db.all(
              'SELECT labels, COUNT(*) as count FROM issues WHERE labels IS NOT NULL GROUP BY labels',
              (err, rows) => {
                if (err) {
                  reject(err);
                  return;
                }

                const categoryMap = new Map();
                rows.forEach(row => {
                  if (row.labels) {
                    const labels = JSON.parse(row.labels);
                    labels.forEach(label => {
                      categoryMap.set(label, (categoryMap.get(label) || 0) + row.count);
                    });
                  }
                });

                const categories = Array.from(categoryMap.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, count]) => ({ 
                    label, 
                    count, 
                    source: 'iCSS',
                    type: 'article'
                  }));

                resolve(categories);
              }
            );
          })
        );
      }

      // CSS-Inspiration categories
      if (source === 'all' || source === 'inspiration') {
        promises.push(
          new Promise((resolve, reject) => {
            this.db.all(
              'SELECT category, COUNT(*) as count FROM css_inspiration GROUP BY category ORDER BY count DESC',
              (err, rows) => {
                if (err) {
                  reject(err);
                  return;
                }

                const categories = rows.map(row => ({
                  label: row.category,
                  count: row.count,
                  source: 'CSS-Inspiration',
                  type: 'demo'
                }));

                resolve(categories);
              }
            );
          })
        );
      }

      Promise.all(promises)
        .then(results => {
          const allCategories = results.flat();
          debugLog(`✅ Found ${allCategories.length} categories`);

          let output = `Available CSS technique categories:\n\n`;

          if (source === 'all') {
            // 按来源分组显示
            const iCSSCategories = allCategories.filter(cat => cat.source === 'iCSS');
            const inspirationCategories = allCategories.filter(cat => cat.source === 'CSS-Inspiration');

            if (iCSSCategories.length > 0) {
              output += `## iCSS Articles (${iCSSCategories.length} categories)\n`;
              output += iCSSCategories.map(cat => 
                `• **${cat.label}** (${cat.count} articles)`
              ).join('\n') + '\n\n';
            }

            if (inspirationCategories.length > 0) {
              output += `## CSS-Inspiration Demos (${inspirationCategories.length} categories)\n`;
              output += inspirationCategories.map(cat => 
                `• **${cat.label}** (${cat.count} demos)`
              ).join('\n');
            }
          } else {
            output += allCategories.map(cat => 
              `• **${cat.label}** (${cat.count} ${cat.type}s) - ${cat.source}`
            ).join('\n');
          }

          resolve({
            content: [
              {
                type: 'text',
                text: output
              }
            ]
          });
        })
        .catch(reject);
    });
  }

  async getRandomCssTip(source = 'both') {
    debugLog(`🎲 Getting random CSS tip (source: ${source})`);
    
    return new Promise((resolve, reject) => {
      let queries = [];

      if (source === 'both' || source === 'icss') {
        queries.push({
          sql: 'SELECT *, "icss" as source_type FROM issues ORDER BY RANDOM() LIMIT 1',
          params: []
        });
      }

      if (source === 'both' || source === 'inspiration') {
        queries.push({
          sql: 'SELECT *, "inspiration" as source_type FROM css_inspiration ORDER BY RANDOM() LIMIT 1',
          params: []
        });
      }

      // 随机选择一个查询
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];

      this.db.get(randomQuery.sql, randomQuery.params, (err, row) => {
        if (err) {
          debugLog('❌ Error getting random tip:', err);
          reject(err);
          return;
        }

        if (!row) {
          reject(new Error('No content available'));
          return;
        }

        if (row.source_type === 'icss') {
          debugLog(`✅ Random iCSS tip: "${row.title}" (Issue #${row.number})`);

          const labels = row.labels ? JSON.parse(row.labels) : [];
          const preview = this.extractPreview(row.body);

          resolve({
            content: [
              {
                type: 'text',
                text: `🎲 **Random CSS Tip** (from iCSS): ${row.title}\n\n` +
                      `**Issue #${row.number}** | **Tags:** ${labels.join(', ')}\n\n` +
                      `${preview}\n\n` +
                      `[Read full article](${row.html_url})`
              }
            ]
          });
        } else {
          debugLog(`✅ Random CSS-Inspiration demo: "${row.title}" (ID #${row.id})`);

          const tags = row.tags ? JSON.parse(row.tags) : [];
          
          resolve({
            content: [
              {
                type: 'text',
                text: `🎲 **Random CSS Demo** (from CSS-Inspiration): ${row.title}\n\n` +
                      `**Demo ID #${row.id}** | **Category:** ${row.category} | **Difficulty:** ${row.difficulty_level}\n\n` +
                      `**Tags:** ${tags.join(', ')}\n\n` +
                      `${row.description}\n\n` +
                      `**Demo:** ${row.demo_url}\n` +
                      `**Source:** ${row.source_url}\n\n` +
                      `💡 Use \`get_css_demo\` with ID ${row.id} to see the complete code!`
              }
            ]
          });
        }
      });
    });
  }

  extractPreview(body, maxLength = 200) {
    if (!body) return 'No preview available';
    
    // Remove markdown formatting for preview
    const cleanText = body
      .replace(/```[\s\S]*?```/g, '[code block]')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    return cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + '...'
      : cleanText;
  }

  async run() {
    debugLog('🚀 Starting MCP Server transport...');
    const transport = new StdioServerTransport();
    debugLog('🎯 iCSS MCP Server running on stdio (Debug Mode)');
    console.error('🎯 iCSS MCP Server running on stdio (Debug Mode)');
    
    try {
      await this.server.connect(transport);
    } catch (error) {
      debugLog('💥 Server error:', error);
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    }
  }
}

// 启动服务器
const server = new IcssServer();
server.run(); 
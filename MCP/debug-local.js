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
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 调试模式
const DEBUG = true;
const debugLog = (...args) => {
  if (DEBUG) {
    console.error(`[DEBUG ${new Date().toISOString()}]`, ...args);
  }
};

class IcssDebugServer {
  constructor() {
    debugLog('🚀 Initializing iCSS Debug Server');
    
    this.server = new Server(
      {
        name: 'icss-debug-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.transport = null;
    this.db = null;
    this.searchEngine = null;
    this.isReady = false;
    this.dbInitFailed = false;
    
    this.setupDatabase();
    this.setupHandlers();
  }

  setupDatabase() {
    debugLog('📂 Setting up database connection...');
    const dbPath = path.join(__dirname, 'data', 'icss.db');
    debugLog(`📍 Database path: ${dbPath}`);
    
    this.db = new Database.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err);
        this.dbInitFailed = true;
      } else {
        debugLog('✅ Connected to SQLite database');
        this.loadSearchIndex();
      }
    });
  }

  loadSearchIndex() {
    debugLog('🔍 Loading search index...');
    
    const query = `
      SELECT 
        i.*,
        GROUP_CONCAT(DISTINCT al.label) as tags,
        GROUP_CONCAT(DISTINCT al.category) as categories,
        GROUP_CONCAT(DISTINCT al.weight) as weights,
        GROUP_CONCAT(DISTINCT lc.description) as tag_descriptions
      FROM issues i
      LEFT JOIN article_labels al ON i.number = al.issue_number
      LEFT JOIN label_categories lc ON al.label = lc.label
      GROUP BY i.number
    `;

    this.db.all(query, [], (err, rows) => {
      if (err) {
        console.error('❌ Error loading search index:', err);
        this.dbInitFailed = true;
        return;
      }

      debugLog(`📊 Loaded ${rows.length} articles for search index`);

      // 处理数据
      const processedRows = rows.map(row => {
        const tags = row.tags ? row.tags.split(',') : [];
        const categories = row.categories ? row.categories.split(',') : [];
        const weights = row.weights ? row.weights.split(',').map(Number) : [];
        const descriptions = row.tag_descriptions ? row.tag_descriptions.split(',') : [];
        
        // 解析 JSON 格式的标签
        let labels = [];
        try {
          labels = row.labels ? JSON.parse(row.labels) : [];
        } catch (e) {
          debugLog(`⚠️ Failed to parse labels for issue #${row.number}`);
        }
        
        return {
          ...row,
          tags,
          categories,
          weights,
          descriptions,
          labels,
          // 合并所有可搜索的文本
          searchContent: [
            row.title,
            row.body,
            ...tags,
            ...categories,
            ...descriptions,
            ...labels
          ].filter(Boolean).join(' ')
        };
      });

      const fuseOptions = {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'searchContent', weight: 0.3 },
          { name: 'tags', weight: 0.2 },
          { name: 'categories', weight: 0.1 }
        ],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true
      };

      this.searchEngine = new Fuse(processedRows, fuseOptions);
      this.isReady = true;
      debugLog(`🎉 Search index loaded with ${rows.length} articles - Server ready!`);
    });
  }

  async waitForReady(timeout = 10000) {
    debugLog(`⏳ Waiting for server to be ready (timeout: ${timeout}ms)`);
    const startTime = Date.now();
    
    while (!this.isReady && !this.dbInitFailed) {
      if (Date.now() - startTime > timeout) {
        throw new McpError(
          ErrorCode.InternalError,
          'Server initialization timeout'
        );
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (this.dbInitFailed) {
      throw new McpError(
        ErrorCode.InternalError,
        'Server initialization failed'
      );
    }
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
            description: 'Search for CSS techniques with filtering and sorting options',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query'
                },
                categories: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Filter by categories'
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Filter by tags'
                },
                min_weight: {
                  type: 'number',
                  description: 'Minimum tag weight'
                },
                limit: {
                  type: 'number',
                  default: 10
                }
              },
              required: ['query']
            }
          }
        ];
        
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

        switch (name) {
          case 'search_css_techniques':
            return await this.searchCssTechniques(args);
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

  async searchCssTechniques({ query, categories = [], tags = [], min_weight, limit = 10 }) {
    debugLog(`🔍 Searching CSS techniques: "${query}"`);
    
    if (!this.searchEngine) {
      throw new McpError(
        ErrorCode.InternalError,
        'Search engine not initialized'
      );
    }
    
    let results = this.searchEngine.search(query);
    debugLog(`📊 Found ${results.length} initial results`);

    // 过滤结果
    if (categories.length > 0) {
      results = results.filter(result => 
        result.item.categories.some(cat => 
          categories.some(c => cat.toLowerCase().includes(c.toLowerCase()))
        )
      );
      debugLog(`📊 After category filter: ${results.length} results`);
    }

    if (tags.length > 0) {
      results = results.filter(result => 
        tags.every(tag => 
          result.item.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
        )
      );
      debugLog(`📊 After tag filter: ${results.length} results`);
    }

    if (min_weight) {
      results = results.filter(result => 
        result.item.weights.some(w => w >= min_weight)
      );
      debugLog(`📊 After weight filter: ${results.length} results`);
    }

    // 格式化结果
    const formattedResults = results.slice(0, limit).map(result => {
      const item = result.item;
      return {
        title: item.title,
        number: item.number,
        url: item.html_url,
        relevance: Math.round((1 - result.score) * 100),
        tags: item.tags.map((tag, i) => ({
          name: tag,
          category: item.categories[i] || 'other',
          weight: item.weights[i] || 1.0,
          description: item.descriptions[i] || ''
        })),
        preview: this.extractPreview(item.body),
        updated_at: item.updated_at
      };
    });

    debugLog(`✅ Returning ${formattedResults.length} formatted results`);

    return {
      content: [
        {
          type: 'text',
          text: `Found ${formattedResults.length} CSS techniques for "${query}":\n\n` +
                formattedResults.map((result, index) => 
                  `${index + 1}. **${result.title}** (Issue #${result.number})\n` +
                  `   📅 Updated: ${new Date(result.updated_at).toLocaleDateString()}\n` +
                  `   💯 Relevance: ${result.relevance}%\n` +
                  `   🏷️ Tags:\n${result.tags.map(tag => 
                    `      - ${tag.name} (${tag.category}, weight: ${tag.weight.toFixed(2)})` +
                    (tag.description ? `\n        ${tag.description}` : '')
                  ).join('\n')}\n` +
                  `   📝 Preview: ${result.preview}\n` +
                  `   🔗 Link: ${result.url}\n`
                ).join('\n')
        }
      ]
    };
  }

  extractPreview(body, maxLength = 200) {
    if (!body) return 'No preview available';
    
    const cleanText = body
      .replace(/```[\s\S]*?```/g, '[code block]')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    return cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength - 3) + '...'
      : cleanText;
  }

  async run() {
    debugLog('🚀 Starting debug server...');
    this.transport = new StdioServerTransport();
    
    try {
      await this.server.connect(this.transport);
      debugLog('✅ Server connected to transport');
      
      // 保持进程运行
      process.stdin.resume();
      
      // 处理进程退出
      process.on('SIGINT', () => this.cleanup());
      process.on('SIGTERM', () => this.cleanup());
    } catch (error) {
      debugLog('💥 Server error:', error);
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    }
  }

  cleanup() {
    debugLog('🧹 Cleaning up...');
    if (this.db) {
      this.db.close();
    }
    if (this.transport) {
      this.transport.close();
    }
    process.exit(0);
  }
}

// 启动服务器
const server = new IcssDebugServer();
server.run(); 
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

dotenv.config();

class IcssServer {
  constructor() {
    this.server = new Server(
      {
        name: 'icss-mcp-server',
        version: '1.0.0',
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
    this.setupDatabase();
    this.setupHandlers();
  }

  setupDatabase() {
    this.db = new Database.Database('./data/icss.db', (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.error('Connected to SQLite database');
        this.initializeDatabase();
      }
    });
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
        console.error('Database table initialized');
        this.loadSearchIndex();
      }
    });
  }

  loadSearchIndex() {
    this.db.all('SELECT * FROM issues', (err, rows) => {
      if (err) {
        console.error('Error loading search index:', err);
        return;
      }

      const fuseOptions = {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'search_content', weight: 0.4 },
          { name: 'labels', weight: 0.2 }
        ],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true
      };

      this.searchEngine = new Fuse(rows, fuseOptions);
      this.isReady = true;
      console.error(`Search index loaded with ${rows.length} articles - Server ready!`);
    });
  }

  async waitForReady() {
    while (!this.isReady) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
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
            description: 'List available CSS technique categories based on issue labels',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'get_random_css_tip',
            description: 'Get a random CSS technique or tip from the collection',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // 等待服务器准备就绪
        await this.waitForReady();

        switch (name) {
          case 'search_css_techniques':
            return await this.searchCssTechniques(args.query, args.limit || 5);
          
          case 'get_css_article':
            return await this.getCssArticle(args.issue_number);
          
          case 'list_css_categories':
            return await this.listCssCategories();
          
          case 'get_random_css_tip':
            return await this.getRandomCssTip();
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        console.error(`Error in ${name}:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to execute ${name}: ${error.message}`
        );
      }
    });
  }

  async searchCssTechniques(query, limit = 5) {
    console.error(`[DEBUG] searchCssTechniques called with query: "${query}", limit: ${limit}`);
    console.error(`[DEBUG] Search engine ready: ${this.isReady}`);
    
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      console.error(`[DEBUG] Starting search at ${new Date().toISOString()}`);
      
      try {
      const results = this.searchEngine.search(query).slice(0, limit);
        const endTime = Date.now();
        
        console.error(`[DEBUG] Search completed in ${endTime - startTime}ms, found ${results.length} results`);
      
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

        console.error(`[DEBUG] Formatted ${formattedResults.length} results, returning response`);

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
        console.error(`[DEBUG] Search failed with error:`, error);
        reject(error);
      }
    });
  }

  async getCssArticle(issueNumber) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM issues WHERE number = ?',
        [issueNumber],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          if (!row) {
            reject(new Error(`Article with issue number ${issueNumber} not found`));
            return;
          }

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

  async listCssCategories() {
    return new Promise((resolve, reject) => {
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
            .map(([label, count]) => ({ label, count }));

          resolve({
            content: [
              {
                type: 'text',
                text: `Available CSS technique categories:\n\n` +
                      categories.map(cat => 
                        `• **${cat.label}** (${cat.count} articles)`
                      ).join('\n')
              }
            ]
          });
        }
      );
    });
  }

  async getRandomCssTip() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM issues ORDER BY RANDOM() LIMIT 1',
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          if (!row) {
            reject(new Error('No articles available'));
            return;
          }

          const labels = row.labels ? JSON.parse(row.labels) : [];
          const preview = this.extractPreview(row.body);

          resolve({
            content: [
              {
                type: 'text',
                text: `🎲 **Random CSS Tip**: ${row.title}\n\n` +
                      `**Issue #${row.number}** | **Tags:** ${labels.join(', ')}\n\n` +
                      `${preview}\n\n` +
                      `[Read full article](${row.html_url})`
              }
            ]
          });
        }
      );
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
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('iCSS MCP Server running on stdio');
  }
}

const server = new IcssServer();
server.run().catch(console.error); 
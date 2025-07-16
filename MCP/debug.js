#!/usr/bin/env node

import Database from 'sqlite3';
import Fuse from 'fuse.js';

console.log('🔍 MCP Server Debug Tool\n');

class DebugTester {
  constructor() {
    this.db = null;
    this.searchEngine = null;
    this.isReady = false;
  }

  async init() {
    return new Promise((resolve, reject) => {
      console.log('📂 Connecting to database...');
      
      this.db = new Database.Database('./data/icss.db', (err) => {
        if (err) {
          console.error('❌ Database connection failed:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ Database connected');
        this.loadSearchIndex().then(resolve).catch(reject);
      });
    });
  }

  async loadSearchIndex() {
    return new Promise((resolve, reject) => {
      console.log('🔄 Loading search index...');
      
      this.db.all('SELECT * FROM issues', (err, rows) => {
        if (err) {
          console.error('❌ Failed to load search index:', err.message);
          reject(err);
          return;
        }

        console.log(`📊 Loaded ${rows.length} articles`);

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
        console.log('✅ Search index ready');
        resolve();
      });
    });
  }

  async testSearchFunction(query = "透明 边框") {
    console.log(`\n🔍 Testing search for: "${query}"`);
    
    if (!this.isReady) {
      console.error('❌ Search engine not ready');
      return;
    }

    const startTime = Date.now();
    
try {
      const results = this.searchEngine.search(query).slice(0, 5);
      const endTime = Date.now();
      
      console.log(`⏱️ Search completed in ${endTime - startTime}ms`);
      console.log(`📋 Found ${results.length} results`);
      
      results.forEach((result, index) => {
        const item = result.item;
        console.log(`\n${index + 1}. ${item.title}`);
        console.log(`   Issue #${item.number}`);
        console.log(`   Score: ${Math.round((1 - result.score) * 100)}%`);
        console.log(`   URL: ${item.html_url}`);
        
        if (result.matches) {
          console.log(`   Matches: ${result.matches.length}`);
          result.matches.forEach(match => {
            console.log(`     - ${match.key}: ${match.value?.substring(0, 50)}...`);
          });
    }
  });
      
      return results;
      
    } catch (error) {
      console.error('❌ Search failed:', error.message);
      console.error(error.stack);
}
  }

  async testSpecificArticle(issueNumber = 1) {
    console.log(`\n📄 Testing get article #${issueNumber}`);
    
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM issues WHERE number = ?',
        [issueNumber],
        (err, row) => {
  if (err) {
            console.error('❌ Database query failed:', err.message);
            reject(err);
            return;
          }

          if (!row) {
            console.error(`❌ Article #${issueNumber} not found`);
            reject(new Error('Article not found'));
    return;
  }
  
          console.log('✅ Article found:');
          console.log(`   Title: ${row.title}`);
          console.log(`   Created: ${row.created_at}`);
          console.log(`   Updated: ${row.updated_at}`);
          console.log(`   Body length: ${row.body?.length || 0} chars`);
          
          resolve(row);
        }
      );
    });
  }

  async testCategories() {
    console.log('\n🏷️ Testing categories listing');
    
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT labels, COUNT(*) as count FROM issues WHERE labels IS NOT NULL GROUP BY labels LIMIT 10',
        (err, rows) => {
    if (err) {
            console.error('❌ Categories query failed:', err.message);
            reject(err);
            return;
          }

          console.log(`✅ Found ${rows.length} label groups`);
          
          const categoryMap = new Map();
          
          rows.forEach(row => {
            if (row.labels) {
              try {
                const labels = JSON.parse(row.labels);
                labels.forEach(label => {
                  categoryMap.set(label, (categoryMap.get(label) || 0) + row.count);
                });
              } catch (parseErr) {
                console.warn(`⚠️ Failed to parse labels: ${row.labels}`);
              }
            }
          });

          const topCategories = Array.from(categoryMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

          console.log('📊 Top categories:');
          topCategories.forEach(([label, count]) => {
            console.log(`   • ${label}: ${count} articles`);
          });
          
          resolve(topCategories);
        }
      );
    });
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('📚 Database connection closed');
    }
  }
    }
    
// 运行调试测试
async function runDebugTests() {
  const tester = new DebugTester();
  
  try {
    await tester.init();
    
    // 测试搜索功能 - 用你想要的查询
    await tester.testSearchFunction("透明 边框");
    await tester.testSearchFunction("border radius");
    await tester.testSearchFunction("镂空");
    
    // 测试获取文章
    await tester.testSpecificArticle(1);
    
    // 测试分类
    await tester.testCategories();
    
    console.log('\n🎉 All debug tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Debug test failed:', error.message);
    console.error(error.stack);
  } finally {
    tester.close();
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  runDebugTests();
} 
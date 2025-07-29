#!/usr/bin/env node

import Database from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InspirationTester {
  constructor() {
    this.dbPath = path.join(__dirname, 'data', 'icss.db');
    this.db = new Database.Database(this.dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err);
        process.exit(1);
      }
    });
  }

  async testDatabaseIntegrity() {
    console.log('🔍 Testing database integrity...\n');
    
    // 测试表是否存在
    const tables = [
      'issues',
      'css_inspiration', 
      'code_snippets',
      'demo_styles'
    ];

    for (const table of tables) {
      await this.checkTable(table);
    }
  }

  checkTable(tableName) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT COUNT(*) as count FROM ${tableName}`,
        (err, row) => {
          if (err) {
            console.error(`❌ Table ${tableName} error:`, err.message);
            reject(err);
          } else {
            console.log(`✅ Table ${tableName}: ${row.count} records`);
            resolve(row.count);
          }
        }
      );
    });
  }

  async testSearchFunctionality() {
    console.log('\n🔍 Testing search functionality...\n');
    
    // 测试 CSS-Inspiration 搜索
    await this.testQuery(
      'CSS-Inspiration Search',
      `SELECT * FROM css_inspiration WHERE search_content LIKE '%动画%' LIMIT 3`
    );

    // 测试分类统计
    await this.testQuery(
      'Category Statistics',
      `SELECT category, COUNT(*) as count FROM css_inspiration GROUP BY category ORDER BY count DESC LIMIT 5`
    );

    // 测试难度分布
    await this.testQuery(
      'Difficulty Distribution',
      `SELECT difficulty_level, COUNT(*) as count FROM css_inspiration GROUP BY difficulty_level`
    );
  }

  testQuery(testName, sql) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, (err, rows) => {
        if (err) {
          console.error(`❌ ${testName} failed:`, err.message);
          reject(err);
        } else {
          console.log(`✅ ${testName}: ${rows.length} results`);
          if (rows.length > 0) {
            console.log('   Sample results:');
            rows.slice(0, 2).forEach((row, index) => {
              console.log(`   ${index + 1}.`, Object.keys(row).slice(0, 3).map(key => 
                `${key}: ${String(row[key]).substring(0, 30)}`
              ).join(', '));
            });
          }
          console.log('');
          resolve(rows);
        }
      });
    });
  }

  async testCodeSnippets() {
    console.log('🔍 Testing code snippets...\n');
    
    await this.testQuery(
      'Code Snippets by Type',
      `SELECT snippet_type, COUNT(*) as count FROM code_snippets GROUP BY snippet_type`
    );

    await this.testQuery(
      'Sample CSS Snippets',
      `SELECT * FROM code_snippets WHERE snippet_type = 'css' LIMIT 2`
    );
  }

  async testDemoStyles() {
    console.log('🔍 Testing demo styles...\n');
    
    await this.testQuery(
      'Interactive Demos',
      `SELECT COUNT(*) as count FROM demo_styles WHERE is_interactive = 1`
    );

    await this.testQuery(
      'Sample Demo',
      `SELECT 
         ci.title, 
         ci.category, 
         ds.is_interactive 
       FROM css_inspiration ci 
       JOIN demo_styles ds ON ci.id = ds.inspiration_id 
       LIMIT 3`
    );
  }

  async generateReport() {
    console.log('📊 Generating comprehensive report...\n');
    
    const stats = {};

    // iCSS 统计
    stats.icss = await new Promise((resolve) => {
      this.db.get('SELECT COUNT(*) as count FROM issues', (err, row) => {
        resolve(err ? 0 : row.count);
      });
    });

    // CSS-Inspiration 统计
    stats.inspiration = await new Promise((resolve) => {
      this.db.get('SELECT COUNT(*) as count FROM css_inspiration', (err, row) => {
        resolve(err ? 0 : row.count);
      });
    });

    // 代码片段统计
    stats.snippets = await new Promise((resolve) => {
      this.db.get('SELECT COUNT(*) as count FROM code_snippets', (err, row) => {
        resolve(err ? 0 : row.count);
      });
    });

    // 演示样式统计
    stats.demos = await new Promise((resolve) => {
      this.db.get('SELECT COUNT(*) as count FROM demo_styles', (err, row) => {
        resolve(err ? 0 : row.count);
      });
    });

    console.log('📈 Database Statistics Summary:');
    console.log(`   iCSS Articles: ${stats.icss}`);
    console.log(`   CSS-Inspiration Demos: ${stats.inspiration}`);
    console.log(`   Code Snippets: ${stats.snippets}`);
    console.log(`   Demo Styles: ${stats.demos}`);
    console.log(`   Total Records: ${stats.icss + stats.inspiration + stats.snippets + stats.demos}`);
  }

  async runAllTests() {
    try {
      await this.testDatabaseIntegrity();
      await this.testSearchFunctionality();
      await this.testCodeSnippets();
      await this.testDemoStyles();
      await this.generateReport();
      
      console.log('\n🎉 All tests completed successfully!');
      console.log('\n💡 You can now use the enhanced iCSS MCP Server with both iCSS articles and CSS-Inspiration demos!');
      
    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
    } finally {
      this.db.close();
    }
  }

  close() {
    this.db.close();
  }
}

// 运行测试
console.log('🚀 Starting iCSS MCP Server Integration Tests...\n');
const tester = new InspirationTester();
tester.runAllTests().catch(console.error);

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n⏹️ Shutting down...');
  tester.close();
  process.exit(0);
}); 
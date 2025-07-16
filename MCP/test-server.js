#!/usr/bin/env node

import Database from 'sqlite3';
import Fuse from 'fuse.js';

console.log('🧪 Testing iCSS MCP Server functionality...\n');

// 测试数据库连接
function testDatabase() {
  return new Promise((resolve, reject) => {
    console.log('1️⃣ Testing database connection...');
    
    const db = new Database.Database('./data/icss.db', (err) => {
      if (err) {
        console.error('❌ Database connection failed:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ Database connected successfully');
      
      // 测试数据查询
      db.all('SELECT COUNT(*) as total FROM issues', (err, rows) => {
        if (err) {
          console.error('❌ Database query failed:', err.message);
          reject(err);
          return;
        }
        
        console.log(`✅ Found ${rows[0].total} articles in database`);
        
        // 测试搜索功能
        testSearch(db, resolve, reject);
      });
    });
  });
}

// 测试搜索功能
function testSearch(db, resolve, reject) {
  console.log('\n2️⃣ Testing search functionality...');
  
  db.all('SELECT * FROM issues LIMIT 10', (err, rows) => {
    if (err) {
      console.error('❌ Search test failed:', err.message);
      reject(err);
      return;
    }
    
    if (rows.length === 0) {
      console.error('❌ No data found for search test');
      reject(new Error('No data found'));
      return;
    }
    
    console.log('✅ Sample data retrieved successfully');
    console.log(`✅ First article: "${rows[0].title}"`);
    
    // 测试Fuse.js搜索
    const fuseOptions = {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'search_content', weight: 0.4 },
        { name: 'labels', weight: 0.2 }
      ],
      threshold: 0.3,
      includeScore: true
    };
    
    const fuse = new Fuse(rows, fuseOptions);
    const results = fuse.search('flex');
    
    console.log(`✅ Search test completed: found ${results.length} results for "flex"`);
    
    db.close();
    resolve();
  });
}

// 测试MCP SDK导入
function testMCPSDK() {
  console.log('\n3️⃣ Testing MCP SDK...');
  
  try {
    import('@modelcontextprotocol/sdk/server/index.js').then(() => {
      console.log('✅ MCP SDK imported successfully');
      console.log('\n🎉 All tests passed! The server should work correctly.\n');
      
      console.log('📋 Next steps:');
      console.log('1. Make sure Cursor MCP configuration is correct');
      console.log('2. Check Cursor logs for any connection issues');
      console.log('3. Restart Cursor after configuration changes');
      
      console.log('\n🔧 Cursor Configuration:');
      console.log('File: ~/.config/cursor/mcp_settings.json');
      console.log('Content:');
      console.log(JSON.stringify({
        mcpServers: {
          icss: {
            command: "node",
            args: [process.cwd() + "/server.js"],
            env: {}
          }
        }
      }, null, 2));
    }).catch(err => {
      console.error('❌ MCP SDK import failed:', err.message);
      console.log('\n💡 Try reinstalling dependencies: npm install');
    });
  } catch (err) {
    console.error('❌ MCP SDK test failed:', err.message);
  }
}

// 运行测试
testDatabase()
  .then(() => {
    testMCPSDK();
  })
  .catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }); 
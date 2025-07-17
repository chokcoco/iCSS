#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试查询列表
const testQueries = [
  {
    name: 'List Tools',
    query: {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {}
    }
  },
  {
    name: 'Search Border Techniques',
    query: {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "search_css_techniques",
        arguments: {
          query: "border",
          categories: ["visual_effects"],
          limit: 3
        }
      }
    }
  },
  {
    name: 'Search Animation Techniques',
    query: {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "search_css_techniques",
        arguments: {
          query: "animation",
          categories: ["animation"],
          limit: 3
        }
      }
    }
  },
  {
    name: 'Search High Weight Techniques',
    query: {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "search_css_techniques",
        arguments: {
          query: "",
          min_weight: 3,
          limit: 3
        }
      }
    }
  }
];

// 创建一个Promise来处理服务器响应
function queryServer(command) {
  return new Promise((resolve, reject) => {
    console.log('\n🔄 Starting debug server process...');
    
    const serverProcess = spawn('node', ['debug-local.js'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'inherit']
    });

    let responseData = '';
    let serverReady = false;

    // 监听服务器输出
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('📝 Server output:', output);
      
      // 检查服务器是否已经准备好
      if (output.includes('Search index loaded with') && !serverReady) {
        serverReady = true;
        console.log('\n🚀 Server is ready, sending query...');
        
        // 发送命令
        console.log('\n📤 Sending query:', JSON.stringify(command, null, 2));
        serverProcess.stdin.write(JSON.stringify(command) + '\n');
      }

      // 尝试解析响应
      try {
        if (output.includes('"result"') || output.includes('"error"')) {
          const jsonStart = output.indexOf('{');
          const jsonEnd = output.lastIndexOf('}') + 1;
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonStr = output.substring(jsonStart, jsonEnd);
            const response = JSON.parse(jsonStr);
            
            console.log('\n✅ Received response:', JSON.stringify(response, null, 2));
            
            // 关闭服务器
            serverProcess.kill();
            
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response);
            }
          }
        }
      } catch (e) {
        console.log('⚠️ Parse error:', e.message);
      }
    });

    // 错误处理
    serverProcess.on('error', (error) => {
      console.error('❌ Server process error:', error);
      reject(error);
    });

    // 设置超时
    setTimeout(() => {
      if (!serverReady) {
        console.log('\n⚠️ Server never became ready');
      }
      console.log('\n⚠️ Query timeout, shutting down server...');
      serverProcess.kill();
      reject(new Error('Query timeout'));
    }, 15000);
  });
}

// 运行所有测试查询
async function runTests() {
  console.log('🧪 Starting test queries...\n');
  
  for (const test of testQueries) {
    console.log(`\n📋 Running test: ${test.name}`);
    try {
      const response = await queryServer(test.query);
      console.log('\n✅ Response:', JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('\n❌ Error:', error.message);
    }
    // 等待一下，避免服务器进程冲突
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 All tests completed!');
}

// 执行测试
runTests().catch(error => {
  console.error('❌ Test execution error:', error);
  process.exit(1);
}); 
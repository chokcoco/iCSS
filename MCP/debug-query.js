#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建一个Promise来处理服务器响应
function queryServer(command) {
  return new Promise((resolve, reject) => {
    console.log('\n🔄 Starting server process...');
    
    const serverProcess = spawn('node', ['debug-local.js'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'inherit']
    });

    let responseData = '';
    let serverReady = false;
    let commandSent = false;
    let searchResults = null;

    // 监听服务器输出
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('\n📥 Received data:', output);
      
      // 检查服务器是否已经准备好
      if (output.includes('Search index loaded with') && !serverReady) {
        serverReady = true;
        console.log('\n🚀 Server is ready, waiting 1s before sending query...');
        
        // 延迟发送命令，确保服务器完全准备好
        setTimeout(() => {
          console.log('\n📤 Sending query command...');
          serverProcess.stdin.write(JSON.stringify(command) + '\n');
          commandSent = true;
        }, 1000);
      }

      // 尝试解析搜索结果
      try {
        if (output.includes('"result"')) {
          const jsonStart = output.indexOf('{');
          const jsonEnd = output.lastIndexOf('}') + 1;
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonStr = output.substring(jsonStart, jsonEnd);
            const result = JSON.parse(jsonStr);
            if (result.result) {
              searchResults = result;
              console.log('\n✨ Found search results:', JSON.stringify(result, null, 2));
              // 找到结果后关闭服务器
              serverProcess.kill();
              resolve(result);
            }
          }
        }
      } catch (e) {
        console.log('Not a JSON response:', e.message);
      }
      
      // 收集响应数据
      responseData += output;
    });

    // 设置超时
    setTimeout(() => {
      if (!commandSent) {
        console.log('\n⚠️ Warning: Command was never sent, server might not be ready');
      }
      if (!searchResults) {
        console.log('\n⚠️ Warning: No search results received');
      }
      console.log('\n✅ Query completed, shutting down server...\n');
      serverProcess.kill();
      resolve(searchResults || responseData);
    }, 8000);

    // 错误处理
    serverProcess.on('error', (error) => {
      console.error('❌ Error:', error);
      reject(error);
    });
  });
}

// 测试查询
const testQuery = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "search_css_techniques",
    arguments: {
      query: "gradient border",
      limit: 3
    }
  }
};

console.log('📝 Executing query:', JSON.stringify(testQuery, null, 2));

// 执行查询
queryServer(testQuery)
  .then(response => {
    console.log('📬 Final response:', JSON.stringify(response, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 
#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔄 Starting MCP Server...');

// 启动服务器进程
const serverProcess = spawn('node', ['debug-local.js'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'inherit']
});

let serverReady = false;

// 监听服务器输出
serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  
  // 检查服务器是否准备好
  if (output.includes('Search index loaded with') && !serverReady) {
    serverReady = true;
    console.log('\n🚀 Server is ready! You can now send commands.');
    showPrompt();
  }
});

// 显示命令提示
function showPrompt() {
  console.log('\n📝 Available commands:');
  console.log('1. List all tools');
  console.log('2. Search CSS techniques');
  console.log('3. Get random CSS tip');
  console.log('4. Custom command');
  console.log('5. Exit');
  
  rl.question('\n👉 Enter command number: ', (answer) => {
    switch(answer) {
      case '1':
        sendCommand({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list",
          params: {}
        });
        break;
      case '2':
        rl.question('Enter search query: ', (query) => {
          sendCommand({
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
              name: "search_css_techniques",
              arguments: {
                query: query,
                limit: 3
              }
            }
          });
        });
        break;
      case '3':
        sendCommand({
          jsonrpc: "2.0",
          id: 3,
          method: "tools/call",
          params: {
            name: "get_random_css_tip",
            arguments: {}
          }
        });
        break;
      case '4':
        rl.question('Enter custom JSON-RPC command: ', (cmd) => {
          try {
            const command = JSON.parse(cmd);
            sendCommand(command);
          } catch (e) {
            console.error('❌ Invalid JSON:', e.message);
            showPrompt();
          }
        });
        break;
      case '5':
        console.log('👋 Shutting down server...');
        serverProcess.kill();
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('❌ Invalid command number');
        showPrompt();
    }
  });
}

// 发送命令到服务器
function sendCommand(command) {
  console.log('\n📤 Sending command:', JSON.stringify(command, null, 2));
  serverProcess.stdin.write(JSON.stringify(command) + '\n');
  setTimeout(showPrompt, 1000);
}

// 处理退出
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  serverProcess.kill();
  rl.close();
  process.exit(0);
});

serverProcess.on('error', (error) => {
  console.error('❌ Server error:', error);
  rl.close();
  process.exit(1);
}); 
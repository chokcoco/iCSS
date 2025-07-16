#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Starting iCSS MCP Server in LOCAL DEBUG mode\n');

// 设置环境变量
const env = {
  ...process.env,
  NODE_ENV: 'development',
  DEBUG: 'icss-mcp:*',
  FORCE_COLOR: '1'
};

console.log('📋 Debug Environment:');
console.log(`   NODE_ENV: ${env.NODE_ENV}`);
console.log(`   DEBUG: ${env.DEBUG}`);
console.log(`   Working Directory: ${process.cwd()}`);
console.log(`   Server Path: ${path.join(__dirname, 'server.js')}`);
console.log(`   Database Path: ${path.join(__dirname, 'data', 'icss.db')}\n`);

// 启动服务器
const serverProcess = spawn('node', ['server.js'], {
  cwd: __dirname,
  env: env,
  stdio: ['pipe', 'inherit', 'inherit']
});

// 监听服务器事件
serverProcess.on('spawn', () => {
  console.log('🚀 MCP Server process spawned successfully');
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start MCP Server:', error);
  process.exit(1);
});

serverProcess.on('close', (code, signal) => {
  if (signal) {
    console.log(`🛑 MCP Server terminated by signal: ${signal}`);
  } else {
    console.log(`🔚 MCP Server exited with code: ${code}`);
  }
  process.exit(code);
});

// 处理进程信号
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down MCP Server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Terminating MCP Server...');
  serverProcess.kill('SIGTERM');
});

// 提供测试输入
setTimeout(() => {
  console.log('\n💡 Debug Tips:');
  console.log('   - Server is running in debug mode with detailed logging');
  console.log('   - All function calls will be logged with timestamps');
  console.log('   - Database queries and results are tracked');
  console.log('   - Use Ctrl+C to stop the server\n');
  
  console.log('🧪 Test Commands (copy and send to server):');
  console.log('   {"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}');
  console.log('   {"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_css_techniques","arguments":{"query":"gradient border","limit":3}}}');
  console.log('   {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_random_css_tip","arguments":{}}}');
  console.log('');
}, 1000); 
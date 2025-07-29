#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serverPath = join(__dirname, '..', 'server.js');

console.log('🚀 Starting iCSS MCP Server v1.1.1...');
console.log('📚 Integrating iCSS techniques + CSS-Inspiration demos');

// 启动 MCP 服务器
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error('❌ Failed to start iCSS MCP Server:', error);
  console.error('💡 Try running: npm install -g icss-mcp-server');
  process.exit(1);
});

server.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    console.error('💡 For help, visit: https://github.com/chokcoco/iCSS/tree/main/MCP');
  }
  process.exit(code);
});

// 处理进程信号
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down iCSS MCP Server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down iCSS MCP Server...');
  server.kill('SIGTERM');
});

// 显示帮助信息
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
iCSS MCP Server v1.1.1 - CSS Techniques & Demos

Usage:
  icss-mcp              Start the MCP server
  icss-mcp-install      Install for Cursor IDE

Features:
  • 270+ CSS technique articles from iCSS
  • 160+ complete CSS demos from CSS-Inspiration  
  • Smart search and categorization
  • Complete runnable code examples

For more information:
  https://github.com/chokcoco/iCSS/tree/main/MCP
`);
  process.exit(0);
} 
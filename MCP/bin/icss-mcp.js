#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serverPath = join(__dirname, '..', 'server.js');

// 启动 MCP 服务器
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error('Failed to start iCSS MCP Server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  process.exit(code);
});

// 处理进程信号
process.on('SIGINT', () => {
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
}); 
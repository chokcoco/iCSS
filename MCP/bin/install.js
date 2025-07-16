#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Installing iCSS MCP Server for Cursor...\n');

// 获取 Cursor 配置目录
function getCursorConfigPath() {
  const platform = process.platform;
  const homeDir = os.homedir();
  
  switch (platform) {
    case 'darwin': // macOS
      return path.join(homeDir, '.config', 'cursor');
    case 'win32': // Windows
      return path.join(homeDir, 'AppData', 'Roaming', 'Cursor', 'User');
    case 'linux': // Linux
      return path.join(homeDir, '.config', 'cursor');
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

// 获取包的绝对路径
function getPackagePath() {
  // 从 node_modules/@icss/mcp-server/bin/install.js 回到包根目录
  return path.resolve(__dirname, '..');
}

// 创建或更新 MCP 配置
function updateMcpConfig() {
  try {
    const configDir = getCursorConfigPath();
    const configFile = path.join(configDir, 'mcp_settings.json');
    
    // 确保配置目录存在
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`✅ Created Cursor config directory: ${configDir}`);
    }
    
    // 读取现有配置或创建新配置
    let config = { mcpServers: {} };
    if (fs.existsSync(configFile)) {
      try {
        const existingConfig = fs.readFileSync(configFile, 'utf8');
        config = JSON.parse(existingConfig);
        console.log('📝 Found existing MCP configuration');
      } catch (err) {
        console.warn('⚠️  Existing config file is invalid, creating new one');
      }
    }
    
    // 确保 mcpServers 对象存在
    if (!config.mcpServers) {
      config.mcpServers = {};
    }
    
    // 添加或更新 iCSS MCP Server 配置
    const packagePath = getPackagePath();
    const serverPath = path.join(packagePath, 'server.js');
    
    config.mcpServers.icss = {
      command: "node",
      args: [serverPath],
      env: {}
    };
    
    // 写入配置文件
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    console.log(`✅ Updated MCP configuration: ${configFile}`);
    
    return configFile;
    
  } catch (error) {
    console.error('❌ Failed to update MCP configuration:', error.message);
    throw error;
  }
}

// 验证安装
function verifyInstallation() {
  try {
    const packagePath = getPackagePath();
    const serverPath = path.join(packagePath, 'server.js');
    const dbPath = path.join(packagePath, 'data', 'icss.db');
    
    console.log('\n🔍 Verifying installation...');
    
    if (!fs.existsSync(serverPath)) {
      throw new Error(`Server file not found: ${serverPath}`);
    }
    console.log('✅ Server file exists');
    
    if (!fs.existsSync(dbPath)) {
      console.log('⚠️  Database not found, will be created on first run');
    } else {
      console.log('✅ Database file exists');
    }
    
    console.log('✅ Installation verified');
    
  } catch (error) {
    console.error('❌ Installation verification failed:', error.message);
    throw error;
  }
}

// 显示使用说明
function showUsageInstructions(configFile) {
  console.log('\n🎉 Installation completed successfully!\n');
  
  console.log('📋 Next steps:');
  console.log('1. Restart Cursor IDE completely');
  console.log('2. The iCSS MCP Server should be available automatically');
  console.log('3. Try asking Cursor about CSS techniques from iCSS\n');
  
  console.log('🛠️  Configuration details:');
  console.log(`   Config file: ${configFile}`);
  console.log(`   Server path: ${path.join(getPackagePath(), 'server.js')}`);
  
  console.log('\n💡 Usage examples:');
  console.log('   - "Show me CSS techniques for flex layout"');
  console.log('   - "Find articles about CSS animations"');
  console.log('   - "Get a random CSS tip from iCSS"');
  
  console.log('\n🔧 Manual testing:');
  console.log('   Run: npx @icss/mcp-server');
  console.log('   Or:  icss-mcp');
  
  console.log('\n📚 More info: https://github.com/chokcoco/iCSS');
}

// 主安装流程
async function main() {
  try {
    // 更新配置
    const configFile = updateMcpConfig();
    
    // 验证安装
    verifyInstallation();
    
    // 显示说明
    showUsageInstructions(configFile);
    
  } catch (error) {
    console.error('\n❌ Installation failed:', error.message);
    console.error('\n🔧 Manual setup instructions:');
    console.error('1. Create ~/.config/cursor/mcp_settings.json');
    console.error('2. Add the following configuration:');
    console.error(JSON.stringify({
      mcpServers: {
        icss: {
          command: "node",
          args: [path.join(getPackagePath(), 'server.js')],
          env: {}
        }
      }
    }, null, 2));
    
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 
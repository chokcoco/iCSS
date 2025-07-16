#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

console.log('🔧 Comprehensive MCP Diagnosis Tool\n');

// 检查所有可能的 Cursor MCP 配置位置
function checkCursorConfigs() {
  console.log('1️⃣ Checking Cursor MCP Configuration Locations:\n');
  
  const possiblePaths = [
    '~/.config/cursor/mcp_settings.json',
    '~/Library/Application Support/Cursor/mcp_settings.json',
    '~/.cursor/mcp_settings.json',
    process.env.HOME + '/.config/cursor/mcp_settings.json',
    process.env.HOME + '/Library/Application Support/Cursor/mcp_settings.json'
  ];

  let foundConfigs = 0;
  
  possiblePaths.forEach(configPath => {
    const expandedPath = configPath.startsWith('~') ? 
      configPath.replace('~', process.env.HOME) : configPath;
    
    if (fs.existsSync(expandedPath)) {
      foundConfigs++;
      console.log(`   ✅ Found: ${configPath}`);
      try {
        const content = fs.readFileSync(expandedPath, 'utf8');
        const config = JSON.parse(content);
        console.log(`      Servers: ${Object.keys(config.mcpServers || {}).join(', ')}`);
      } catch (err) {
        console.log(`      ❌ Invalid JSON: ${err.message}`);
      }
    } else {
      console.log(`   ❌ Not found: ${configPath}`);
    }
  });
  
  if (foundConfigs === 0) {
    console.log('\n   ⚠️  No MCP configuration files found!');
  }
  
  return foundConfigs > 0;
}

// 检查服务器可执行性
function checkServerExecutability() {
  console.log('\n2️⃣ Checking Server Executability:\n');
  
  const serverPath = path.resolve('./server.js');
  console.log(`   Server path: ${serverPath}`);
  
  if (!fs.existsSync(serverPath)) {
    console.log('   ❌ server.js not found');
    return false;
  }
  
  console.log('   ✅ server.js exists');
  
  // 检查权限
  try {
    fs.accessSync(serverPath, fs.constants.R_OK);
    console.log('   ✅ server.js is readable');
  } catch (err) {
    console.log('   ❌ server.js is not readable');
    return false;
  }
  
  return true;
}

// 手动测试 MCP 协议
function testMCPProtocol() {
  console.log('\n3️⃣ Testing MCP Protocol Manually:\n');
  
  return new Promise((resolve) => {
    const serverProcess = spawn('node', ['./server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    
    serverProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    serverProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // 发送 MCP 初始化请求
    const initRequest = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "test-client",
          version: "1.0.0"
        }
      }
    }) + '\n';
    
    serverProcess.stdin.write(initRequest);
    
    // 等待响应
    setTimeout(() => {
      serverProcess.kill();
      
      console.log('   📤 Sent initialization request');
      
      if (stdout.trim()) {
        console.log('   ✅ Got stdout response:');
        console.log(`      ${stdout.trim()}`);
      } else {
        console.log('   ❌ No stdout response');
      }
      
      if (stderr.trim()) {
        console.log('   ⚠️  Got stderr:');
        console.log(`      ${stderr.trim()}`);
      }
      
      resolve(stdout.length > 0);
    }, 3000);
  });
}

// 生成正确的配置
function generateCorrectConfig() {
  console.log('\n4️⃣ Generating Correct Configuration:\n');
  
  const serverPath = path.resolve('./server.js');
  const configs = [
    {
      path: process.env.HOME + '/.config/cursor/mcp_settings.json',
      content: {
        mcpServers: {
          icss: {
            command: "node",
            args: [serverPath],
            env: {}
          }
        }
      }
    },
    {
      path: process.env.HOME + '/Library/Application Support/Cursor/mcp_settings.json',
      content: {
        mcpServers: {
          icss: {
            command: "node",
            args: [serverPath],
            env: {}
          }
        }
      }
    }
  ];
  
  configs.forEach((config, index) => {
    console.log(`   📝 Config ${index + 1}: ${config.path}`);
    
    // 确保目录存在
    const dir = path.dirname(config.path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`      ✅ Created directory: ${dir}`);
    }
    
    // 写入配置
    try {
      fs.writeFileSync(config.path, JSON.stringify(config.content, null, 2));
      console.log(`      ✅ Written configuration`);
    } catch (err) {
      console.log(`      ❌ Failed to write: ${err.message}`);
    }
  });
  
  console.log('\n   💡 Try both locations and restart Cursor completely');
}

// 提供故障排除建议
function provideTroubleshootingTips() {
  console.log('\n5️⃣ Troubleshooting Tips:\n');
  
  const tips = [
    '1. 完全退出 Cursor (Cmd+Q)，然后重新启动',
    '2. 检查 Cursor 版本是否支持 MCP (需要较新版本)',
    '3. 在 Cursor 中按 Cmd+Option+I 打开开发者工具，检查 Console 错误',
    '4. 尝试在 Cursor 设置中查看 MCP 相关配置',
    '5. 确保没有其他 MCP 服务器冲突',
    '6. 如果使用 VS Code，确保安装了正确的 Cursor 而不是 VS Code'
  ];
  
  tips.forEach(tip => console.log(`   ${tip}`));
  
  console.log('\n   🔧 Manual Test Command:');
  console.log(`   cd ${process.cwd()}`);
  console.log('   echo \'{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}\' | node server.js');
}

// 主诊断流程
async function runDiagnosis() {
  console.log('Starting comprehensive MCP diagnosis...\n');
  
  const hasConfig = checkCursorConfigs();
  const serverWorks = checkServerExecutability();
  
  if (serverWorks) {
    const protocolWorks = await testMCPProtocol();
    console.log(`\n   MCP Protocol Test: ${protocolWorks ? '✅ Working' : '❌ Failed'}`);
  }
  
  generateCorrectConfig();
  provideTroubleshootingTips();
  
  console.log('\n🎯 Summary:');
  console.log(`   Config Found: ${hasConfig ? '✅' : '❌'}`);
  console.log(`   Server Works: ${serverWorks ? '✅' : '❌'}`);
  console.log('\n📚 Next: Restart Cursor completely and try again');
}

// 运行诊断
runDiagnosis().catch(console.error); 
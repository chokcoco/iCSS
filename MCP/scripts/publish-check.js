#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 Pre-publish check for icss-mcp-server\n');

let allPassed = true;

function checkFailed(message) {
  console.log(`❌ ${message}`);
  allPassed = false;
}

function checkPassed(message) {
  console.log(`✅ ${message}`);
}

// 1. 检查必要文件
console.log('📁 Checking required files...');
const requiredFiles = [
  'package.json',
  'server.js',
  'setup.js',
  'bin/icss-mcp.js',
  'bin/install.js',
  'README.md',
  'LICENSE'
];

requiredFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    checkPassed(`Required file exists: ${file}`);
  } else {
    checkFailed(`Missing required file: ${file}`);
  }
});

// 2. 检查 package.json
console.log('\n📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  
  if (packageJson.name === 'icss-mcp-server') {
    checkPassed('Package name is correct');
  } else {
    checkFailed(`Package name should be icss-mcp-server, got: ${packageJson.name}`);
  }
  
  if (packageJson.version && packageJson.version.match(/^\d+\.\d+\.\d+/)) {
    checkPassed(`Version format is valid: ${packageJson.version}`);
  } else {
    checkFailed(`Invalid version format: ${packageJson.version}`);
  }
  
  if (packageJson.bin && packageJson.bin['icss-mcp'] && packageJson.bin['icss-mcp-install']) {
    checkPassed('CLI commands are defined');
  } else {
    checkFailed('CLI commands are missing in package.json');
  }
  
  if (packageJson.files && packageJson.files.length > 0) {
    checkPassed('Files array is defined');
  } else {
    checkFailed('Files array is missing or empty');
  }
  
} catch (error) {
  checkFailed(`Failed to parse package.json: ${error.message}`);
}

// 3. 检查 CLI 脚本权限
console.log('\n🔧 Checking CLI scripts...');
const cliScripts = ['bin/icss-mcp.js', 'bin/install.js'];
cliScripts.forEach(script => {
  const scriptPath = path.join(rootDir, script);
  try {
    const stats = fs.statSync(scriptPath);
    if (stats.mode & parseInt('111', 8)) {
      checkPassed(`${script} is executable`);
    } else {
      checkFailed(`${script} is not executable`);
    }
    
    const content = fs.readFileSync(scriptPath, 'utf8');
    if (content.startsWith('#!/usr/bin/env node')) {
      checkPassed(`${script} has correct shebang`);
    } else {
      checkFailed(`${script} is missing shebang`);
    }
  } catch (error) {
    checkFailed(`Failed to check ${script}: ${error.message}`);
  }
});

// 4. 检查依赖
console.log('\n📚 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const requiredDeps = [
    '@modelcontextprotocol/sdk',
    'sqlite3',
    'fuse.js',
    'axios',
    'marked',
    'dotenv'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      checkPassed(`Dependency ${dep} is included`);
    } else {
      checkFailed(`Missing dependency: ${dep}`);
    }
  });
} catch (error) {
  checkFailed(`Failed to check dependencies: ${error.message}`);
}

// 5. 检查数据库
console.log('\n🗄️ Checking database...');
const dbPath = path.join(rootDir, 'data', 'icss.db');
if (fs.existsSync(dbPath)) {
  try {
    const stats = fs.statSync(dbPath);
    if (stats.size > 1024) { // At least 1KB
      checkPassed(`Database file exists and has content (${Math.round(stats.size / 1024)}KB)`);
    } else {
      checkFailed('Database file is too small (might be empty)');
    }
  } catch (error) {
    checkFailed(`Failed to check database: ${error.message}`);
  }
} else {
  console.log('⚠️  Database file not found (will be created on first run)');
}

// 6. 检查 README
console.log('\n📖 Checking README...');
try {
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
  
  if (readme.includes('# iCSS MCP Server')) {
    checkPassed('README has correct title');
  } else {
    checkFailed('README title is incorrect');
  }
  
  if (readme.includes('npm install -g icss-mcp-server')) {
    checkPassed('README includes installation instructions');
  } else {
    checkFailed('README missing installation instructions');
  }
  
  if (readme.length > 1000) {
    checkPassed('README has sufficient content');
  } else {
    checkFailed('README is too short');
  }
  
} catch (error) {
  checkFailed(`Failed to check README: ${error.message}`);
}

// 7. 检查 LICENSE
console.log('\n⚖️  Checking LICENSE...');
try {
  const license = fs.readFileSync(path.join(rootDir, 'LICENSE'), 'utf8');
  
  if (license.includes('MIT License')) {
    checkPassed('LICENSE is MIT');
  } else {
    checkFailed('LICENSE is not MIT or incorrectly formatted');
  }
} catch (error) {
  checkFailed(`Failed to check LICENSE: ${error.message}`);
}

// 总结
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 All checks passed! Ready to publish.');
  console.log('\n📋 To publish:');
  console.log('   npm publish');
  console.log('\n📋 After publishing:');
  console.log('   npm install -g icss-mcp-server');
  console.log('   icss-mcp-install');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please fix the issues before publishing.');
  process.exit(1);
} 
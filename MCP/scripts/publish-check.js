#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 Pre-publish check for icss-mcp-server v1.1.1\n');

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
  'scripts/fetch-issues.js',
  'scripts/fetch-inspiration.js',
  'test-server.js',
  'test-inspiration.js',
  'README.md',
  'README.en.md',
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
  
  if (packageJson.version === '1.1.1') {
    checkPassed(`Version is updated to v1.1.1`);
  } else {
    checkFailed(`Version should be 1.1.1, got: ${packageJson.version}`);
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

  // 检查新的脚本命令
  const requiredScripts = ['build:inspiration', 'build:all', 'test:inspiration', 'test:all'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      checkPassed(`Script '${script}' is defined`);
    } else {
      checkFailed(`Missing script: ${script}`);
    }
  });
  
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

    // 检查版本信息
    if (content.includes('v1.1.1')) {
      checkPassed(`${script} includes version v1.1.1`);
    } else {
      checkFailed(`${script} missing version v1.1.1`);
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
    'dotenv',
    'cheerio'
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

// 6. 检查新增功能文件
console.log('\n🎨 Checking CSS-Inspiration integration...');
const inspirationFiles = [
  'scripts/fetch-inspiration.js',
  'test-inspiration.js'
];

inspirationFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    checkPassed(`CSS-Inspiration file exists: ${file}`);
    
    // 检查文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('css_inspiration') || content.includes('CSS-Inspiration')) {
      checkPassed(`${file} contains CSS-Inspiration logic`);
    } else {
      checkFailed(`${file} missing CSS-Inspiration references`);
    }
  } else {
    checkFailed(`Missing CSS-Inspiration file: ${file}`);
  }
});

// 7. 检查 README
console.log('\n📖 Checking README files...');
const readmeFiles = ['README.md', 'README.en.md'];
readmeFiles.forEach(readmeFile => {
  try {
    const readme = fs.readFileSync(path.join(rootDir, readmeFile), 'utf8');
    
    if (readme.includes('# iCSS MCP Server')) {
      checkPassed(`${readmeFile} has correct title`);
    } else {
      checkFailed(`${readmeFile} title is incorrect`);
    }
    
    if (readme.includes('CSS-Inspiration')) {
      checkPassed(`${readmeFile} mentions CSS-Inspiration integration`);
    } else {
      checkFailed(`${readmeFile} missing CSS-Inspiration references`);
    }
    
    if (readme.includes('npm install -g icss-mcp-server')) {
      checkPassed(`${readmeFile} includes installation instructions`);
    } else {
      checkFailed(`${readmeFile} missing installation instructions`);
    }
    
    if (readme.length > 1000) {
      checkPassed(`${readmeFile} has sufficient content`);
    } else {
      checkFailed(`${readmeFile} is too short`);
    }
    
  } catch (error) {
    checkFailed(`Failed to check ${readmeFile}: ${error.message}`);
  }
});

// 8. 检查 LICENSE
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

// 9. 检查服务器版本
console.log('\n🖥️  Checking server version...');
try {
  const serverContent = fs.readFileSync(path.join(rootDir, 'server.js'), 'utf8');
  if (serverContent.includes('1.1.1')) {
    checkPassed('Server.js includes version 1.1.1');
  } else {
    checkFailed('Server.js missing version 1.1.1');
  }

  // 检查新的 MCP 功能
  const newFunctions = ['search_css_demos', 'get_css_demo'];
  newFunctions.forEach(func => {
    if (serverContent.includes(func)) {
      checkPassed(`Server includes new function: ${func}`);
    } else {
      checkFailed(`Server missing new function: ${func}`);
    }
  });
} catch (error) {
  checkFailed(`Failed to check server.js: ${error.message}`);
}

// 总结
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 All checks passed! Ready to publish v1.1.1.');
  console.log('\n📋 New features in v1.1.1:');
  console.log('   • Integrated CSS-Inspiration with 160+ demos');
  console.log('   • Added search_css_demos and get_css_demo functions');
  console.log('   • Enhanced CLI with better error handling');
  console.log('   • Updated documentation and examples');
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
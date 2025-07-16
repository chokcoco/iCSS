#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProjectSetup {
  constructor() {
    this.projectRoot = __dirname;
    this.dataDir = path.join(this.projectRoot, 'data');
  }

  async setup() {
    console.log('🚀 Setting up iCSS MCP Server...\n');

    // 1. 创建必要的目录
    this.createDirectories();

    // 2. 创建环境变量文件
    this.createEnvFile();

    // 3. 显示下一步指令
    this.showNextSteps();
  }

  createDirectories() {
    console.log('📁 Creating necessary directories...');
    
    const directories = [
      this.dataDir
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`   ✅ Created: ${path.relative(this.projectRoot, dir)}`);
      } else {
        console.log(`   ℹ️  Already exists: ${path.relative(this.projectRoot, dir)}`);
      }
    });
  }

  createEnvFile() {
    console.log('\n🔧 Creating environment configuration...');
    
    const envPath = path.join(this.projectRoot, '.env');
    const envExampleContent = `
        # GitHub API Configuration (Optional - for higher rate limits)
        # Get your token from: https://github.com/settings/tokens
        GITHUB_TOKEN=your_github_token_here

        # Server Configuration
        NODE_ENV=production
        PORT=3000

        # Database Configuration
        DB_PATH=./data/icss.db
    `;

    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, envExampleContent);
      console.log('   ✅ Created .env file');
    } else {
      console.log('   ℹ️  .env file already exists');
    }
  }

  showNextSteps() {
    console.log('\n🎉 Setup completed! Next steps:\n');
    
    console.log('1️⃣  Install dependencies:');
    console.log('   npm install\n');
    
    console.log('2️⃣  Fetch iCSS repository data:');
    console.log('   npm run fetch-issues\n');
    
    console.log('3️⃣  Test the server:');
    console.log('   npm start\n');
    
    console.log('4️⃣  Configure Cursor IDE:');
    console.log('   Add this to your MCP settings (~/.config/cursor/mcp_settings.json):');
    console.log('   {');
    console.log('     "mcpServers": {');
    console.log('       "icss": {');
    console.log(`         "command": "node",`);
    console.log(`         "args": ["${path.resolve(this.projectRoot, 'server.js')}"],`);
    console.log('         "env": {}');
    console.log('       }');
    console.log('     }');
    console.log('   }\n');
    
    console.log('5️⃣  Restart Cursor IDE to load the MCP server\n');
    
    console.log('📚 For more information, see README.md');
  }
}

const setup = new ProjectSetup();
setup.setup().catch(console.error); 
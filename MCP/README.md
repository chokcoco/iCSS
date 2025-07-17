# iCSS MCP Server 中文使用指南

> iCSS MCP Server 是一个基于 Model Context Protocol (MCP) 的服务端，提供 iCSS 技巧库的搜索、分类、文章详情、随机技巧等能力，支持 Cursor IDE 智能调用。

[![npm version](https://badge.fury.io/js/icss-mcp-server.svg)](https://www.npmjs.com/package/icss-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 快速开始

### 1. 全局安装（推荐）
```bash
npm install -g icss-mcp-server
icss-mcp-install
# 启动 MCP 服务（如需手动）
icss-mcp
```

### 2. NPX 免安装
```bash
npx icss-mcp-server
npx icss-mcp-server install
```

### 3. 本地开发
```bash
git clone https://github.com/chokcoco/iCSS.git
cd iCSS/MCP
npm install
npm run setup
npm start
```

## 📋 主要功能
- 🔍 CSS 技巧模糊搜索
- 📖 获取指定 iCSS 文章详情
- 🏷️ 技巧分类浏览
- 🎲 随机 CSS 技巧
- 🚀 一键集成 Cursor
- 🔧 命令行工具

## 🛠️ 安装与配置

### 自动配置
```bash
npm install -g icss-mcp-server
icss-mcp-install
```

### 手动配置（如自动失败）
编辑 `~/.config/cursor/mcp_settings.json`，添加：
```json
{
  "mcpServers": {
    "icss": {
      "command": "node",
      "args": ["/你的/绝对/路径/icss-mcp-server/server.js"],
      "env": {}
    }
  }
}
```
重启 Cursor IDE。

## 💡 Cursor 智能调用示例
- “查找 flex 布局的 CSS 技巧”
- “iCSS 有哪些动画相关的技巧？”
- “如何实现渐变边框？”
- “来一个随机 CSS 技巧”
- “有哪些 CSS 技巧分类？”
- “获取 issue #1 的详细内容”

## 🧩 MCP 可用工具
| 工具名 | 说明 | 参数 |
|--------|------|------|
| search_css_techniques | 搜索 CSS 技巧 | query, limit(可选) |
| get_css_article | 获取文章详情 | issue_number |
| list_css_categories | 获取所有分类 | 无 |
| get_random_css_tip | 随机技巧 | 无 |

## 🔧 常用命令
```bash
icss-mcp            # 启动 MCP 服务
icss-mcp-install    # 自动配置 Cursor
npm run setup       # 初始化数据库
npm test            # 测试服务
npm run build       # 拉取最新数据
```

## 📊 数据来源
- 超过 270 篇 iCSS 技巧文章
- 支持模糊搜索、分类、定期同步
- 原始仓库：[iCSS](https://github.com/chokcoco/iCSS)

## ❓ 常见问题
1. **Cursor 未识别 MCP Server**
   - 检查配置文件路径和 server.js 路径
   - 完全重启 Cursor
2. **数据库报错**
   - 运行 `npm run setup` 重新初始化
3. **权限问题**
   - macOS/Linux 下 `chmod +x node_modules/icss-mcp-server/bin/*`

## 📝 贡献与支持
- 欢迎 PR 和 Issue
- [iCSS 讨论区](https://github.com/chokcoco/iCSS/discussions)
- [原文档/英文版](./README.en.md)

---

Made with ❤️ for the CSS community 
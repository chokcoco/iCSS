# iCSS MCP Server 中文使用指南

> iCSS MCP Server 是一个基于 Model Context Protocol (MCP) 的服务端，整合了 iCSS 技巧库和 CSS-Inspiration 演示案例，提供 CSS 技巧搜索、分类、文章详情、完整代码演示等能力，支持 Cursor IDE 智能调用。

[![npm version](https://badge.fury.io/js/icss-mcp-server.svg?cacheBust=1)](https://www.npmjs.com/package/icss-mcp-server)
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
- 🔍 **双库搜索**：同时搜索 iCSS 文章和 CSS-Inspiration 演示
- 📖 **文章详情**：获取指定 iCSS 文章的完整内容
- 🎯 **演示代码**：获取 CSS-Inspiration 的完整可运行代码
- 🏷️ **智能分类**：按技术类别、难度级别浏览内容
- 🎲 **随机发现**：随机获取技巧或演示案例
- 🔧 **代码片段**：提取和管理 CSS/HTML 代码块
- 🚀 **一键集成**：自动配置 Cursor IDE
- 📊 **性能分析**：提供浏览器兼容性和性能建议

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
      "args": ["/path/to/global/node_modules/icss-mcp-server/server.js"],
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
| search_css_techniques | 搜索 iCSS 技巧文章 | query, limit(可选) |
| search_css_demos | 搜索 CSS-Inspiration 演示 | query, category(可选), difficulty(可选), limit(可选) |
| get_css_article | 获取 iCSS 文章详情 | issue_number |
| get_css_demo | 获取演示完整代码 | demo_id |
| list_css_categories | 获取所有分类 | source(可选): icss/inspiration/all |
| get_random_css_tip | 随机技巧或演示 | source(可选): icss/inspiration/both |

## 🔧 常用命令
```bash
icss-mcp                # 启动 MCP 服务
icss-mcp-install        # 自动配置 Cursor
npm run setup           # 初始化数据库
npm run build           # 拉取 iCSS 文章数据
npm run build:inspiration # 拉取 CSS-Inspiration 演示数据
npm run build:all       # 拉取所有数据
npm test                # 测试服务
```

## 📊 数据来源

### iCSS 技巧库
- 超过 270 篇高质量 CSS 技巧文章
- 涵盖动画、布局、特效、性能优化等主题
- 原始仓库：[iCSS](https://github.com/chokcoco/iCSS)

### CSS-Inspiration 演示库
- 包含 14 个分类的完整 CSS 演示
- 提供可运行的 HTML/CSS 代码
- 按难度级别分类（初级/中级/高级）
- 包含浏览器兼容性信息
- 原始仓库：[CSS-Inspiration](https://github.com/chokcoco/CSS-Inspiration)

### 技术特性
- 支持模糊搜索、智能分类
- 自动提取代码片段
- 性能分析和优化建议
- 定期同步最新内容

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
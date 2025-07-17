# iCSS MCP Server

> 🎨 A Model Context Protocol (MCP) server that provides access to CSS techniques and solutions from the [iCSS repository](https://github.com/chokcoco/iCSS).

[![npm version](https://badge.fury.io/js/icss-mcp-server.svg)](https://www.npmjs.com/package/icss-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

### Option 1: NPM Installation (Recommended)

```bash
# Install globally
npm install -g icss-mcp-server

# Auto-configure for Cursor
icss-mcp-install

# Start the server (if needed manually)
icss-mcp
```

### Option 2: NPX (No Installation)

```bash
# Run directly
npx icss-mcp-server

# Auto-configure for Cursor
npx icss-mcp-server install
```

### Option 3: Local Development

```bash
# Clone and setup
git clone https://github.com/chokcoco/iCSS.git
cd iCSS/MCP
npm install
npm run setup
npm start
```

## 📋 Features

- 🔍 **Search CSS Techniques**: Find relevant CSS solutions from 270+ articles
- 📖 **Get Article Details**: Access full content of specific iCSS articles
- 🏷️ **Browse Categories**: List available CSS technique categories
- 🎲 **Random Tips**: Get random CSS tips for inspiration
- 🚀 **Easy Integration**: Auto-configures with Cursor IDE
- 🔧 **CLI Tools**: Simple command-line interface

## 🛠️ Installation & Configuration

### Automatic Setup

The easiest way is to use the automatic installer:

```bash
npm install -g icss-mcp-server
icss-mcp-install
```

This will:
1. Install the package globally
2. Auto-configure Cursor IDE settings
3. Create necessary database files
4. Verify the installation

### Manual Configuration

If automatic setup doesn't work, you can manually configure Cursor:

1. Create or edit `~/.config/cursor/mcp_settings.json`:

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

2. Restart Cursor IDE completely

## 💡 Usage in Cursor

Once installed and configured, you can ask Cursor about CSS techniques:

### Example Queries

- *"Show me CSS techniques for flex layout"*
- *"Find articles about CSS animations from iCSS"*
- *"How to create gradient borders with CSS?"*
- *"Get a random CSS tip"*
- *"What CSS techniques are available for responsive design?"*

### MCP Functions Available

| Function | Description | Parameters |
|----------|-------------|------------|
| `search_css_techniques` | Search for CSS techniques | `query`, `limit` (optional) |
| `get_css_article` | Get full article content | `issue_number` |
| `list_css_categories` | List all available categories | none |
| `get_random_css_tip` | Get a random CSS tip | none |

## 🔧 CLI Commands

After installation, these commands are available:

```bash
# Start MCP server
icss-mcp

# Install/configure for Cursor
icss-mcp-install

# Run setup (create database, fetch data)
npm run setup

# Test server functionality
npm test

# Fetch latest data from GitHub
npm run build
```

## 📊 Data Source

This MCP server provides access to:

- **270+ CSS articles** from the iCSS repository
- **Searchable content** with fuzzy matching
- **Categorized techniques** by labels
- **Regular updates** from GitHub issues

All content is sourced from the excellent [iCSS repository](https://github.com/chokcoco/iCSS) by [chokcoco](https://github.com/chokcoco).

## 🔍 Troubleshooting

### Common Issues

**1. MCP Server not found in Cursor**
- Ensure Cursor is completely restarted after installation
- Check the config file: `~/.config/cursor/mcp_settings.json`
- Verify the server path in the configuration

**2. Permission errors**
- On macOS/Linux: `chmod +x node_modules/icss-mcp-server/bin/*`
- Run with sudo if needed: `sudo npm install -g icss-mcp-server`

**3. Database issues**
- Run setup again: `npm run setup`
- Check if SQLite3 is properly installed
- Clear and rebuild: `rm -rf data/icss.db && npm run build`

### Debug Mode

Enable debug logging:

```bash
# Set debug environment
export DEBUG=icss-mcp:*

# Run with debug info
icss-mcp
```

### Manual Testing

Test the server directly:

```bash
# Test server functionality
npm test

# Test specific functions
node -e "
import('./server.js').then(async () => {
  // Server will start and show debug info
});
"
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
git clone https://github.com/chokcoco/iCSS.git
cd iCSS/MCP
npm install
npm run setup
npm run dev
```

### Publishing

```bash
npm run prepublishOnly
npm publish
```

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [iCSS Repository](https://github.com/chokcoco/iCSS) - Original CSS techniques collection
- [chokcoco](https://github.com/chokcoco) - Creator of iCSS
- [Model Context Protocol](https://github.com/modelcontextprotocol) - MCP specification
- [Cursor IDE](https://cursor.sh/) - AI-powered code editor

## 📞 Support

- 🐛 [Report Issues](https://github.com/chokcoco/iCSS/issues)
- 💬 [Discussions](https://github.com/chokcoco/iCSS/discussions)
- 📚 [iCSS Documentation](https://github.com/chokcoco/iCSS)

---

Made with ❤️ for the CSS community 
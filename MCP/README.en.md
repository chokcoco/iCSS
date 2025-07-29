# iCSS MCP Server

> 🎨 A comprehensive Model Context Protocol (MCP) server that integrates both [iCSS repository](https://github.com/chokcoco/iCSS) techniques and [CSS-Inspiration](https://github.com/chokcoco/CSS-Inspiration) demos, providing complete CSS solutions with runnable code examples.

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

- 🔍 **Dual Search**: Search both iCSS articles and CSS-Inspiration demos
- 📖 **Article Details**: Access full content of specific iCSS articles
- 🎯 **Demo Code**: Get complete runnable HTML/CSS code from CSS-Inspiration
- 🏷️ **Smart Categories**: Browse by technology type and difficulty level
- 🎲 **Random Discovery**: Get random techniques or demo examples
- 🔧 **Code Snippets**: Extract and manage CSS/HTML code blocks
- 🚀 **Easy Integration**: Auto-configures with Cursor IDE
- 📊 **Performance Analysis**: Browser compatibility and performance insights

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

#### iCSS Articles
- *"Show me CSS techniques for flex layout"*
- *"Find articles about CSS animations from iCSS"*
- *"How to create gradient borders with CSS?"*
- *"Get details for issue #80"*

#### CSS-Inspiration Demos
- *"Search for 3D effect demonstrations"*
- *"Find animation demos with complete code"*
- *"Show border effect examples"*
- *"Get complete code for demo ID #25"*

#### General Features
- *"Get a random CSS tip"*
- *"What CSS technique categories are available?"*
- *"Show all CSS-Inspiration categories"*
- *"Random animation demo"*

### MCP Functions Available

| Function | Description | Parameters |
|----------|-------------|------------|
| `search_css_techniques` | Search iCSS technique articles | `query`, `limit` (optional) |
| `search_css_demos` | Search CSS-Inspiration demos | `query`, `category` (optional), `difficulty` (optional), `limit` (optional) |
| `get_css_article` | Get full iCSS article content | `issue_number` |
| `get_css_demo` | Get complete demo with code | `demo_id` |
| `list_css_categories` | List all available categories | `source` (optional): icss/inspiration/all |
| `get_random_css_tip` | Get random technique or demo | `source` (optional): icss/inspiration/both |

## 🔧 CLI Commands

After installation, these commands are available:

```bash
# Start MCP server
icss-mcp

# Install/configure for Cursor
icss-mcp-install

# Run setup (create database, fetch data)
npm run setup

# Fetch iCSS article data
npm run build

# Fetch CSS-Inspiration demo data
npm run build:inspiration

# Fetch all data
npm run build:all

# Test server functionality
npm test
```

## 📊 Data Source

### iCSS Technique Library
- **270+ high-quality CSS articles** covering animations, layouts, effects, and performance
- Comprehensive technique explanations with detailed examples
- Source: [iCSS repository](https://github.com/chokcoco/iCSS)

### CSS-Inspiration Demo Library
- **14 categories** of complete CSS demonstrations
- Runnable HTML/CSS code with live examples
- **Difficulty levels**: Beginner, Intermediate, Advanced
- **Browser compatibility** information included
- Source: [CSS-Inspiration repository](https://github.com/chokcoco/CSS-Inspiration)

### Technical Features
- **Fuzzy search** with intelligent matching
- **Smart categorization** by technology and difficulty
- **Automatic code extraction** and snippet management
- **Performance analysis** and browser compatibility insights
- **Regular updates** from both repositories

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
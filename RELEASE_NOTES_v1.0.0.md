# ChatPorter v1.0.0 🚀

**First official release!**

ChatPorter is a CLI utility that imports your local codebases, repositories, and directories directly into v0.dev chats via the Platform API.

## ✨ Features

- 📁 **Import local directories** - Bring your entire local codebase into v0.dev
- 📦 **Import GitHub repositories** - Import repos directly from GitHub URLs
- 📎 **Import zip archives** - Import code from zip archive URLs
- 📄 **Upload individual files** - Import specific markdown or code files
- 🚀 **Create v0 chats via Platform API** - Directly creates chats in v0.dev
- 🔗 **Automatic browser opening** - Opens your new chat automatically
- 🔒 **File locking options** - Lock files to prevent AI modifications
- ⚡ Fast, lightweight, zero-config CLI

## 📦 Installation

```bash
npm install -g chatporter
```

Or use it directly with `npx`:

```bash
npx chatporter
```

## 🚀 Quick Start

```bash
# Set your API key first
export V0_API_KEY=your_api_key_here

# Import entire local directory into v0
chatporter dir ./my-project

# Import GitHub repository
chatporter repo https://github.com/username/my-project

# Import from zip URL
chatporter zip https://github.com/username/project/archive/main.zip
```

## 📚 Documentation

Full documentation available at: https://github.com/pstagner/ChatPorter#readme

## 🔗 Links

- **Repository**: https://github.com/pstagner/ChatPorter
- **Issues**: https://github.com/pstagner/ChatPorter/issues
- **npm**: https://www.npmjs.com/package/chatporter

## 📄 License

MIT


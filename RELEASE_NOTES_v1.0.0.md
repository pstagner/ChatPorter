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

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


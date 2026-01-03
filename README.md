# ChatPorter 🚀

**Import repositories and directories from your local machine into v0.dev chats**

ChatPorter is a CLI utility that imports your local codebases, repositories, and directories directly into v0.dev chats via the Platform API. Perfect for bringing your entire project context into v0 for AI-assisted development, code review, and technical discussions.

## Features

- 📁 **Import local directories** - Bring your entire local codebase into v0.dev
- 📦 **Import GitHub repositories** - Import repos directly from GitHub URLs
- 📎 **Import zip archives** - Import code from zip archive URLs
- 📄 **Upload individual files** - Import specific markdown or code files
- 🚀 **Create v0 chats via Platform API** - Directly creates chats in v0.dev
- 🔗 **Automatic browser opening** - Opens your new chat automatically
- 🔒 **File locking options** - Lock files to prevent AI modifications
- ⚡ Fast, lightweight, zero-config CLI

## Installation

```bash
npm install -g chatporter
```

Or use it directly with `npx`:

```bash
npx chatporter
```

## Quick Start

### Import Local Directory (Most Common!)

```bash
# Set your API key first
export V0_API_KEY=your_api_key_here

# Import entire local directory into v0
chatporter dir ./my-project

# With custom chat name
chatporter dir ./my-project --name "My Project"
```

### Import GitHub Repository

```bash
# Set your API key first
export V0_API_KEY=your_api_key_here

# Import entire GitHub repository
chatporter repo https://github.com/username/my-project

# With custom branch and name
chatporter repo https://github.com/username/my-project --branch develop --name "My Project Dev"

# Lock all files from AI modification
chatporter repo https://github.com/username/my-project --lock-all-files
```


### Import Zip Archive

```bash
# Import from zip URL
chatporter zip https://github.com/username/project/archive/main.zip

# With custom name
chatporter zip https://github.com/username/project/archive/main.zip --name "Project Archive"
```

### Upload Individual Files

```bash
# Create v0 chat from markdown files
chatporter upload docs/*.md --platform v0 --api

# With custom name and locked files
chatporter upload docs/*.md --platform v0 --api --name "Project Docs" --lock-files
```

### Interactive mode

```bash
chatporter
```

This will prompt you to:
1. Select files to upload
2. Choose your target platform (v0 API, v0 formatted, ChatGPT, Claude, etc.)
3. Create chat via API or generate formatted output

## Usage

### Basic Upload

```bash
chatporter upload <file1> [file2] [file3...]
```

### Format for Specific Platform

```bash
chatporter upload docs/timeline.md --platform v0
chatporter upload docs/task-list.md --platform chatgpt
```

### Output to File

```bash
chatporter upload docs/*.md --output formatted-context.txt
```

### Open Directly

```bash
chatporter upload docs/spec.md --open v0
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
V0_API_KEY=your_v0_api_key_here
```

Get your API key from: https://v0.app/settings/api

### Config File

Create a `.chatporterrc.json` file in your project root:

```json
{
  "defaultPlatform": "v0",
  "includeMetadata": true,
  "format": "concise",
  "maxFileSize": "10MB"
}
```

## Examples

### Import Local Codebase (Primary Use Case)

```bash
# Import your local project directory
chatporter dir ./my-project

# Import with custom name
chatporter dir ./my-project --name "Production Codebase"

# Import and lock all files from modification
chatporter dir ./my-project --lock-all-files
```

### Import from GitHub

```bash
# Import GitHub repository
chatporter repo https://github.com/yourusername/your-project

# Import specific branch
chatporter repo https://github.com/yourusername/your-project --branch develop
```

### Import from Zip Archive

```bash
# Import from zip URL
chatporter zip https://github.com/user/repo/archive/main.zip
```

### Upload Individual Files

```bash
# Upload markdown files to v0
chatporter upload docs/*.md --platform v0 --api

# Upload specific files with custom name
chatporter upload docs/timeline.md docs/task-list.md --platform v0 --api --name "Project Timeline"
```

## How It Works

1. **Scans** your local directory or repository for files
2. **Reads** all code and documentation files (excluding node_modules, .git, etc.)
3. **Uploads** files to v0.dev via the Platform API
4. **Creates** a new chat session with your codebase as context
5. **Opens** the chat in your browser automatically

## Platform Support

- ✅ **v0.dev** (Primary) - Direct API integration for creating chats
- 📝 **Formatted output** - Also supports generating formatted text for ChatGPT, Claude, Cursor AI

## License

MIT

## Contributing

This is a standalone utility. Feel free to fork and adapt for your needs!


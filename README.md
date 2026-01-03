# ChatPorter 🚀

**Port your markdown documents into AI chat conversations**

ChatPorter is a lightweight CLI utility that helps you quickly upload markdown files as context for new AI chat sessions. Perfect for sharing technical documentation, project specs, timelines, and task lists with AI assistants like v0, ChatGPT, Claude, and more.

## Features

- 📄 Upload single or multiple markdown files
- 🚀 **Create actual v0 chats via Platform API**
- 📦 **Import entire GitHub repositories** (new!)
- 📁 **Import local directories** (new!)
- 📎 **Import zip archives from URLs** (new!)
- 🎯 Format documents for optimal AI consumption
- 🔗 Generate shareable chat links (v0, ChatGPT, etc.)
- ⚡ Fast, lightweight, zero-config CLI
- 🔄 Reusable across all your projects

## Installation

```bash
npm install -g chatporter
```

Or use it directly with `npx`:

```bash
npx chatporter
```

## Quick Start

### Upload a single file

```bash
chatporter upload docs/spec-integration-summary.md
```

### Upload multiple files

```bash
chatporter upload docs/*.md
```

### Import GitHub Repository (Recommended!)

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

### Import Local Directory

```bash
# Import entire local directory
chatporter dir ./my-project

# With custom name
chatporter dir ./my-project --name "Local Project"
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
# Create actual v0 chat from files
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

### Import Entire Repository

```bash
# Import GitHub repo (most common use case)
chatporter repo https://github.com/yourusername/your-project

# Import local directory
chatporter dir ../my-project

# Import from zip archive
chatporter zip https://github.com/user/repo/archive/main.zip
```

### Upload Individual Files

```bash
# Upload all docs
chatporter upload docs/*.md --platform v0 --api

# Upload specific files
chatporter upload docs/timeline.md docs/task-list.md --platform v0 --api --name "Project Timeline"
```

### Share with team

```bash
# Generate formatted output to share (without API)
chatporter upload docs/architecture.md --output share.txt
```

## How It Works

1. **Reads** your markdown files
2. **Formats** them with proper headers and structure
3. **Combines** multiple files into a cohesive context
4. **Outputs** formatted text ready for AI chat or opens directly

## Platform Support

- ✅ v0.dev
- ✅ ChatGPT
- ✅ Claude (Anthropic)
- ✅ Cursor AI
- ✅ Custom (formatted text)

## License

MIT

## Contributing

This is a standalone utility. Feel free to fork and adapt for your needs!


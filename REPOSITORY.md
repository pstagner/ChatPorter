# Repository Import Guide

ChatPorter supports importing entire repositories into v0 chats, exactly as described in the [v0 Platform API documentation](https://v0.app/docs/api/platform/guides/start-from-existing-code).

## Supported Import Types

### 1. GitHub Repositories

Import directly from public or private GitHub repositories:

```bash
chatporter repo https://github.com/username/my-react-app
```

**Options:**
- `--branch <branch>` - Specify git branch (default: `main`)
- `--name <name>` - Custom chat name
- `--project-id <id>` - Associate with v0 project
- `--lock-all-files` - Lock all files from AI modification
- `--no-open` - Don't open browser after creation

**Example:**
```bash
chatporter repo https://github.com/username/my-app \
  --branch develop \
  --name "Development Branch" \
  --lock-all-files
```

### 2. Local Directories

Import your entire local project directory:

```bash
chatporter dir ./my-project
```

**How it works:**
- Recursively walks the directory
- Automatically excludes: `node_modules`, `.git`, `.next`, `dist`, `build`, etc.
- Reads all text files (skips binary files)
- Uploads everything to v0

**Options:**
- `--name <name>` - Custom chat name
- `--project-id <id>` - Associate with v0 project
- `--lock-files` - Lock individual files from AI modification
- `--lock-all-files` - Lock all files from AI modification
- `--no-open` - Don't open browser after creation

**Example:**
```bash
chatporter dir ../Cherry \
  --name "Cherry Project" \
  --lock-all-files
```

### 3. Zip Archives

Import from zip archive URLs:

```bash
chatporter zip https://github.com/username/project/archive/refs/heads/main.zip
```

**Options:**
- `--name <name>` - Custom chat name
- `--project-id <id>` - Associate with v0 project
- `--lock-all-files` - Lock all files from AI modification
- `--no-open` - Don't open browser after creation

**Example:**
```bash
chatporter zip https://github.com/user/repo/archive/main.zip \
  --name "Project Archive"
```

## Auto-Detection

The `upload` command automatically detects repository URLs and directories:

```bash
# GitHub URL - automatically uses repo import
chatporter upload https://github.com/user/repo --platform v0 --api

# Directory path - automatically uses directory import
chatporter upload ./my-project --platform v0 --api

# Individual files - uses file upload
chatporter upload docs/*.md --platform v0 --api
```

## Use Cases

### Import Your Current Project

```bash
# From your project root
cd /path/to/your-project
chatporter dir . --name "My Project"
```

### Import from GitHub

```bash
# Public repository
chatporter repo https://github.com/vercel/next.js

# Specific branch
chatporter repo https://github.com/user/repo --branch feature-branch
```

### Import Cherry Project

```bash
# From Cherry directory
cd /Users/stagner/workspace/Cherry
chatporter dir . --name "Cherry Escrow Platform"
```

## File Locking

Control which files the AI can modify:

```bash
# Lock all files (read-only)
chatporter repo https://github.com/user/repo --lock-all-files

# Lock individual files (for directory imports)
chatporter dir ./project --lock-files
```

## Project Association

Associate chats with v0 projects:

```bash
chatporter repo https://github.com/user/repo \
  --project-id your-project-id \
  --name "Project Chat"
```

## Interactive Mode

Use interactive mode for guided repository imports:

```bash
chatporter
# Select "GitHub Repository", "Local Directory", or "Zip Archive URL"
# Follow prompts
```

## Best Practices

1. **Use descriptive names**: `--name "Project Name - Feature Branch"`
2. **Lock important files**: Use `--lock-all-files` for production code
3. **Specify branches**: Use `--branch` for GitHub imports to get the right code
4. **Associate with projects**: Use `--project-id` to organize chats

## API Reference

All repository imports use the v0 Platform API `chats.init()` method:

- **Repositories**: `type: 'repo'`
- **Directories**: `type: 'files'` (with all directory files)
- **Zip Archives**: `type: 'zip'`

See the [v0 Platform API documentation](https://v0.app/docs/api/platform/guides/start-from-existing-code) for details.

## Troubleshooting

**Issue**: `Repository not found` or `401 Unauthorized`
- **Solution**: Check that the repository is accessible and your API key is valid

**Issue**: `Directory is empty`
- **Solution**: Ensure the directory contains files and isn't excluded by ignore patterns

**Issue**: `Too many files`
- **Solution**: v0 may have limits on file count. Try importing a subset or use a zip archive

**Issue**: `Binary files skipped`
- **Solution**: This is expected. Only text files are imported. Binary files are automatically skipped.


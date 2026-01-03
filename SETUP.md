# ChatPorter Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Make CLI executable (if needed):**
   ```bash
   chmod +x bin/chatporter.js
   chmod +x src/index.js
   ```

3. **Test it:**
   ```bash
   # Using node directly
   node src/index.js upload EXAMPLE.md --platform v0
   
   # Or use interactive mode
   node src/index.js
   ```

## Installation Options

### Option 1: Global Install (Recommended)

```bash
npm install -g .
```

Then use from anywhere:
```bash
chatporter upload docs/*.md
```

### Option 2: Use with npx

```bash
npx chatporter upload docs/*.md
```

### Option 3: Local Development

```bash
# Install dependencies
npm install

# Run directly
node src/index.js upload <files>
```

## Usage Examples

### Upload Cherry project docs to v0

```bash
cd /path/to/Cherry
chatporter upload docs/spec-integration-summary.md docs/timeline.md docs/task-list.md --platform v0 --output context.txt
```

### Interactive mode

```bash
chatporter
# Follow prompts to select files and platform
```

### Quick upload and open

```bash
chatporter upload docs/*.md --platform v0 --open v0
```

## Moving to Separate Repo

This project is designed to be completely standalone. To move it to its own GitHub repo:

1. **Initialize git:**
   ```bash
   cd ChatPorter
   git init
   git add .
   git commit -m "Initial commit: ChatPorter utility"
   ```

2. **Create GitHub repo** and push:
   ```bash
   git remote add origin <your-repo-url>
   git branch -M main
   git push -u origin main
   ```

3. **Publish to npm (optional):**
   ```bash
   npm login
   npm publish
   ```

## Project Structure

```
ChatPorter/
├── bin/
│   └── chatporter.js      # CLI entry point
├── src/
│   └── index.js           # Main logic
├── package.json           # Dependencies & config
├── README.md              # User documentation
├── SETUP.md               # This file
├── LICENSE                 # MIT license
└── .chatporterrc.json     # Default config
```

## Configuration

Edit `.chatporterrc.json` to customize defaults:

```json
{
  "defaultPlatform": "v0",
  "includeMetadata": true,
  "format": "concise",
  "maxFileSize": "10MB"
}
```

## Troubleshooting

**Issue:** `command not found: chatporter`
- **Solution:** Use `node src/index.js` directly or install globally with `npm install -g .`

**Issue:** Permission denied
- **Solution:** Run `chmod +x bin/chatporter.js src/index.js`

**Issue:** Module not found errors
- **Solution:** Run `npm install` to install dependencies

## Next Steps

1. Test with your own markdown files
2. Customize platform formatters if needed
3. Add to your project's workflow
4. Share with your team!


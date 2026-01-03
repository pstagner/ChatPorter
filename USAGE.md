# ChatPorter Usage Examples

## Using with Cherry Project

From the Cherry project root, you can upload documentation to AI chats:

```bash
# Navigate to ChatPorter
cd ChatPorter

# Install dependencies (first time only)
npm install

# Set your v0 API key (first time only)
export V0_API_KEY=your_api_key_here
# Or create .env file with: V0_API_KEY=your_api_key_here

# Create actual v0 chat via API (Recommended!)
node src/index.js upload ../docs/spec-integration-summary.md ../docs/timeline.md ../docs/task-list.md --platform v0 --api

# With custom name
node src/index.js upload ../docs/*.md --platform v0 --api --name "Cherry Project Docs"

# Save formatted output (fallback mode)
node src/index.js upload ../docs/*.md --platform v0 --output ../chat-context.txt

# Interactive mode
node src/index.js
```

## Common Workflows

### 1. Upload Project Specs to v0

```bash
chatporter upload docs/spec-integration-summary.md docs/timeline.md --platform v0 --output v0-context.txt
```

### 2. Share Documentation with Team

```bash
chatporter upload docs/architecture.md docs/data-model.md --platform raw --output shared-context.txt
```

### 3. Quick Context for ChatGPT

```bash
chatporter upload README.md docs/setup.md --platform chatgpt
```

### 4. Multiple Files with Metadata

```bash
chatporter upload docs/*.md --platform v0 --output full-context.txt
```

## Platform-Specific Tips

### v0.dev
- Best for: Technical specs, architecture docs, task lists
- Format: Includes file list header, clean markdown
- Usage: Copy output and paste into v0 chat

### ChatGPT
- Best for: General documentation, explanations
- Format: Includes friendly intro message
- Usage: Paste directly into new chat

### Claude
- Best for: Long-form documentation, analysis
- Format: XML-style document tags
- Usage: Paste into Claude chat

### Cursor AI
- Best for: Code-related documentation
- Format: Comment-style header
- Usage: Use in Cursor chat interface

## Advanced Usage

### Custom Output Format

Edit `src/index.js` to add custom formatters:

```javascript
const platformFormatters = {
  // ... existing formatters
  custom: (content, metadata) => {
    return `CUSTOM FORMAT\n\n${content}`;
  },
};
```

### Batch Processing

Create a script to upload multiple project docs:

```bash
#!/bin/bash
# upload-all.sh

chatporter upload \
  docs/spec-integration-summary.md \
  docs/timeline.md \
  docs/task-list.md \
  docs/architecture.md \
  --platform v0 \
  --output all-docs-context.txt
```

## Tips

1. **File Size**: Large files (>10MB) may need chunking
2. **Multiple Files**: Use glob patterns: `docs/*.md`
3. **Output**: Always save to file for sharing: `--output context.txt`
4. **Platform**: Choose based on your AI assistant's preferences

## Integration Ideas

- Add to your project's `package.json` scripts
- Create GitHub Actions to auto-generate context
- Use in CI/CD for documentation updates
- Share with team members for onboarding


# v0 Platform API Integration

ChatPorter integrates with the [v0 Platform API](https://v0.app/docs/api/platform) to create actual chat sessions from your markdown files.

## API Reference

Based on the [v0 Platform API documentation](https://v0.app/docs/api/platform/guides/start-from-existing-code), ChatPorter uses the `chats.init()` method to create chats from files.

## Authentication

Get your API key from: https://v0.app/settings/api

Set it as an environment variable:
```bash
export V0_API_KEY=your_api_key_here
```

Or use the `--api-key` option:
```bash
chatporter upload docs/*.md --api --api-key your_key
```

## API Endpoints

ChatPorter uses the following v0 Platform API endpoints:

- **Create Chat**: `POST /v1/chats/init`
  - Creates a new chat session with uploaded files
  - Returns chat ID and URL

## Implementation Details

### SDK vs Direct API

ChatPorter tries to use the `v0-sdk` package first (if installed), then falls back to direct HTTP API calls. This ensures compatibility even if the SDK package structure changes.

### File Format

Files are uploaded in the format expected by v0:

```javascript
{
  type: 'files',
  files: [
    {
      name: 'docs/filename.md',
      content: 'file content...',
      locked: false  // Whether AI can modify this file
    }
  ],
  name: 'Chat Name',
  lockAllFiles: false,
  projectId: 'optional-project-id'
}
```

### Response Format

Successful API calls return:

```javascript
{
  id: 'chat-id',
  // ... other chat properties
}
```

The chat URL is: `https://v0.dev/chat/{chat.id}`

## Error Handling

ChatPorter handles common API errors:

- **401 Unauthorized**: Invalid or missing API key
- **400 Bad Request**: Invalid file format or payload
- **Network Errors**: Connection issues

All errors are displayed with helpful messages and suggestions.

## Rate Limits

Refer to the [v0 Platform API rate limits](https://v0.app/docs/api/platform/rate-limits) documentation for current limits.

## Examples

### Basic API Usage

```bash
# Set API key
export V0_API_KEY=your_key

# Create chat
chatporter upload docs/*.md --api
```

### With Options

```bash
chatporter upload docs/*.md \
  --api \
  --name "Project Documentation" \
  --lock-files \
  --project-id your-project-id
```

### Interactive Mode

```bash
chatporter
# Select "v0.dev (API)" option
# Enter API key if not set
```

## Troubleshooting

**Issue**: `V0_API_KEY not found`
- **Solution**: Set the environment variable or use `--api-key` option

**Issue**: `API Error: 401`
- **Solution**: Check that your API key is valid and not expired

**Issue**: `v0-sdk not found`
- **Solution**: This is fine - ChatPorter will use direct HTTP calls

**Issue**: `Network error`
- **Solution**: Check your internet connection and firewall settings

## References

- [v0 Platform API Docs](https://v0.app/docs/api/platform)
- [Start from Existing Code Guide](https://v0.app/docs/api/platform/guides/start-from-existing-code)
- [v0 SDK Package](https://www.npmjs.com/package/v0-sdk)


#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { readFile, stat, readdir } from 'fs/promises';
import { join, resolve, extname, basename, relative, dirname as pathDirname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import open from 'open';
import dotenv from 'dotenv';
import { existsSync, createReadStream } from 'fs';
import archiver from 'archiver';
import { glob } from 'glob';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

// Platform formatters
const platformFormatters = {
  v0: (content, metadata) => formatForV0(content, metadata),
  chatgpt: (content, metadata) => formatForChatGPT(content, metadata),
  claude: (content, metadata) => formatForClaude(content, metadata),
  cursor: (content, metadata) => formatForCursor(content, metadata),
  raw: (content, metadata) => formatRaw(content, metadata),
};

// Format content for v0.dev
function formatForV0(content, metadata) {
  let formatted = `# Context Upload\n\n`;
  
  if (metadata.files.length > 1) {
    formatted += `## Files Included\n\n`;
    metadata.files.forEach((file, idx) => {
      formatted += `${idx + 1}. \`${file.name}\`\n`;
    });
    formatted += `\n---\n\n`;
  }
  
  formatted += content;
  
  return formatted;
}

// Format content for ChatGPT
function formatForChatGPT(content, metadata) {
  let formatted = `I'm sharing ${metadata.files.length} document${metadata.files.length > 1 ? 's' : ''} for context:\n\n`;
  
  metadata.files.forEach((file, idx) => {
    formatted += `## Document ${idx + 1}: ${file.name}\n\n`;
  });
  
  formatted += `\n---\n\n${content}`;
  
  return formatted;
}

// Format content for Claude
function formatForClaude(content, metadata) {
  let formatted = `<documents>\n`;
  
  metadata.files.forEach((file) => {
    formatted += `<document name="${file.name}">\n`;
  });
  
  formatted += `</documents>\n\n${content}`;
  
  return formatted;
}

// Format content for Cursor
function formatForCursor(content, metadata) {
  let formatted = `// Context from ${metadata.files.length} file${metadata.files.length > 1 ? 's' : ''}\n\n`;
  formatted += content;
  return formatted;
}

// Raw format (just the content)
function formatRaw(content, metadata) {
  return content;
}

// Read and combine markdown files
async function readMarkdownFiles(filePaths) {
  const files = [];
  const contents = [];
  
  for (const filePath of filePaths) {
    try {
      const fullPath = resolve(filePath);
      const stats = await stat(fullPath);
      
      if (!stats.isFile()) {
        console.warn(chalk.yellow(`Skipping ${filePath}: not a file`));
        continue;
      }
      
      if (extname(filePath).toLowerCase() !== '.md') {
        console.warn(chalk.yellow(`Skipping ${filePath}: not a markdown file`));
        continue;
      }
      
      const content = await readFile(fullPath, 'utf-8');
      files.push({
        name: basename(filePath),
        path: filePath,
        size: stats.size,
      });
      
      contents.push({
        name: basename(filePath),
        content: content,
      });
    } catch (error) {
      console.error(chalk.red(`Error reading ${filePath}: ${error.message}`));
    }
  }
  
  return { files, contents };
}

// Combine multiple markdown files into one formatted string
function combineMarkdownFiles(fileContents) {
  if (fileContents.length === 1) {
    return fileContents[0].content;
  }
  
  let combined = '';
  
  fileContents.forEach((file, index) => {
    if (index > 0) {
      combined += '\n\n---\n\n';
    }
    combined += `# ${file.name}\n\n${file.content}`;
  });
  
  return combined;
}

// Check if a path is a GitHub URL
function isGitHubUrl(url) {
  return /^https?:\/\/(www\.)?github\.com\/[\w\-\.]+\/[\w\-\.]+/.test(url);
}

// Check if a path is a directory
async function isDirectory(path) {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

// Walk directory and collect all files (excluding node_modules, .git, etc.)
async function walkDirectory(dirPath, basePath = dirPath) {
  const files = [];
  const ignorePatterns = [
    'node_modules',
    '.git',
    '.next',
    '.vercel',
    'dist',
    'build',
    '.DS_Store',
    '*.log',
    '.env',
    '.env.local',
    'coverage',
    '.nyc_output',
  ];
  
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      const relativePath = relative(basePath, fullPath);
      
      // Skip ignored patterns
      if (ignorePatterns.some(pattern => {
        if (pattern.includes('*')) {
          return entry.name.match(new RegExp(pattern.replace('*', '.*')));
        }
        return entry.name === pattern || relativePath.includes(pattern);
      })) {
        continue;
      }
      
      if (entry.isDirectory()) {
        // Recursively walk subdirectories
        const subFiles = await walkDirectory(fullPath, basePath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        try {
          const content = await readFile(fullPath, 'utf-8');
          files.push({
            name: relativePath,
            content: content,
            path: fullPath,
          });
        } catch (error) {
          // Skip binary files or files that can't be read
          console.warn(chalk.yellow(`  Skipping ${relativePath}: ${error.message}`));
        }
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error reading directory ${dirPath}: ${error.message}`));
  }
  
  return files;
}

// Create v0 chat from GitHub repository
async function createV0ChatFromRepo(repoUrl, options) {
  const apiKey = process.env.V0_API_KEY || options.apiKey;
  
  if (!apiKey) {
    throw new Error(
      'V0_API_KEY not found. Set it in your environment or use --api-key option.\n' +
      'Get your API key from: https://v0.app/settings/api'
    );
  }
  
  // Try using v0-sdk first
  try {
    const { v0, createClient } = await import('v0-sdk');
    
    console.log(chalk.blue(`🚀 Creating v0 chat from repository: ${repoUrl}\n`));
    
    // Create client with API key (SDK will use env var if not provided)
    const v0Client = createClient({ apiKey });
    
    const chat = await v0Client.chats.init({
      type: 'repo',
      repo: {
        url: repoUrl,
        branch: options.branch || undefined,
      },
      name: options.name || `ChatPorter: ${basename(repoUrl)}`,
      projectId: options.projectId || undefined,
      lockAllFiles: options.lockAllFiles || false,
    });
    
    console.log(chalk.green(`✓ Chat created successfully!`));
    console.log(chalk.cyan(`  Chat ID: ${chat.id}`));
    console.log(chalk.cyan(`  Chat URL: https://v0.dev/chat/${chat.id}`));
    
    if (options.open !== false) {
      await open(`https://v0.dev/chat/${chat.id}`);
      console.log(chalk.green(`\n🌐 Opened chat in browser`));
    }
    
    return chat;
  } catch (sdkError) {
    // Log SDK error for debugging
    if (sdkError.code !== 'ERR_MODULE_NOT_FOUND') {
      console.log(chalk.yellow(`⚠ SDK error: ${sdkError.message}`));
      console.log(chalk.gray('  Falling back to direct API calls...\n'));
    }
    return await createV0ChatFromRepoDirect(repoUrl, { ...options, apiKey });
  }
}

// Direct HTTP implementation for repository import
async function createV0ChatFromRepoDirect(repoUrl, options) {
  const apiKey = options.apiKey;
  // Use correct v0 API endpoint (from SDK source: https://api.v0.dev/v1)
  const apiUrl = process.env.V0_API_URL || 'https://api.v0.dev/v1/chats/init';
  
  console.log(chalk.blue(`🚀 Creating v0 chat from repository: ${repoUrl}\n`));
  console.log(chalk.gray(`  Using direct API calls (SDK fallback)\n`));
  
  const payload = {
    type: 'repo',
    repo: {
      url: repoUrl,
    },
    name: options.name || `ChatPorter: ${basename(repoUrl)}`,
    lockAllFiles: options.lockAllFiles || false,
  };
  
  if (options.branch) {
    payload.repo.branch = options.branch;
  }
  
  if (options.projectId) {
    payload.projectId = options.projectId;
  }
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || response.statusText };
      }
      throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
    }
    
    const chat = await response.json();
    
    console.log(chalk.green(`✓ Chat created successfully!`));
    console.log(chalk.cyan(`  Chat ID: ${chat.id}`));
    console.log(chalk.cyan(`  Chat URL: https://v0.dev/chat/${chat.id}`));
    
    if (options.open !== false) {
      await open(`https://v0.dev/chat/${chat.id}`);
      console.log(chalk.green(`\n🌐 Opened chat in browser`));
    }
    
    return chat;
  } catch (error) {
    console.error(chalk.red(`\n✗ Error creating v0 chat: ${error.message}`));
    console.error(chalk.yellow(`\n💡 Tips:`));
    console.error(chalk.yellow(`  1. Verify your API key is correct: https://v0.app/settings/api`));
    console.error(chalk.yellow(`  2. Check that the repository URL is accessible`));
    console.error(chalk.yellow(`  3. API endpoint: ${apiUrl}`));
    throw error;
  }
}

// Create v0 chat from local directory
async function createV0ChatFromDirectory(dirPath, options) {
  console.log(chalk.blue(`📁 Reading directory: ${dirPath}\n`));
  
  const files = await walkDirectory(resolve(dirPath));
  
  if (files.length === 0) {
    throw new Error('No files found in directory');
  }
  
  console.log(chalk.green(`✓ Found ${files.length} file(s) in directory`));
  
  // Convert to fileContents format
  const fileContents = files.map(file => ({
    name: file.name,
    content: file.content,
  }));
  
  // Use the existing file upload function
  return await createV0Chat(fileContents, {
    ...options,
    name: options.name || `ChatPorter: ${basename(dirPath)}`,
  });
}

// Create v0 chat from zip URL
async function createV0ChatFromZip(zipUrl, options) {
  const apiKey = process.env.V0_API_KEY || options.apiKey;
  
  if (!apiKey) {
    throw new Error(
      'V0_API_KEY not found. Set it in your environment or use --api-key option.\n' +
      'Get your API key from: https://v0.app/settings/api'
    );
  }
  
  // Try using v0-sdk first
  try {
    const { createClient } = await import('v0-sdk');
    
    console.log(chalk.blue(`🚀 Creating v0 chat from zip archive: ${zipUrl}\n`));
    
    // Create client with API key
    const v0Client = createClient({ apiKey });
    
    const chat = await v0Client.chats.init({
      type: 'zip',
      zip: {
        url: zipUrl,
      },
      name: options.name || `ChatPorter: Zip Archive`,
      projectId: options.projectId || undefined,
      lockAllFiles: options.lockAllFiles || false,
    });
    
    console.log(chalk.green(`✓ Chat created successfully!`));
    console.log(chalk.cyan(`  Chat ID: ${chat.id}`));
    console.log(chalk.cyan(`  Chat URL: https://v0.dev/chat/${chat.id}`));
    
    if (options.open !== false) {
      await open(`https://v0.dev/chat/${chat.id}`);
      console.log(chalk.green(`\n🌐 Opened chat in browser`));
    }
    
    return chat;
  } catch (sdkError) {
    return await createV0ChatFromZipDirect(zipUrl, { ...options, apiKey });
  }
}

// Direct HTTP implementation for zip import
async function createV0ChatFromZipDirect(zipUrl, options) {
  const apiKey = options.apiKey;
  const apiUrl = process.env.V0_API_URL || 'https://api.v0.dev/v1/chats/init';
  
  console.log(chalk.blue(`🚀 Creating v0 chat from zip archive: ${zipUrl}\n`));
  
  const payload = {
    type: 'zip',
    zip: {
      url: zipUrl,
    },
    name: options.name || `ChatPorter: Zip Archive`,
    lockAllFiles: options.lockAllFiles || false,
  };
  
  if (options.projectId) {
    payload.projectId = options.projectId;
  }
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || response.statusText };
      }
      throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
    }
    
    const chat = await response.json();
    
    console.log(chalk.green(`✓ Chat created successfully!`));
    console.log(chalk.cyan(`  Chat ID: ${chat.id}`));
    console.log(chalk.cyan(`  Chat URL: https://v0.dev/chat/${chat.id}`));
    
    if (options.open !== false) {
      await open(`https://v0.dev/chat/${chat.id}`);
      console.log(chalk.green(`\n🌐 Opened chat in browser`));
    }
    
    return chat;
  } catch (error) {
    console.error(chalk.red(`\n✗ Error creating v0 chat: ${error.message}`));
    throw error;
  }
}

// Create v0 chat via API
// Uses direct HTTP calls based on v0 Platform API documentation
// Reference: https://v0.app/docs/api/platform/guides/start-from-existing-code
async function createV0Chat(fileContents, options) {
  const apiKey = process.env.V0_API_KEY || options.apiKey;
  
  if (!apiKey) {
    throw new Error(
      'V0_API_KEY not found. Set it in your environment or use --api-key option.\n' +
      'Get your API key from: https://v0.app/settings/api'
    );
  }
  
  // Try using v0-sdk first (if available and properly configured)
  try {
    const { createClient } = await import('v0-sdk');
    
    console.log(chalk.blue('🚀 Creating v0 chat via SDK...\n'));
    
    // Create client with API key
    const v0Client = createClient({ apiKey });
    
    // Prepare files for v0 API
    const v0Files = fileContents.map((file) => ({
      name: `docs/${file.name}`,
      content: file.content,
      locked: options.lockFiles || false,
    }));
    
    const chat = await v0Client.chats.init({
      type: 'files',
      files: v0Files,
      name: options.name || `ChatPorter: ${fileContents.length} file(s)`,
      projectId: options.projectId || undefined,
      lockAllFiles: options.lockAllFiles || false,
    });
    
    console.log(chalk.green(`✓ Chat created successfully!`));
    console.log(chalk.cyan(`  Chat ID: ${chat.id}`));
    console.log(chalk.cyan(`  Chat URL: https://v0.dev/chat/${chat.id}`));
    
    // Open in browser if requested
    if (options.open !== false) {
      await open(`https://v0.dev/chat/${chat.id}`);
      console.log(chalk.green(`\n🌐 Opened chat in browser`));
    }
    
    return chat;
  } catch (sdkError) {
    // Fallback to direct HTTP API calls if SDK fails
    if (sdkError.code === 'ERR_MODULE_NOT_FOUND') {
      console.log(chalk.gray('ℹ v0-sdk not found, using direct API calls\n'));
    } else {
      console.log(chalk.yellow(`⚠ SDK error, falling back to direct API: ${sdkError.message}\n`));
    }
    
    return await createV0ChatDirect(fileContents, { ...options, apiKey });
  }
}

// Direct HTTP implementation for v0 Platform API
// API Reference: https://v0.app/docs/api/platform
async function createV0ChatDirect(fileContents, options) {
  const apiKey = options.apiKey;
  // v0 Platform API endpoint (may need to verify actual endpoint)
  const apiUrl = process.env.V0_API_URL || 'https://api.v0.dev/v1/chats/init';
  
  console.log(chalk.blue('🚀 Creating v0 chat via API...\n'));
  
  // Prepare files for v0 API
  const v0Files = fileContents.map((file) => ({
    name: `docs/${file.name}`,
    content: file.content,
    locked: options.lockFiles || false,
  }));
  
  const payload = {
    type: 'files',
    files: v0Files,
    name: options.name || `ChatPorter: ${fileContents.length} file(s)`,
    lockAllFiles: options.lockAllFiles || false,
  };
  
  if (options.projectId) {
    payload.projectId = options.projectId;
  }
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || response.statusText };
      }
      throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
    }
    
    const chat = await response.json();
    
    console.log(chalk.green(`✓ Chat created successfully!`));
    console.log(chalk.cyan(`  Chat ID: ${chat.id}`));
    console.log(chalk.cyan(`  Chat URL: https://v0.dev/chat/${chat.id}`));
    
    // Open in browser if requested
    if (options.open !== false) {
      await open(`https://v0.dev/chat/${chat.id}`);
      console.log(chalk.green(`\n🌐 Opened chat in browser`));
    }
    
    return chat;
  } catch (error) {
    console.error(chalk.red(`\n✗ Error creating v0 chat: ${error.message}`));
    if (error.message.includes('fetch')) {
      console.error(chalk.yellow('  Tip: Check your internet connection and API endpoint'));
    }
    throw error;
  }
}

// Main upload function - detects type and routes accordingly
async function uploadFiles(filePaths, options) {
  // If single path and it's a GitHub URL, use repo import
  if (filePaths.length === 1 && isGitHubUrl(filePaths[0])) {
    if (options.useApi && options.platform === 'v0') {
      return await createV0ChatFromRepo(filePaths[0], options);
    } else {
      console.error(chalk.red('Repository imports require --api flag with --platform v0'));
      process.exit(1);
    }
  }
  
  // If single path and it's a directory, use directory import
  if (filePaths.length === 1) {
    const path = resolve(filePaths[0]);
    if (await isDirectory(path)) {
      if (options.useApi && options.platform === 'v0') {
        return await createV0ChatFromDirectory(path, options);
      } else {
        console.error(chalk.red('Directory imports require --api flag with --platform v0'));
        process.exit(1);
      }
    }
  }
  
  // Otherwise, treat as individual files
  console.log(chalk.blue('📦 ChatPorter: Reading files...\n'));
  
  const { files, contents } = await readMarkdownFiles(filePaths);
  
  if (files.length === 0) {
    console.error(chalk.red('No valid markdown files found.'));
    process.exit(1);
  }
  
  console.log(chalk.green(`✓ Found ${files.length} file(s):`));
  files.forEach((file) => {
    console.log(chalk.gray(`  - ${file.name} (${(file.size / 1024).toFixed(2)} KB)`));
  });
  
  // Use v0 API if requested
  if (options.useApi && options.platform === 'v0') {
    try {
      const chat = await createV0Chat(contents, options);
      return chat;
    } catch (error) {
      console.log(chalk.yellow('\n⚠ Falling back to text formatting...\n'));
      // Fall through to formatting mode
    }
  }
  
  // Format and output (fallback or non-API mode)
  const combinedContent = combineMarkdownFiles(contents);
  const platform = options.platform || 'raw';
  const formatter = platformFormatters[platform] || platformFormatters.raw;
  
  const formatted = formatter(combinedContent, { files });
  
  // Output to file if specified
  if (options.output) {
    const { writeFile } = await import('fs/promises');
    await writeFile(options.output, formatted, 'utf-8');
    console.log(chalk.green(`\n✓ Formatted content written to: ${options.output}`));
  } else {
    // Output to console
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.bold('Formatted Content:\n'));
    console.log(formatted);
    console.log(chalk.blue('\n' + '='.repeat(60)));
  }
  
  // Open in browser if requested
  if (options.open) {
    await openInPlatform(options.open, formatted);
  }
  
  return formatted;
}

// Open content in platform
async function openInPlatform(platform, content) {
  const urls = {
    v0: 'https://v0.dev/chat',
    chatgpt: 'https://chat.openai.com',
    claude: 'https://claude.ai',
    cursor: 'cursor://',
  };
  
  const url = urls[platform];
  if (url) {
    console.log(chalk.blue(`\n🌐 Opening ${platform}...`));
    // Note: Content would need to be passed via clipboard or API
    // For now, we'll just open the platform
    await open(url);
    console.log(chalk.yellow('💡 Tip: Copy the formatted content above and paste it into the chat.'));
  } else {
    console.warn(chalk.yellow(`Unknown platform: ${platform}`));
  }
}

// Interactive mode
async function interactiveMode() {
  console.log(chalk.bold.blue('\n🚀 ChatPorter - Interactive Mode\n'));
  
  const hasApiKey = !!process.env.V0_API_KEY;
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'importType',
      message: 'What would you like to import?',
      choices: [
        { name: 'GitHub Repository', value: 'repo' },
        { name: 'Local Directory', value: 'dir' },
        { name: 'Zip Archive URL', value: 'zip' },
        { name: 'Individual Files', value: 'files' },
      ],
    },
    {
      type: 'input',
      name: 'source',
      message: (answers) => {
        const messages = {
          repo: 'Enter GitHub repository URL:',
          dir: 'Enter directory path:',
          zip: 'Enter zip archive URL:',
          files: 'Enter file paths (space-separated or glob pattern):',
        };
        return messages[answers.importType];
      },
      validate: (input) => input.trim().length > 0 || 'Please enter a valid source',
    },
    {
      type: 'list',
      name: 'platform',
      message: 'Select target platform:',
      choices: (answers) => {
        // Repo/dir/zip imports require API
        if (['repo', 'dir', 'zip'].includes(answers.importType)) {
          return [
            { name: 'v0.dev (API)', value: 'v0-api' },
          ];
        }
        return [
          { name: 'v0.dev (API)', value: 'v0-api' },
          { name: 'v0.dev (formatted text)', value: 'v0' },
          { name: 'ChatGPT', value: 'chatgpt' },
          { name: 'Claude', value: 'claude' },
          { name: 'Cursor AI', value: 'cursor' },
          { name: 'Raw (formatted text)', value: 'raw' },
        ];
      },
      default: hasApiKey ? 'v0-api' : 'v0',
      when: (answers) => answers.importType === 'files' || hasApiKey,
    },
    {
      type: 'input',
      name: 'apiKey',
      message: 'v0 API Key (or set V0_API_KEY env var):',
      when: (answers) => {
        const needsApi = ['repo', 'dir', 'zip'].includes(answers.importType) || answers.platform === 'v0-api';
        return needsApi && !hasApiKey;
      },
      validate: (input) => input.trim().length > 0 || 'API key is required',
    },
    {
      type: 'input',
      name: 'branch',
      message: 'Git branch (optional, defaults to main):',
      when: (answers) => answers.importType === 'repo',
      default: 'main',
    },
    {
      type: 'input',
      name: 'chatName',
      message: 'Chat name (optional):',
      when: (answers) => ['repo', 'dir', 'zip'].includes(answers.importType) || answers.platform === 'v0-api',
    },
    {
      type: 'confirm',
      name: 'lockFiles',
      message: 'Lock files from AI modification?',
      when: (answers) => ['dir', 'files'].includes(answers.importType) && answers.platform === 'v0-api',
      default: false,
    },
    {
      type: 'confirm',
      name: 'lockAllFiles',
      message: 'Lock all files from AI modification?',
      when: (answers) => ['repo', 'zip'].includes(answers.importType) || (answers.platform === 'v0-api' && answers.importType === 'dir'),
      default: false,
    },
    {
      type: 'confirm',
      name: 'saveToFile',
      message: 'Save formatted output to file?',
      when: (answers) => answers.platform !== 'v0-api',
      default: false,
    },
    {
      type: 'input',
      name: 'outputFile',
      message: 'Output file path:',
      when: (answers) => answers.saveToFile,
      default: 'chatporter-output.txt',
    },
    {
      type: 'confirm',
      name: 'openBrowser',
      message: 'Open in browser?',
      default: true,
    },
  ]);
  
  const options = {
    platform: answers.platform === 'v0-api' ? 'v0' : (answers.platform || 'v0'),
    useApi: ['repo', 'dir', 'zip'].includes(answers.importType) || answers.platform === 'v0-api',
    apiKey: answers.apiKey || process.env.V0_API_KEY,
    name: answers.chatName,
    branch: answers.branch,
    lockFiles: answers.lockFiles,
    lockAllFiles: answers.lockAllFiles,
    output: answers.saveToFile ? answers.outputFile : null,
    open: answers.openBrowser !== false,
  };
  
  // Route to appropriate function based on import type
  if (answers.importType === 'repo') {
    await createV0ChatFromRepo(answers.source, options);
  } else if (answers.importType === 'dir') {
    await createV0ChatFromDirectory(resolve(answers.source), options);
  } else if (answers.importType === 'zip') {
    await createV0ChatFromZip(answers.source, options);
  } else {
    // Individual files
    const filePaths = answers.source.trim().split(/\s+/);
    await uploadFiles(filePaths, options);
  }
}

// CLI Setup
program
  .name('chatporter')
  .description('Port markdown documents into AI chat conversations')
  .version('1.0.0');

program
  .command('upload')
  .description('Upload markdown file(s), directory, or GitHub repository')
  .argument('<paths...>', 'File(s), directory, or GitHub repo URL to upload')
  .option('-p, --platform <platform>', 'Target platform (v0, chatgpt, claude, cursor, raw)', 'raw')
  .option('-o, --output <file>', 'Save formatted output to file')
  .option('--open <platform>', 'Open in browser (v0, chatgpt, claude, cursor)')
  .option('--api', 'Use v0 Platform API to create actual chat (requires V0_API_KEY)', false)
  .option('--api-key <key>', 'v0 API key (or set V0_API_KEY env var)')
  .option('--name <name>', 'Chat name (for API mode)')
  .option('--project-id <id>', 'v0 Project ID (optional, for API mode)')
  .option('--lock-files', 'Lock files from AI modification (API mode)', false)
  .option('--lock-all-files', 'Lock all files from AI modification (API mode)', false)
  .option('--branch <branch>', 'Git branch (for GitHub repo imports)', 'main')
  .action(async (paths, options) => {
    await uploadFiles(paths, options);
  });

program
  .command('repo')
  .description('Import GitHub repository to v0 chat')
  .argument('<repo-url>', 'GitHub repository URL (e.g., https://github.com/user/repo)')
  .option('--api-key <key>', 'v0 API key (or set V0_API_KEY env var)')
  .option('--name <name>', 'Chat name')
  .option('--project-id <id>', 'v0 Project ID (optional)')
  .option('--branch <branch>', 'Git branch to import', 'main')
  .option('--lock-all-files', 'Lock all files from AI modification', false)
  .option('--no-open', 'Don\'t open browser after creation')
  .action(async (repoUrl, options) => {
    await createV0ChatFromRepo(repoUrl, {
      ...options,
      useApi: true,
      platform: 'v0',
      open: options.open !== false,
    });
  });

program
  .command('dir')
  .description('Import local directory to v0 chat')
  .argument('<directory>', 'Local directory path to import')
  .option('--api-key <key>', 'v0 API key (or set V0_API_KEY env var)')
  .option('--name <name>', 'Chat name')
  .option('--project-id <id>', 'v0 Project ID (optional)')
  .option('--lock-files', 'Lock files from AI modification', false)
  .option('--lock-all-files', 'Lock all files from AI modification', false)
  .option('--no-open', 'Don\'t open browser after creation')
  .action(async (dirPath, options) => {
    await createV0ChatFromDirectory(resolve(dirPath), {
      ...options,
      useApi: true,
      platform: 'v0',
      open: options.open !== false,
    });
  });

program
  .command('zip')
  .description('Import zip archive from URL to v0 chat')
  .argument('<zip-url>', 'URL to zip archive (e.g., https://github.com/user/repo/archive/main.zip)')
  .option('--api-key <key>', 'v0 API key (or set V0_API_KEY env var)')
  .option('--name <name>', 'Chat name')
  .option('--project-id <id>', 'v0 Project ID (optional)')
  .option('--lock-all-files', 'Lock all files from AI modification', false)
  .option('--no-open', 'Don\'t open browser after creation')
  .action(async (zipUrl, options) => {
    await createV0ChatFromZip(zipUrl, {
      ...options,
      useApi: true,
      platform: 'v0',
      open: options.open !== false,
    });
  });

program
  .command('interactive', { isDefault: true })
  .alias('i')
  .description('Run in interactive mode')
  .action(async () => {
    await interactiveMode();
  });

// Parse arguments
program.parse();


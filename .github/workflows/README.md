# GitHub Actions Workflows

## Release Workflow

The release workflow allows you to create GitHub releases directly from the Actions tab with a user-friendly interface.

### How to Use

1. **Go to Actions Tab**
   - Navigate to your repository on GitHub
   - Click on the "Actions" tab

2. **Run the Release Workflow**
   - Select "Create Release" from the workflow list on the left
   - Click "Run workflow" button
   - Fill in the form with your release details

### Workflow Inputs

#### Version Type
- **patch** (default): Increments the patch version (1.0.0 → 1.0.1)
- **minor**: Increments the minor version (1.0.0 → 1.1.0)
- **major**: Increments the major version (1.0.0 → 2.0.0)
- **custom**: Use a custom version (requires custom_version input)

#### Custom Version
- Only used when `version_type` is set to "custom"
- Format: `1.2.3` (without the `v` prefix)
- Example: `1.2.3` will create tag `v1.2.3`

#### Release Notes
- Optional: Leave empty to auto-generate from git commits
- If provided, will be used as-is for the release description
- Supports Markdown formatting

#### Publish to npm
- **true**: Publishes the package to npm after creating the release
- **false** (default): Only creates the GitHub release
- Requires `NPM_TOKEN` secret to be configured

#### Draft Release
- **true**: Creates the release as a draft (not visible to public)
- **false** (default): Creates a public release immediately

#### Pre-release
- **true**: Marks the release as a pre-release (e.g., beta, alpha)
- **false** (default): Creates a stable release

### Required Secrets

#### For npm Publishing
If you want to publish to npm, you need to configure:

1. Go to: Settings → Secrets and variables → Actions
2. Add a new secret named `NPM_TOKEN`
3. Value: Your npm automation token (from https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
4. Select "Automation" token type when creating

### What the Workflow Does

1. ✅ Checks out the code
2. ✅ Calculates the new version based on your selection
3. ✅ Updates `package.json` and `package-lock.json` with the new version
4. ✅ Generates release notes (from commits or uses your provided notes)
5. ✅ Creates a git tag (e.g., `v1.0.1`)
6. ✅ Commits the version bump
7. ✅ Pushes the tag and commit to GitHub
8. ✅ Creates a GitHub release with the tag
9. ✅ Optionally publishes to npm (if enabled)

### Example Workflow Run

**Scenario**: Create a patch release (1.0.0 → 1.0.1) and publish to npm

1. Go to Actions → Create Release → Run workflow
2. Select:
   - Version type: `patch`
   - Release notes: (leave empty for auto-generation)
   - Publish to npm: `true`
   - Draft release: `false`
   - Pre-release: `false`
3. Click "Run workflow"
4. Wait for the workflow to complete
5. Check the release at: https://github.com/pstagner/ChatPorter/releases

### Troubleshooting

**Workflow fails with "NPM_TOKEN not found"**
- Make sure you've added the `NPM_TOKEN` secret in repository settings
- The token must have publish permissions

**Version calculation fails**
- Ensure your current `package.json` has a valid version format (e.g., `1.0.0`)
- Custom versions must follow semantic versioning (major.minor.patch)

**Tag already exists**
- Delete the existing tag if it was created incorrectly
- Or use a different version number

### Manual Release Alternative

If you prefer to create releases manually, you can still use the `create-release.sh` script locally, or create releases directly on GitHub's releases page.


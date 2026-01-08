#!/bin/bash

# Script to create GitHub release for ChatPorter v1.0.0

set -e

REPO="pstagner/ChatPorter"
VERSION="v1.0.0"
TAG="v1.0.0"

echo "🚀 Creating GitHub release for ChatPorter $VERSION"

# Step 1: Push the tag to GitHub
echo "📤 Pushing tag $TAG to GitHub..."
git push origin $TAG

# Step 2: Create GitHub release
echo "📝 Creating GitHub release..."

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  GITHUB_TOKEN not set. You can either:"
    echo ""
    echo "Option 1: Set GITHUB_TOKEN environment variable and run this script again"
    echo "   export GITHUB_TOKEN=your_token_here"
    echo "   ./create-release.sh"
    echo ""
    echo "Option 2: Create release manually via GitHub web UI:"
    echo "   1. Go to https://github.com/$REPO/releases/new"
    echo "   2. Select tag: $TAG"
    echo "   3. Title: ChatPorter $VERSION"
    echo "   4. Copy contents from RELEASE_NOTES_v1.0.0.md"
    echo "   5. Check 'Set as the latest release'"
    echo "   6. Click 'Publish release'"
    exit 1
fi

# Read release notes
RELEASE_NOTES=$(cat RELEASE_NOTES_v1.0.0.md)

# Create release via GitHub API
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/releases" \
  -d "{
    \"tag_name\": \"$TAG\",
    \"name\": \"ChatPorter $VERSION\",
    \"body\": $(echo "$RELEASE_NOTES" | jq -Rs .),
    \"draft\": false,
    \"prerelease\": false
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo "✅ Release created successfully!"
    echo "🔗 View release at: https://github.com/$REPO/releases/tag/$TAG"
else
    echo "❌ Failed to create release. HTTP code: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi


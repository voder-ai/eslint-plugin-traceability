#!/bin/bash
# @story 060.0-DEV-POST-DEPLOYMENT-VERIFICATION.story.md
set -e

VERSION="${1:-}"

if [ -z "$VERSION" ]; then
  echo "❌ Error: VERSION argument required"
  echo "Usage: $0 <version>"
  exit 1
fi

echo "🔍 Post-deployment verification for version $VERSION"
echo ""

# Wait for the version to be available on npm (max 3 minutes)
echo "⏳ Waiting for version $VERSION to be available on npm registry..."
for i in {1..36}; do
  if npm view "eslint-plugin-traceability@$VERSION" version > /dev/null 2>&1; then
    echo "✓  Version $VERSION found on registry"
    sleep 5  # Give it a bit more time to fully propagate
    break
  fi
  echo "   Attempt $i/36: Version not yet available, waiting..."
  sleep 5
done

# Verify version is actually available
if ! npm view "eslint-plugin-traceability@$VERSION" version > /dev/null 2>&1; then
  echo "❌ Version $VERSION not available on npm registry after 3 minutes"
  exit 1
fi

# Run smoke test with the published version
echo ""
echo "🧪 Running smoke test with published version..."
./scripts/smoke-test.sh "$VERSION"

echo ""
echo "✅ Post-deployment verification completed successfully"
echo "   Version $VERSION is live and functional on npm registry"

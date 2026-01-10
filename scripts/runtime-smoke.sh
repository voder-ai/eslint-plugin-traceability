#!/bin/bash
# Lightweight runtime smoke test - read-only check against minimal fixture
# @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
# This is a fast health check to verify the plugin can be loaded and executed

set -e

echo "🔍 Running lightweight runtime smoke test..."
echo ""

# Check if lib exists
if [ ! -d "lib" ]; then
  echo "❌ Error: lib/ directory not found. Run 'npm run build' first."
  exit 1
fi

# Create a minimal test fixture in a temp directory
workdir=$(mktemp -d)
trap "rm -rf $workdir" EXIT

cd "$workdir"

# Create minimal ESLint config
cat > eslint.config.js << 'EOF'
const path = require('path');
const plugin = require(path.join(process.cwd(), 'lib', 'src', 'index.js'));

module.exports = [
  {
    files: ['**/*.ts', '**/*.js'],
    plugins: { traceability: plugin },
    rules: {
      'traceability/require-story': ['error', { requireAnnotation: false }]
    }
  }
];
EOF

# Create minimal test file
cat > test-file.ts << 'EOF'
/**
 * Test function
 * @story docs/test-story.md
 */
export function testFunction() {
  return true;
}
EOF

# Create story file
mkdir -p docs
cat > docs/test-story.md << 'EOF'
# Test Story

This is a minimal test story.
EOF

cd -

# Run ESLint against the fixture
echo "✓ Loading plugin and checking fixture..."
npx eslint --config "$workdir/eslint.config.js" "$workdir/test-file.ts" > /dev/null 2>&1

# Verify CLI exists and can run help
echo "✓ Verifying CLI availability..."
if [ -f "lib/src/maintenance/cli.js" ]; then
  node lib/src/maintenance/cli.js --help > /dev/null 2>&1
  echo "✓ CLI is functional"
else
  echo "❌ Error: CLI not found at lib/src/maintenance/cli.js"
  exit 1
fi

echo ""
echo "✅ Runtime smoke test passed! Plugin is healthy and executable."

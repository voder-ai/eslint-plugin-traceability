#!/bin/bash
set -e

VERSION="${1:-local}"

echo "🧪 Running smoke test for eslint-plugin-traceability"
echo ""

if [ "$VERSION" = "local" ]; then
  # Pack the package first for local testing
  echo "📦 Packing the package..."
  tarball=$(npm pack 2>&1 | tail -1)
  echo "   Created: $tarball"
  PACKAGE_SOURCE="$PWD/$tarball"
  INSTALL_ARGS=(npm install "$PACKAGE_SOURCE" --no-audit --no-fund)
else
  # Use specific version from npm registry
  echo "📦 Using version $VERSION from npm registry"
  PACKAGE_SOURCE="eslint-plugin-traceability@$VERSION"
  
  # Wait for the version to be available on npm (max 2 minutes)
  echo "⏳ Waiting for version $VERSION to be available on npm registry..."
  for i in {1..24}; do
    if npm view "$PACKAGE_SOURCE" version > /dev/null 2>&1; then
      echo "✓  Version $VERSION found on registry"
      sleep 5  # Give it a bit more time to fully propagate
      break
    fi
    echo "   Attempt $i/24: Version not yet available, waiting..."
    sleep 5
  done
  
  INSTALL_ARGS=(npm install "$PACKAGE_SOURCE" --prefer-online --no-audit --no-fund)
fi

# Create temporary directory
workdir=$(mktemp -d)
echo "📁 Created test directory: $workdir"

# Cleanup on exit
cleanup() {
  echo "🧹 Cleaning up test directory"
  rm -rf "$workdir"
  if [ "$VERSION" = "local" ] && [ -n "$tarball" ]; then
    rm -f "$tarball"
  fi
}
trap cleanup EXIT

cd "$workdir"

# Initialize npm project
echo "📦 Initializing npm project..."
npm init -y > /dev/null

# Install the package
echo "📥 Installing eslint-plugin-traceability..."
"${INSTALL_ARGS[@]}" > /dev/null

# Verify it loaded correctly
echo "🔎 Verifying package loaded correctly..."
if [ "$VERSION" != "local" ]; then
  node -e "
    const pkg = require('eslint-plugin-traceability');
    const pkgJson = require('eslint-plugin-traceability/package.json');
    if (!pkg.rules) throw new Error('Package did not load correctly');
    if (pkgJson.version !== '$VERSION') throw new Error('Wrong version installed: ' + pkgJson.version);
    console.log('   Verified version:', pkgJson.version);
  "
else
  node -e "
    const pkg = require('eslint-plugin-traceability');
    if (!pkg.rules) throw new Error('Package did not load correctly');
    console.log('   Package loaded successfully');
  "
fi

# Create ESLint config (CommonJS format)
echo "⚙️  Creating ESLint config..."
cat > eslint.config.js << 'EOF'
const traceability = require('eslint-plugin-traceability');
module.exports = [
  {
    plugins: { traceability },
    rules: {}
  }
];
EOF

# Test the plugin loads
echo "🔍 Testing plugin configuration..."
npx eslint --print-config eslint.config.js > /dev/null

# Test the traceability-maint CLI (success and error paths)
echo "🧪 Testing traceability-maint CLI (success path)..."
cat > example.ts << 'EOF'
/**
 * @story local-story.story.md
 */
export function example() {}
EOF

cat > local-story.story.md << 'EOF'
# Local Story
EOF

npx traceability-maint detect --root . > cli-detect-output.txt 2>&1
grep -q "No stale @story annotations found." cli-detect-output.txt

echo "🧪 Testing traceability-maint CLI (error path)..."
set +e
npx traceability-maint report --root . --format yaml > cli-report-error.txt 2>&1
cli_status=$?
set -e

if [ "$cli_status" -ne 2 ]; then
  echo "❌ Expected traceability-maint report to exit with status 2, but got: $cli_status"
  echo "   Full output:"
  cat cli-report-error.txt || true
  exit 1
fi

if ! grep -q "Invalid format: yaml" cli-report-error.txt || ! grep -q "Expected 'text' or 'json'" cli-report-error.txt; then
  echo "❌ traceability-maint report error output did not contain expected validation messages."
  echo "   Expected it to mention \"Invalid format: yaml\" and \"Expected 'text' or 'json'\"."
  echo "   Full output:"
  cat cli-report-error.txt || true
  exit 1
fi

echo ""
echo "✅ Smoke test passed! Plugin and CLI verified successfully."
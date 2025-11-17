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
  INSTALL_CMD="npm install \"$PACKAGE_SOURCE\""
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
  
  INSTALL_CMD="npm install \"$PACKAGE_SOURCE\" --prefer-online"
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
eval "$INSTALL_CMD" > /dev/null

# Verify it loaded correctly
echo "� Verifying package loaded correctly..."
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

echo ""
echo "✅ Smoke test passed! Plugin loads successfully."

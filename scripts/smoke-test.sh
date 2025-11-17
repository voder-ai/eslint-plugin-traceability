#!/bin/bash
set -e

echo "🧪 Running smoke test for eslint-plugin-traceability"
echo ""

# Pack the package first
echo "📦 Packing the package..."
tarball=$(npm pack 2>&1 | tail -1)
echo "   Created: $tarball"

# Create temporary directory
workdir=$(mktemp -d)
echo "📁 Created test directory: $workdir"

# Cleanup on exit
cleanup() {
  echo "🧹 Cleaning up test directory and tarball"
  rm -rf "$workdir"
  rm -f "$tarball"
}
trap cleanup EXIT

cd "$workdir"

# Initialize npm project
echo "📦 Initializing npm project..."
npm init -y > /dev/null

# Install the packed tarball
echo "📥 Installing eslint-plugin-traceability from packed tarball..."
npm install "$OLDPWD/$tarball" > /dev/null

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

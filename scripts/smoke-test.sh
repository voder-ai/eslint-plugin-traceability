#!/bin/bash
set -e

echo "🧪 Running smoke test for eslint-plugin-traceability"
echo ""

# Create temporary directory
workdir=$(mktemp -d)
echo "📁 Created test directory: $workdir"

# Cleanup on exit
cleanup() {
  echo "🧹 Cleaning up test directory"
  rm -rf "$workdir"
}
trap cleanup EXIT

cd "$workdir"

# Initialize npm project
echo "📦 Initializing npm project..."
npm init -y > /dev/null

# Install the local package
echo "📥 Installing eslint-plugin-traceability from local build..."
npm install "$OLDPWD" > /dev/null

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

#!/bin/bash
# Enhanced runtime smoke test - broader rule coverage
# @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
# @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md  
# @req REQ-PLUGIN-STRUCTURE - Verify plugin loads and all rules execute
# @req REQ-CONFIG-PRESETS - Verify recommended/strict presets work

set -e

echo "🔍 Running enhanced runtime smoke test with broader rule coverage..."
echo ""

# Check if lib exists
if [ ! -d "lib" ]; then
  echo "❌ Error: lib/ directory not found. Run 'npm run build' first."
  exit 1
fi

# Store the project root before changing directories
projectRoot=$(pwd)

# Create a test fixture in a temp directory
workdir=$(mktemp -d)
trap "rm -rf $workdir" EXIT

cd "$workdir"

# Create comprehensive ESLint config with relaxed path requirements for smoke test
cat > eslint.config.js << EOF
const path = require('path');
const plugin = require(path.join('${projectRoot}', 'lib', 'index.js'));

module.exports = [
  {
    files: ['**/*.ts', '**/*.js'],
    plugins: { traceability: plugin },
    rules: {
      'traceability/require-traceability': 'error',
      'traceability/require-branch-annotation': 'error',
      'traceability/valid-annotation-format': ['error', {
        story: { pattern: '^docs/stories/.*\\\\.story\\\\.md$' },
        req: { pattern: '^REQ-[A-Z0-9-]+$' }
      }],
      'traceability/valid-story-reference': ['error', { 
        requireStoryExtension: false 
      }],
      'traceability/valid-req-reference': 'error',
      'traceability/no-redundant-annotation': 'warn'
    }
  }
];
EOF

# Create test file with multiple scenarios
cat > test-file.ts << 'EOF'
/**
 * @story docs/stories/test-story.story.md
 * @req REQ-VALID-FUNCTION
 */
export function validFunction() {
  /** @supports docs/stories/test-story.story.md REQ-BRANCH */
  if (Math.random() > 0.5) {
    return true;
  }
  /** @supports docs/stories/test-story.story.md REQ-BRANCH */
  return false;
}

/**
 * @story docs/stories/test-story.story.md
 * @req REQ-EXAMPLE
 */
function processData() {
  const items = [1, 2, 3];
  return items.map(x => x * 2);
}

/** @supports docs/stories/test-story.story.md REQ-ARROW */
const namedArrow = () => {
  return "test";
};

/** 
 * @story docs/stories/test-story.story.md
 * @req REQ-TEST-CLASS
 */
class TestClass {
  /** @supports docs/stories/test-story.story.md REQ-METHOD */
  testMethod() {
    /** @supports docs/stories/test-story.story.md REQ-SWITCH */
    switch (true) {
      /** @supports docs/stories/test-story.story.md REQ-CASE */
      case true:
        return "yes";
      /** @supports docs/stories/test-story.story.md REQ-CASE */
      default:
        return "no";
    }
  }
}
EOF

# Create story file with requirements
mkdir -p docs/stories
cat > docs/stories/test-story.story.md << 'EOF'
# Test Story

This is a test story for smoke testing.

## Requirements

- REQ-VALID-FUNCTION: Valid function requirement
- REQ-EXAMPLE: Example requirement
- REQ-BRANCH: Branch requirement
- REQ-ARROW: Arrow function requirement
- REQ-METHOD: Method requirement
- REQ-SWITCH: Switch statement requirement
- REQ-CASE: Case requirement
- REQ-TEST-CLASS: Test class requirement
EOF

# Test 1: Run ESLint with all rules enabled
echo "✓ Test 1: Loading plugin with multiple rules..."
node "$projectRoot/node_modules/eslint/bin/eslint.js" --config eslint.config.js test-file.ts > /dev/null 2>&1 || {
  echo "❌ Error: ESLint check failed with multiple rules"
  node "$projectRoot/node_modules/eslint/bin/eslint.js" --config eslint.config.js test-file.ts
  exit 1
}
echo "  ✓ All rules loaded and executed successfully"

# Test 2: Test recommended preset
cat > eslint-recommended.config.js << EOF
const path = require('path');
const plugin = require(path.join('${projectRoot}', 'lib', 'index.js'));

module.exports = [
  ...plugin.configs.recommended
];
EOF

echo "✓ Test 2: Testing recommended preset..."
node "$projectRoot/node_modules/eslint/bin/eslint.js" --config eslint-recommended.config.js test-file.ts > /dev/null 2>&1 || {
  echo "❌ Error: ESLint check failed with recommended preset"
  node "$projectRoot/node_modules/eslint/bin/eslint.js" --config eslint-recommended.config.js test-file.ts
  exit 1
}
echo "  ✓ Recommended preset works correctly"

# Test 3: Test strict preset  
cat > eslint-strict.config.js << EOF
const path = require('path');
const plugin = require(path.join('${projectRoot}', 'lib', 'index.js'));

module.exports = [
  ...plugin.configs.strict
];
EOF

echo "✓ Test 3: Testing strict preset..."
node "$projectRoot/node_modules/eslint/bin/eslint.js" --config eslint-strict.config.js test-file.ts > /dev/null 2>&1 || {
  echo "❌ Error: ESLint check failed with strict preset"
  node "$projectRoot/node_modules/eslint/bin/eslint.js" --config eslint-strict.config.js test-file.ts
  exit 1
}
echo "  ✓ Strict preset works correctly"

# Test 4: Verify rule with invalid annotation reports error
cat > invalid-file.ts << 'EOF'
/**
 * Function with invalid story path
 * @story invalid-path-format
 */
export function invalidFunction() {
  return true;
}
EOF

echo "✓ Test 4: Testing error reporting..."
if node "$projectRoot/node_modules/eslint/bin/eslint.js" --config eslint.config.js invalid-file.ts > /dev/null 2>&1; then
  echo "❌ Error: Expected ESLint to fail on invalid annotation but it passed"
  exit 1
fi
echo "  ✓ Error reporting works correctly"

cd "$projectRoot"

# Test 5: Verify CLI commands
echo "✓ Test 5: Verifying CLI functionality..."
if [ -f "lib/maintenance/cli.js" ]; then
  # Test help command
  node lib/maintenance/cli.js --help > /dev/null 2>&1 || {
    echo "❌ Error: CLI help command failed"
    exit 1
  }
  
  # Test detect command with dry-run in temp dir
  cd "$workdir"
  node "$projectRoot/lib/maintenance/cli.js" detect --dry-run > /dev/null 2>&1 || {
    echo "❌ Error: CLI detect command failed"
    exit 1
  }
  
  cd "$projectRoot"
  echo "  ✓ CLI commands work correctly"
else
  echo "❌ Error: CLI not found at lib/maintenance/cli.js"
  exit 1
fi

echo ""
echo "✅ Enhanced runtime smoke test passed!"
echo "   Verified:"
echo "   - Plugin loading with multiple rules"
echo "   - Recommended and strict presets"
echo "   - Error reporting for invalid annotations"
echo "   - CLI functionality (help, detect)"
echo ""


# eslint-plugin-traceability

A customizable ESLint plugin that enforces traceability annotations in your code, ensuring each implementation is linked to its requirement or test case.

## Attribution

Created autonomously by [voder.ai](https://voder.ai).

## Installation

Prerequisites: Node.js >=14 and ESLint v9+.

1. Using npm  
   npm install --save-dev eslint-plugin-traceability
2. Using Yarn  
   yarn add --dev eslint-plugin-traceability

For detailed setup with ESLint v9, see user-docs/eslint-9-setup-guide.md.

## Usage

Add the plugin to your ESLint configuration and enable the rules.

Additional ESLint v9 configuration guidance:

- For detailed configuration examples, see [Common Configuration Patterns](user-docs/eslint-9-setup-guide.md#common-configuration-patterns) in the ESLint 9 Setup Guide.
- For troubleshooting ESLint flat-config errors, see [Troubleshooting ESLint Configuration](user-docs/eslint-9-setup-guide.md#troubleshooting-eslint-configuration).

Example eslint.config.js (ESLint v9 flat config):

```js
// eslint.config.js
module.exports = [
  {
    env: {
      es2021: true,
      node: true,
    },
    plugins: { traceability: {} },
    rules: {
      "traceability/require-story-annotation": "error",
      "traceability/require-req-annotation": "error",
      "traceability/require-branch-annotation": "error",
    },
  },
];
```

### Available Rules

- `traceability/require-story-annotation` Enforces presence of `@story` annotations. ([Documentation](docs/rules/require-story-annotation.md))
- `traceability/require-req-annotation` Enforces presence of `@req` annotations. ([Documentation](docs/rules/require-req-annotation.md))
- `traceability/require-branch-annotation` Enforces presence of branch annotations. ([Documentation](docs/rules/require-branch-annotation.md))
- `traceability/valid-annotation-format` Enforces correct format of traceability annotations. ([Documentation](docs/rules/valid-annotation-format.md))
- `traceability/valid-story-reference` Validates that `@story` references point to existing story files. ([Documentation](docs/rules/valid-story-reference.md))
- `traceability/valid-req-reference` Validates that `@req` references point to existing requirement IDs. ([Documentation](docs/rules/valid-req-reference.md))

Configuration options: For detailed per-rule options (such as scopes, branch types, and story directory settings), see the individual rule docs in `docs/rules/` and the consolidated [API Reference](user-docs/api-reference.md).

For development and contribution guidelines, see docs/eslint-plugin-development-guide.md.

## Quick Start

1. Create a flat ESLint config file (`eslint.config.js`):

```javascript
// eslint.config.js
import traceability from "eslint-plugin-traceability";

export default [
  // Load the traceability plugin's recommended rule set
  traceability.configs.recommended,
];
```

2. Annotate your functions or modules:

```js
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
function initAuth() {
  // implementation...
}
```

3. Run ESLint:

```bash
npx eslint "src/**/*.js"
```

## API Reference

Detailed API specification and configuration options can be found in the [API Reference](user-docs/api-reference.md).

## Examples

Practical usage examples and sample configurations are available in the [Examples](user-docs/examples.md) document.

## Plugin Validation

You can validate the plugin by running ESLint CLI with the plugin on a sample file:

```bash
# Validate missing @story annotation (should report an error)
npx eslint --no-eslintrc --config eslint.config.js sample.js --rule 'traceability/require-story-annotation:error'
```

This command runs ESLint with the plugin, pointing at `eslint.config.js` flat config.

Replace `sample.js` with your JavaScript or TypeScript file.

## Running Tests

You can run tests and quality checks locally using the npm scripts provided:

```bash
# Run all tests with coverage
npm test

# Run linting with zero tolerance for warnings
npm run lint -- --max-warnings=0

# Check code formatting
npm run format:check

# Check duplication threshold
npm run duplication
```

Coverage reports will be generated in the `coverage/` directory.

## CLI Integration

Integration tests for the ESLint CLI plugin are included in the Jest test suite under `tests/integration/cli-integration.test.ts`.

To run only the CLI integration tests:

```bash
npm test -- tests/integration/cli-integration.test.ts
```

Or run the full test suite:

```bash
npm test
```

These tests verify end-to-end behavior of the plugin via the ESLint CLI.

## Documentation Links

- ESLint v9 Setup Guide: user-docs/eslint-9-setup-guide.md
- Plugin Development Guide: docs/eslint-plugin-development-guide.md
- API Reference: user-docs/api-reference.md
- Examples: user-docs/examples.md
- Migration Guide: user-docs/migration-guide.md
- Full README: https://github.com/voder-ai/eslint-plugin-traceability#readme
- Rule: require-story-annotation: docs/rules/require-story-annotation.md
- Rule: require-req-annotation: docs/rules/require-req-annotation.md
- Rule: require-branch-annotation: docs/rules/require-branch-annotation.md
- Contribution guide: https://github.com/voder-ai/eslint-plugin-traceability/blob/main/CONTRIBUTING.md
- Issue tracker: https://github.com/voder-ai/eslint-plugin-traceability/issues
- Configuration Presets: docs/config-presets.md
- Changelog: CHANGELOG.md

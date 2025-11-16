# eslint-plugin-traceability

A customizable ESLint plugin that enforces traceability annotations in your code, ensuring each implementation is linked to its requirement or test case.

## Attribution

Created autonomously by [voder.ai](https://voder.ai).

## Installation

Prerequisites: Node.js v12+ and ESLint v9+.

1. Using npm  
   npm install --save-dev eslint-plugin-traceability
2. Using Yarn  
   yarn add --dev eslint-plugin-traceability

For detailed setup with ESLint v9, see docs/eslint-9-setup-guide.md.

## Usage

Add the plugin to your ESLint configuration and enable the rules.

Example `.eslintrc.js`:

```js
module.exports = {
  plugins: ["traceability"],
  rules: {
    "traceability/require-story-annotation": "error",
    "traceability/require-req-annotation": "error",
    "traceability/require-branch-annotation": "error",
  },
};
```

### Available Rules

- `require-story-annotation`  
  Enforces `@story` annotations on function declarations. ([Documentation](docs/rules/require-story-annotation.md))
- `require-req-annotation`  
  Enforces `@req` annotations on function declarations. ([Documentation](docs/rules/require-req-annotation.md))
- `require-branch-annotation`  
  Enforces `@story` and `@req` annotations on significant code branches. ([Documentation](docs/rules/require-branch-annotation.md))

For development and contribution guidelines, see docs/eslint-plugin-development-guide.md.

## Quick Start

1. Create a minimal ESLint config file (`.eslintrc.json`):

```json
{
  "env": {
    "es2021": true,
    "node": true
  },
  "plugins": ["traceability"],
  "extends": ["eslint:recommended"],
  "rules": {
    "traceability/require-story-annotation": "error",
    "traceability/require-req-annotation": "error",
    "traceability/require-branch-annotation": "error"
  }
}
```

2. Annotate your functions or modules:

```js
// REQ-1001 Initialize the user authentication flow
function initAuth() {
  // implementation...
}
```

3. Run ESLint:

```bash
npx eslint "src/**/*.js"
```

## Plugin Validation

You can validate the plugin by running ESLint CLI with the plugin on a sample file:

```bash
# Validate missing @story annotation (should report an error)
npx eslint --no-eslintrc --config eslint.config.js sample.js --rule 'traceability/require-story-annotation:error'
```

This command runs ESLint with the plugin, pointing at `eslint.config.js` flat config.

Replace `sample.js` with your JavaScript or TypeScript file.

## Documentation Links

- ESLint v9 Setup Guide: docs/eslint-9-setup-guide.md
- Plugin Development Guide: docs/eslint-plugin-development-guide.md
- Full README: https://github.com/voder-ai/eslint-plugin-traceability#readme
- Rule: require-story-annotation: docs/rules/require-story-annotation.md
- Rule: require-req-annotation: docs/rules/require-req-annotation.md
- Rule: require-branch-annotation: docs/rules/require-branch-annotation.md
- Contribution guide: https://github.com/voder-ai/eslint-plugin-traceability/blob/main/CONTRIBUTING.md
- Issue tracker: https://github.com/voder-ai/eslint-plugin-traceability/issues

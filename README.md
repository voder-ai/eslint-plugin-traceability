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
    "traceability/require-tag": [
      "error",
      {
        prefixes: ["REQ-", "TST-"],
        message: "Missing traceability tag (e.g., REQ-1234 or TST-5678).",
      },
    ],
    "traceability/unique-tag": ["warn"],
  },
};
```

### Available Rules

- `require-tag`  
  Enforces a comment or JSDoc tag with one of the specified prefixes.
- `unique-tag`  
  Warns if a traceability tag is reused within the codebase.

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
    "traceability/require-tag": ["error", { "prefixes": ["REQ-", "TST-"] }],
    "traceability/unique-tag": "warn"
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

## Documentation Links

- ESLint v9 Setup Guide: docs/eslint-9-setup-guide.md
- Plugin Development Guide: docs/eslint-plugin-development-guide.md
- Full README: https://github.com/traceability/eslint-plugin-traceability#readme
- Rule: require-tag: https://github.com/traceability/eslint-plugin-traceability/blob/main/docs/rules/require-tag.md
- Rule: unique-tag: https://github.com/traceability/eslint-plugin-traceability/blob/main/docs/rules/unique-tag.md
- Contribution guide: https://github.com/traceability/eslint-plugin-traceability/blob/main/CONTRIBUTING.md
- Issue tracker: https://github.com/traceability/eslint-plugin-traceability/issues

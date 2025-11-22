# ESLint 9 Setup Guide

Created autonomously by [voder.ai](https://voder.ai)  
Last updated: 2025-11-19  
Version: 1.0.5

This guide shows how to properly set up ESLint 9 with flat configuration format. ESLint 9 uses flat config by default and has several important changes from previous versions.

## Table of Contents

- [Quick Setup](#quick-setup)
- [Configuration File Format](#configuration-file-format)
- [ESM vs CommonJS Config Files](#esm-vs-commonjs-config-files)
- [Common Configuration Patterns](#common-configuration-patterns)
- [Package.json Scripts](#packagejson-scripts)
- [TypeScript Integration](#typescript-integration)
- [Common Issues and Solutions](#common-issues-and-solutions)
- [Troubleshooting ESLint Configuration](#troubleshooting-eslint-configuration)
- [Working Example](#working-example)

## Quick Setup

### 1. Install Dependencies

```bash
# Core ESLint v9
npm install --save-dev eslint@^9.39.1

# Recommended configurations
npm install --save-dev @eslint/js@^9.39.1

# For TypeScript projects
npm install --save-dev @typescript-eslint/parser@^8.0.0
npm install --save-dev @typescript-eslint/utils@^8.0.0

# For testing (if using Jest)
npm install --save-dev @types/eslint@^9.0.0
```

### 2. Create Configuration File

Create `eslint.config.js` (not `.eslintrc.*`):

```javascript
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    rules: {
      // Your custom rules here
    },
  },
];
```

### 3. Add Scripts to package.json

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### 4. Enable Traceability Plugin

To integrate the traceability plugin, update your `eslint.config.js` to include its recommended configuration:

```javascript
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [js.configs.recommended, traceability.configs.recommended];
```

## Configuration File Format

### Key Changes from ESLintRC

- **File name**: `eslint.config.js` (not `.eslintrc.*`)
- **Format**: Array of configuration objects (not single object)
- **Import style**: ES modules by default
- **No extends**: Use imports and spread syntax instead

### Basic Structure

```javascript
// eslint.config.js
import js from "@eslint/js";

export default [
  // Apply to all files
  js.configs.recommended,

  // Specific configuration objects
  {
    files: ["**/*.js"], // File patterns
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
    rules: {
      // Rule configurations
    },
  },

  // Ignore patterns
  {
    ignores: ["dist/**", "build/**", "node_modules/**"],
  },
];
```

## ESM vs CommonJS Config Files

ESLint 9's flat config system works with both ESM and CommonJS configs; which one you use depends on your Node setup:

- **ESM (recommended for new projects)**
  - Use `eslint.config.js` or `eslint.config.mjs` that exports with `export default [...]`.
  - Your `package.json` typically has `{ "type": "module" }`, or you use the `.mjs` extension.
  - Examples in this guide that use `import ... from` and `export default [...]` assume an ESM config.

- **CommonJS**
  - Use `eslint.config.cjs` or `eslint.config.js` with `module.exports = [...]`.
  - Your `package.json` typically omits `"type": "module"` (or explicitly sets `"type": "commonjs"`).
  - This style matches the example in the project README that shows `module.exports = [...]`.

Both forms are supported by ESLint 9 as long as the file extension and `package.json` `type` setting are consistent. Pick the style that matches the rest of your Node tooling and stick to it across your project.

## Common Configuration Patterns

### 1. JavaScript Only Project

```javascript
// eslint.config.js
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "error",
      "no-console": "warn",
    },
  },
  {
    ignores: ["dist/**", "build/**"],
  },
];
```

### 2. TypeScript Project

```javascript
// eslint.config.js
import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2024,
        sourceType: "module",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
  },
];
```

### Mixed JavaScript/TypeScript Projects

```javascript
// eslint.config.js
import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2024,
        sourceType: "module",
      },
      ecmaVersion: 2024,
      sourceType: "module",
    },
    rules: {
      // Combined JS and TS rules
      "no-unused-vars": "error",
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
];
```

### 3. Node.js Configuration Files (CommonJS)

```javascript
// eslint.config.js
export default [
  {
    // Config files that use CommonJS
    files: ["*.config.js", "*.config.mjs", "jest.config.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
  },
];
```

### 4. Test Files (Jest/Vitest)

```javascript
// eslint.config.js
export default [
  {
    files: [
      "**/*.test.{js,ts}",
      "**/__tests__/**/*.{js,ts}",
      "**/tests/**/*.{js,ts}",
    ],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
        vi: "readonly", // for Vitest
      },
    },
  },
];
```

### Monorepos / Workspaces

```javascript
// eslint.config.js
import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    // Lint all packages in a monorepo/workspace
    files: ["packages/*/src/**/*.{js,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: ["./packages/*/tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2024,
        sourceType: "module",
      },
      ecmaVersion: 2024,
      sourceType: "module",
    },
    rules: {
      // Monorepo-specific rules
      "no-unused-vars": "error",
    },
  },
];
```

## Package.json Scripts

### Recommended Scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "lint:check": "eslint . --max-warnings 0"
  }
}
```

### For Plugin Development (with Build Step)

```json
{
  "scripts": {
    "prelint": "npm run build",
    "build": "tsc",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## TypeScript Integration

### Parser Configuration

```javascript
// eslint.config.js
import typescriptParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser, // Import the parser object directly
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname, // Use import.meta.dirname in ESM
        ecmaVersion: 2024,
        sourceType: "module",
      },
    },
  },
];
```

### Common TypeScript Rules

```javascript
export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-const": "error",
    },
  },
];
```

## Common Issues and Solutions

### Issue: "Expected object with parse() method"

**Problem**: Using `require.resolve()` for parser

```javascript
// ❌ Wrong
languageOptions: {
  parser: require.resolve("@typescript-eslint/parser");
}
```

**Solution**: Import parser directly

```javascript
// ✅ Correct
import typescriptParser from "@typescript-eslint/parser";

languageOptions: {
  parser: typescriptParser;
}
```

### Issue: "eslint:recommended" not working

**Problem**: Using string reference

```javascript
// ❌ Wrong
export default ["eslint:recommended"];
```

**Solution**: Import from @eslint/js

```javascript
// ✅ Correct
import js from "@eslint/js";

export default [js.configs.recommended];
```

### Issue: CLI flags not working

**Problem**: Using deprecated flags

```bash
# ❌ Wrong (deprecated in flat config)
eslint src --ext .ts --config eslint.config.js
```

**Solution**: Use file patterns in config

```bash
# ✅ Correct
eslint .
```

### Issue: Globals not defined

**Problem**: Missing environment globals

```javascript
// ❌ Wrong - globals not defined
export default [
  {
    files: ["**/*.js"],
    // Missing globals for Node.js/browser
  },
];
```

**Solution**: Define globals explicitly

```javascript
// ✅ Correct
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        // etc.
      },
    },
  },
];
```

## Troubleshooting ESLint Configuration

The following scenarios cover common issues when configuring ESLint 9 with flat config, especially in mixed JavaScript and TypeScript projects.

### Mixed JavaScript/TypeScript Projects

Problem: ESLint does not correctly apply rules to `.js`, `.jsx`, `.ts`, or `.tsx` files when using separate file patterns or incorrect parser configuration.

Solution: Use combined file patterns or separate override blocks, and import the parser correctly. For example:

```javascript
// eslint.config.js
import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2024,
        sourceType: "module",
      },
      ecmaVersion: 2024,
      sourceType: "module",
    },
    rules: {
      // Combined JS and TS rules
      "no-unused-vars": "error",
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
];
```

## Working Example

Here's a complete working configuration for a TypeScript ESLint plugin project:

```javascript
// eslint.config.js
import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";

// Conditional plugin loading (for plugin development)
let plugin;
try {
  plugin = await import("./lib/index.js");
} catch {
  console.warn("Plugin not built yet, skipping traceability rules");
  plugin = {};
}

export default [
  js.configs.recommended,
  {
    // Node.js config files (CommonJS)
    files: ["*.config.js", "*.config.mjs", "jest.config.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
  },
  {
    // TypeScript files
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2024,
        sourceType: "module",
      },
    },
    plugins: {
      ...(plugin.rules ? { traceability: plugin } : {}),
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
  {
    // JavaScript files
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
    plugins: {
      ...(plugin.rules ? { traceability: plugin } : {}),
    },
  },
  {
    // Test files
    files: [
      "**/*.test.{js,ts}",
      "**/__tests__/**/*.{js,ts}",
      "**/tests/**/*.{js,ts}",
    ],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
  },
  {
    // Ignore patterns
    ignores: [
      "lib/**",
      "dist/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
    ],
  },
];
```

### Corresponding package.json:

```json
{
  "scripts": {
    "prelint": "npm run build",
    "build": "tsc",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@typescript-eslint/parser": "^8.46.4",
    "@typescript-eslint/utils": "^8.46.4",
    "eslint": "^9.39.1",
    "typescript": "^5.9.3"
  }
}
```

## Key Takeaways

1. **Use `eslint.config.js`**, not `.eslintrc.*`
2. **Import configurations**, don't use string references
3. **Import parsers directly**, don't use `require.resolve()`
4. **Define globals explicitly** for different environments
5. **Use file patterns** instead of CLI `--ext` flags
6. **Structure as array of objects**, each targeting specific file types
7. **Use `ignores`** instead of `.eslintignore` files

This setup provides a solid foundation for ESLint 9 that works reliably across different project types and environments.

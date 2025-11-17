# ESLint 9 Setup Guide

This guide shows how to properly set up ESLint 9 with flat configuration format. ESLint 9 uses flat config by default and has several important changes from previous versions.

## Table of Contents

- [Quick Setup](#quick-setup)
- [Configuration File Format](#configuration-file-format)
- [Common Configuration Patterns](#common-configuration-patterns)
- [Package.json Scripts](#packagejson-scripts)
- [TypeScript Integration](#typescript-integration)
- [Common Issues and Solutions](#common-issues-and-solutions)
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

##...
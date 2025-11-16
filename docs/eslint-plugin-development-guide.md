# ESLint Plugin Development Guidance

This document provides comprehensive guidance for developing ESLint plugins, specifically tailored for the eslint-plugin-traceability project. It's based on the official [ESLint plugin documentation](https://eslint.org/docs/latest/extend/plugins) and includes project-specific considerations.

## Plugin Structure Overview

An ESLint plugin is a JavaScript object that exposes specific properties to ESLint:

- `meta` - information about the plugin
- `configs` - an object containing named configurations
- `rules` - an object containing custom rule definitions
- `processors` - an object containing named processors

## Basic Plugin Template

```typescript
// src/index.ts
const plugin = {
  meta: {
    name: "eslint-plugin-traceability",
    version: "1.0.0",
    namespace: "traceability",
  },
  configs: {},
  rules: {},
  processors: {},
};

// for ESM source (compiled to CommonJS)
export default plugin;
```

## Meta Data Requirements

### Essential Meta Properties

Every plugin should include meta information for debugging and caching:

```typescript
const plugin = {
  meta: {
    name: "eslint-plugin-traceability", // npm package name
    version: "1.0.0", // npm package version
    namespace: "traceability", // prefix for rules/configs
  },
  // ... other properties
};
```

### Reading from package.json

For maintainability, read name and version from package.json:

```typescript
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(
  fs.readFileSync(join(__dirname, "../package.json"), "utf8"),
);

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
    namespace: "traceability",
  },
  // ... other properties
};
```

## Rule Development

### Rule Structure

Rules are the core functionality of an ESLint plugin:

```typescript
const plugin = {
  meta: {
    name: "eslint-plugin-traceability",
    version: "1.0.0",
    namespace: "traceability",
  },
  rules: {
    "require-story-annotation": {
      meta: {
        type: "problem",
        docs: {
          description: "require @story annotations on functions",
          category: "Traceability",
          recommended: true,
        },
        schema: [
          {
            type: "object",
            properties: {
              // rule options
            },
            additionalProperties: false,
          },
        ],
        messages: {
          missingStory: "Function '{{name}}' is missing @story annotation",
          invalidStoryFormat: "@story annotation format is invalid: {{format}}",
        },
      },
      create(context) {
        return {
          FunctionDeclaration(node) {
            // rule implementation
          },
        };
      },
    },
  },
};
```

### Rule Implementation Guidelines

1. **Use TypeScript for type safety**: Leverage @typescript-eslint/utils for AST manipulation
2. **Clear error messages**: Provide helpful, actionable error messages
3. **Configurable options**: Allow users to customize rule behavior
4. **Performance**: Avoid expensive operations in visitors
5. **Testing**: Use ESLint's RuleTester for comprehensive testing

### AST Node Handling

When working with AST nodes, use TypeScript for safety:

```typescript
import { TSESTree } from "@typescript-eslint/utils";

function checkFunctionAnnotation(node: TSESTree.FunctionDeclaration) {
  // Type-safe AST manipulation
  if (node.id?.name) {
    // Check for @story annotation in comments
  }
}
```

## Configuration Presets

### Recommended Configuration

Provide a recommended configuration for common use cases:

```typescript
const plugin = {
  // ... meta and rules
  configs: {},
};

// Assign configs after plugin definition to reference plugin
Object.assign(plugin.configs, {
  recommended: [
    {
      plugins: {
        traceability: plugin,
      },
      rules: {
        "traceability/require-story-annotation": "error",
        "traceability/require-req-annotation": "error",
        "traceability/valid-story-reference": "error",
        "traceability/valid-req-reference": "error",
      },
    },
  ],
  strict: [
    {
      plugins: {
        traceability: plugin,
      },
      rules: {
        "traceability/require-story-annotation": "error",
        "traceability/require-req-annotation": "error",
        "traceability/valid-story-reference": "error",
        "traceability/valid-req-reference": "error",
        "traceability/require-branch-annotation": "error",
      },
    },
  ],
});
```

### Configuration Usage

Users can extend configurations in their eslint.config.js:

```javascript
// eslint.config.js
import { defineConfig } from "eslint/config";
import traceability from "eslint-plugin-traceability";

export default defineConfig([
  {
    files: ["src/**/*.{js,ts}"],
    plugins: {
      traceability,
    },
    extends: ["traceability/recommended"],
  },
]);
```

## Testing Strategy

### Using ESLint's RuleTester

```typescript
// tests/rules/require-story-annotation.test.ts
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-story-annotation";

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("require-story-annotation", rule, {
  valid: [
    {
      code: `
        /**
         * @story docs/stories/001.0-DEV-EXAMPLE.story.md
         * @req REQ-EXAMPLE
         */
        function validFunction() {}
      `,
    },
  ],
  invalid: [
    {
      code: `function invalidFunction() {}`,
      errors: [
        {
          messageId: "missingStory",
          data: { name: "invalidFunction" },
        },
      ],
    },
  ],
});
```

### Test Organization

- **Unit tests**: Test individual rules in isolation
- **Integration tests**: Test plugin loading and configuration
- **File system tests**: Test file reference validation (use temporary directories)

## Project-Specific Considerations

### File System Integration

For validating @story references to actual files:

```typescript
import fs from "fs/promises";
import path from "path";

async function validateStoryFile(
  storyPath: string,
  context: any,
): Promise<boolean> {
  try {
    const fullPath = path.resolve(context.getCwd(), storyPath);

    // Check file exists
    await fs.access(fullPath);

    // Check file extension
    if (!fullPath.endsWith(".story.md")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
```

### Requirement Reference Validation

For validating @req references within story files:

```typescript
async function validateRequirement(
  storyPath: string,
  reqId: string,
): Promise<boolean> {
  try {
    const content = await fs.readFile(storyPath, "utf8");

    // Look for requirement ID in story content
    const reqPattern = new RegExp(`\\*\\*${reqId}\\*\\*:`, "g");
    return reqPattern.test(content);
  } catch {
    return false;
  }
}
```

### Configuration Options

Allow users to customize behavior:

```typescript
interface RuleOptions {
  storyFilePattern?: string; // Default: "**/*.story.md"
  requirementPattern?: string; // Default: "REQ-*"
  excludePatterns?: string[]; // Files to exclude
  includePrivateFunctions?: boolean; // Default: false
}
```

## Build and Distribution

### TypeScript Configuration

Configure TypeScript to output CommonJS for ESLint compatibility:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "declaration": true,
    "outDir": "./lib",
    "strict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "lib", "tests"]
}
```

### Package.json Configuration

Essential package.json settings for ESLint plugins:

```json
{
  "name": "eslint-plugin-traceability",
  "version": "1.0.0",
  "description": "ESLint plugin for enforcing code traceability annotations",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "keywords": ["eslint", "eslintplugin", "eslint-plugin", "traceability"],
  "peerDependencies": {
    "eslint": ">=9.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Development Workflow

### Local Testing

1. **Link locally**: Use `npm link` for local development
2. **Test project**: Create a test project to verify plugin behavior
3. **Rule tester**: Use ESLint's RuleTester for individual rule testing
4. **Integration testing**: Test complete plugin configuration

### Quality Checks

Recommended linting for the plugin itself:

```javascript
// eslint.config.js (for the plugin project)
import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import eslintPlugin from "eslint-plugin-eslint-plugin";

export default [
  js.configs.recommended,
  {
    plugins: {
      "@typescript-eslint": typescript,
      "eslint-plugin": eslintPlugin,
    },
    rules: {
      // Plugin-specific linting rules
    },
  },
];
```

## Performance Considerations

### Efficient AST Traversal

- **Minimal visitors**: Only register for needed node types
- **Early returns**: Exit early when conditions aren't met
- **Caching**: Cache expensive operations (file reads, regex compilation)
- **Async handling**: Use proper async patterns for file operations

### Memory Management

- **Avoid global state**: Keep rule instances isolated
- **Clean up resources**: Properly handle file handles and timers
- **Limit recursion**: Avoid deep recursive operations

## Documentation Requirements

### Rule Documentation

Each rule should have comprehensive documentation:

```typescript
const rule = {
  meta: {
    docs: {
      description: "require @story annotations on functions",
      category: "Traceability",
      recommended: true,
      url: "https://github.com/voder-ai/eslint-plugin-traceability#require-story-annotation",
    },
    // ... other meta properties
  },
  // ... rule implementation
};
```

### README Structure

Include in the plugin README:

1. **Installation instructions**
2. **Configuration examples**
3. **Rule documentation**
4. **Usage examples**
5. **Troubleshooting guide**

## Security Considerations

### File System Access

- **Validate paths**: Prevent directory traversal attacks
- **Sanitize input**: Validate user-provided file patterns
- **Limit scope**: Restrict file access to project directory

### Input Validation

- **Schema validation**: Use JSON Schema for rule options
- **Type checking**: Leverage TypeScript for compile-time safety
- **Runtime checks**: Validate configuration at runtime

## Maintenance Guidelines

### Version Management

- **Semantic versioning**: Follow semver for releases
- **Breaking changes**: Document breaking changes clearly
- **Migration guides**: Provide upgrade instructions

### Community Support

- **Issue templates**: Provide clear bug report templates
- **Contributing guide**: Document contribution process
- **Code of conduct**: Establish community guidelines

---

## Related Resources

- [ESLint Plugin Development Guide](https://eslint.org/docs/latest/extend/plugins)
- [ESLint Custom Rules](https://eslint.org/docs/latest/extend/custom-rules)
- [@typescript-eslint/utils](https://typescript-eslint.io/packages/utils/)
- [ESLint RuleTester](https://eslint.org/docs/latest/integrate/nodejs-api#ruletester)

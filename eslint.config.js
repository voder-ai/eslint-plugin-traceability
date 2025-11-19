/**
 * ESLint flat config for Traceability Plugin
 * @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md
 * @req REQ-FLAT-CONFIG - Setup ESLint v9 flat config for plugin usage
 */

const typescriptParser = require("@typescript-eslint/parser");
const js = require("@eslint/js");

// Try to load the plugin, but handle case where it doesn't exist yet
let plugin;
try {
  plugin = require("./lib/src/index.js");
} catch {
  console.warn("Plugin not built yet, skipping traceability rules");
  plugin = {};
}

module.exports = [
  js.configs.recommended,
  {
    // Node.js config files
    files: ["*.config.js", "*.config.mjs", "jest.config.js"],
    languageOptions: {
      ecmaVersion: 2022,
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
    files: ["tests/integration/cli-integration.test.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
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
    plugins: { ...(plugin.rules ? { traceability: plugin } : {}) },
    rules: { complexity: "error" },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: "module",
      },
      globals: {
        process: "readonly",
        require: "readonly",
        module: "readonly",
        console: "readonly",
      },
    },
    plugins: {
      ...(plugin.rules ? { traceability: plugin } : {}),
    },
    rules: {
      complexity: ["error", { max: 18 }],
      // Enforce maximum lines per function for maintainability
      "max-lines-per-function": ["error", { max: 60, skipBlankLines: true, skipComments: true }],
      // Enforce maximum lines per file for maintainability
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      // Disallow magic numbers with sensible exceptions for 0 and 1
      "no-magic-numbers": ["error", { ignore: [0, 1], ignoreArrayIndexes: true, enforceConst: true }],
      // Limit max parameters per function
      "max-params": ["error", { max: 4 }],
      "no-undef": "off",
      "no-console": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    plugins: {
      ...(plugin.rules ? { traceability: plugin } : {}),
    },
    rules: {
      complexity: ["error", { max: 18 }],
      // Enforce maximum lines per function for maintainability
      "max-lines-per-function": ["error", { max: 60, skipBlankLines: true, skipComments: true }],
      // Enforce maximum lines per file for maintainability
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      // Disallow magic numbers with sensible exceptions for 0 and 1
      "no-magic-numbers": ["error", { ignore: [0, 1], ignoreArrayIndexes: true, enforceConst: true }],
      // Limit max parameters per function
      "max-params": ["error", { max: 4 }],
    },
  },
  {
    // Test files
    files: [
      "**/*.test.{js,ts,tsx}",
      "**/__tests__/**/*.{js,ts,tsx}",
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
        require: "readonly",
        __dirname: "readonly",
        process: "readonly",
        console: "readonly",
      },
    },
    rules: {
      complexity: "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
      // Disable magic numbers and max params in tests
      "no-magic-numbers": "off",
      "max-params": "off",
    },
  },
  {
    // Ignore build output and node_modules and dynamic loader file
    ignores: [
      "src/index.ts",
      "lib/**",
      "node_modules/**",
      "coverage/**",
      ".cursor/**",
      "**/.cursor/**",
      ".voder/**",
      "docs/**",
      "*.md",
    ],
  },
];
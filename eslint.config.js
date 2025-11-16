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
  plugin = require("./lib/index.js");
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
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      ...(plugin.rules ? { traceability: plugin } : {}),
    },
    rules: {
      // Enforce maximum cyclomatic complexity per function
      complexity: ["error", { max: 20 }],
      // Add basic TypeScript-friendly rules here as needed
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
      // Enforce maximum cyclomatic complexity per function
      complexity: ["error", { max: 20 }],
      // Add basic JavaScript rules here as needed
    },
  },
  {
    // Test files
    files: [
      "**/*.test.{js,ts,tsx}",
      "**/__tests__/**/*.{js,ts,tsx}",
      "**/tests/**/*.{js,ts,tsx}",
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
    // Ignore build output and node_modules
    ignores: ["lib/**", "node_modules/**", "coverage/**"],
  },
];

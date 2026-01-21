/**
 * ESLint flat config for Traceability Plugin
 * @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md
 * @req REQ-FLAT-CONFIG - Setup ESLint v9 flat config for plugin usage
 */

const typescriptParser = require("@typescript-eslint/parser");
const js = require("@eslint/js");

// Prefer loading the plugin from the source during development if available.
// This allows running eslint directly against the src tree without a build step.
// Fallback to the built plugin in lib for CI / production use.
// If neither exists and we are running in CI, throw an error to fail the build.
// Otherwise warn and continue with an empty plugin object so local dev can proceed.
let plugin;
try {
  // First, try to load from source (developer workflow)
  plugin = require("./src/index.js");
} catch (eSrc) {
  try {
    // Fallback to built output (production / CI workflow)
    plugin = require("./lib/index.js");
  } catch (eLib) {
    const inCI = process.env.NODE_ENV === "ci" || process.env.CI === "true";
    if (inCI) {
      // In CI we want to fail fast if the plugin isn't built/installed.
      throw new Error(
        "Traceability plugin not found. Expected ./src/index.js or ./lib/index.js to be present in CI."
      );
    } else {
      // Local dev: warn and continue without the plugin so eslint can still run.
      console.warn("Traceability plugin not built yet, skipping traceability rules");
      plugin = {};
    }
  }
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
      complexity: ["error", { max: 16 }],
      // Enforce maximum lines per function for maintainability
      "max-lines-per-function": ["error", { max: 45, skipBlankLines: true, skipComments: true }],
      // Enforce maximum lines per file for maintainability
      "max-lines": ["error", { max: 450, skipBlankLines: true, skipComments: true }],
      // Disallow magic numbers with sensible exceptions for 0 and 1
      "no-magic-numbers": ["error", { ignore: [0, 1], ignoreArrayIndexes: true, enforceConst: true }],
      // Limit max parameters per function
      "max-params": ["error", { max: 4 }],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-new-wrappers": "error",
      "no-undef": "off",
      "no-console": "off",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      ...(plugin.rules
        ? {
            "traceability/valid-annotation-format": "error",
            "traceability/valid-story-reference": "error",
            "traceability/valid-req-reference": "error",
          }
        : {}),
    },
  },
  {
    // Rule 4: Function-level traceability requirements (src + tests)
    files: ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    plugins: { ...(plugin.rules ? { traceability: plugin } : {}) },
    rules: {
      ...(plugin.rules
        ? {
            "traceability/require-traceability": "error",
          }
        : {}),
    },
  },
  {
    // Rule 5: Branch-level traceability requirements (src only)
    files: ["src/**/*.{ts,tsx}"],
    plugins: { ...(plugin.rules ? { traceability: plugin } : {}) },
    rules: {
      ...(plugin.rules
        ? {
            "traceability/require-branch-annotation": "error",
          }
        : {}),
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
      complexity: ["error", { max: 16 }],
      // Enforce maximum lines per function for maintainability
      "max-lines-per-function": ["error", { max: 45, skipBlankLines: true, skipComments: true }],
      // Enforce maximum lines per file for maintainability
      "max-lines": ["error", { max: 450, skipBlankLines: true, skipComments: true }],
      // Disallow magic numbers with sensible exceptions for 0 and 1
      "no-magic-numbers": ["error", { ignore: [0, 1], ignoreArrayIndexes: true, enforceConst: true }],
      // Limit max parameters per function
      "max-params": ["error", { max: 4 }],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-new-wrappers": "error",
      ...(plugin.rules ? {
        "traceability/valid-annotation-format": "error",
        "traceability/valid-story-reference": "error",
      } : {}),
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
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    // Ignore build output and node_modules and dynamic loader file
    ignores: [
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
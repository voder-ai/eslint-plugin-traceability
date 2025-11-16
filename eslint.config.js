/**
 * ESLint flat config for Traceability Plugin
 * @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md
 * @req REQ-FLAT-CONFIG - Setup ESLint v9 flat config for plugin usage
 */

const plugin = require("./lib/index.js");

module.exports = [
  {
    files: ["*.ts", "*.tsx"],
    languageOptions: {
      parser: require.resolve("@typescript-eslint/parser"),
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    plugins: { traceability: plugin },
    rules: {},
  },
  {
    files: ["*.js", "*.jsx"],
    plugins: { traceability: plugin },
    rules: {},
  },
];

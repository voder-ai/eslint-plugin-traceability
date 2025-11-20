/****
 * Jest configuration for ESLint Traceability Plugin tests
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TEST-SETUP - Provide testing infrastructure for plugin
 */
module.exports = {
  coverageProvider: "v8",
  collectCoverageFrom: ["src/**/*.{ts,js}"],
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      diagnostics: false,
    },
  },
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/lib/"],
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  coveragePathIgnorePatterns: ["<rootDir>/lib/", "<rootDir>/node_modules/"],
  moduleFileExtensions: ["ts", "js"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "clover", "json-summary"],
  coverageThreshold: {
    global: {
      branches: 82,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
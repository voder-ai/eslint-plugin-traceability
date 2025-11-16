/**
 * Jest configuration for ESLint Traceability Plugin tests
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TEST-SETUP - Provide testing infrastructure for plugin
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/tests/**/*.test.ts",
    "<rootDir>/lib/tests/**/*.test.js",
  ],
  coverageThreshold: {
    global: {
      branches: 47,
      functions: 42,
      lines: 59,
      statements: 57,
    },
  },
  moduleFileExtensions: ["ts", "js"],
};

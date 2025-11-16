/**
 * Jest configuration for ESLint Traceability Plugin tests
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TEST-SETUP - Provide testing infrastructure for plugin
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  coverageThreshold: {
    global: {
      branches: 88,
      functions: 87,
      lines: 90,
      statements: 90,
    },
  },
  moduleFileExtensions: ["ts", "js"],
};

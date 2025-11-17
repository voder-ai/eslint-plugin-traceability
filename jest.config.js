/****
 * Jest configuration for ESLint Traceability Plugin tests
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TEST-SETUP - Provide testing infrastructure for plugin
 */
module.exports = {
  coverageProvider: "v8",
  collectCoverageFrom: ["src/**/*.{ts,js}"],
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/lib/"],
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  coveragePathIgnorePatterns: ["<rootDir>/lib/"],
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

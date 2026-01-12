---
status: "accepted"
date: 2026-01-12
decision-makers: [Development Team]
consulted: [Foundation Assessment, Testing Best Practices]
informed: [Project Stakeholders, Future Contributors]
---

# Error Handling Test Strategy for Plugin Load Failures

## Context and Problem Statement

Story 001.0-DEV-PLUGIN-SETUP defines REQ-ERROR-HANDLING to ensure the plugin "gracefully handles plugin loading errors and missing dependencies." The foundation assessment identified that existing CLI tests (tests/cli-error-handling.test.ts) validate lint failures but do not simulate rule module load failures, missing package metadata, or malformed plugin scenarios. We need to decide how to test these error scenarios to provide comprehensive coverage while maintaining test reliability and maintainability.

## Decision Drivers

- Need for test evidence that REQ-ERROR-HANDLING acceptance criteria are met
- Ensuring error scenarios are reproducible in test environment
- Avoiding pollution of version control with test artifacts
- Maintaining fast, reliable test execution
- Providing clear test documentation and traceability to requirements
- Following established testing patterns in the project

## Considered Options

- Temporary test environments with simulated plugin structures
- Mock/stub error scenarios in unit tests
- Integration tests against broken builds in CI only
- Manual testing only without automated coverage

## Decision Outcome

Chosen option: "Temporary test environments with simulated plugin structures", because it provides realistic end-to-end error path validation while maintaining test isolation and avoiding version control pollution. Tests use `fs.mkdtemp()` to create temporary plugin structures with intentional failures, execute ESLint CLI against them, and verify error handling, then clean up.

### Consequences

- Good, because error scenarios are tested end-to-end through actual ESLint CLI execution
- Good, because temporary directories prevent test artifacts from polluting version control
- Good, because tests document expected error messages and exit codes
- Good, because each scenario is independently verifiable and reproducible
- Good, because aligns with existing e2e test patterns using temp directories
- Bad, because tests require filesystem operations and process spawning (slower than pure unit tests)
- Bad, because tests depend on ESLint CLI being available in node_modules
- Neutral, because requires careful cleanup in afterEach/finally blocks

### Confirmation

Implementation compliance confirmed through:

- Tests in tests/cli-error-handling.test.ts use fs.mkdtemp for temporary environments
- Each test case cleans up with fs.rmSync in finally blocks
- Tests verify stderr output contains expected error messages
- Tests verify exit codes match documented error handling behavior
- @supports annotations link test cases to REQ-ERROR-HANDLING
- No test-generated plugin directories committed to version control

## Test Coverage Scenarios

### Rule Module Load Failure

**Scenario**: Rule file exists but throws error when loaded

**Test Implementation**:

- Create temporary plugin structure with intentionally broken rule module
- Rule file contains `throw new Error('intentionally broken')`
- Plugin index.js catches error and creates fallback rule
- Verify stderr contains "Failed to load rule" message
- Verify plugin continues functioning with fallback

**Acceptance Criteria Mapping**: REQ-ERROR-HANDLING - "rule module loading fails"

### Missing Package Metadata

**Scenario**: Plugin loads without package.json present

**Test Implementation**:

- Create temporary plugin directory without package.json
- Plugin index.js exports rules correctly
- Verify plugin still functions (Node.js allows modules without package.json)
- Verify no fatal errors occur
- Exit code 0 indicates graceful degradation

**Acceptance Criteria Mapping**: REQ-ERROR-HANDLING - "missing dependency handling"

### Malformed Plugin Entry Point

**Scenario**: Plugin index.js contains syntax errors

**Test Implementation**:

- Create temporary plugin with invalid JavaScript syntax in index.js
- Attempt to load plugin through ESLint config
- Verify ESLint reports clear error message
- Verify non-zero exit code (fatal error is expected)
- Error handling at ESLint level, not plugin level

**Acceptance Criteria Mapping**: REQ-ERROR-HANDLING - "plugin loading errors"

## Pros and Cons of the Options

### Temporary test environments with simulated plugin structures

Create real filesystem structures in temp directories to simulate error conditions.

- Good, because tests realistic end-to-end error paths through ESLint CLI
- Good, because isolated from actual codebase (no risk of corrupting real plugin)
- Good, because temporary directories auto-cleanup prevents test artifact pollution
- Good, because can test exact error messages and exit codes users will see
- Good, because works well with CI/CD pipeline (no special environment needed)
- Neutral, because requires careful resource management (cleanup in finally blocks)
- Bad, because slower than pure unit tests due to filesystem and process operations
- Bad, because more complex test setup code

### Mock/stub error scenarios in unit tests

Use mocking frameworks to simulate errors during module loading.

- Good, because fast execution without filesystem operations
- Good, because isolated from external dependencies
- Good, because easy to simulate specific error conditions
- Bad, because doesn't test actual ESLint CLI integration
- Bad, because mocks may not reflect real error behavior accurately
- Bad, because doesn't verify actual error messages users see
- Bad, because reduces confidence in end-to-end error handling

### Integration tests against broken builds in CI only

Only test error scenarios in CI pipeline with special broken builds.

- Good, because no impact on local development test speed
- Good, because can use actual build artifacts
- Bad, because error scenarios not testable locally during development
- Bad, because CI-only failures harder to debug and reproduce
- Bad, because requires maintaining separate broken build configurations
- Bad, because doesn't integrate with standard test suite

### Manual testing only without automated coverage

Rely on manual testing and code review for error handling validation.

- Good, because no test implementation cost
- Good, because no test maintenance burden
- Bad, because no automated verification of error handling
- Bad, because error scenarios may regress without detection
- Bad, because doesn't meet foundation assessment requirement for test evidence
- Bad, because no documentation of expected error behavior

## Related Decisions

- [002-jest-for-eslint-testing](002-jest-for-eslint-testing.accepted.md) - Establishes Jest as testing framework
- [003-code-quality-ratcheting-plan](003-code-quality-ratcheting-plan.md) - Test coverage expectations

## Related Requirements

- **Story**: 001.0-DEV-PLUGIN-SETUP
- **Requirement**: REQ-ERROR-HANDLING - Gracefully handles plugin loading errors and missing dependencies
- **Test Coverage**: tests/cli-error-handling.test.ts
- **Specification**: prompts/001.0-plugin-error-handling.md

## Implementation Notes

### Critical Testing Pattern

All tests MUST follow this pattern to avoid version control pollution:

```javascript
it("test scenario", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-prefix-"));

  try {
    // Create test plugin structure
    // Run ESLint CLI
    // Verify error handling
    expect(result.stderr).toContain("expected error");
  } finally {
    // CRITICAL: Always clean up
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
```

### Violation Examples

**HIGH PENALTY** patterns to avoid:

```javascript
// BAD: Creates test artifacts in repository
const testDir = path.join(__dirname, "../test-plugin");
fs.mkdirSync(testDir);
// Never cleaned up, gets committed to git

// BAD: No cleanup on test failure
const tempDir = fs.mkdtempSync(...);
// Test code...
fs.rmSync(tempDir, { recursive: true }); // Not in finally block
```

## References

- Foundation Assessment: `.voder/foundation-assessment.json`
- Functionality Gap: "REQ-ERROR-HANDLING#1 lacks test evidence for missing dependency handling and CLI behavior when rule loading fails"
- Existing Test: tests/cli-error-handling.test.ts (extended to add missing scenarios)
- Error Handling Implementation: src/index.ts (rule loading try/catch)

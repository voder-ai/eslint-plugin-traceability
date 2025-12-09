---
status: proposed
date: 2025-12-09
decision-makers: [Development Team]
---

# Exclude Anonymous Test Framework Callbacks from Function-Level Annotations

## Context and Problem Statement

Story 003.0-DEV-FUNCTION-ANNOTATIONS introduced the requirement `REQ-FUNCTION-DETECTION`, which states: "Anonymous arrow functions (e.g., callbacks like `array.map(() => {})`) are excluded by default from traceability requirements."

The current implementation excludes anonymous arrow functions only when they are **nested inside another function**. However, test framework callbacks (e.g., `describe()`, `it()`, `test()`, `beforeEach()`, etc.) are often called at the **top level** of test files, meaning they are not nested inside any other function.

This creates a problem:

```javascript
// Test file with file-level traceability
/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */

describe("Feature X", () => {
  // ❌ Flagged as missing annotation
  it("should work", () => {
    // ❌ Flagged as missing annotation
    // test code
  });
});
```

The anonymous arrow functions passed to `describe()` and `it()` are being flagged as requiring `@story` annotations, even though:

1. They are implementation details of the test structure
2. The test file itself has file-level `@supports` or `@story` annotation for traceability
3. These callbacks don't have meaningful names and exist only as test scaffolding
4. Requiring annotations on every test callback creates hundreds of unnecessary annotations

This blocks adoption of function-level traceability in projects with test suites.

## Decision Drivers

- **Existing requirement alignment**: `REQ-FUNCTION-DETECTION` already establishes that anonymous arrow function callbacks should be excluded by default
- **Practical usability**: Test files can have dozens or hundreds of test cases; requiring annotations on every callback is impractical
- **File-level traceability sufficiency**: Test files typically have file-level annotations that establish traceability for the entire test suite
- **ESLint ecosystem consistency**: Other ESLint rules often have special handling for test files and test framework patterns
- **Developer experience**: Developers should focus on annotating actual implementation code rather than test scaffolding

## Considered Options

1. Add `excludeTestCallbacks` option (default: `true`)
2. Exclude all test files via ESLint ignore patterns
3. Use scope configuration to exclude `ArrowFunctionExpression`
4. File-pattern-based exclusion (e.g., `excludeFilePatterns: ["**/*.test.ts"]`)
5. Require @story on `describe()` but not on `it()`

## Decision Outcome

Chosen option: "Add `excludeTestCallbacks` option (default: `true`)", because it provides targeted relief for test callback scenarios while maintaining flexibility for teams that want stricter enforcement, aligns with existing `REQ-ARROW-FUNCTION-EXCLUDED` requirements, and doesn't compromise traceability (file-level annotations still required).

### Consequences

- Good, because enables test suite traceability adoption without annotation noise
- Good, because reduces hundreds of meaningless annotations in test files
- Good, because provides better developer experience (focus on implementation code)
- Good, because maintains traceability via file-level annotations on test files
- Good, because provides opt-out for teams wanting stricter enforcement
- Bad, because adds additional detection logic (maintain list of test framework function names)
- Bad, because adds another configuration option (though with sensible default)
- Neutral, because false negatives possible if production code uses function names like `describe()`

### Confirmation

The implementation will be confirmed by:

1. Test file with `describe()` and `it()` callbacks does not trigger errors (default behavior)
2. Named arrow functions still require annotations
3. Nested anonymous functions in production code still excluded
4. Option `excludeTestCallbacks: false` re-enables checking
5. All existing tests pass
6. Documentation includes examples

## Pros and Cons of the Options

### Add excludeTestCallbacks option (default: true)

Detect anonymous arrow functions passed as direct callbacks to known test framework functions (describe, it, test, etc.) and exclude them from annotation requirements by default.

Configuration example:

```javascript
{
  "traceability/require-story-annotation": ["error", {
    "excludeTestCallbacks": true  // default
  }]
}
```

- Good, because provides targeted relief specifically for test callback pattern
- Good, because test framework function names are well-known and stable
- Good, because opt-out available for stricter enforcement
- Good, because aligns with existing `REQ-FUNCTION-DETECTION` requirement
- Bad, because requires maintaining list of test framework function names
- Bad, because adds configuration complexity
- Neutral, because false negatives if production code uses names like `describe()`

### Exclude all test files via ESLint ignore patterns

Users configure ESLint to skip test files entirely using `.eslintignore` or config `ignorePatterns`.

- Good, because simple configuration (no code changes needed)
- Good, because well-understood ESLint pattern
- Bad, because test files should still enforce some traceability (file-level annotations)
- Bad, because loses all linting benefits for test files
- Bad, because doesn't address the specific issue (test callbacks vs test code)

### Use scope configuration to exclude ArrowFunctionExpression

Configure `scope: ["FunctionDeclaration", "FunctionExpression", "MethodDefinition"]` to exclude all arrow functions.

- Good, because uses existing configuration mechanism
- Good, because simple for users to configure
- Bad, because excludes named arrow functions in production code (should be annotated)
- Bad, because too broad (affects all arrow functions, not just test callbacks)
- Bad, because doesn't provide granular control

### File-pattern-based exclusion

Add option like `excludeFilePatterns: ["**/*.test.ts", "**/*.spec.ts"]` to exclude entire files.

- Good, because targets test files specifically
- Good, because pattern matching is familiar to developers
- Bad, because excludes all functions in test files (helper functions should be annotated)
- Bad, because not all test files follow naming conventions
- Bad, because doesn't address the root issue (anonymous test callbacks vs test helpers)

### Require @story on describe() but not on it()

Only exclude the innermost test callbacks (it, test) but require annotations on describe blocks.

- Good, because provides some traceability structure
- Good, because describe blocks organize test suites
- Bad, because describe callbacks are also anonymous implementation details
- Bad, because inconsistent rule behavior is confusing
- Bad, because still creates significant annotation noise

## More Information

**Implementation approach:**

1. Add constant list of known test framework function names (describe, it, test, beforeEach, etc.)
2. Add helper function `isTestFrameworkCallback()` to detect the pattern
3. Update `requiresOwnFunctionAnnotation()` to check this condition
4. Wire the `excludeTestCallbacks` option through the rule schema and configuration
5. Add comprehensive tests for various test framework patterns

**Test frameworks covered:**

- Jest (describe, it, test, beforeEach, afterEach, beforeAll, afterAll)
- Mocha (describe, it, suite, context, specify, before, after, beforeEach, afterEach)
- Vitest (describe, it, test, bench, beforeEach, afterEach, beforeAll, afterAll)
- Focused/skipped variants (fdescribe, xdescribe, fit, xit, etc.)
- Concurrent variants (test.concurrent, describe.concurrent)

**Related:**

- Story 004.0-DEV-BRANCH-ANNOTATIONS (REQ-ARROW-FUNCTION-EXCLUDED)
- Story 003.0-DEV-FUNCTION-ANNOTATIONS
- Issue #5: https://github.com/voder-ai/eslint-plugin-traceability/issues/5

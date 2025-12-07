# Examples

Created autonomously by [voder.ai](https://voder.ai).
Examples are written for the eslint-plugin-traceability 1.x series. For the latest published version and full release history, see GitHub Releases: <https://github.com/voder-ai/eslint-plugin-traceability/releases>.

This document provides runnable examples demonstrating how to use the `eslint-plugin-traceability` plugin in real-world scenarios.

## 1. ESLint Flat Config with Recommended Preset

Create an ESLint config file (`eslint.config.js`) at your project root:

```javascript
// eslint.config.js
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [js.configs.recommended, traceability.configs.recommended];
```

Then run ESLint on your source files:

```bash
npx eslint "src/**/*.ts"
```

## 2. Using the Strict Preset

If you want to enforce all traceability rules (strict mode), update your config:

```javascript
// eslint.config.js
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [js.configs.recommended, traceability.configs.strict];
```

Run ESLint the same way:

```bash
npx eslint "src/**/*.js"
```

## 3. CLI Invocation Example

You can use the plugin without a config file by specifying rules inline:

```bash
npx eslint --no-eslintrc \
  --rule "traceability/require-story-annotation:error" \
  --rule "traceability/require-req-annotation:error" \
  sample.js
```

- `--no-eslintrc` tells ESLint to ignore user configs.
- `--rule` options enable the traceability rules you need.

Replace `sample.js` with your JavaScript or TypeScript file.

## 4. Linting a Specific Directory

Add an npm script in your `package.json`:

```json
"scripts": {
  "lint:trace": "eslint \"src/**/*.{js,ts}\" --config eslint.config.js"
}
```

Then run:

```bash
npm run lint:trace
```

## 5. Test Traceability Example

This example complements the `traceability/require-test-traceability` rule and matches its default expectations for how stories and requirements are referenced from tests.

Create a Jest test file, for example `tests/dev-test-traceability.spec.ts`:

```ts
/**
 * @supports docs/stories/021.0-DEV-TEST-TRACEABILITY.story.md#REQ-TEST-TRACEABILITY
 */

describe("Story 021.0-DEV-TEST-TRACEABILITY", () => {
  it("[REQ-TEST-TRACEABILITY] should handle the primary test scenario", () => {
    // Arrange
    const input = "happy-path";

    // Act
    const result = performOperation(input);

    // Assert
    expect(result).toBe("ok");
  });

  it("[REQ-TEST-TRACEABILITY-EDGE] should handle the edge-case scenario", () => {
    // Arrange
    const input = "edge-case";

    // Act
    const result = performOperation(input);

    // Assert
    expect(result).toBe("edge-ok");
  });
});

// Example implementation under test (normally imported from your source code)
function performOperation(input: string): string {
  if (input === "edge-case") return "edge-ok";
  return "ok";
}
```

## 6. Branch annotations with if/else/else-if and Prettier

This example shows how to keep `traceability/require-branch-annotation` satisfied while still running Prettier on your code.

### 6.1 Before formatting

In this version, annotations are placed immediately before each significant branch. This is a simple layout that is easy to read and accepted by the rule:

```ts
function pickCategory(score: number): string {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-BRANCH-DETECTION
  if (score >= 80) {
    return "high";
  }
  // @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
  // @req REQ-DUAL-POSITION-DETECTION-ELSE-IF
  else if (score >= 50) {
    return "medium";
  }
  // You can annotate `else` using the same pattern if you treat it as a significant branch.
  else {
    return "low";
  }
}
```

You can run just the branch-annotation rule via the CLI:

```bash
npx eslint --no-eslintrc \
  --rule "traceability/require-branch-annotation:error" \
  pick-category.ts
```

### 6.2 After formatting with Prettier

Prettier may reflow your `else if` line, wrap the condition, or move comments into the body of the branch. The `traceability/require-branch-annotation` rule is formatter-aware and will still recognize valid annotations in supported positions, such as the first comment-only lines inside the block body:

```ts
function pickCategory(score: number): string {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-BRANCH-DETECTION
  if (score >= 80) {
    return "high";
  } else if (score >= 50) {
    // @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
    // @req REQ-DUAL-POSITION-DETECTION-ELSE-IF
    return "medium";
  } else {
    return "low";
  }
}
```

Depending on your Prettier version and configuration, the exact layout of the `else if` line and braces may differ, but as long as your annotations are in one of the supported locations, the rule will accept them.

- Notes:
  - For most branch types, `traceability/require-branch-annotation` associates comments immediately before the branch keyword (such as `if`, `else`, `switch`, `case`) with that branch.
  - For `catch` clauses and `else if` branches, the rule is formatter-aware and also looks at comments between the condition and the block, as well as the first comment-only lines inside the block body, so you do not need to fight Prettier if it moves your annotations.
  - When annotations exist in more than one place around an `else if` branch, the rule prefers comments immediately before the `else if` line, then comments between the condition and the block, and finally comments inside the block body, matching the behavior described in the API reference and stories `025.0` and `026.0`.

# CLI Integration Script Documentation

This document provides detailed information about the `cli-integration.js` script, which runs end-to-end CLI integration tests for the `eslint-plugin-traceability` plugin.

Story: docs/stories/001.0-DEV-PLUGIN-SETUP.story.md  
Requirement: REQ-PLUGIN-STRUCTURE - Validate plugin registers via CLI

## Overview

The `cli-integration.js` script automates tests that invoke the ESLint CLI with the plugin configured, verifying that rule errors are reported (or not) as expected when code is passed via `stdin`.

It uses Node.js `child_process.spawnSync` to:

- Disable default ESLint config resolution
- Load the plugin via `eslint.config.js` flat config
- Pass code and rule settings via `--stdin` and `--rule` flags

## Tests Implemented

The script defines an array of test scenarios, each with:

- **name**: A descriptive test name
- **code**: A string containing JavaScript code to lint
- **rule**: An ESLint rule override specifying severity
- **expectedStatus**: The expected exit code (0 or 1)

Current test scenarios:

1. `reports error when @story annotation is missing`
   - Code: `function foo() {}`
   - Rule: `traceability/require-story-annotation:error`
   - Expected exit code: 1 (error reported)

2. `does not report error when @story annotation is present`

   ```js
   /**
    * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    */
   function foo() {}
   ```

   - Rule: `traceability/require-story-annotation:error`
   - Expected exit code: 0 (no error)

3. `reports error when @req annotation is missing`
   - Code: `function bar() {}`
   - Rule: `traceability/valid-req-reference:error`
   - Expected exit code: 1 (error reported)

4. `reports error when @req annotation uses path traversal`

   ```js
   /**
    * @req ../docs/requirements/REQ-INVALID.md
    */
   function bar() {}
   ```

   - Rule: `traceability/valid-req-reference:error`
   - Expected exit code: 1 (error reported)

5. `reports error when @req annotation uses absolute path`

   ```js
   /**
    * @req /etc/passwd
    */
   function baz() {}
   ```

   - Rule: `traceability/valid-req-reference:error`
   - Expected exit code: 1 (error reported)

## Usage

```bash
# Run CLI integration tests
node cli-integration.js
```

## Integration into CI

The CI workflow (`.github/workflows/ci.yml`) includes a separate `integration-tests` job that runs:

```yaml
jobs:
  integration-tests:
    needs: quality-checks
    run: node cli-integration.js
```

This ensures that CLI-level behavior is verified on all supported Node.js versions.

## Extending Tests

To add new CLI integration scenarios:

1. Open `cli-integration.js`.
2. Append a new object to the `tests` array with the desired `name`, `code`, `rule`, and `expectedStatus`.
3. Run `node cli-integration.js` locally to verify.

Ensure that any new scenarios have clear test names and cover distinct rule behaviors.

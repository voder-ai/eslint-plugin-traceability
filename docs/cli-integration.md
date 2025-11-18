# CLI Integration Guide

Story: docs/stories/001.0-DEV-PLUGIN-SETUP.story.md  
Requirement: REQ-PLUGIN-STRUCTURE - Validate plugin registers via CLI

Integration tests for the ESLint CLI plugin are included in the Jest test suite under `tests/integration/cli-integration.test.ts`.

## Running CLI Integration Tests

To run only the CLI integration tests:

```bash
npm test -- tests/integration/cli-integration.test.ts
```

To run the full test suite:

```bash
npm test
```

These tests invoke the ESLint CLI with the plugin configured, verifying that rule errors are reported (or not) as expected when code is passed via `stdin`. Ensure your ESLint flat config (`eslint.config.js`) loads the plugin before running these tests.
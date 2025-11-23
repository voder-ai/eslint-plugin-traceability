---
status: "accepted"
date: 2025-11-23
decision-makers: [Development Team]
consulted:
  [ESLint Documentation, eslint-plugin-security, Node.js Security Guidance]
informed: [All Contributors]
---

# 009-Security-Focused Lint Rules

## Context and Problem Statement

This project already has strong baseline linting focused on maintainability (complexity, max-lines, no-magic-numbers, max-params). However, a few classes of security-relevant issues are not explicitly guarded by lint rules yet, such as dynamic code evaluation, construction of regular expressions from untrusted input, and accidental use of insecure randomness APIs.

While this plugin is primarily an ESLint rule set and maintenance CLI (not a network service), adding lightweight security-focused rules will help catch risky patterns early, especially in helper scripts and potential future extensions.

## Decision

We will tighten the ESLint configuration by enabling a **minimal set of built-in security-relevant rules** that are low-noise for this codebase and do not require additional dependencies:

- `no-eval`: disallow use of `eval()` entirely.
- `no-implied-eval`: disallow string forms of `setTimeout`, `setInterval`, and `Function` constructors.
- `no-new-func`: disallow `new Function(...)`.
- `no-new-wrappers`: disallow boxed primitives (`new String`, `new Number`, `new Boolean`).

These rules will be enabled for all TypeScript and JavaScript source files (not tests) with severity `error`.

## Rationale

- These rules are part of core ESLint and require **no new plugins**.
- They directly guard against dynamic code evaluation and other patterns that frequently lead to security vulnerabilities when combined with untrusted input.
- The current codebase already avoids these patterns, so enabling the rules should have **zero or near-zero violations**, keeping the ratcheting impact small.
- By starting with a small, well-justified subset, we avoid overwhelming contributors while still improving the security posture.

## Consequences

- **Positive**
  - Immediate feedback in local development and CI if unsafe patterns such as `eval` or `new Function` are introduced.
  - No additional dependency or configuration complexity.
  - Aligns the project with common Node.js security linting baselines.

- **Negative / Trade-offs**
  - Very rare legitimate uses of `new Function` or similar patterns would require design reconsideration or narrowly scoped disable comments.
  - Contributors must be aware of these rules and avoid dynamic evaluation patterns.

## Implementation

- Update `eslint.config.js` TypeScript and JavaScript rule blocks to include:
  - `"no-eval": "error"`
  - `"no-implied-eval": "error"`
  - `"no-new-func": "error"`
  - `"no-new-wrappers": "error"`
- Run `npm run lint` and adjust any unexpected violations (none expected in the current codebase).

## Validation

- `npm run lint -- --max-warnings=0` passes with the new rules enabled.
- CI (`npm run ci-verify:full`) passes without additional changes.
- Future attempts to introduce `eval`, `new Function`, or similar patterns fail linting locally and in CI.

## Future Work

If the project grows to include more complex parsing, templating, or data handling, we may consider introducing additional security-focused rules via dedicated plugins (e.g., `eslint-plugin-security`) following the same ratcheting approach: start with a small, low-noise subset, validate impact, and expand incrementally.

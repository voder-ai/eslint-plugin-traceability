# Code Quality and Security Refactor Opportunities (2025-12-03)

Created autonomously by voder.ai

This note captures small, low-risk refactors that can be implemented incrementally to further improve maintainability and security without changing public behavior.

## 1. Decompose maintenance CLI implementation

**Files:**

- `src/maintenance/cli.ts`
- `src/maintenance/flags.ts`
- `src/maintenance/commands.ts`

**Status:**

- This refactor has been completed. The CLI implementation is now decomposed into dedicated modules for flags and subcommand handlers, with `cli.ts` acting as a thin coordination layer.

**Motivation (original):**

- `cli.ts` is one of the larger source files and currently owns argument parsing, flag normalization, subcommand dispatch, and user-facing messaging.
- While it still passes `max-lines` and `max-lines-per-function` rules, splitting responsibilities would improve navigability.

**Refactor outcome:**

- Extracted a dedicated `src/maintenance/flags.ts` module responsible solely for:
  - Defining the `CliFlags` shape and defaults.
  - Implementing `applyFlag` / `parseFlags` behavior and validation.
- Extracted a `src/maintenance/commands.ts` module for the four subcommand handlers:
  - `handleDetect`, `handleVerify`, `handleReport`, `handleUpdate`.
  - Kept `runMaintenanceCli` as a small coordination layer that wires parsed arguments to these handlers.

## 2. Narrow helper responsibilities in require-story helpers

**Files:**

- `src/rules/helpers/require-story-helpers.ts`
- `src/rules/helpers/require-story-core.ts`

**Motivation:**

- These helpers concentrate multiple kinds of functionality: AST visitor construction, IO behavior, message construction, and small utility predicates.
- Individual functions are reasonably sized, but the number of exported helpers makes the files dense.

**Potential refactors:**

- Introduce a dedicated `src/rules/helpers/require-story-io.ts` (already partially present) as the single place for reading and writing files in tests and rules.
- Move purely structural helpers (e.g., small predicates, formatting helpers) into a `require-story-utils.ts`-style module so each file focuses on a single axis of responsibility.
- Consider applying the same helper-extraction pattern used for `valid-story-reference` and `prefer-implements-annotation` to `valid-req-reference`, which is another relatively complex rule that would benefit from clearer separation between AST traversal, validation logic, and message construction.

## 3. Revisit targeted ESLint suppressions

**Files:**

- `src/rules/helpers/valid-story-reference-helpers.ts` (single `no-unused-vars` suppression on a type-only parameter)
- `src/rules/helpers/valid-annotation-options.ts` (single `max-params` suppression for a central option-normalization helper)
- `tests/utils/ts-language-options.ts` (single `no-magic-numbers` suppression to allow ECMA version constants)

**Motivation:**

- Each suppression is currently justified and localized, but a small refactor could remove them entirely, simplifying the lint configuration.

**Potential refactors:**

- Replace the suppressed `max-params` helper with an options object parameter so callers pass a single argument while preserving type safety.
- For the `no-unused-vars` case, explore using a `type`-only import or restructuring the function signature so all parameters are meaningfully consumed.
- Extract ECMA version numbers into named constants in a small shared test utility module to avoid the need for a `no-magic-numbers` override.

## 4. Optional: add slim wrappers for Story/Req detection utilities

**Files:**

- `src/utils/reqAnnotationDetection.ts`
- `src/utils/annotation-checker.ts`

**Motivation:**

- These utilities are well-tested but contain a moderate amount of conditional logic for different AST node types.

**Potential refactors:**

- Introduce thin, strongly-typed wrapper functions for the most common call sites (e.g., “analyze function declaration for traceability annotations”) that hide some of the configuration detail from rule implementations.
- This would make rule modules slightly smaller and more declarative, leaving the complex branching in a shared, well-tested location.

These refactors should be tackled incrementally, one small change at a time, with existing Jest tests and ESLint rules acting as safety nets to ensure behavior remains unchanged.

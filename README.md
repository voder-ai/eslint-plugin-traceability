# eslint-plugin-traceability

An ESLint plugin that creates searchable verification indices in your code, enabling systematic validation of requirement-to-code mapping.

**The Core Value:** Transforms an impossible question ("Does code exist somewhere that should support requirement X?") into a tractable question ("Does this annotated code actually support the requirement it claims to?").

The plugin requires `@supports` annotations at key verification points (functions and control flow branches), creating direct checkpoints where each annotation is a verifiable claim you can search, find, and verify locally without needing to understand the broader codebase context.

## Attribution

Created autonomously by [voder.ai](https://voder.ai).

## Installation

Prerequisites: Node.js 18.18.x, 20.x, 22.14.x, or 24.x and ESLint v9+.

1. Using npm  
   npm install --save-dev eslint-plugin-traceability
2. Using Yarn  
   yarn add --dev eslint-plugin-traceability

For detailed setup with ESLint v9, see the [ESLint v9 Setup Guide](user-docs/eslint-9-setup-guide.md).

## Usage

Add the plugin to your ESLint configuration and enable the rules.

Additional ESLint v9 configuration guidance:

- For detailed configuration examples, see [Common Configuration Patterns](user-docs/eslint-9-setup-guide.md#common-configuration-patterns) in the ESLint 9 Setup Guide.
- For troubleshooting ESLint flat-config errors, see [Troubleshooting ESLint Configuration](user-docs/eslint-9-setup-guide.md#troubleshooting-eslint-configuration).

Example `eslint.config.js` (ESLint v9 flat config):

This example shows the recommended starting point using the plugin's recommended preset alongside ESLint's recommended config:

```js
// eslint.config.js
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [
  js.configs.recommended,
  {
    plugins: {
      traceability,
    },
  },
  ...traceability.configs.recommended,
];
```

### Canonical function-level rule and legacy aliases

For function-level checks, `traceability/require-traceability` is the **canonical** rule. It ensures that in-scope functions and methods have both story coverage and requirement coverage, and it understands both the modern `@supports` format and the legacy `@story` / `@req` pairs.

The older rule keys:

- `traceability/require-story-annotation`
- `traceability/require-req-annotation`

remain available as **backward-compatible aliases** that are wired to the same underlying engine. Existing configurations that reference these legacy keys will continue to behave as before. New configurations should normally prefer the unified `traceability/require-traceability` rule and treat the legacy keys as compatibility shims or for gradual migration.

A concise flat-config example that enables the unified function-level rule and commonly used supporting rules explicitly:

```js
// eslint.config.js
import traceability from "eslint-plugin-traceability";

export default [
  {
    plugins: {
      traceability,
    },
    rules: {
      // Canonical function-level rule (preferred for new configs)
      "traceability/require-traceability": "error",

      // Common supporting rules
      "traceability/require-branch-annotation": "warn",
      "traceability/valid-annotation-format": "error",
      "traceability/valid-story-reference": "error",
      "traceability/valid-req-reference": "error",

      // Optional: enforce test traceability conventions
      "traceability/require-test-traceability": "warn",
    },
  },
];
```

### Annotation Placement

Traceability annotations are typically placed immediately adjacent to the code they index. The plugin exposes explicit placement options for branch-level rules and a stable, conventional placement for function-level rules.

- **Branch-level (`traceability/require-branch-annotation`)**

  `require-branch-annotation` supports an `annotationPlacement` option:
  - `"before"` – Annotation appears **immediately before** the branch statement (default).
  - `"inside"` – Annotation appears as the **first comment-only lines inside** the branch block.

  In `"inside"` mode, the rule expects the annotation to be the first meaningful content inside blocks for `if` / `else` / loops / `try` / `catch` / `finally` / `switch` cases.

  Example (`if` statement):

  ```js
  // annotationPlacement: "before"
  // @supports docs/stories/auth.md REQ-AUTH-VALIDATION
  if (isValidUser(user)) {
    performLogin(user);
  }

  // annotationPlacement: "inside"
  if (isValidUser(user)) {
    // @supports docs/stories/auth.md REQ-AUTH-VALIDATION
    performLogin(user);
  }
  ```

  The `annotationPlacement` option is also supported by the function-level rules (`traceability/require-story-annotation` and `traceability/require-req-annotation`) when you configure them directly. In `"inside"` mode, these rules treat only the first comment-only lines inside function and method bodies as satisfying the annotation requirement; JSDoc and before-function comments are ignored for block-bodied functions and methods, while TypeScript declarations and signature-only nodes continue to use before-node annotations.

- **Function-level (`traceability/require-story-annotation`, `traceability/require-req-annotation`)**

  Function-level rules support both before-function and inside-body placement, controlled by the same `annotationPlacement` option described above:
  - `"before"` – Annotations are written as JSDoc blocks immediately preceding the function, or as line comments placed directly before the function declaration or expression.
  - `"inside"` – Annotations are expected to appear on the first comment-only lines inside function and method bodies; comments before the function are ignored for block-bodied functions in this mode, while TypeScript declarations and signature-only nodes still rely on before-node annotations.

  For full details and migration guidance between placement styles, see the [API Reference](user-docs/api-reference.md) and the migration guide ([user-docs/migration-guide.md](user-docs/migration-guide.md)).

For full configuration details and migration guidance between placement styles, see:

- `traceability/require-branch-annotation` rule docs: [docs/rules/require-branch-annotation.md](https://github.com/voder-ai/eslint-plugin-traceability/blob/main/docs/rules/require-branch-annotation.md)
- Migration guide: [user-docs/migration-guide.md](user-docs/migration-guide.md)

### Available Rules

The plugin exposes several rules. For **new configurations**, the unified function-level rule and `@supports` annotations are the canonical choice; the `@story` and `@req` forms remain available primarily for backward compatibility and gradual migration.

#### Core Verification Index Rules

- `traceability/require-traceability` – **Unified function-level verification rule.** Ensures every function has a verification checkpoint. Without this, functions could exist without explaining their purpose, breaking verification completeness. Accepts either `@supports` (preferred for new code) or legacy `@story` / `@req` annotations and is enabled by default in the plugin's `recommended` and `strict` presets.

- `traceability/require-story-annotation` – Legacy function-level rule key that focuses on the **story** side of function-level verification. It is kept for backward compatibility and is wired to the same underlying engine as `traceability/require-traceability`. New configurations should normally rely on `traceability/require-traceability` instead.

- `traceability/require-req-annotation` – Legacy function-level rule key that focuses on the **requirement** side of function-level verification. Like `traceability/require-story-annotation`, it is retained for backward compatibility. New configurations can usually rely on the unified rule alone unless you have specific reasons to tune the legacy keys separately.

- `traceability/require-branch-annotation` – **Creates verification checkpoints at every branch** (if/else/switch/try/catch). This enables local verification - you can check each branch independently without understanding the entire function. Without branch annotations, you must read entire functions to find branch logic. With branch annotations, you can verify each branch by searching for the requirement ID. Branch annotations can use `@supports` (preferred) or the older `@story`/`@req` pair for backward compatibility.

- `traceability/valid-annotation-format` – **Ensures annotations are searchable** with consistent patterns. Verification workflows depend on being able to search for requirement IDs reliably. Enforces correct format of traceability annotations, including `@supports` (preferred), `@story`, and `@req`.

- `traceability/valid-story-reference` – **Validates story file references** to ensure verification checkpoints point to real documentation. Validates that story references (whether written via `@story` or embedded in `@supports`) point to existing story files.

- `traceability/valid-req-reference` – **Validates requirement identifiers** to ensure verification checkpoints reference valid requirements. Validates that requirement identifiers (whether written via `@req` or embedded in `@supports`) point to existing requirement IDs in your story files.

- `traceability/require-test-traceability` – **Enforces verification conventions in test files** by requiring file-level `@supports` annotations, story references in `describe` blocks, and `[REQ-...]` prefixes in `it`/`test` names. This ensures tests are traceable back to requirements for comprehensive verification coverage.

#### Quality Rules

- `traceability/no-redundant-annotation` – **Removes annotations on simple statements** already covered by enclosing scope. These don't create useful verification checkpoints (no branches to verify), so removing them reduces noise without hurting verifiability. It is enabled at severity `warn` in both the `recommended` and `strict` presets by default; consumers can override its severity or disable it explicitly.

- `traceability/prefer-supports-annotation` – **Optional migration helper** that recommends converting legacy single-story `@story`/`@req` JSDoc blocks and inline comments into the newer `@supports` format for better verification trails. It is disabled by default and must be explicitly enabled. The legacy rule name `traceability/prefer-implements-annotation` remains available as a deprecated alias.

Configuration options: For detailed per-rule options (such as scopes, branch types, and story directory settings), see the individual rule docs in the plugin's user guide and the consolidated [API Reference](user-docs/api-reference.md).

For development and contribution guidelines, see the contribution guide in the repository.

## How It Works

### The Verification Workflow

Traceability annotations enable systematic requirement verification through a simple three-step process:

1. **Search:** `grep -r "REQ-AUTH-VALIDATION" src/`
2. **Find:** Get a list of every location claiming to support that requirement
3. **Verify:** For each result, read the annotation and adjacent code to confirm they match

### Why Annotations at Every Branch

Each annotation creates a **local verification checkpoint**:

- ✅ **Searchable** - Direct search finds all implementation claims
- ✅ **Local** - Annotation is adjacent to the code being verified
- ✅ **No context needed** - Verify the claim without understanding control flow
- ✅ **Parallelizable** - Multiple reviewers work independently
- ✅ **Complete coverage** - No code can exist without explaining its purpose

This enables you to verify requirements systematically rather than trying to remember which code should implement what.

### Example: Verifying a Switch Statement

```javascript
switch (severity) {
  // @supports docs/stories/logging.md REQ-SEVERITY-LEVELS
  case "low":
    logLevel = "info";
    break;
  // @supports docs/stories/logging.md REQ-SEVERITY-LEVELS
  case "moderate":
    logLevel = "warn";
    break;
  // @supports docs/stories/logging.md REQ-SEVERITY-LEVELS
  case "high":
    logLevel = "error";
    break;
}
```

**Verification process:**

- Search finds 3 annotations
- Verify each: "Does this case handle REQ-SEVERITY-LEVELS correctly?"
- Time: ~30 seconds per case, ~90 seconds total
- Can be split across team members

**Without explicit annotations:**

- Must read entire switch to understand what it does
- Must remember which requirement you're checking
- Cannot split the work effectively
- Risk missing cases or misunderstanding intent

## Quick Start

1. Create a flat ESLint config file (`eslint.config.js`):

```javascript
// eslint.config.js
import traceability from "eslint-plugin-traceability";

export default [
  {
    plugins: {
      traceability,
    },
  },
  ...traceability.configs.recommended,
];
```

2. Annotate your functions or modules:

```js
/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 *   // Prefer @supports for new implementations; @story/@req remain supported for
 *   // legacy and simple single-story code paths.
 */
function initAuth() {
  // implementation...
}
```

`@supports` is the canonical format for new, multi-story integrations and richer traceability. The legacy `@story` and `@req` forms are kept for backward compatibility and remain appropriate for simple, single-story functions or where a gradual migration is preferred.

3. Run ESLint:

```bash
npx eslint "src/**/*.js"
```

## Common Misconceptions

### "The annotations are redundant"

**Reality:** The apparent redundancy is intentional indexing. Each annotation is a separate verification checkpoint. When the same requirement appears in multiple branches, each annotation creates an independent checkpoint that can be verified in ~30 seconds without understanding the broader code structure.

Removing "duplicate" annotations would break the verification workflow by forcing reviewers to trace through code structure instead of verifying local claims.

### "This only works for small codebases"

**Reality:** The plugin is specifically designed for codebases where manual review is impractical. Small codebases could use manual review; larger ones need systematic, searchable verification indices to make requirement validation tractable.

### "This is just documentation"

**Reality:** These are verification indices, not documentation. The goal is searchability and local verification, not explaining code. Documentation aims to reduce redundancy; verification indices intentionally create checkpoints for independent validation.

### "Inheritance would reduce boilerplate"

**Reality:** Inheritance would break verification tractability. When you search for a requirement, you need to find every place that implements it - not find a parent annotation and manually trace what inherits from it. Direct, explicit annotations at each implementation point enable grep-based verification.

## Verification Workflow Guide

For detailed verification workflows, examples, and best practices, see the [Verification Workflow Guide](https://github.com/voder-ai/eslint-plugin-traceability/blob/main/docs/verification-workflow-guide.md).

## API Reference

Detailed API specification and configuration options can be found in the [API Reference](user-docs/api-reference.md).

## Examples

Practical usage examples and sample configurations are available in the [Examples](user-docs/examples.md) document.

## Maintenance CLI

The `traceability-maint` CLI provides a batch update tool for maintaining `@story` and `@supports` annotation references when you reorganize story files.

**Note**: Detection and verification of stale references are already handled by ESLint rules (`valid-story-reference`, `valid-req-reference`) during normal linting. The maintenance CLI's primary value is the **update** command, which can batch-update references across your codebase when story files are moved or renamed - something ESLint's auto-fix cannot do.

### Primary Command

- `update` – Batch update `@story` and `@supports` annotations when a story file is renamed or moved (the key feature ESLint cannot provide)

### Supporting Commands

The CLI also includes `detect`, `verify`, and `report` commands for historical compatibility, but these largely duplicate what ESLint already provides during normal linting:

- `detect` – Scan for `@story` annotations referencing missing files (ESLint rules already do this)
- `verify` – Check for stale annotations (ESLint rules already do this)
- `report` – Generate reports of stale references (ESLint output already provides this)

### Usage

**Primary use case - batch update references:**

```bash
# Update references when a story file is renamed
npx traceability-maint update \
  --root . \
  --from "stories/feature-authentication.story.md" \
  --to "stories/feature-auth-v2.story.md"

# Preview changes first with --dry-run
npx traceability-maint update \
  --root . \
  --from "stories/old.story.md" \
  --to "stories/new.story.md" \
  --dry-run

# Update with ignore patterns to skip generated code
npx traceability-maint update \
  --root . \
  --from "stories/old.story.md" \
  --to "stories/new.story.md" \
  --ignore-pattern dist
```

**Supporting commands** (largely redundant with ESLint, but available):

```bash
# Show help and all options
npx traceability-maint --help

# Detect stale story references (ESLint already does this during linting)
npx traceability-maint detect --root .

# Detect with ESLint-style ignore patterns
npx traceability-maint detect --root . --ignore-pattern node_modules --ignore-pattern dist

# Verify that annotations are valid (ESLint already does this during linting)
npx traceability-maint verify --root .

# Generate a report (ESLint output already provides this information)
npx traceability-maint report --root . --format json
```

### Options

- `--root <path>` – Workspace root directory (defaults to current directory)
- `--json` – Output results in JSON format
- `--format <text|json>` – Report format (for `report` command)
- `--from <path>` – Source story path (for `update` command)
- `--to <path>` – Destination story path (for `update` command)
- `--dry-run` – Preview changes without modifying files (for `update` command)
- `--ignore-pattern <pattern>` – Path or directory to ignore (can be specified multiple times)

### ESLint Configuration Integration

The maintenance tools support `--ignore-pattern` flags to skip directories when performing batch updates:

- Skip generated code directories (e.g., `dist`, `build`)
- Ignore dependency folders (e.g., `node_modules`)
- Exclude test fixtures or temporary files

Multiple patterns can be specified:

```bash
npx traceability-maint update \
  --from old.story.md \
  --to new.story.md \
  --ignore-pattern node_modules \
  --ignore-pattern dist \
  --ignore-pattern coverage
```

### When to Use the Maintenance CLI vs ESLint

**Use the maintenance CLI** when:

- You've renamed or moved story files and need to update all code references
- You're reorganizing your story file structure

**Use ESLint** for:

- Detecting stale or invalid references during development
- Validating annotation format
- Ongoing verification of traceability compliance

The maintenance CLI is a manual refactoring aid, not an automated validation tool. ESLint handles validation automatically during your normal development workflow.

For a full description of options and JSON payloads, see the [Maintenance API and CLI](user-docs/api-reference.md#maintenance-api-and-cli) section in the API Reference.

## Plugin Validation

You can validate the plugin by running ESLint CLI with the plugin on a sample file:

```bash
# Validate missing function-level traceability (should report an error)
npx eslint --no-eslintrc --config eslint.config.js sample.js --rule 'traceability/require-traceability:error'
```

If you have existing configurations that reference the legacy function-level keys, you can also validate them directly by enabling `traceability/require-story-annotation` and `traceability/require-req-annotation` instead.

This command runs ESLint with the plugin, pointing at `eslint.config.js` flat config.

Replace `sample.js` with your JavaScript or TypeScript file.

## Running Tests

You can run tests and quality checks locally using the npm scripts provided:

```bash
# Run all tests with coverage
npm test

# Run linting with zero tolerance for warnings
npm run lint -- --max-warnings=0

# Check code formatting
npm run format:check

# Check duplication threshold
npm run duplication
```

Coverage reports will be generated in the `coverage/` directory.

## CLI Integration

Integration tests for the ESLint CLI plugin are included in the Jest test suite under `tests/integration/cli-integration.test.ts`.

To run only the CLI integration tests:

```bash
npm test -- tests/integration/cli-integration.test.ts
```

Or run the full test suite:

```bash
npm test
```

These tests verify end-to-end behavior of the plugin via the ESLint CLI.

## Security and Dependency Health

For the canonical, user-facing security policy (including how to report vulnerabilities), see [SECURITY.md](SECURITY.md). Internal implementation details and deeper discussion live in the project’s internal documentation and decision records, which are intended for maintainers rather than end users.

### What end users can expect from production dependencies

- The published `eslint-plugin-traceability` package is intended to ship **only with production dependencies that have no known high‑severity vulnerabilities** at release time.
- As part of CI and the local pre‑push hook, we run:
  - `npm audit --omit=dev --audit-level=high` – this checks only the **runtime (prod) dependency graph** and fails if any high‑severity issues are reported.
- This means:
  - Known high‑severity issues in production dependencies are blocked before a version is released.
  - Dev‑only tooling and CI infrastructure are kept separate from what you install via `npm install eslint-plugin-traceability`.

### How `dry-aged-deps` and `npm audit` work together

- **Maturity checks via `dry-aged-deps`**
  - We use `dry-aged-deps` (via `npm run deps:maturity` and `npm run safety:deps`) to enforce basic “maturity” constraints on dependency updates.
  - Current policy for adopting new versions:
    - **Minimum age:** new versions are typically required to be **at least 7 days old**, reducing the chance of adopting a just‑released, unvetted version.
    - **No known vulnerabilities:** versions with known vulnerabilities are rejected.
- **Security scan via `npm audit`**
  - `npm audit --omit=dev --audit-level=high` is run on the **production dependency tree** to catch known high‑severity issues before release.
- **Combined effect**
  - `dry-aged-deps` controls **which versions** we are willing to upgrade to (age + no‑known‑vulns).
  - `npm audit` validates that the **current, locked set of production dependencies** is free from known high‑severity vulnerabilities.
  - Together, they provide a conservative, security‑focused process for dependency updates that directly affect end users.

### Scope of the semantic‑release/npm tooling risk

- There is a known, documented risk in the semantic‑release/npm release toolchain related to bundled `npm`/`glob`/`brace-expansion`.
- This risk:
  - Applies only to the **GitHub Actions release workflow and related dev‑only tooling**.
  - Does **not** modify or run inside consumers’ projects.
  - Does **not** affect the built plugin artifacts published to npm.
- In other words:
  - The issue is confined to the CI environment that prepares and publishes releases.
  - It **cannot impact** the runtime behavior or dependency graph of the `eslint-plugin-traceability` package you install or use in your own projects.

## Documentation Links

- ESLint v9 Setup Guide: [user-docs/eslint-9-setup-guide.md](user-docs/eslint-9-setup-guide.md)
- API Reference: [user-docs/api-reference.md](user-docs/api-reference.md)
- Examples: [user-docs/examples.md](user-docs/examples.md)
- Traceability Overview and FAQ: [user-docs/traceability-overview.md](user-docs/traceability-overview.md)
- Migration Guide: [user-docs/migration-guide.md](user-docs/migration-guide.md)
- Full README: <https://github.com/voder-ai/eslint-plugin-traceability#readme>
- Contribution guide: <https://github.com/voder-ai/eslint-plugin-traceability/blob/main/CONTRIBUTING.md>
- Issue tracker: <https://github.com/voder-ai/eslint-plugin-traceability/issues>
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Versioning and Releases: This project uses semantic-release for automated versioning. The authoritative list of published versions and release notes is on GitHub Releases: <https://github.com/voder-ai/eslint-plugin-traceability/releases>

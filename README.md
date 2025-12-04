# eslint-plugin-traceability

A customizable ESLint plugin that enforces traceability annotations in your code, ensuring each implementation is linked to its requirement or test case.

## Attribution

Created autonomously by [voder.ai](https://voder.ai).

## Installation

Prerequisites: Node.js >=18.18.0 and ESLint v9+.

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

### Available Rules

- `traceability/require-story-annotation` Enforces presence of `@story` annotations. (See the rule documentation in the plugin's user guide.)
- `traceability/require-req-annotation` Enforces presence of `@req` annotations. (See the rule documentation in the plugin's user guide.)
- `traceability/require-branch-annotation` Enforces presence of branch annotations. (See the rule documentation in the plugin's user guide.)
- `traceability/valid-annotation-format` Enforces correct format of traceability annotations. (See the rule documentation in the plugin's user guide.)
- `traceability/valid-story-reference` Validates that `@story` references point to existing story files. (See the rule documentation in the plugin's user guide.)
- `traceability/valid-req-reference` Validates that `@req` references point to existing requirement IDs. (See the rule documentation in the plugin's user guide.)
- `traceability/prefer-implements-annotation` Recommends migration from legacy `@story`/`@req` annotations to `@supports` (opt-in; disabled by default in the presets and must be explicitly enabled). (See the rule documentation in the plugin's user guide.)

Configuration options: For detailed per-rule options (such as scopes, branch types, and story directory settings), see the individual rule docs in the plugin's user guide and the consolidated [API Reference](user-docs/api-reference.md).

For development and contribution guidelines, see the contribution guide in the repository.

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
 * @story stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 *   // Point this to your own project's story/requirements file, not to this plugin's internal docs.
 * @req REQ-ANNOTATION-REQUIRED
 */
function initAuth() {
  // implementation...
}
```

3. Run ESLint:

```bash
npx eslint "src/**/*.js"
```

## API Reference

Detailed API specification and configuration options can be found in the [API Reference](user-docs/api-reference.md).

## Examples

Practical usage examples and sample configurations are available in the [Examples](user-docs/examples.md) document.

## Maintenance CLI

The `traceability-maint` CLI helps you maintain and audit `@story` annotations outside of ESLint runs. It focuses on repository-wide checks for stale story references and safe batch updates.

### Commands

- `detect` – Scan the workspace and detect `@story` annotations that reference missing story files.
- `verify` – Verify that no stale `@story` annotations exist under the workspace root.
- `report` – Generate a human-readable or JSON report of stale story references.
- `update` – Apply safe, scripted updates to `@story` annotations (e.g., when a story file is renamed).

### Usage

All commands are run from your project root:

```bash
# Show help and all options
npx traceability-maint --help

# Detect stale story references
npx traceability-maint detect --root .

# Verify that annotations are valid
npx traceability-maint verify --root .

# Generate a JSON report for CI pipelines
npx traceability-maint report --root . --format json

# Update references when a story file is renamed
npx traceability-maint update \
  --root . \
  --from "stories/feature-authentication.story.md" \
  --to "stories/feature-auth-v2.story.md"
```

For a full description of options and JSON payloads, see the [Maintenance API and CLI](user-docs/api-reference.md#maintenance-api-and-cli) section in the API Reference.

## Plugin Validation

You can validate the plugin by running ESLint CLI with the plugin on a sample file:

```bash
# Validate missing @story annotation (should report an error)
npx eslint --no-eslintrc --config eslint.config.js sample.js --rule 'traceability/require-story-annotation:error'
```

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
- Migration Guide: [user-docs/migration-guide.md](user-docs/migration-guide.md)
- Full README: <https://github.com/voder-ai/eslint-plugin-traceability#readme>
- Contribution guide: <https://github.com/voder-ai/eslint-plugin-traceability/blob/main/CONTRIBUTING.md>
- Issue tracker: <https://github.com/voder-ai/eslint-plugin-traceability/issues>
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Versioning and Releases: This project uses semantic-release for automated versioning. The authoritative list of published versions and release notes is on GitHub Releases: <https://github.com/voder-ai/eslint-plugin-traceability/releases>

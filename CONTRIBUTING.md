# Contributing to eslint-plugin-traceability

Thank you for your interest in contributing to `eslint-plugin-traceability`! We welcome bug reports, feature requests, and pull requests. To ensure a smooth process, please follow the guidelines below.

## Reporting Issues

If you encounter a bug or have a feature request:

1. Search existing issues to see if the problem or suggestion has already been reported.
2. If not, open a new issue on GitHub: [Issue Tracker](https://github.com/voder-ai/eslint-plugin-traceability/issues).
3. Provide a clear and descriptive title, steps to reproduce, expected behavior, and any relevant screenshots or logs.
4. Specify your environment:
   - `node` version: `node -v`
   - `eslint` version: `npx eslint -v`
   - Operating system and shell.

## Pull Request Process

This project uses **trunk-based development** with a single integration branch: `main`.

### Core workflow (default)

For maintainers and contributors with direct push access:

1. Do your work in small, incremental commits made **directly on the `main` branch**.
2. Push changes straight to `main` once they:
   - Are logically scoped and reviewable,
   - Pass local checks (see “Coding Style and Quality Checks” below).
3. Avoid long-lived feature branches; they are **not** part of the normal workflow for this repository.

In other words, the standard contribution flow is: **edit → test → commit to `main` → push**.

### When to use Pull Requests

PRs are a **code review mechanism**, not the default integration path:

- Open a PR **if you explicitly want review or CI verification** before merging, even when you have push access to `main`.
- Use your PR description to:
  - Summarize the change,
  - Reference any related issues,
  - Call out areas where you’d like specific feedback.

A maintainer will review your changes and may request updates or approve the PR.

### External contributors and forks

External contributors who do not have direct push access will typically:

1. Fork the repository.
2. Create small, incremental commits in their fork (feature branches in forks are acceptable if helpful to your workflow).
3. Open a PR from the fork against the `main` branch of this repository.

Even in this case, `main` in the upstream repository remains the **single integration branch**, and changes are merged into `main` as soon as they are ready.

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) format to enable automated semantic versioning and changelog generation.

For detailed guidelines and examples, see [docs/conventional-commits-guide.md](docs/conventional-commits-guide.md).

Commit messages should be structured as:

```
type[optional scope]: description

[optional body]

[optional footer(s)]
```

Examples:

- `feat: add new validation rule` → minor version increment
- `fix: resolve parsing issue` → patch version increment
- `feat!: change API interface` → major version increment
- `docs: update README` → no version change

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

## Coding Style and Quality Checks

We enforce code style and quality using ESLint, Prettier, TypeScript, Jest, and other tools. For day-to-day development, you can use the faster, focused test subset:

```bash
# Fast pre-flight: rules + maintenance Jest tests
npm run ci-verify:fast
```

Before submitting your PR or pushing (the pre-push hook runs this automatically), run the full local gate:

```bash
# Full CI-equivalent verification
npm run ci-verify:full
```

Under the hood, `ci-verify:fast` runs Jest with:

```bash
jest --testPathPattern 'tests/(rules|maintenance)'
```

This executes a meaningful subset of the suite (rule tests plus maintenance tests), making it suitable as a quick pre-flight signal before running the full gate.

For reference, the full gate performs:

```bash
# Build the project and generate types
npm run build

# Run TypeScript type checks
npm run type-check

# Lint code
npm run lint

# Run tests (including coverage and additional suites)
npm test

# Check formatting (no changes)
npm run format:check

# Check duplication threshold
npm run duplication
```

Some checks require the plugin to be built first. To run the lint-plugin check locally:

```bash
# Build the plugin, then run the check that requires the built plugin
npm run build
npm run lint:require-built-plugin
```

Note on pre-push hook: the repository's pre-push hook now runs a full CI-equivalent verification task. You can run it locally (and it's what the hook runs before pushing) with:

```bash
npm run ci-verify:full
```

`ci-verify:full` is the comprehensive local gate intended to mirror CI quality checks: it runs a clean build, type-checking, linting, `format:check`, duplication analysis, traceability checks, the full Jest test suite with coverage, dependency and security audits, and related safeguards. `ci-verify:fast` executes a focused subset of Jest tests (using `--testPathPattern 'tests/(rules|maintenance)'`) to quickly validate rule behavior and maintenance invariants; it is optimized for quick feedback during development and as a pre-flight before invoking the full gate. Continuous Integration still runs some CI-only steps that are not part of `ci-verify:full` (such as certain smoke or integration tests, and release automation). For details of the pipeline, see [docs/ci-cd-pipeline.md](docs/ci-cd-pipeline.md), and for the rationale behind the pre-push parity gate, see [docs/decisions/adr-pre-push-parity.md](docs/decisions/adr-pre-push-parity.md).

Ensure there are no errors or warnings in the output.

## Developing Locally

1. Clone your fork and install dependencies:

   ```bash
   git clone https://github.com/<your-username>/eslint-plugin-traceability.git
   cd eslint-plugin-traceability
   npm install
   ```

2. Run the tests in watch mode:

   ```bash
   npm test
   ```

3. Make your changes, and verify that tests and linting continue to pass.

## Local Security and Dependency Checks

The `ci-verify:full` script is your local entry point for the same security and dependency checks that matter in CI. It runs, in addition to build/tests/lint:

- `npm audit --omit=dev --audit-level=high`
- `npm run safety:deps` (dry-aged-deps)
- `npm run audit:dev-high`

These map to CI as follows:

- **Gating CI checks (must pass to keep the main job green):**
  - `npm audit --omit=dev --audit-level=high` – production/runtime dependency audit
  - `npm run safety:deps` – dry-aged-deps baseline for dependency “staleness” / health

- **Advisory CI checks (do not fail CI, but are still run and recorded):**
  - `npm run audit:dev-high` – dev-only dependency audit; findings are logged for maintainers but do _not_ gate merges

Running `npm run ci-verify:full` locally gives you the same security/dependency signal that the main CI job expects for gating, plus the same advisory information. You normally **do not** need to run `npm audit`, `dry-aged-deps`, or the dev audit commands directly.

As a contributor, your default workflow should be:

- Use `npm run ci-verify:fast` for quick iteration.
- Use `npm run ci-verify:full` before pushing or opening a PR to exercise the same gating checks as CI (including security and dependency health).

You only need to run the underlying tools individually (or add extra runs) if you are:

- Working specifically on dependency upgrades / cleanups.
- Investigating or documenting a security or dependency incident.
- Updating the policies, baselines, or docs that describe how these checks are used.

Thank you for helping improve `eslint-plugin-traceability`!

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

Trunk-based development: work happens directly on the `main` branch.

1. Make small, incremental commits directly on the `main` branch in this repository. Avoid long-lived feature branches or forks.
2. Commit your changes in small, logical increments. Use descriptive commit messages.
3. Ensure all tests pass and the project builds successfully.
4. Push your changes to GitHub and open a PR against the `main` branch if you want a review or CI verification.
5. Reference any related issues in your PR description.
6. A maintainer will review your changes and may request updates or approve the PR.

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

We enforce code style and quality using ESLint, Prettier, TypeScript, and other tools. Please run the following commands before submitting your PR:

```bash
# Build the project and generate types
npm run build

# Run TypeScript type checks
npm run type-check

# Lint code
npm run lint

# Run tests
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

`ci-verify:full` is the comprehensive local gate intended to mirror CI quality checks: it runs a clean build, type-checking, linting, `format:check`, duplication analysis, traceability checks, the full Jest test suite with coverage, dependency and security audits, and related safeguards. `ci-verify:fast` still exists as an optional, manual fast check for quick feedback (for example, before committing or during TDD loops), but it is not wired into the pre-push hook. Continuous Integration still runs some CI-only steps that are not part of `ci-verify:full` (such as certain smoke or integration tests, and release automation). For the detailed rationale behind using a full-parity local pre-push hook alongside CI, see [docs/decisions/adr-pre-push-parity.md](docs/decisions/adr-pre-push-parity.md).

Ensure there are no errors or warnings in the output.

## Developing Locally

1. Clone your fork and install dependencies:

   ```bash
   git clone https://github.com/<your-username>/eslint-plugin-traceability.git
   cd eslint-plugin-traceability
   npm install
   ````

2. Run the tests in watch mode:

   ```bash
npm test
````

3. Make your changes, and verify that tests and linting continue to pass.

Thank you for helping improve `eslint-plugin-traceability`!
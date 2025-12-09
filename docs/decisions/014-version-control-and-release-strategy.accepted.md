---
status: "accepted"
date: 2025-12-09
decision-makers: [Development Team]
consulted:
  [
    docs/ci-cd-pipeline.md,
    docs/conventional-commits-guide.md,
    docs/decisions/006-semantic-release-for-automated-publishing.accepted.md,
    docs/decisions/007-github-releases-over-changelog.accepted.md,
    docs/decisions/adr-pre-push-parity.md,
  ]
informed: [Project Contributors, CI/CD Pipeline Maintainers]
---

# Version Control and Release Strategy

## Context

The project has evolved its CI/CD pipeline and release automation over time:

- Early ADRs introduced automated version bumping via ad-hoc GitHub Actions logic.
- ADR 006 formally adopted **semantic-release** with **Conventional Commits** for automated versioning and publishing.
- ADR 007 designated **GitHub Releases** as the canonical user-facing changelog.
- ADR `adr-pre-push-parity` aligned local pre-push hooks with CI quality gates.

While each decision addressed a specific concern, contributors and automated assessment tools now need a **single, authoritative description** of how version control, branching, commit discipline, and releases fit together.

This ADR consolidates those prior decisions into a clear, end-to-end version control and release strategy.

## Decision

We adopt the following version control and release strategy for `eslint-plugin-traceability`:

1. **Trunk-based development on `main`**
   - `main` is the **single long-lived integration branch**.
   - Day-to-day development by maintainers happens directly on `main` using small, incremental commits.
   - Feature branches are allowed in forks or when explicitly useful, but integration always terminates on `main`.

2. **Conventional Commits for all changes**
   - All commits to `main` (whether direct or via PR merge) must follow the Conventional Commits format documented in `docs/conventional-commits-guide.md`.
   - Commit types drive semantic-release behavior:
     - `feat` → minor version bump.
     - `fix` → patch version bump.
     - `feat!` (or any type with `!`) or a `BREAKING CHANGE:` footer → major version bump.
     - Other types (`docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`) do **not** trigger a new release.

3. **Single unified CI/CD workflow on pushes to `main`**
   - A single GitHub Actions workflow (`.github/workflows/ci-cd.yml`) is responsible for:
     - Running all quality gates (build, type-check, lint, tests, duplication, formatting, audits, traceability, secret scans) on a Node.js version matrix.
     - Invoking semantic-release **only** on `push` events to `main` and only for the `22.14.0` matrix entry.
     - Optionally publishing a new npm version and creating a GitHub Release based on commit history.
   - The same workflow also runs on `pull_request` targeting `main` for feedback, but **semantic-release is never run on PR events**.
   - There are **no tag-based, manual, or `workflow_dispatch`-driven release workflows**.

4. **semantic-release as the sole release orchestrator**
   - Releases are determined entirely by semantic-release running in CI:
     - It inspects commits on `main` since the last release tag.
     - It decides whether a release is needed and which semantic version to apply.
     - It publishes to npm and creates GitHub Releases when warranted.
   - The version in `package.json` is **not** manually updated for each release; git tags and GitHub Releases are the source of truth.

5. **Automated, CI-driven publishing only**
   - Publishing to npm occurs **only** from the CI workflow on successful `push` events to `main` when semantic-release determines a new release is required.
   - Maintainers do **not** publish locally (`npm publish`) and do **not** create release tags by hand.
   - If `NPM_TOKEN` is missing or invalid, the pipeline logs a warning and skips publishing without failing CI; any other semantic-release error fails the job.

6. **Local pre-push parity with CI quality gates**
   - The Husky **pre-push** hook runs `npm run ci-verify:full`, mirroring CI’s core quality gates as defined in `docs/ci-cd-pipeline.md`.
   - This ensures that most issues are detected before changes reach `main` and that successful pushes are strong predictors of CI success.

## Rationale

- **Simplicity and clarity**: A single integration branch and a single CI/CD workflow avoid ambiguity about where and how releases are produced.
- **Automated, repeatable releases**: semantic-release plus Conventional Commits eliminate manual version management and reduce human error.
- **Fast feedback, strong guarantees**: Pre-push parity with CI gates keeps `main` healthy and prevents avoidable red pipelines.
- **Traceability**: Git tags, GitHub Releases, and Conventional Commits together provide a clear, auditable history of what changed and why for each release.
- **Tooling alignment**: This strategy matches how the existing `.releaserc.json`, Husky hooks, and CI workflow are already configured, and makes those implicit contracts explicit.

## Consequences

- **Positive**
  - Every successful push to `main` that includes `feat`/`fix`/breaking-change commits can automatically result in a new npm release without any manual tagging or publishing.
  - Contributors can reason about release behavior directly from commit history and the Conventional Commits guide.
  - Automated assessments and tooling can rely on `main` + the `CI/CD Pipeline` workflow as the single source of truth for integration and deployment status.
  - Local pre-push checks align closely with CI, reducing CI-only surprises.

- **Neutral / Trade-offs**
  - Package.json’s `version` field may lag behind the latest published version; consumers should consult Git tags or GitHub Releases for the authoritative version.
  - Commit message discipline is required; poorly formatted messages can prevent semantic-release from producing the intended version bump.

- **Negative**
  - Release behavior is less flexible for ad-hoc/manual scenarios; maintainers must follow the documented flow instead of short-circuiting it with manual tags or `npm publish`.
  - New contributors may need time to learn Conventional Commits and understand the automatic release behavior.

## Implementation Notes

- **Branching**
  - Protect `main` according to project policy (e.g., required checks, required reviews) while preserving the trunk-based model.
  - Feature branches in forks are supported, but merges are always into `main`.

- **Commit messages**
  - Use the types and patterns documented in `docs/conventional-commits-guide.md`.
  - Avoid squashing or rebasing in ways that lose meaningful commit types before merging to `main`.

- **CI/CD**
  - The `CI/CD Pipeline` workflow must remain the only workflow that runs semantic-release.
  - Any future changes to the Node.js version matrix or semantic-release guard conditions must be reflected in `docs/ci-cd-pipeline.md` and, if material, in this ADR.

- **Releases**
  - Release notes are read from GitHub Releases, not from a manually maintained CHANGELOG; `CHANGELOG.md` is a redirect per ADR 007.
  - Smoke tests for newly published versions are part of the same workflow run that performs the release.

## Future Revisions

This ADR should be revisited if:

- The project adopts a different branching model (e.g., long-lived release branches).
- semantic-release is replaced with a different release tool or policy.
- The CI/CD pipeline is split into multiple workflows in a way that affects how releases are produced.

Until then, this document is the **authoritative reference** for version control and release behavior in `eslint-plugin-traceability`.

---
status: "proposed"
date: 2025-11-17
decision-makers: [Development Team]
consulted:
  [
    npm Documentation,
    GitHub Actions Best Practices,
    Semantic Versioning Specification,
  ]
informed: [Project Stakeholders, CI/CD Pipeline Maintainers]
---

# Automated Version Bumping for CI/CD Publishing

## Context and Problem Statement

The current CI/CD pipeline attempts to publish the package to npm on every push to the main branch, but lacks any mechanism to automatically increment the package version. This causes publish failures when the same version number already exists on npm, as npm does not allow republishing the same version. The pipeline fails with errors like "You cannot publish over the previously published versions" or similar npm publish conflicts.

Currently, version bumping requires manual intervention through direct package.json edits, which is error-prone, interrupts the automated delivery flow, and creates a disconnect between the continuous integration process and package publishing. This breaks the principle of continuous delivery and creates friction in the development workflow.

## Decision Drivers

- Need for reliable automated publishing without manual intervention
- Prevention of npm publish failures due to version conflicts
- Alignment with semantic versioning principles for clear change communication
- Integration with existing CI/CD pipeline and GitHub workflow
- Maintainability of version history and changelog automation
- Support for different types of releases (patch, minor, major)
- Traceability of version changes to specific commits or pull requests
- Minimal friction for developers while maintaining version discipline

## Considered Options

- npm version command with automated execution in CI/CD
- Semantic Release with automated version detection
- Manual version bumping with CI/CD workflow triggers
- Version bumping through GitHub Actions with npm version

## Decision Outcome

Chosen option: "npm version command with automated execution in CI/CD", because it provides direct integration with npm tooling, maintains simplicity in the CI/CD pipeline, allows for both automated and manual control when needed, and follows established npm ecosystem practices without requiring complex semantic analysis tooling.

### Implementation Strategy

The CI/CD pipeline will be modified to avoid infinite loops while ensuring reliable publishing:

1. **Pre-publish Version Check**: Before attempting to publish, check if the current package.json version already exists on npm using `npm view`
2. **In-Pipeline Version Increment**: If the version exists, increment the patch version directly in the pipeline without committing back to git using `npm version patch --no-git-tag-version`
3. **Changelog Update**: Update CHANGELOG.md programmatically with the new version entry within the pipeline
4. **Publish with New Version**: Proceed with npm publish using the incremented version
5. **Post-Publish Git Update**: After successful publish, commit the version changes and create a git tag using `git commit` and `git tag`, with commit message including `[skip ci]` to prevent pipeline recursion
6. **Push Changes**: Push the version commit and tag back to the repository with CI skip directive

### Alternative Approach Considered

**Version Increment Without Git Commits**: Increment version only in-memory during pipeline execution, publish to npm, but never commit version changes back to git. This would eliminate loop concerns entirely but would cause package.json to drift from published versions, making it difficult to track which version is published and potentially causing confusion for developers.

### Consequences

- Good, because prevents all npm publish failures due to version conflicts
- Good, because maintains fully automated delivery without any manual intervention
- Good, because creates proper git tags and version history after successful publish
- Good, because uses standard npm tooling that developers understand
- Good, because avoids infinite CI/CD loops through `[skip ci]` directive
- Good, because integrates cleanly with existing CI/CD infrastructure
- Good, because ensures version increments only occur when publishing is successful
- Neutral, because requires CI/CD pipeline to have git write access
- Neutral, because creates additional commits in the main branch for version tracking
- Bad, because does not automatically determine semantic version type (major/minor/patch)
- Bad, because version commits occur after publish rather than before

### Confirmation

Implementation compliance will be confirmed through:

- CI/CD pipeline successfully publishes without version conflicts
- Git repository contains version tags matching published npm versions
- CHANGELOG.md automatically updated with version entries
- No manual intervention required for routine publishing
- Version bumps traceable through git commit history
- package.json version always synchronized with published npm version

## Pros and Cons of the Options

### npm version command with automated execution in CI/CD

Standard npm tooling with CI/CD automation provides reliable version management with minimal complexity.

- Good, because uses native npm version management tools
- Good, because creates proper git tags and version commits automatically
- Good, because simple to understand and maintain in CI/CD
- Good, because allows manual override for major/minor version bumps
- Good, because integrates with existing npm publish workflow
- Good, because provides immediate resolution to publish failures
- Good, because maintains compatibility with npm ecosystem tools
- Neutral, because requires configuration of git credentials in CI/CD
- Neutral, because creates automated commits that include CI skip directives
- Bad, because defaults to patch-level increments only
- Bad, because does not analyze commit messages for semantic versioning
- Bad, because potential for git history inconsistency if post-publish commits fail

### Semantic Release with automated version detection

Automated semantic versioning based on commit message analysis and release automation.

- Good, because fully automated semantic version determination
- Good, because analyzes commit messages for version type
- Good, because comprehensive release note generation
- Good, because follows semantic versioning specification strictly
- Good, because popular in open source ecosystem
- Neutral, because requires standardized commit message format
- Bad, because adds significant complexity to CI/CD pipeline
- Bad, because requires team discipline for commit message formatting
- Bad, because may be overkill for the current project size
- Bad, because introduces external dependency on semantic-release tool
- Bad, because harder to override for exceptional cases

### Manual version bumping with CI/CD workflow triggers

Requiring manual version increments before publishing with workflow validation.

- Good, because provides full developer control over versioning
- Good, because ensures deliberate version decisions
- Good, because no automated commits or git history noise
- Good, because simple to understand and implement
- Neutral, because requires developer discipline for version management
- Bad, because breaks continuous delivery principle
- Bad, because requires manual intervention for every release
- Bad, because prone to human error and forgotten version bumps
- Bad, because does not solve the original npm publish failure problem
- Bad, because creates friction in development workflow

### Version bumping through GitHub Actions with npm version

GitHub Actions-specific tooling for automated version management within the existing platform.

- Good, because native integration with GitHub workflow ecosystem
- Good, because can leverage GitHub-specific features like releases
- Good, because may provide better integration with pull request workflows
- Good, because uses familiar GitHub Actions patterns
- Neutral, because similar capabilities to npm version approach
- Bad, because locks solution to GitHub Actions platform specifically
- Bad, because may require additional GitHub Actions marketplace dependencies
- Bad, because potentially less portable to other CI/CD systems
- Bad, because npm version command is more universally understood

## More Information

This decision addresses the immediate CI/CD publish failures while establishing a foundation for reliable automated delivery. The implementation should be flexible enough to support future migration to semantic release if the project grows to require more sophisticated version management.

Key implementation considerations:

- Configure CI/CD pipeline with appropriate git credentials for post-publish commits
- Set up git user configuration for automated commits
- Ensure version tags follow consistent naming convention (v1.0.0 format)
- Use `[skip ci]` or `[ci skip]` in commit messages to prevent pipeline recursion
- Update CHANGELOG.md generation to work with automated version increments
- Handle potential race conditions if multiple commits are pushed simultaneously
- Ensure proper error handling if post-publish git operations fail

This decision should be re-evaluated if:

- Project adopts semantic versioning discipline across the team
- Commit message standardization becomes feasible
- Publishing frequency increases significantly requiring more sophisticated automation
- The simple patch increment approach becomes insufficient for change communication

Related resources:

- [npm version command documentation](https://docs.npmjs.com/cli/v9/commands/npm-version)
- [GitHub Actions CI/CD Best Practices](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments)
- [Semantic Versioning Specification](https://semver.org/)

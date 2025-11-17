---
status: "superseded"
date: 2025-11-17
decision-makers: [Development Team]
consulted:
  [
    npm Documentation,
    GitHub Actions Best Practices,
    Semantic Versioning Specification,
  ]
informed: [Project Stakeholders, CI/CD Pipeline Maintainers]
superseded-by: "006-semantic-release-for-automated-publishing"
superseded-date: "2025-11-17"
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

Chosen option: "Version Increment Without Git Commits", because it eliminates CI/CD loop complexity, requires no git write permissions, solves the immediate npm publish failures, and provides the simplest implementation while maintaining full automation.

### Implementation Strategy

The CI/CD pipeline will use in-memory version increments without git write-back:

1. **Pre-publish Version Check**: Before attempting to publish, check if the current package.json version already exists on npm using `npm view eslint-plugin-traceability@<version>`
2. **In-Memory Version Increment**: If the version exists on npm, increment the patch version in the pipeline workspace using `npm version patch --no-git-tag-version`
3. **Immediate Publish**: Proceed with npm publish using the incremented version without any git operations
4. **Pipeline Logging**: Log the version increment action for visibility and debugging
5. **No Git Write-Back**: The incremented version exists only in the pipeline workspace and is never committed back to the repository

### Primary Approach Considered

**Git Write-Back with Version Commits**: Increment version in pipeline, publish to npm, then commit version changes and create git tags with `[skip ci]` to prevent recursion. This approach was rejected due to complexity concerns including git write permissions, infinite loop prevention, post-publish failure handling, and potential race conditions in concurrent pipeline runs.

### Consequences

- Good, because prevents all npm publish failures due to version conflicts
- Good, because maintains fully automated delivery without any manual intervention
- Good, because eliminates infinite CI/CD loop risks entirely
- Good, because requires no git write permissions or credentials in CI/CD
- Good, because uses standard npm tooling that developers understand
- Good, because simplest possible implementation with minimal failure modes
- Good, because each pipeline run is completely independent
- Good, because immediate resolution to publish failures with no complexity overhead
- Neutral, because package.json version may lag behind published npm version
- Neutral, because developers can check published version via `npm view eslint-plugin-traceability version`
- Bad, because does not automatically determine semantic version type (major/minor/patch)
- Bad, because no automatic git tags or version history created

### Confirmation

Implementation compliance will be confirmed through:

- CI/CD pipeline successfully publishes without version conflicts
- No npm publish failures due to existing version numbers
- No git write operations or credentials required in CI/CD
- No infinite pipeline loops or `[skip ci]` complexity needed
- Pipeline logs clearly show when version increments occur
- Published npm versions can be verified via `npm view eslint-plugin-traceability versions`
- No manual intervention required for routine publishing

## Pros and Cons of the Options

### Version Increment Without Git Commits

In-memory version increments during pipeline execution without any git write-back operations.

- Good, because eliminates all CI/CD loop complexity and infinite recursion risks
- Good, because requires no git write permissions or credentials in CI/CD environment
- Good, because simplest possible implementation with minimal failure modes
- Good, because each pipeline run is completely independent with no race conditions
- Good, because immediate resolution to npm publish failures
- Good, because uses standard npm version tooling familiar to developers
- Good, because no complex error handling for git operations required
- Neutral, because package.json version may not reflect latest published version
- Neutral, because published version always discoverable via npm registry
- Bad, because no automatic git tags created for release tracking
- Bad, because requires manual version management for major/minor releases
- Bad, because no automated version commit history

### Git Write-Back with Version Commits

Increment version in pipeline, publish to npm, then commit version changes and create git tags.

- Good, because creates proper git tags and version commits automatically
- Good, because maintains package.json synchronization with published versions
- Good, because provides complete version history in git repository
- Good, because allows for automated CHANGELOG.md updates
- Good, because follows traditional npm ecosystem patterns
- Neutral, because requires configuration of git credentials in CI/CD
- Neutral, because creates automated commits with CI skip directives
- Bad, because requires complex infinite loop prevention with `[skip ci]`
- Bad, because potential for git write failures after successful npm publish
- Bad, because introduces race conditions in concurrent pipeline runs
- Bad, because requires git write permissions and credential management
- Bad, because adds multiple failure modes beyond the core publish operation

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

## More Information

This decision addresses the immediate CI/CD publish failures with the simplest possible solution that eliminates complexity while maintaining full automation. The in-memory version increment approach provides immediate relief from npm publish conflicts without introducing git write-back complexity.

Key implementation details:

```yaml
- name: Prepare version for publish
  run: |
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    echo "Current package.json version: $CURRENT_VERSION"

    # Check if this version exists on npm
    if npm view eslint-plugin-traceability@$CURRENT_VERSION version >/dev/null 2>&1; then
      echo "Version $CURRENT_VERSION already exists on npm, incrementing..."
      npm version patch --no-git-tag-version
      NEW_VERSION=$(node -p "require('./package.json').version")
      echo "Bumped version to: $NEW_VERSION"
    else
      echo "Version $CURRENT_VERSION is available, proceeding with publish"
    fi

- name: Publish package
  run: npm publish --access public
```

Implementation considerations:

- No git credentials or write permissions required in CI/CD
- Version increments are logged for visibility and debugging
- Each pipeline run operates independently with no side effects
- Published versions remain discoverable via `npm view eslint-plugin-traceability versions`
- Manual version bumps for major/minor releases can still be done via git commits
- Future migration to git write-back approach remains possible if needed

This decision should be re-evaluated if:

- Package.json/npm version drift becomes problematic for development workflow
- Automatic git tagging becomes a requirement for release management
- The team adopts semantic versioning discipline requiring commit message analysis
- Integration with automated changelog generation becomes necessary

The simplicity of this approach allows for easy migration to more complex solutions later while solving the immediate problem with minimal risk and complexity.

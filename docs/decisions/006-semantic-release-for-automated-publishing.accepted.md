---
status: "accepted"
date: 2025-11-17
decision-makers: [Development Team]
consulted:
  [
    semantic-release Documentation,
    Conventional Commits Specification,
    GitHub Actions Best Practices,
    npm Publishing Guidelines,
  ]
informed: [Project Stakeholders, CI/CD Pipeline Maintainers]
---

# Semantic Release for Automated Publishing

## Context and Problem Statement

The current automated version bumping strategy (ADR 004) has several limitations that impact maintainability and developer experience:

1. **Single Increment Logic**: The CI/CD pipeline only increments the version once, requiring complex loop logic to handle cases where multiple increments are needed (e.g., when both 1.0.3 and 1.0.4 already exist on npm)

2. **No Semantic Version Determination**: The system only performs patch increments and cannot automatically determine when minor or major version bumps are appropriate based on the nature of changes

3. **Missing Release Management**: No automatic git tagging, release notes, or CHANGELOG.md generation, reducing traceability and release visibility

4. **Workflow Complexity**: The custom version increment logic in GitHub Actions is becoming complex and error-prone, potentially violating workflow validation best practices established in ADR 005

5. **Package.json/npm Version Drift**: The package.json version in the repository can lag behind the published npm version, creating confusion about the actual release state

The current approach was designed as a temporary solution to prevent npm publish failures, but its limitations suggest that a more comprehensive release automation strategy is needed.

## Decision Drivers

- Need for proper semantic version determination based on change significance
- Automatic generation of release notes and changelog maintenance
- Git tag creation for release tracking and traceability
- Elimination of complex custom version increment logic in CI/CD workflows
- Integration with conventional commit standards for automated version type detection
- Prevention of unnecessary publishing when no changes warrant a release
- Alignment with npm ecosystem best practices for release management
- Simplification of GitHub Actions workflow to improve maintainability and validation compliance

## Considered Options

- Enhance current in-memory version increment approach with loop logic
- Implement semantic-release with conventional commits
- Switch to git write-back approach with automated tagging
- Implement manual release workflow with GitHub releases

## Decision Outcome

Chosen option: "semantic-release with conventional commits", because it provides comprehensive release automation, proper semantic versioning, automated changelog generation, and eliminates the need for complex custom version logic while following industry standards.

### Implementation Strategy

1. **Install and Configure semantic-release**:
   - Add `semantic-release` and related plugins as development dependencies
   - Configure semantic-release with conventional commits preset
   - Set up plugins for npm publishing, git tagging, and changelog generation

2. **Establish Conventional Commit Standards**:
   - Adopt conventional commit message format for semantic version determination
   - Configure semantic-release to analyze commit messages for version impact
   - Document commit message guidelines for contributors

3. **Update CI/CD Pipeline**:
   - Replace custom version increment logic with semantic-release execution
   - Configure semantic-release to run on main branch pushes
   - Set up proper npm registry authentication and git permissions

4. **Configure Release Automation**:
   - Automatic CHANGELOG.md generation and maintenance
   - Git tag creation for each release
   - GitHub release creation with release notes
   - Conditional publishing (only when changes warrant a release)

### Consequences

- Good, because eliminates complex custom version increment logic from CI/CD workflows
- Good, because provides proper semantic version determination based on commit analysis
- Good, because automatically generates and maintains CHANGELOG.md with release notes
- Good, because creates proper git tags and GitHub releases for traceability
- Good, because follows conventional commits standard adopted widely in open source
- Good, because only publishes when changes actually warrant a new release
- Good, because maintains package.json/npm version synchronization through git operations
- Good, because simplifies GitHub Actions workflow, improving validation compliance
- Good, because provides comprehensive release management with minimal configuration
- Neutral, because requires team adoption of conventional commit message format
- Neutral, because requires git write permissions in CI/CD environment
- Bad, because introduces dependency on semantic-release tool and its ecosystem
- Bad, because may require learning curve for conventional commit message format

### Confirmation

Implementation compliance will be confirmed through:

- semantic-release successfully analyzes commits and determines appropriate version increments
- Automatic CHANGELOG.md generation and git tag creation on releases
- CI/CD pipeline publishes to npm only when semantic-release determines a release is warranted
- No npm publish failures due to version conflicts or unnecessary publishing attempts
- Package.json version remains synchronized with published npm version
- GitHub Actions workflow simplified and validates successfully with actionlint (ADR 005)
- Conventional commit message format adopted and documented for contributors

## Pros and Cons of the Options

### semantic-release with conventional commits

Comprehensive automated release management based on commit message analysis.

- Good, because industry standard tool with extensive ecosystem
- Good, because proper semantic version determination based on commit analysis
- Good, because automatic CHANGELOG.md and release notes generation
- Good, because creates git tags and GitHub releases automatically
- Good, because only publishes when changes warrant a release
- Good, because eliminates custom version increment logic complexity
- Good, because maintains git history and package.json synchronization
- Good, because follows conventional commits standard
- Good, because comprehensive documentation and community support
- Neutral, because requires conventional commit message discipline
- Neutral, because adds dependency on semantic-release ecosystem
- Bad, because requires git write permissions in CI/CD
- Bad, because learning curve for commit message conventions

### Enhanced in-memory version increment with loop logic

Improve the current approach with better version conflict resolution.

- Good, because builds on existing working foundation
- Good, because no external dependencies or new tooling
- Good, because maintains current simplicity of git read-only CI/CD
- Neutral, because addresses immediate technical limitation
- Bad, because still provides only patch-level version increments
- Bad, because no semantic version determination capability
- Bad, because no automatic changelog or git tag generation
- Bad, because increases complexity of custom GitHub Actions logic
- Bad, because doesn't address package.json/npm version synchronization
- Bad, because potential for workflow validation issues with complex logic

### Git write-back approach with automated tagging

Custom solution with git operations for version commits and tagging.

- Good, because provides git tag creation and version history
- Good, because maintains package.json synchronization
- Good, because can be customized for specific project needs
- Neutral, because requires git write permissions
- Bad, because requires complex infinite loop prevention logic
- Bad, because no semantic version determination
- Bad, because no automated changelog generation
- Bad, because potential race conditions in CI/CD
- Bad, because increased failure modes with git operations
- Bad, because custom implementation maintenance burden

### Manual release workflow with GitHub releases

Manual release creation through GitHub interface with automated publishing.

- Good, because provides full control over release timing and messaging
- Good, because natural integration with GitHub releases interface
- Good, because allows for manual changelog and release notes
- Good, because no automated commit message requirements
- Neutral, because requires manual intervention for releases
- Bad, because breaks continuous delivery principle
- Bad, because prone to human error and forgotten releases
- Bad, because no automation of version determination
- Bad, because workflow friction for regular development
- Bad, because doesn't solve original npm publish failure problem

## More Information

This decision supersedes ADR 004 "Automated Version Bumping for CI/CD Publishing", which served as a temporary solution to prevent npm publish failures but has reached its limitations in terms of semantic versioning and release management.

semantic-release configuration will include:

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

Conventional commit format examples:

- `feat: add new validation rule` → minor version increment
- `fix: resolve annotation parsing issue` → patch version increment
- `feat!: change API interface` → major version increment
- `docs: update README` → no version increment

GitHub Actions workflow simplification:

- Remove custom version increment logic
- Replace with single `npx semantic-release` command
- Add git credentials for tag and commit operations
- Maintain existing quality checks and security audits

This decision should be re-evaluated if:

- Conventional commit discipline becomes difficult to maintain
- semantic-release ecosystem introduces breaking changes or maintenance issues
- Project requirements change to need custom release logic not supported by semantic-release
- Team prefers different commit message standards incompatible with conventional commits

Related resources:

- [semantic-release Documentation](https://semantic-release.gitbook.io/)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [GitHub Actions with semantic-release](https://github.com/semantic-release/semantic-release/blob/master/docs/recipes/github-actions.md)

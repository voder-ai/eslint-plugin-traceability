---
status: "accepted"
date: 2025-11-17
decision-makers: [Development Team]
consulted:
  [
    semantic-release Documentation,
    GitHub Releases Best Practices,
    Open Source Project Standards,
  ]
informed: [Project Contributors, Package Users]
---

# GitHub Releases Over Manual CHANGELOG.md Maintenance

## Context and Problem Statement

With the adoption of semantic-release (ADR 006), the project now has automated changelog generation and GitHub release creation capabilities. However, we currently maintain a manual CHANGELOG.md file that duplicates this information and creates several issues:

1. **Duplicate Effort**: semantic-release automatically generates release notes and CHANGELOG.md content, making manual maintenance redundant

2. **Synchronization Risk**: Manual CHANGELOG.md updates can become out of sync with actual releases, creating confusion about what changes were included in which version

3. **Source of Truth Ambiguity**: Having both a manual CHANGELOG.md and automated GitHub Releases creates uncertainty about which source is authoritative for release information

4. **Maintenance Burden**: Developers must remember to update CHANGELOG.md manually in addition to following conventional commit standards, increasing cognitive load

5. **Incomplete Historical Record**: Manual changelogs are prone to omissions, while automated generation from commits provides complete traceability

The current CHANGELOG.md was valuable during manual release management, but semantic-release provides a superior automated alternative that eliminates these problems.

## Decision Drivers

- Elimination of duplicate changelog maintenance effort
- Single source of truth for release information
- Consistency between commits, releases, and changelog
- Leveraging semantic-release capabilities fully
- Reducing manual maintenance burden on developers
- Following modern open source project practices
- Improving traceability from commits to releases
- Preventing changelog/release synchronization issues

## Considered Options

- Continue maintaining both manual CHANGELOG.md and GitHub Releases
- Use CHANGELOG.md as redirect to GitHub Releases page
- Completely remove CHANGELOG.md file
- Keep manual CHANGELOG.md and disable semantic-release changelog generation

## Decision Outcome

Chosen option: "Use CHANGELOG.md as redirect to GitHub Releases page", because it maintains backward compatibility for users who expect a CHANGELOG.md file while directing them to the authoritative and automatically maintained release information on GitHub.

### Implementation Strategy

1. **Replace CHANGELOG.md Content**:
   - Replace current content with a simple redirect message
   - Include link to GitHub Releases page
   - Provide brief explanation of why releases are maintained on GitHub
   - Keep file in repository to avoid breaking tooling that expects it

2. **Configure semantic-release**:
   - Ensure semantic-release is configured to create GitHub Releases with complete release notes
   - Verify automated release notes include all commit types appropriately
   - Maintain git tags as authoritative version markers

3. **Update Documentation**:
   - Update contributing guidelines to reference GitHub Releases
   - Document that changelog is maintained automatically via semantic-release
   - Remove any references to manual CHANGELOG.md maintenance

4. **Archive Historical Content**:
   - Historical CHANGELOG.md content remains in git history
   - Previous releases maintain their existing changelog entries
   - New releases will be documented exclusively on GitHub

### Consequences

- Good, because eliminates duplicate changelog maintenance effort
- Good, because provides single source of truth (GitHub Releases)
- Good, because leverages semantic-release automation fully
- Good, because ensures changelog is always synchronized with releases
- Good, because provides richer release information (links, commits, contributors)
- Good, because maintains backward compatibility with CHANGELOG.md file presence
- Good, because follows modern open source project conventions
- Good, because reduces manual maintenance burden on developers
- Good, because improves traceability from commits through releases
- Neutral, because requires users to access GitHub for detailed release information
- Neutral, because CHANGELOG.md becomes a pointer rather than content
- Bad, because users without GitHub access cannot see detailed changelogs
- Bad, because breaks offline changelog access (mitigated by git tags and package.json version)

### Confirmation

Implementation compliance will be confirmed through:

- CHANGELOG.md file contains redirect message with GitHub Releases URL
- semantic-release creates GitHub Releases with comprehensive release notes
- No manual CHANGELOG.md maintenance occurs in subsequent releases
- Documentation updated to reference GitHub Releases as changelog source
- New contributors directed to GitHub Releases rather than CHANGELOG.md
- Release process validates that GitHub Releases are created automatically
- Historical changelog content remains accessible in git history

## Pros and Cons of the Options

### Use CHANGELOG.md as redirect to GitHub Releases page

Replace CHANGELOG.md with a redirect message pointing to GitHub Releases.

- Good, because maintains file presence for backward compatibility
- Good, because clearly directs users to authoritative source
- Good, because eliminates duplicate maintenance
- Good, because simple and clear implementation
- Good, because preserves historical changelog in git history
- Neutral, because requires GitHub access for detailed changelog
- Bad, because CHANGELOG.md no longer contains actual changelog content

### Continue maintaining both manual CHANGELOG.md and GitHub Releases

Keep manual CHANGELOG.md updated alongside automated GitHub Releases.

- Good, because provides maximum accessibility
- Good, because maintains traditional expectations
- Neutral, because offers redundancy
- Bad, because duplicates maintenance effort significantly
- Bad, because creates synchronization risk
- Bad, because negates benefits of semantic-release automation
- Bad, because requires manual discipline for every release
- Bad, because potential for inconsistency between sources

### Completely remove CHANGELOG.md file

Delete CHANGELOG.md entirely and rely solely on GitHub Releases.

- Good, because completely eliminates duplicate maintenance
- Good, because clearly establishes GitHub Releases as source of truth
- Good, because most direct implementation of semantic-release pattern
- Neutral, because follows some modern project conventions
- Bad, because breaks tooling that expects CHANGELOG.md presence
- Bad, because unexpected for users accustomed to changelog files
- Bad, because removes clear signposting to release information
- Bad, because loses historical changelog from repository view

### Keep manual CHANGELOG.md and disable semantic-release changelog generation

Maintain manual CHANGELOG.md as primary changelog and disable automated generation.

- Good, because provides full control over changelog content
- Good, because maintains traditional changelog maintenance
- Neutral, because keeps changelog in repository
- Bad, because foregoes semantic-release automation benefits
- Bad, because requires manual discipline for every release
- Bad, because prone to omissions and inconsistencies
- Bad, because creates additional maintenance burden
- Bad, because doesn't leverage conventional commits for changelog
- Bad, because prevents automated release notes generation

## More Information

This decision builds upon ADR 006 "Semantic Release for Automated Publishing" by completing the transition to fully automated release management. The manual CHANGELOG.md served the project well during the initial development phase, but semantic-release provides superior automation and consistency.

The CHANGELOG.md redirect will contain:

```markdown
# Changelog

This project uses automated release management via semantic-release.

For detailed release notes and changelog information, please see:
**[GitHub Releases](https://github.com/voder-ai/eslint-plugin-traceability/releases)**

Each release includes:

- Detailed change descriptions
- Commit references
- Breaking changes (if any)
- Migration notes (when applicable)

Historical changelog entries prior to automated release management are preserved in this file's git history.
```

GitHub Releases will automatically include:

- Semantic version number from conventional commits
- Release date and tag reference
- Categorized changes (Features, Bug Fixes, Breaking Changes)
- Individual commit references with links
- Contributor information
- Generated from conventional commit messages

semantic-release configuration ensures:

- `@semantic-release/release-notes-generator` creates formatted release notes
- `@semantic-release/github` publishes releases to GitHub
- All commits since last release are analyzed and categorized
- Release notes follow consistent format across all releases

This decision should be re-evaluated if:

- Significant user base requires offline changelog access
- Project moves away from GitHub hosting
- semantic-release becomes unmaintained or problematic
- Tooling dependencies emerge that require traditional CHANGELOG.md
- Community feedback strongly favors manual changelog maintenance

Related decisions:

- ADR 006: Semantic Release for Automated Publishing (establishes automated release management)
- ADR 004: Automated Version Bumping for CI/CD (superseded by ADR 006)

Related resources:

- [semantic-release GitHub Plugin](https://github.com/semantic-release/github)
- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Keep a Changelog](https://keepachangelog.com/) - traditional approach being deprecated

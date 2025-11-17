# Changelog

This project uses automated release management via [semantic-release](https://semantic-release.gitbook.io/).

For detailed release notes and changelog information, please see:

**[GitHub Releases](https://github.com/voder-ai/eslint-plugin-traceability/releases)**

Each release includes:
- Detailed change descriptions
- Commit references
- Breaking changes (if any)
- Migration notes (when applicable)

---

## Historical Changelog (Prior to Automated Releases)

The following entries were maintained manually before the adoption of semantic-release. Current and future releases are documented exclusively on the GitHub Releases page.

### [1.0.5] - 2025-11-17

**Changed**
- Lowered maintainability thresholds to 70 lines/function and 300 lines/file in ESLint config.
- Added override for 'tar' package to mitigate moderate vulnerabilities.

### [1.0.4] - 2025-11-17

**Fixed**
- Ensured temporary directories are cleaned up in maintenance tests for detect and update functions.
- Refactored valid-req-reference rule to reduce function length and added explicit type annotations.

### [1.0.3] - 2025-11-17

**Added**
- CLI integration script (`cli-integration.js`) for end-to-end ESLint CLI tests.
- Migration guide in `user-docs/migration-guide.md`.

### [1.0.2] - 2025-11-17

**Changed**
- Updated README and docs to reference `cli-integration.js` script.
- Removed stale references to migration guide in CHANGELOG gradients.

### [1.0.1] - 2025-11-17

**Added**
- Detailed API documentation in `user-docs/api-reference.md`
- New usage examples in `user-docs/examples.md`

**Changed**
- Updated `README.md` with advanced usage instructions and migration guide
- Consolidated CI workflows into a unified GitHub Actions pipeline

### [1.0.0] - 2025-11-16

**Changed**
- Bumped version to 1.0.0 in package.json.
- Aligned CHANGELOG with package.json version.

### [0.1.0] - 2025-11-16

**Added**
- Initial release of `eslint-plugin-traceability`:
  - `require-story-annotation`
  - `require-req-annotation`
  - `require-branch-annotation`
  - `valid-annotation-format`
  - `valid-story-reference`
  - `valid-req-reference`
- Documentation for all rules under `docs/rules`.
- Configuration presets in `docs/config-presets.md`.
- Example usage in `README.md`.
- Pre-commit and pre-push hooks with formatting, linting, and tests.
- Comprehensive tests covering core validation rules.
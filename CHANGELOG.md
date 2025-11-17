# Changelog

All notable changes to this project will be documented in this file.

## [1.0.3] - 2025-11-17

### Added
- CLI integration script (`cli-integration.js`) for end-to-end ESLint CLI tests.
- Migration guide in `user-docs/migration-guide.md`.

## [1.0.2] - 2025-11-17

### Changed
- Updated README and docs to reference `cli-integration.js` script.
- Removed stale references to migration guide in CHANGELOG gradients.

## [1.0.1] - 2025-11-17

### Added
- Detailed API documentation in `user-docs/api-reference.md`
- New usage examples in `user-docs/examples.md`

### Changed
- Updated `README.md` with advanced usage instructions and migration guide
- Consolidated CI workflows into a unified GitHub Actions pipeline

## [1.0.0] - 2025-11-16

### Changed
- Bumped version to 1.0.0 in package.json.
- Aligned CHANGELOG with package.json version.

## [0.1.0] - 2025-11-16

### Added
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

### Fixed
- N/A
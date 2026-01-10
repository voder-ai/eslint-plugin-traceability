# Known Dependency Issues

## semver-diff Deprecation Warning

**Status**: Non-critical dev dependency deprecation  
**Affects**: Development environment only (not runtime or consumers)  
**Source**: Transitive dependency via `semantic-release@25.0.2`

### Background

During `npm ci` or `npm install`, you may see a deprecation warning:

```
npm warn deprecated semver-diff@5.0.0: Deprecated as the semver package now supports this built-in.
```

### Impact

- **Runtime**: No impact - semver-diff is a dev dependency only
- **Consumers**: No impact - not included in published package
- **Development**: Warning only - functionality works correctly

### Resolution Status

- We're using the latest version of `semantic-release` (25.0.2)
- The `semver-diff` package (v5.0.0) is the latest available version
- The deprecation indicates that `semver` now has built-in functionality
- Waiting for `semantic-release` to update and remove `semver-diff` dependency
- Tracking issue: This is a known issue in the semantic-release ecosystem

### Action Required

No action required. This warning can be safely ignored until semantic-release removes the dependency.

### Verification

To verify this only affects dev dependencies:

```bash
# Check dependency tree
npm ls semver-diff

# Output shows it's only via semantic-release (dev dependency):
# └─┬ semantic-release@25.0.2
#   └── semver-diff@5.0.0
```

---

Last updated: 2026-01-10

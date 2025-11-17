# Conventional Commits Guide

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to enable automated semantic versioning and changelog generation through semantic-release.

## Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types and Version Impact

### `feat`: New Features (Minor Version)

- Adds new functionality
- Results in a **minor** version increment (e.g., 1.0.0 → 1.1.0)

Examples:

```bash
feat: add new validation rule for story references
feat(rules): implement require-branch-annotation rule
feat: add CLI integration for batch processing
```

### `fix`: Bug Fixes (Patch Version)

- Fixes existing functionality
- Results in a **patch** version increment (e.g., 1.0.0 → 1.0.1)

Examples:

```bash
fix: resolve annotation parsing for multiline comments
fix(validation): handle edge case in reference checking
fix: prevent false positives in story reference detection
```

### Breaking Changes (Major Version)

- Any commit with `!` after the type or `BREAKING CHANGE:` in footer
- Results in a **major** version increment (e.g., 1.0.0 → 2.0.0)

Examples:

```bash
feat!: change API interface for rule configuration
fix!: remove deprecated annotation format support

feat: add new validation options

BREAKING CHANGE: The `allowUnresolved` option has been removed.
Use `strict: false` instead.
```

### Other Types (No Version Change)

These don't trigger releases but appear in changelog:

- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring without functional changes
- `test`: Adding or updating tests
- `chore`: Build process, auxiliary tools, or maintenance
- `perf`: Performance improvements
- `ci`: CI/CD configuration changes

Examples:

```bash
docs: update README with installation instructions
test: add unit tests for validation rules
chore: update dependencies to latest versions
ci: configure semantic-release for automated publishing
```

## Scopes (Optional)

Use scopes to specify what part of the codebase is affected:

- `rules`: ESLint rule implementations
- `maintenance`: Maintenance scripts and utilities
- `cli`: Command-line integration tools
- `config`: Configuration and setup files
- `deps`: Dependency updates

Examples:

```bash
feat(rules): add valid-annotation-format rule
fix(maintenance): resolve batch processing memory leak
docs(config): add ESLint 9 setup guide
```

## Best Practices

### Commit Message Guidelines

1. **Use imperative mood**: "add feature" not "added feature"
2. **Keep subject under 50 characters**: For better git log readability
3. **Capitalize the subject line**: Start with capital letter
4. **No period at the end**: Of the subject line
5. **Explain what and why**: In the body, not how

### When to Use Each Type

**Use `feat` when:**

- Adding new ESLint rules
- Adding new maintenance utilities
- Adding new configuration options
- Adding new CLI commands or features

**Use `fix` when:**

- Fixing rule logic or false positives/negatives
- Fixing crashes or runtime errors
- Fixing configuration issues
- Fixing documentation errors

**Use `refactor` when:**

- Improving code structure without changing behavior
- Renaming variables or functions
- Extracting common functionality
- Simplifying complex logic

**Use `docs` when:**

- Updating README, guides, or API documentation
- Adding code comments or JSDoc
- Updating examples or migration guides

### Example Workflow

```bash
# New feature
git commit -m "feat(rules): add require-story-annotation rule

Implements validation to ensure all functions have @story annotations
linking them to user stories for traceability.

Resolves: #123"

# Bug fix
git commit -m "fix: resolve false positive in annotation parsing

The regex pattern was incorrectly matching inline comments.
Updated to only match block comments that start at beginning of line."

# Breaking change
git commit -m "feat!: change rule configuration schema

BREAKING CHANGE: Rule options now use 'patterns' instead of 'pattern'.
Update your ESLint config:
- Before: { "pattern": "REQ-*" }
+ After: { "patterns": ["REQ-*"] }"
```

## Integration with semantic-release

semantic-release analyzes commit messages to:

1. **Determine version bump**: Based on feat/fix/breaking change types
2. **Generate changelog**: From commit messages and pull request information
3. **Create git tags**: For each release
4. **Publish to npm**: Only when changes warrant a release

## Validation

Pre-commit hooks will validate your commit messages follow the conventional format. If you need to bypass validation temporarily (not recommended), use:

```bash
git commit --no-verify -m "your message"
```

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [semantic-release Documentation](https://semantic-release.gitbook.io/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format)

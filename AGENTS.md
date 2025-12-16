# AI Agent Instructions for eslint-plugin-traceability

This project uses GitHub Copilot and other AI assistants. Follow these guidelines when working on this codebase.

## Core Principles

**Ask Questions One at a Time**: When you need additional information, ask questions one at a time, allowing me to respond to each before asking the next.

**Provide Context**: When asking questions, provide context or background information to help me understand your needs better.

## Documentation-First Development

### Specifications and Decisions

When making changes to code or tests:

1. **Update specifications first**: Ensure the specification in `prompts/` is updated before implementation
2. **Document decisions**: Relevant decisions must be documented or updated in `docs/decisions/` using the MADR 4.0 format (see `prompt-assets/adr-template.md`)
3. **Conform to specifications**: All code changes should conform to `prompts/` and `docs/decisions/`
4. **Check dependencies**: When working with dependencies, follow usage patterns documented in `docs/libraries/`

### Story Maps

When updating user story maps:

- Use descriptive theme names (e.g., "Core Validation", "Formatter Compatibility")
- Include status indicators (Completed, Current, Planned, Future)
- Avoid version numbers to keep story maps timeless and decoupled from semantic versioning

### When Specifications Don't Match

If directed to make changes that don't conform to `prompts/` and `docs/decisions/`:

1. Seek clarification
2. Update the documentation based on the response
3. Then proceed with implementation

## Testing Guidelines

### Test Coverage

- Ensure all relevant tests are updated or added in `tests/` to maintain code quality and coverage
- Include references to relevant specifications in `prompts/` and decisions in `docs/decisions/` to assist with traceability assessments

### Testing Initializers and Generators

**CRITICAL** when testing code that creates projects, templates, or generates files:

- **ALWAYS use temp directories** via `fs.mkdtemp(path.join(os.tmpdir(), 'prefix-'))` or equivalent
- **NEVER generate test projects directly in the repository** - this pollutes version control
- **ALWAYS clean up** temp directories in `afterEach`/`finally` blocks using `fs.rm(dir, { recursive: true, force: true })`
- Generated test projects committed to git are a **HIGH PENALTY** version control violation

**Pattern**: Create temp dir → Run initializer/generator → Assert outputs → Clean up temp dir

**Bad example**: Directories like `cli-test-project/`, `test-project-*/`, `manual-cli/` committed to version control

## Documentation Standards

- Ensure documentation accurately reflects the current state of the codebase and recent changes
- When renaming files, prefer `git mv` to preserve file history

## Commit Message Guidelines

Follow conventional commits as per `docs/conventional-commits-guide.md`:

### `feat:` - New Features

For implementing new features that are **user-facing** (code changes that affect end users)

- **NOT** for adding dev dependencies or upgrading dev tooling
- **NOT** for internal improvements that don't affect user experience

### `docs:` - Documentation Changes

For documentation-only changes including:

- Adding or updating user stories in `docs/stories/`
- Updating story maps
- Documentation updates that don't involve code implementation
- Changes to guides, ADRs, or planning documents

### `test:` - Test Changes

For adding or updating tests

### `fix:` - Bug Fixes

For bug fixes that affect user-facing functionality or runtime behavior

- **NOT** for linting/formatting fixes (use `chore:` or `refactor:` instead)
- **NOT** for code quality improvements that don't fix user-facing issues

### `chore:` - Maintenance Tasks

For maintenance tasks like:

- Removing linting suppressions (e.g., eslint-disable directives)
- Fixing code quality issues that don't affect functionality
- Updating dependencies (both dev and production)
- Upgrading dev tooling (linters, formatters, test frameworks, etc.)
- Cleaning up code formatting

### `refactor:` - Code Restructuring

For code restructuring that improves internal quality without changing behavior

Use appropriate scope (e.g., `docs(stories):`, `feat(rules):`, `chore(lint):`, `chore(deps):`)

## Development Scripts (SOA Pattern)

We use **Contract Centralization** (Service-Oriented Architecture pattern) for all development scripts:

### JS/TS Projects

- **`package.json` "scripts" field is the ONLY way to access dev scripts**
- Run scripts via `npm run scriptname`
- Scripts in `scripts/` directory are implementation details called BY package.json scripts

### Rules

- **ALWAYS** add new scripts to package.json
- **NEVER** create standalone scripts in `scripts/` without adding to centralized contract
- Scripts not in contract are considered unused and should be removed
- Rare exceptions: Emergency scripts or one-time setup scripts documented in README

## Pre-commit Hooks

**NEVER** use `--no-verify` or similar flags to bypass pre-commit hooks.

When pre-commit hooks fail due to linting/quality issues:

1. **DO NOT bypass with --no-verify**
2. **DO analyze the root cause** of the failures
3. **DO fix issues incrementally** - one file at a time if needed
4. **DO verify each fix** works before proceeding to the next
5. **DO commit each incremental fix** as hooks pass
6. **DO document the approach** in the plan before mass changes

If hooks prevent committing fixes (chicken-and-egg scenario):

- Fix the FIRST file that has the issue
- Verify the fix resolves the issue for that file
- Commit that single fix once hooks pass
- Then proceed incrementally to next files
- Update the plan after each successful fix to reflect progress

## Tool Usage

### File Editing

- Prefer file editing tools over `cat` and `echo` for modifying files
- This ensures better handling of file contents and formatting

### Command Output

- Avoid piping output to `jq` - it's not needed, you can read the full results
- Avoid `|| echo {}` patterns - if a command fails, let it fail so you can address the root cause

### GitHub CLI (gh)

**GitHub CLI commands MUST be piped to `cat`** to prevent terminal blocking on macOS.

This applies to ALL `gh` commands that produce output:

- `gh run list --limit 5 | cat` instead of `gh run list --limit 5`
- `gh run view <run-id> | cat` instead of `gh run view <run-id>`
- `gh pr list | cat` instead of `gh pr list`
- `gh workflow list | cat` instead of `gh workflow list`

**Required**: Always append `| cat` to any `gh` command that produces output to prevent interactive pager issues.

## Quality Checks

When you've finished updating files, make sure you run the linting, formatting, and test scripts defined in the project.

## Manual Edits Assumption

**NOTE**: NEVER assume there have been manual edits to files. I NEVER EVER make manual edits to files unless I explicitly say so.

---

For more detailed instructions, see:

- `.github/instructions/base.instructions.md` - Base development guidelines
- `.github/instructions/local-tools.instructions.md` - Tool-specific configurations
- `.github/instructions/save-decisions.instructions.md` - Decision management process
- `.github/instructions/save-prompts.instructions.md` - Prompt documentation process
- `docs/conventional-commits-guide.md` - Commit message conventions
- `.github/prompts/commit-push.prompt.md` - Commit and push workflow

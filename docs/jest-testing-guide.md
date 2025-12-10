# Jest Testing Guide

This guide covers testing practices and configuration for the eslint-plugin-traceability project.

## Traceability in Test Output

### Viewing Story and Requirement References

By default, Jest's standard output only shows file-level test results without displaying individual test descriptions or traceability annotations. To see the full traceability information including story references and requirement IDs, you must use the `--verbose` option.

**Standard output (limited visibility):**

```bash
npm test
```

Shows only:

```
 PASS  tests/maintenance/batch.test.ts
 PASS  tests/rules/require-branch-annotation.test.ts
```

**Verbose output (full traceability):**

```bash
npm test -- --verbose
```

Shows detailed test descriptions with traceability annotations:

```
 PASS  tests/maintenance/batch.test.ts
  batchUpdateAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)
    ✓ [REQ-MAINT-BATCH] should return 0 when no mappings applied (6 ms)
  verifyAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)
    ✓ [REQ-MAINT-VERIFY] should return true when annotations are valid

 PASS  tests/rules/require-branch-annotation.test.ts
  Require Branch Annotation Rule (Story 004.0-DEV-BRANCH-ANNOTATIONS)
    require-branch-annotation
      valid
        ✓ [REQ-BRANCH-DETECTION] valid if-statement with annotations (4 ms)
```

### Test Structure Requirements

All tests in this project follow a specific structure to support traceability:

1. **File-level annotations** at the top of each test file:

   ```typescript
   /**
    * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    * @req REQ-MAINT-BATCH - Perform batch updates
    * @req REQ-MAINT-VERIFY - Verify annotation references
    */
   ```

2. **Describe blocks** that reference the story:

   ```typescript
   describe('batchUpdateAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)', () => {
   ```

3. **Test cases** that reference specific requirements:
   ```typescript
   it('[REQ-MAINT-BATCH] should return 0 when no mappings applied', () => {
   ```

### Running Tests for Traceability Review

When reviewing test coverage for specific stories or requirements:

- **For development/debugging**: Use `npm test -- --verbose` to see all traceability information
- **For CI/CD pipelines**: Standard `npm test` provides sufficient pass/fail information
- **For coverage analysis**: Both modes provide the same coverage statistics

### Best Practices

1. **Always include story references** in describe blocks to make them visible in verbose output
2. **Prefix test descriptions with requirement IDs** in square brackets (e.g., `[REQ-MAINT-BATCH]`)
3. **Use meaningful test descriptions** that clearly indicate what requirement is being tested
4. **Run with --verbose during development** to verify traceability annotations are properly displayed

## Configuration

The project's Jest configuration is defined in `jest.config.js` and includes:

- Coverage reporting
- TypeScript support via ts-jest
- Test file patterns
- CI-friendly options (--ci --bail --coverage)

## Optional Migration Rule and CLI Smoke Tests

The `tests/rules/prefer-implements-annotation.test.ts` suite exercises the optional `traceability/prefer-implements-annotation` migration rule from Story 010.3. It covers detection and auto-fix of single-story `@story` + `@req` blocks, diagnostics for mixed legacy annotations combined with `@supports` and multi-story blocks, and explicit backward-compatibility cases where comments containing only `@story`, only `@req`, only `@supports`, or simple mixed-but-non-migratable combinations (such as `@story` + `@supports` or `@req` + `@supports`) are intentionally ignored.

When changing this migration behavior, contributors should:

- Add or update valid/invalid test cases for any new edge conditions, autofix shapes, or message IDs.
- Keep the test expectations aligned with Story 010.3 requirements, including REQ-OPTIONAL-WARNING and REQ-MULTI-STORY-DETECT, so that each requirement has explicit coverage.
- Prefer table-driven or grouped test cases that make it clear which inputs are meant to be migratable, which are only diagnostic, and which are explicitly out of scope.

In addition to the Jest-based CLI tests under `tests/maintenance/cli.test.ts` and `tests/perf/maintenance-cli-large-workspace.test.ts`, the `scripts/smoke-test.sh` script now runs an end-to-end flow: it packs and installs the plugin into a fresh temporary project, verifies that the ESLint plugin loads, and invokes the installed `traceability-maint` CLI binary for both a successful `detect --root .` run and an error-path `report --format yaml` run, asserting on exit codes and key messages. When maintainers change CLI behavior or exit codes, they must update both the Jest CLI tests and the smoke test assertions to keep end-to-end coverage in sync with the documented options and contracts.

### Performance Tests and Runtime Guarantees

The `tests/perf/*` suites encode performance expectations for the maintenance tools and key rules. In particular, the large-workspace maintenance and CLI tests enforce a 5 second per-operation budget via constants defined in those test files. Developers should run these performance tests before merging significant changes to the maintenance tools or the covered rules. See `docs/maintenance-performance-tests.md` and `docs/performance-tests-overview.md` for the primary references and detailed guidance.

## Related Documentation

- [Story Files](stories/) - User story definitions
- [ESLint Plugin Development Guide](eslint-plugin-development-guide.md) - General development practices
- [Decision Records](decisions/) - Architectural decisions including Jest adoption
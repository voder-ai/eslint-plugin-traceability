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

## Related Documentation

- [Story Files](stories/) - User story definitions
- [ESLint Plugin Development Guide](eslint-plugin-development-guide.md) - General development practices
- [Decision Records](decisions/) - Architectural decisions including Jest adoption

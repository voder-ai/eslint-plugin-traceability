---
status: accepted
date: 2026-01-12
decision-makers: [Tom Howard]
---

# @req Mismatch Detection in Migration Rule (prefer-supports-annotation)

## Context and Problem Statement

Story 010.3-DEV-MIGRATE-TO-SUPPORTS defines requirement REQ-MULTI-STORY-DETECT with acceptance criterion: "Detect when function has `@req` that don't match `@story` and warn (cannot auto-fix)".

The current `prefer-supports-annotation` rule implementation detects:

- Multiple `@story` paths in the same comment block
- Mixed usage of `@story`/`@req` with existing `@supports` annotations
- Complex patterns like `@req` without `@story`

However, it does NOT validate whether the `@req` IDs listed in annotations are actually defined in the referenced `@story` file. This means a function could reference `REQ-SECURITY-CHECK` while pointing to a story that only defines `REQ-AGE-FILTER`, and the migration rule would auto-fix it without warning about the mismatch.

This gap was identified in the functionality assessment: "REQ-MULTI-STORY-DETECT#1 is not fully met: the migration rule does not compare @req IDs against the @story path (or story content) to warn about mismatched requirements; it only detects multiple @story paths or mixed @supports usage."

## Decision Drivers

- **Requirement completeness**: REQ-MULTI-STORY-DETECT explicitly requires detecting mismatched @req IDs
- **Migration safety**: Auto-fix should only be offered when @req IDs are verified to belong to the referenced story
- **Developer feedback**: Mismatched @req IDs likely indicate multi-story implementations that need manual migration
- **Existing patterns**: Should leverage story file parsing patterns from `valid-req-reference` rule
- **Performance**: Reading story files on every annotation could impact lint performance
- **Configuration**: Should respect shared config resolution (ADR-016) for story directory lookup

## Considered Options

1. **Validate @req IDs against story file content before auto-fix**
2. **Skip validation and rely on valid-req-reference rule to catch mismatches**
3. **Add validation as optional feature (off by default)**
4. **Defer validation to a separate rule (prefer-valid-req-in-migration)**

## Decision Outcome

Chosen option: "Validate @req IDs against story file content before auto-fix", because it fully implements REQ-MULTI-STORY-DETECT, prevents unsafe auto-fixes that would produce invalid traceability links, and provides actionable feedback during migration.

### Implementation Approach

#### Story File Requirement Extraction

Add helper function to extract requirement IDs from story markdown files:

```typescript
/**
 * Extract requirement IDs defined in a story file.
 * Supports multiple markdown formats used in story files:
 * - Heading format: - **REQ-ID**: Description
 * - Acceptance format: - [x] REQ-ID: Description
 * - Code annotation format: @req REQ-ID
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-MULTI-STORY-DETECT
 */
function extractRequirementsFromStory(
  storyPath: string,
  context: Rule.RuleContext,
): Set<string> | null {
  // Returns null if file not found or read error
  // Returns Set<string> of requirement IDs if successful
}
```

#### Mismatch Detection Logic

Modify `buildImplementsAutoFix` to validate @req IDs:

```typescript
function buildImplementsAutoFix(
  context: Rule.RuleContext,
  comment: any,
  storyPaths: Set<string>,
): Rule.ReportFixer | null {
  // ... existing checks ...

  // NEW: Extract requirements from story file
  const storyReqs = extractRequirementsFromStory(storyPath, context);

  // If story file not found/readable, cannot safely auto-fix
  if (storyReqs === null) {
    return null;
  }

  // Check for mismatched @req IDs
  const mismatchedReqs = reqIds.filter(reqId => !storyReqs.has(reqId));

  if (mismatchedReqs.length > 0) {
    // Report mismatch and skip auto-fix
    return null;
  }

  // All @req IDs are valid - proceed with auto-fix
  return applyImplementsReplacement(context, comment, { ... });
}
```

#### Error Reporting

Use existing `cannotAutoFix` message ID with descriptive reasons:

```typescript
// Story file not found
context.report({
  messageId: "cannotAutoFix",
  data: { reason: `story file '${storyPath}' not found` },
});

// Mismatched @req IDs
context.report({
  messageId: "cannotAutoFix",
  data: {
    reason: `@req '${mismatchedReqs.join(", ")}' not found in story '${storyPath}'`,
  },
});
```

#### Performance Optimization

Cache story file contents during rule execution:

```typescript
// Module-level cache (cleared between ESLint runs)
const storyFileCache = new Map<string, Set<string> | null>();

function extractRequirementsFromStory(
  storyPath: string,
  context: Rule.RuleContext,
): Set<string> | null {
  if (storyFileCache.has(storyPath)) {
    return storyFileCache.get(storyPath)!;
  }

  // Read and parse story file...
  const reqs = parseStoryFile(resolvedPath);
  storyFileCache.set(storyPath, reqs);
  return reqs;
}
```

#### Configuration Integration

Leverage shared config resolution (ADR-016) for story directory:

```typescript
import { resolveStoryPath } from "./helpers/shared-config";

function extractRequirementsFromStory(
  storyPath: string,
  context: Rule.RuleContext,
): Set<string> | null {
  const resolvedPath = resolveStoryPath(storyPath, context);
  if (!resolvedPath) {
    return null; // Story file not found
  }
  // ...
}
```

### Consequences

- Good, because fully implements REQ-MULTI-STORY-DETECT acceptance criterion
- Good, because prevents auto-fix from creating invalid traceability links
- Good, because provides actionable feedback about mismatched requirements
- Good, because reuses story file parsing patterns from existing rules
- Good, because respects shared configuration (ADR-016)
- Good, because caching mitigates performance impact of file I/O
- Neutral, because adds file system reads during migration linting (mitigated by caching)
- Neutral, because requires story files to be readable during linting (already a requirement for other rules)
- Bad, because increases complexity of migration rule implementation

### Confirmation

The implementation will be confirmed by:

1. **Specification created**: `prompts/010.3-prefer-supports-req-mismatch-detection.md` documents the behavior
2. **Tests added**: Cover valid @req IDs (auto-fix offered), mismatched @req IDs (warning, no auto-fix), story file not found (warning)
3. **Functionality assessment passes**: REQ-MULTI-STORY-DETECT#1 marked as complete
4. **Existing tests still pass**: No regression in current mismatch detection (multiple @story paths, mixed usage)
5. **Manual verification**: Migration warnings appear for mismatched @req IDs in real codebases

## Pros and Cons of the Options

### Validate @req IDs against story file content

- Good, because directly implements the requirement as written
- Good, because prevents creating invalid traceability links via auto-fix
- Good, because provides immediate feedback during migration
- Good, because leverages existing story file parsing infrastructure
- Neutral, because requires file system access (acceptable for linting)
- Neutral, because adds modest complexity (mitigated by helper functions)
- Bad, because requires story files to be present and readable

### Skip validation and rely on valid-req-reference rule

- Good, because simpler implementation (no file I/O in migration rule)
- Good, because avoids adding file system dependencies
- Bad, because doesn't fulfill REQ-MULTI-STORY-DETECT requirement
- Bad, because allows auto-fix to create invalid traceability links
- Bad, because errors appear later (in valid-req-reference) rather than during migration
- Bad, because poor developer experience (fix one rule, break another)

### Add validation as optional feature

- Good, because gives teams flexibility to opt in/out
- Good, because allows faster migration without validation
- Bad, because doesn't fulfill REQ-MULTI-STORY-DETECT requirement as written (not optional)
- Bad, because splits behavior into two modes (complex to document and test)
- Bad, because teams that skip validation will create invalid links

### Defer to separate rule

- Good, because keeps migration rule simple
- Good, because allows independent evolution of validation logic
- Bad, because doesn't fulfill REQ-MULTI-STORY-DETECT requirement (req is on migration rule)
- Bad, because splits related functionality across rules
- Bad, because requires running two rules for safe migration

## Related Decisions

- **ADR-016**: Shared config resolution for story directories (used for path resolution)
- **ADR-011**: @supports annotation naming (context for migration rule purpose)
- **Story 010.3**: Migration tooling requirements (primary requirement source)
- **Story 003**: valid-req-reference rule (established story file parsing patterns)

## References

- [Specification: 010.3-prefer-supports-req-mismatch-detection.md](../../prompts/010.3-prefer-supports-req-mismatch-detection.md)
- [Story: 010.3-DEV-MIGRATE-TO-SUPPORTS](../stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md)
- [Functionality Assessment](.voder/foundation-assessment.json) - Gap identified: "REQ-MULTI-STORY-DETECT#1 is not fully met"

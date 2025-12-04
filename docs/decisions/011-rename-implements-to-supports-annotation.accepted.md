---
status: accepted
date: 2025-12-04
decision-makers: [Tom Howard]
---

# Rename @implements to @supports Annotation to Avoid TypeScript Conflict

## Context and Problem Statement

The recently released `@implements` annotation (v1.8.0, v1.8.1) for multi-story requirement traceability conflicts with TypeScript's standard JSDoc `@implements` tag. TypeScript expects `@implements` to be attached to classes implementing interfaces, causing validation errors in JavaScript files with `// @ts-check` when the traceability annotation is used on functions. This creates a poor developer experience where users must choose between type checking and traceability validation.

The `@implements` annotation was released less than 24 hours ago and has no known adoption in the wild, making this an ideal time for a breaking change before widespread usage.

## Decision Drivers

- **TypeScript compatibility**: Must not conflict with TypeScript's built-in JSDoc validation
- **Semantic accuracy**: Annotation name should reflect that code typically contributes to/supports a requirement rather than fully implementing it
- **Minimal disruption**: Feature just released (v1.8.0/1.8.1), no known users to migrate
- **Developer experience**: Should work seamlessly with `// @ts-check` enabled files
- **Existing pattern**: Should maintain consistency with `@story` and `@req` annotation style

## Considered Options

1. Rename to `@supports` 
2. Rename to `@traces`
3. Rename to `@addresses`
4. Keep `@implements` and document workaround (remove `// @ts-check`)
5. Add `@supports` and deprecate `@implements` over multiple versions

## Decision Outcome

Chosen option: "Rename to `@supports`", because it accurately reflects the contributory relationship between code and requirements (code typically supports/contributes to requirements rather than fully implementing them), avoids the TypeScript conflict completely, and can be done immediately with minimal disruption given zero adoption.

### Consequences

- Good, because resolves TypeScript JSDoc validation conflict
- Good, because more accurately represents partial/contributory relationship to requirements
- Good, because no migration path needed (zero current users)
- Good, because works seamlessly with `// @ts-check` in JavaScript files
- Good, because timing is perfect (feature hours old, not yet adopted)
- Bad, because invalidates fresh documentation and examples from v1.8.0/1.8.1
- Bad, because requires coordinated update across stories, tests, and implementation
- Neutral, because requires version bump to 2.0.0 (breaking change)

### Confirmation

The implementation will be confirmed by:
1. All existing tests passing with `@supports` replacing `@implements`
2. Manual verification that `@supports` works in JavaScript files with `// @ts-check`
3. TypeScript validator no longer raises errors on the annotation
4. Traceability validation continues to work for multi-story requirements
5. Documentation updated consistently across all files

## Pros and Cons of the Options

### Rename to @supports

Annotation format: `@supports <story-path> <REQ-ID> [<REQ-ID> ...]`

Example:
```javascript
/**
 * Apply filters combining age and security checks.
 * @supports prompts/003.0-DEV-IDENTIFY-OUTDATED.md REQ-AGE-THRESHOLD
 * @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-AUDIT-CHECK
 */
export async function applyFilters(rows, options) {
```

- Good, because "supports" accurately reflects contributory relationship (code supports requirements, rarely implements them fully)
- Good, because no TypeScript conflict (`@supports` is not a standard JSDoc tag)
- Good, because semantically appropriate verb for traceability
- Good, because matches existing annotation style (verb form like `@story`)
- Good, because timing is perfect (no migration needed)
- Neutral, because requires global search-replace across codebase
- Neutral, because requires version 2.0.0 (breaking change, though no users affected)

### Rename to @traces

Annotation format: `@traces <story-path> <REQ-ID> [<REQ-ID> ...]`

- Good, because explicitly about traceability (matches "traceability" plugin name)
- Good, because neutral verb (doesn't imply full implementation)
- Good, because no TypeScript conflict
- Neutral, because less semantically precise than "supports" for requirement relationships
- Bad, because "traces" is more about discovery/linking than functional contribution

### Rename to @addresses

Annotation format: `@addresses <story-path> <REQ-ID> [<REQ-ID> ...]`

- Good, because implies partial handling of requirements
- Good, because no TypeScript conflict
- Neutral, because slightly less clear than "supports" for contribution relationship
- Bad, because less common verb in code annotation context

### Keep @implements and document workaround

- Good, because no code changes needed
- Good, because maintains consistency with recent release
- Bad, because forces users to remove `// @ts-check` from files using multi-story annotations
- Bad, because creates poor developer experience (type checking vs traceability validation)
- Bad, because semantically inaccurate (implies full implementation rather than contribution)
- Bad, because perpetuates TypeScript conflict indefinitely

### Add @supports and deprecate @implements

Multi-version deprecation path:
- v2.0.0: Add `@supports`, deprecate `@implements` with warnings
- v2.1.0: `@implements` warnings become errors
- v3.0.0: Remove `@implements` entirely

- Good, because provides migration path for users
- Good, because avoids immediate breaking change
- Bad, because unnecessary complexity given zero adoption
- Bad, because delays resolution of TypeScript conflict
- Bad, because maintains two parallel implementations temporarily
- Bad, because delays semantic improvement to "supports"

## More Information

**Implementation Plan:**
1. Update ADR 010 to reference this decision
2. Create/update story 010.2 to use `@supports` terminology
3. Global replace in plugin source code:
   - `@implements` → `@supports` in all string matching
   - Function names can optionally keep "implements" prefix internally
   - Update all error messages and documentation
4. Update all test cases to use `@supports`
5. Update user-facing documentation
6. Bump version to 2.0.0
7. Publish with clear release notes explaining the rename
8. Update dry-aged-deps to use `@supports` once new version published

**Related Decisions:**
- ADR 010: Multi-story requirement support (original decision to add the annotation)
- Story 010.2: Multi-story requirements implementation

**TypeScript Conflict Details:**
TypeScript's `@implements` tag is defined in their JSDoc reference for documenting that a class implements an interface. Using it on functions or with non-interface values triggers validation errors when `// @ts-check` is enabled, making it incompatible with our use case.

**Timing Justification:**
Version 1.8.0 was released approximately 24 hours ago (2025-12-03), with 1.8.1 following shortly after. GitHub shows no issues or PRs related to `@implements` usage, and npm download statistics show minimal downloads. This makes it an ideal window for a breaking rename before any significant adoption occurs.

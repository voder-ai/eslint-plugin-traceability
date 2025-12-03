---
status: "proposed"
date: 2025-12-03
decision-makers: [Development Team]
consulted: [dry-aged-deps codebase patterns, JSDoc conventions]
informed: [Plugin Users, Project Contributors]
---

# Introduce @implements Annotation for Multi-Story Requirements

## Context and Problem Statement

The current traceability annotation system uses `@story` to reference a story file and `@req` to reference requirement IDs within that story. This works well for functions that implement a single story, but breaks down for integration functions that combine functionality from multiple stories. For example, `apply-filters.js` calls both `filterByAge()` (from story 003) and `filterBySecurity()` (from story 004), needing to reference requirements from both stories.

The current `valid-req-reference` rule only validates `@req` annotations against the **first** `@story` annotation, causing false-positive linting errors when a function legitimately implements requirements from multiple stories. This blocks code quality validation and forces developers to either suppress linting or remove valid traceability annotations.

## Decision Drivers

- Integration functions naturally combine functionality from multiple stories
- Current single-story validation prevents legitimate multi-story traceability
- Need backwards compatibility with existing `@story` + `@req` annotations
- Requirement IDs should be unique only within their story file (scoping)
- Clear, explicit mapping between requirements and their source stories
- Minimal disruption to existing codebases
- Natural semantics that match developer mental models

## Considered Options

1. Multiple `@story` support - Allow multiple `@story` tags, validate `@req` against any
2. Transitive references - Only reference primary story, infer requirements from called functions
3. Integration story pattern - Create integration story files that duplicate requirements
4. Flatten requirements - Remove `@req` validation entirely
5. Namespaced requirements - Use aliases like `@story ... as alias` / `@req alias:REQ-ID`
6. Inline story reference - `@req REQ-ID from path/to/story.md`
7. New `@implements` annotation - `@implements story-path REQ-ID1 REQ-ID2 ...`

## Decision Outcome

Chosen option: "New `@implements` annotation", because it provides clear, explicit mapping between requirements and stories, enables requirement ID scoping, maintains full backwards compatibility with existing annotations, and uses semantically meaningful terminology.

### Consequences

- Good, because `@implements` clearly expresses "this code implements these requirements from this story"
- Good, because requirement IDs only need to be unique within their story file (scoping)
- Good, because all requirements from one story can be listed on a single line
- Good, because completely backwards compatible - existing `@story` + `@req` code continues working
- Good, because no ambiguity in multi-story scenarios
- Good, because reduced annotation overhead compared to separate `@story` tags
- Good, because story paths appear once per story (grouped requirements)
- Neutral, because introduces a new annotation tag (but semantically clear)
- Neutral, because both annotation styles can coexist during migration
- Bad, because requires plugin enhancement to support new annotation
- Bad, because requires documentation updates and user communication

### Confirmation

Implementation compliance will be confirmed through:

- Plugin parses `@implements story-path REQ-ID1 REQ-ID2 ...` format correctly
- Each requirement ID is validated against its specified story file
- Existing `@story` + `@req` annotations continue to work unchanged
- Mixed usage (both styles in same codebase) works correctly
- Error messages clearly indicate which story was checked for each requirement
- Tests cover single-story, multi-story, and mixed annotation patterns
- Documentation includes migration guide and examples

## Pros and Cons of the Options

### New `@implements` annotation

Introduces a new annotation tag that combines story reference with requirement IDs.

- Good, because semantically clear ("implements requirements from story")
- Good, because explicit story-to-requirement mapping (no inference needed)
- Good, because requirements grouped by story (readable, organized)
- Good, because enables requirement ID scoping to story files
- Good, because backwards compatible (existing code unchanged)
- Good, because story paths not duplicated per requirement
- Good, because natural for both single-story and multi-story cases
- Neutral, because new annotation to learn (but intuitive naming)
- Bad, because requires plugin changes to support new tag
- Bad, because migration effort for existing codebases (though optional)

**Example usage:**

```javascript
/**
 * Apply age and security filters to rows.
 * @implements prompts/003.0-DEV-IDENTIFY-OUTDATED.md REQ-AGE-THRESHOLD REQ-OUTPUT
 * @implements prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-AUDIT-CHECK REQ-SAFE-ONLY
 */
export async function applyFilters(rows, options) {
```

**Legacy format (still supported):**

```javascript
/**
 * @story docs/stories/003.0-DEV-EXAMPLE.story.md
 * @req REQ-FUNCTION-VALIDATION
 */
export function legacyFunction() {
```

### Multiple `@story` support

Allow multiple `@story` annotations, validate `@req` against any referenced story.

- Good, because extends current annotation model incrementally
- Good, because explicit story listing provides context
- Neutral, because maintains separation of stories and requirements
- Bad, because unclear which `@req` maps to which `@story`
- Bad, because doesn't enable requirement ID scoping
- Bad, because story paths repeated if requirements intermixed

### Namespaced requirements

Use story aliases like `@story path as alias` / `@req alias:REQ-ID`.

- Good, because clear story-to-requirement mapping via namespace
- Good, because story paths appear once
- Neutral, because requires learning namespace syntax
- Bad, because alias management adds cognitive overhead
- Bad, because unconventional for JSDoc

### Inline story reference

Format: `@req REQ-ID from path/to/story.md`

- Good, because very explicit per-requirement
- Good, because no aliasing needed
- Bad, because verbose (story path repeated per requirement)
- Bad, because harder to refactor story paths
- Bad, because doesn't enable requirement ID scoping

### Transitive references

Infer requirements from called functions automatically.

- Good, because minimal annotation overhead
- Bad, because requires complex static analysis
- Bad, because fragile (refactoring breaks validation)
- Bad, because implicit (not backwards compatible)

### Integration story pattern

Create integration story files that duplicate requirements.

- Good, because single `@story` still works
- Bad, because duplicates requirements across stories
- Bad, because high maintenance overhead
- Bad, because doesn't scale

## More Information

This decision addresses the limitation discovered when fixing systematic linting suppression in dry-aged-deps, where 80% of files had `eslint-disable traceability/*` due to multi-story integration functions.

The `@implements` annotation name was chosen because:

- It's semantically accurate - code implements requirements
- It's familiar from interface implementation in many languages
- It clearly conveys purpose without abbreviation
- It differentiates from `@story` (context) vs implementation scope

**Migration strategy:**

1. Plugin supports both `@story`+`@req` and `@implements` simultaneously
2. Existing code continues working without changes
3. New code can use either format based on preference
4. Multi-story code should migrate to `@implements` to fix validation
5. Single-story code can optionally migrate for consistency

**Validation behavior:**

- `@implements story-path REQ-1 REQ-2`: Validate REQ-1 and REQ-2 exist in story-path
- `@story path` + `@req REQ-1`: Validate REQ-1 exists in path (legacy)
- Mixed: Both formats can coexist, validated independently

This decision should be implemented in eslint-plugin-traceability story 011.0-DEV-MULTI-STORY-SUPPORT or similar.

Related resources:

- eslint-plugin-traceability story 010.0-DEV-DEEP-VALIDATION (requirement validation)
- eslint-plugin-traceability story 003.0-DEV-FUNCTION-ANNOTATIONS (current @req validation)

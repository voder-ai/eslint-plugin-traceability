# Branch Annotations Inside Anonymous Arrow Functions

## Status

Accepted

## Context

Anonymous arrow functions are excluded from function-level traceability requirements, but branches inside them still represent control-flow decisions. The `require-branch-annotation` rule already inspects branch nodes independent of function annotations, yet this behavior needs to be explicitly documented and tested to avoid regressions.

The functionality assessment identified a coverage gap: there were no tests proving that branch annotation requirements still apply inside anonymous arrow functions.

## Decision

Branch nodes inside anonymous arrow functions are treated the same as top-level branches for annotation requirements. Missing `@story`/`@req` (or `@supports`) inside anonymous arrow bodies must be reported, and properly annotated branches must be accepted.

This decision does **not** change the existing policy that anonymous arrow functions themselves are excluded from function-level annotation requirements.

## Consequences

### Positive

- Prevents control-flow inside anonymous callbacks from silently bypassing branch traceability.
- Locks down existing behavior with targeted tests to prevent regressions.
- Keeps function-level annotation exclusions intact while preserving branch-level traceability.

### Negative

- Adds additional test cases to maintain as branch rules evolve.

## Alternatives Considered

### 1. Exempt branches inside anonymous arrows

**Rejected** because it would create blind spots in traceability for significant control flow inside callbacks.

### 2. Require function-level annotations for anonymous arrows instead

**Rejected** because it conflicts with the established default exclusion for anonymous arrow functions (REQ-FUNCTION-DETECTION#1).

## References

- Specification: `prompts/004.1-branch-annotation-anonymous-arrows.md`
- Story: `docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md`
- Rule: `src/rules/require-branch-annotation.ts`
- Tests: `tests/rules/require-branch-annotation.test.ts`

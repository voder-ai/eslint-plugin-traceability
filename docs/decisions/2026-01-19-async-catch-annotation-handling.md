# Async Catch-Clause Annotation Handling

## Status

Accepted

## Context

Async/await usage is common in modern codebases, and `try`/`catch` blocks inside async functions represent the same branching behavior as synchronous catch clauses. The `require-branch-annotation` rule already evaluates catch clauses independent of async context, but the functionality assessment identified a gap: there were no tests proving async catch clauses are handled identically to non-async ones.

## Decision

Catch clauses inside async functions are treated the same as regular catch clauses for branch annotation requirements. Missing `@story`/`@req` (or `@supports`) annotations on async catch clauses must be reported, and properly annotated async catch clauses must be accepted. Auto-fix placement behavior remains identical to non-async catch clauses.

## Consequences

### Positive

- Prevents async error handling from bypassing traceability enforcement.
- Confirms parity between async and non-async catch clause handling.
- Locks down existing behavior with targeted tests to prevent regressions.

### Negative

- Adds additional test cases to maintain as branch rules evolve.

## Alternatives Considered

### 1. Exempt async catch clauses

**Rejected** because it would create a blind spot for async error handling paths, reducing traceability coverage.

### 2. Require function-level annotations for async functions instead

**Rejected** because the requirement is specific to catch-branch handling and does not change the existing function-level annotation policy.

## References

- Specification: `prompts/004.2-async-catch-annotation-handling.md`
- Story: `docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md`
- Rule: `src/rules/require-branch-annotation.ts`
- Tests: `tests/rules/require-branch-annotation.test.ts`

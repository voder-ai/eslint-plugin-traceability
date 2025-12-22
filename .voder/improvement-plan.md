# Improvement Plan

Focus area: documentation
Priority: Foundation gate failed (80% threshold). Documentation at 45% is furthest below threshold (35 points below). Version-control at 85% is only 5 points below. Documentation has critical issues blocking traceability workflows: 18+ functions missing @supports/@story annotations, 10 malformed @supports annotations, 22 plain text doc references instead of Markdown links, and 13+ public APIs without JSDoc.

## NOW

- Add @supports or @story annotation to the exported getInsideCatchCommentText function in src/utils/branch-annotation-catch-insert-position.ts. Add JSDoc describing parameters, return value, and purpose.
  - Category: non-functional
  - Reason: One of 18+ functions lacking traceability annotations. This blocks verification workflows and prevents automated requirements coverage analysis. Starting with one function establishes pattern for remaining functions.
  - Success criteria: Function has valid @supports or @story annotation with story path reference. Function has complete JSDoc with @param, @returns, and description. npm run lint passes. npm run test passes.
  - Dimension: documentation

## NEXT

- Add @supports or @story annotation to gatherSwitchCaseCommentText function. Add JSDoc.
- Add @supports or @story annotation to checkReqAnnotation function. Add JSDoc.
- Fix one of the 10 malformed @supports annotations that use REQ-INSIDE-BRACE-PLACEMENT format without story path reference. Add proper story path.
- Convert one of 22 plain text documentation references (user-docs/*.md) to proper Markdown link format in user-facing documentation.

## LATER

- Complete traceability annotations for all 18+ remaining functions
- Fix all 10 malformed @supports annotations with proper story paths
- Convert all 22 plain text doc references to Markdown links
- Add JSDoc to all 13+ public APIs missing documentation
- Remove project docs links from user-facing README (docs/ directory references)
- Address code duplication in 5 test files (22-42% duplication rates)
- Improve branch coverage from 86.57% to 90% target
- Push 5 unpushed commits to origin/main to restore trunk-based development hygiene
- Replace generic test values ('foo', 'bar') with meaningful test data

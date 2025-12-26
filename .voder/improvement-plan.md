# Improvement Plan

Focus area: Documentation link integrity and code traceability
Priority: Documentation dimension is at 45% (35 points below 80% threshold), furthest from foundation. Two CRITICAL broken links in README.md reference docs/ files not published with npm package, breaking user experience. One file lacks proper traceability annotations.

## NOW

- Replace README.md line 132 markdown link to docs/rules/require-branch-annotation.md with a reference to user-docs/ content or GitHub repository link, since docs/ directory is excluded from published package
  - Category: non-functional
  - Reason: CRITICAL: Link breaks for npm package users because docs/ directory not included in package.json files field
  - Success criteria: README.md line 132 contains valid link accessible to npm package users (either user-docs/ file or GitHub URL), npm pack test confirms link works for installed package users
  - Dimension: documentation

## NEXT

- Replace README.md line 283 markdown link to docs/verification-workflow-guide.md with reference to user-docs/ content or GitHub repository link, since docs/ directory is excluded from published package
- Add proper JSDoc @story or @supports annotations to src/rules/require-traceability.ts file header to match traceability standards of other 55 source files

## LATER

- Monitor for additional docs/ references in user-facing documentation that may break for package users
- Consider consolidating developer documentation (docs/) vs user documentation (user-docs/) structure for clarity
- Evaluate whether docs/rules/ content should be moved to user-docs/ or remain development-only

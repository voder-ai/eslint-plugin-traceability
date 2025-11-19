## NOW
Extract the path normalization and file‐existence logic from the `validateStoryPath` function in `src/rules/valid-story-reference.ts` into a new helper `normalizeStoryPath` in `src/utils/storyReferenceUtils.ts`.

## NEXT
- Remove the `// eslint-disable-next-line max-lines-per-function` in `valid-story-reference.ts` and continue splitting `validateStoryPath` by extracting its comment-parsing logic into separate helpers so it falls below 60 lines.  
- Update the CI/CD workflow (`.github/workflows/ci-cd.yml`) to run `npm audit` without the `--production` flag, ensuring dev-dependencies are scanned.  
- Run `npm run lint`, `npm run format:check`, and `npm test` to confirm Code Quality and Security checks now pass.

## LATER
- Add unit tests for `normalizeStoryPath` (and other extracted helpers) to preserve 100% function coverage.  
- Introduce a CI check for security-incident file naming conventions.  
- Audit other large rule files and apply the same extract-helper refactoring to enforce the max-lines-per-function rule project-wide.
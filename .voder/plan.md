## NOW
Modify the Husky pre-push hook (`.husky/pre-push`) to run `npm run build` as the first step, ensuring local build verification before tests and lint.

## NEXT
- Add explicit `coverageThreshold` settings (≥90% for branches, statements, functions, and lines) in `jest.config.js`.  
- Write edge‐case and invalid‐input tests for maintenance utilities (e.g., `detectStaleAnnotations`) to boost branch coverage.  
- Update the CI/CD workflow (`.github/workflows/ci-cd.yml`) so the “Run tests” step uses `npm run test -- --coverage` and fails on unmet thresholds.

## LATER
- Create a reusable test-data-builder module to DRY up fixtures across unit and integration tests.  
- Add performance and resource‐usage benchmarks to the test suite to track regressions.  
- Integrate a `dry-aged-deps` check into the CI quality gates to report on dev-dependency health.
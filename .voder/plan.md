## NOW
Update all integration-test `describe` blocks to include their corresponding `@story` identifier in the title.

## NEXT
- Add `[REQ-…]` tags to each `it(...)` name in integration tests to map tests to specific requirements.  
- Run `npm test -- --coverage` locally to verify that the 90% coverage thresholds and traceability rules pass.  
- Ensure the CI/CD quality-gate step invokes Jest with coverage threshold enforcement.

## LATER
- Introduce a reusable test-data-builder utility to DRY up fixtures across unit and integration tests.  
- Add performance or resource-usage benchmarks to the test suite to detect regressions.  
- Integrate `npx dry-aged-deps` into the CI pipeline’s quality gates to report on dev-dependency health alongside coverage.
## NOW  
Standardize all test file headers under `tests/` to use JSDoc block comments with proper `@story` and `@req` annotations, replacing any inline comments for traceability.

## NEXT  
- Refactor test bodies to adopt explicit GIVEN-WHEN-THEN (Arrange-Act-Assert) structure and eliminate any custom logic (e.g. sorting/flatMap) in expectations.  
- Add a post-deployment smoke-test job to `.github/workflows/ci-cd.yml` that installs the freshly published package in a clean workspace and executes the `cli-integration.js` script.  
- Incorporate `cli-integration.js` into the CI “quality-checks” job so the pipeline mirrors the Husky pre-push behavior.

## LATER  
- Write additional edge-case unit tests to cover any uncovered branches in the maintenance utilities.  
- Monitor and optimize test execution times to keep unit tests fast (<100 ms each).  
- Once testing and version-control improvements push both support areas above 90%, perform a full functionality reassessment.
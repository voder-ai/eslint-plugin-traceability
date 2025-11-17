## NOW
Modify the ESLint configuration (`eslint.config.js`) to lower the `max-lines-per-function` rule threshold from 90 to 80.

## NEXT
- Reduce the ESLint `max-lines` per-file threshold from 400 to 350 and refactor any files that exceed the new limit.  
- Migrate the standalone `cli-integration.js` tests into the Jest test suite to eliminate the custom runner.  
- Rename `tests/basic.test.ts` and `tests/index.test.ts` to descriptive filenames that reflect the feature or module under test.

## LATER
- Continue ratcheting ESLint thresholds downward (e.g. in 5–10 line increments) until reaching defaults, refactoring as needed.  
- Monitor and optimize unit‐test execution times to keep each test fast (< 100 ms).  
- Add new edge‐case unit tests to cover any remaining untested branches in maintenance utilities.  
- Once code quality and testing support both exceed 90%, perform a full functionality reassessment.
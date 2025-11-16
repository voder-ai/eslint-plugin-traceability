## NOW
Run ESLint with JSON output to identify all violations of the size rules in one go:  
```bash
npm run lint -- --format=json > eslint-violations.json
```  
(Examining `eslint-violations.json` for `max-lines-per-function` and `max-lines-per-file` errors will pinpoint the exact functions and files needing refactoring.)

## NEXT
- Refactor each file/function flagged in the report:
  - Extract large functions into focused helpers under `src/utils/` so no function exceeds the current 100-line limit.  
  - Break up any file over 500 lines into smaller modules (e.g. split rule implementations into per‐rule files).  
- Once existing violations are cleared, tighten the thresholds in `eslint.config.js` to:
  - `max-lines-per-function: [“error”, { max: 90 }]`  
  - `max-lines-per-file: [“error”, { max: 400 }]`  
  - Re-run lint and fix any new violations.  
- Revise all tests that rely on fixed fixture directories:
  - In each file-I/O test under `tests/`, replace hard-coded `tests/fixtures` paths with a temp directory created via `fs.mkdtempSync()` (or `os.tmpdir()`), copy in the needed fixtures, and clean up after the test.

## LATER
- Continue the ESLint ratcheting plan by moving thresholds down in 10-line increments until functions average ~50 lines and files ~300 lines.  
- Add a CI job that fails on any new size-rule violation and publishes a short report for maintainers.  
- Document the ratcheting goals and timeline in an ADR so future contributors can track progress.  
- Expand test utilities to automate temp-dir fixture setup/teardown and validate file-system side-effects in isolation.
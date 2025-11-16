## NOW
Remove the `.voder/` entry from `.gitignore`.

## NEXT
- Git-add and commit the existing `.voder/` directory (and its contents) so that Voder’s internal state files are tracked.
- Update the ESLint configuration to lower `max-lines-per-function` to 100 and `max-lines` to 500 according to the ratcheting plan.
- Run `npm run lint` to identify any functions or files exceeding the new size limits and begin refactoring them into compliance.

## LATER
- Add a CI “smoke-test” job that, after a successful release, installs the published package (via `npm pack` → `npm install`) and runs a basic `eslint --version` or lint check against a sample file.
- Develop performance benchmarks for file-validation and caching logic under heavy load.
- Improve test branch coverage to at least 90% by adding tests for deep‐validation edge cases and complex nested branches.
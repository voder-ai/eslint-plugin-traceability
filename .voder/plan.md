## NOW
Add a dependency override for the vulnerable `tar` package in `package.json` to pin it to version ≥ 6.1.11.

## NEXT
- Run `npm install` to regenerate `package-lock.json` and commit the updated lockfile.  
- Update tests that create temporary directories (e.g. in `detectStaleAnnotations`) to clean up their temp folders using `afterAll` or `finally` blocks.  
- Adjust ESLint maintainability rules: lower `max-lines-per-function` to 70 and `max-lines-per-file` to 300; refactor any files/functions that exceed those limits.  
- Correct user-facing documentation: add missing CHANGELOG entries for v1.0.4 and v1.0.5 (or align the `package.json` version), and move the ESLint v9 setup guide from `docs/` into `user-docs/`, updating README links accordingly.

## LATER
- Document and publish an incremental plan for ratcheting up complexity and size rules in `docs/decisions/`.  
- Integrate a CI job that fails on any moderate-severity audit findings and schedules periodic dependency-health checks.  
- After foundation improvements are complete, proceed with the functionality assessment and begin new feature work.
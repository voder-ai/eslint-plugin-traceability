## NOW  
Delete the stray `temp_foo.js` file from the project root.

## NEXT  
- Remove any leftover `tests/maintenance/tmp-nested-*` directories that are not referenced by fixtures or tests.  
- Add a `.gitignore` entry (e.g. `tmp-*.js`) to prevent committing future temp files.  
- Update `eslint.config.js` to enable the `max-lines-per-function` and `max-lines-per-file` rules.  
- Ensure the CI “quality-checks” job explicitly runs the `jscpd` duplication check and fails on any detected duplicates.

## LATER  
- Create an `npm run clean` script to purge temp artifacts and stale files.  
- Configure a pre-commit hook to reject new temp files (e.g. via `lint-staged`).  
- Tighten complexity and file-length thresholds as the codebase grows.  
- Audit the repo for any other orphaned files or directories and remove them.
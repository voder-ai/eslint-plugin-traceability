## NOW  
Create an isolated unit test for `updateAnnotationReferences` in `tests/maintenance/update-isolated.test.ts` that uses `fs.mkdtempSync` to spin up a temporary directory, writes a file with a stale `// @story old.path.md` annotation, invokes `updateAnnotationReferences(tempDir, "old.path.md", "new.path.md")`, and asserts both the returned fix count and the file’s updated contents.

## NEXT  
- Add isolated unit tests for `detectStaleAnnotations` in `tests/maintenance/detect-isolated.test.ts`, using `fs.mkdtempSync` to cover nested directories, missing directories, and permission‐denied scenarios.  
- Expand `cli-integration.js` test scenarios to include `traceability/require-req-annotation`, `traceability/require-branch-annotation`, `traceability/valid-annotation-format`, and `traceability/valid-story-reference`.  
- Introduce a simple in-memory cache in `src/rules/valid-story-reference.ts` and `src/rules/valid-req-reference.ts` (e.g. a `Map` keyed by resolved file path) to avoid repeated `fs` reads and markdown parses, improving lint execution performance.  
- Update `.github/workflows/ci.yml` to add a new `release` job triggered on Git tags that runs `npm publish` and verifies the published package, strengthening version-control automation.

## LATER  
- Implement automated semantic-version bumps and changelog generation (e.g., via `semantic-release`).  
- Build a CLI entrypoint (`bin/traceability-maintenance.js`) and add corresponding npm scripts for batch maintenance operations.  
- Author `docs/maintenance-tools.md` and add a “Maintenance Tools” section to `README.md`.  
- Explore advanced caching strategies (e.g., persistent on-disk cache) and parallel file traversal to further optimize linting and maintenance-tool performance on large codebases.
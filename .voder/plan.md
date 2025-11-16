## NOW  
Create a new Jest RuleTester suite at `tests/rules/valid-story-reference.test.ts` that covers the core file‐validation rule (006.0-DEV-FILE-VALIDATION): valid paths, missing files, wrong extensions, path traversal, and custom story directories.

## NEXT  
- Add a corresponding test suite for deep requirement‐content validation at `tests/rules/valid-req-reference.test.ts` (010.0-DEV-DEEP-VALIDATION), covering existing and missing `@req` IDs in real `.story.md` files.  
- Enhance the `valid-story-reference` and `valid-req-reference` rule implementations in `src/rules/` to memoize file reads and directory lookups—cache by file path with modification timestamps to avoid repeated fs calls.  
- Add an end-to-end integration test in `tests/integration/file-validation.test.ts` that spawns ESLint CLI against sample code using the file‐validation rule and asserts exit codes and error messages.

## LATER  
- Add a new GitHub Actions workflow (`.github/workflows/release.yml`) to publish the plugin to npm on semantically versioned git tags, using `actions/setup-node` and `npm publish`.  
- Document the automated release process in a `RELEASE.md`, include publish scripts in `package.json`, and configure semantic-release or version-bump tooling for continuous delivery.
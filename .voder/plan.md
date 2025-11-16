## NOW
Modify `src/index.ts` to export a default plugin object that includes the `rules` and `configs` so that, once built, `lib/index.js` correctly registers all implemented rules.

## NEXT
- Add an end-to-end integration test that runs the built plugin via the ESLint CLI on a small sample fixture and asserts that `traceability/require-story-annotation` violations are reported.
- In `README.md`, add a “Plugin Validation” section showing how to invoke ESLint with the traceability plugin and interpret its output; correct the homepage link and add a `CONTRIBUTING.md` with contribution guidelines.
- Update `.github/workflows/ci.yml` to include:
  - A step that lints a fixtures directory using the built plugin.
  - An `npm publish --dry-run` step on version‐tag pushes to validate automated publishing workflows.

## LATER
- Configure semantic-release or a GitHub Action to automate version bumps and npm publishing on merges to `main` or tag pushes.
- Build performance benchmarks to measure lint-time overhead of the plugin on large codebases.
- Implement and ship rules for annotation format (005), file reference (006), error reporting (007), auto-fix (008), maintenance tools (009), and deep validation (010) with accompanying documentation and tests.
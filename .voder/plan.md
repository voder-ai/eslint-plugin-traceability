## NOW

- [ ] Use read_file on `user-docs/api-reference.md` to inspect the current rule documentation, focusing on the "Options" sections for each rule so we can identify and correct any mismatches with the implemented rule options.

## NEXT

- [ ] Use read_file on `docs/rules/require-story-annotation.md`, `docs/rules/require-branch-annotation.md`, and `docs/rules/valid-story-reference.md` plus the corresponding TypeScript rule implementations in `src/rules` to confirm the exact option names, types, and defaults for each rule.
- [ ] Use modify_file on `user-docs/api-reference.md` to update the "Options" subsections so they accurately describe the available options for `traceability/require-story-annotation`, `traceability/require-branch-annotation`, and `traceability/valid-story-reference`, and explicitly state "Options: None" only for rules that truly have no options.
- [ ] Use read_file on `docs/config-presets.md` and `src/index.ts` to compare the documented severities for each preset (especially `traceability/valid-annotation-format`) with the actual `configs.recommended` and `configs.strict` objects.
- [ ] Use modify_file on `docs/config-presets.md` to align the documented preset severities and rule lists with the current implementation in `src/index.ts`, ensuring that `valid-annotation-format` is documented with the same severity (e.g., `warn`) as in the code.
- [ ] Use read_file on `src/rules/valid-req-reference.ts` and `src/rules/require-branch-annotation.ts` to locate any traceability annotations that deviate from the required `@story docs/stories/...` / `@req REQ-...` pattern or missing annotations on named inner functions and significant branches.
- [ ] Use modify_file on the identified TypeScript files (starting with `src/rules/valid-req-reference.ts` and `src/rules/require-branch-annotation.ts`) to normalize `@story`/`@req` comment format and add missing annotations for named inner functions and important conditional branches, keeping comments concise and machine-parseable.
- [ ] Use modify_file on `README.md` to add or update a short "Configuration options" note that points readers to the rule docs in `docs/rules/` and `user-docs/api-reference.md` for detailed per-rule options, improving discoverability of the configuration surface.

## LATER

- [ ] Do a follow-up sweep with search_file_content (e.g., for `"Options: None"` and `@story`/`@req` tags) to catch any remaining documentation or traceability-format inconsistencies and fix them incrementally.
- [ ] Re-run the implementation assessment’s DOCUMENTATION checks (via existing automation) to confirm the documentation score has risen above 90% and that FUNCTIONALITY assessment can proceed.
- [ ] Once FUNCTIONALITY is unblocked, review any uncovered feature gaps or failing requirements from the stories and plan focused code, test, and doc updates in small, safe steps.

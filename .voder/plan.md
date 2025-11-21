## NOW

- [ ] read_file docs/stories/008.0-DEV-AUTO-FIX.story.md

## NEXT

- [ ] read_file src/rules/require-story-annotation.ts
- [ ] read_file src/rules/helpers/require-story-core.ts
- [ ] read_file src/rules/valid-annotation-format.ts
- [ ] read_file tests/rules/require-story-annotation.test.ts
- [ ] generate_file tests/rules/auto-fix-behavior-008.test.ts
- [ ] modify_file src/rules/require-story-annotation.ts
- [ ] modify_file src/rules/valid-annotation-format.ts
- [ ] modify_file docs/stories/008.0-DEV-AUTO-FIX.story.md
- [ ] modify_file user-docs/api-reference.md

## LATER

- [ ] Refine auto-fix template configurability across all relevant rules (functions, branches, req annotations) using story 008.0’s option model.
- [ ] Add configuration and docs for selectively enabling/disabling auto-fix categories per rule and preset, ensuring backward-compatible defaults.
- [ ] Broaden test coverage for edge-case auto-fixes (complex JSDoc blocks, mixed annotations, partially-correct formats) tied to 008.0 story requirements.
- [ ] Refine and factor shared auto-fix utilities (e.g., a central template resolver) once behavior is stable, ensuring no regression in earlier stories.

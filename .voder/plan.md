## NOW

- [ ] Update the configuration schema and tests for the valid-annotation-format rule so that its documented auto-fix toggle option is actually usable and correctly disables suffix-normalization fixes while still reporting invalid annotations, fully satisfying the selective auto-fix requirement from the auto-fix story.

## NEXT

- [ ] Review and, if necessary, adjust the user-facing documentation for the valid-annotation-format rule so that its description of the auto-fix option, default behavior, and limitations exactly matches the implemented behavior.
- [ ] Perform a focused pass over the require-story helper and core modules to identify and refactor small duplicated logic blocks into shared helpers without changing observable behavior, further reducing duplication.
- [ ] Audit defensive error-handling paths in the require-story core helpers (such as empty catch blocks) and either document the rationale clearly or introduce minimal, non-intrusive hooks that make future debugging easier while preserving current user-facing behavior.

## LATER

- [ ] Re-run a targeted review of the auto-fix story’s requirements against the implementation and tests to confirm all aspects, including edge cases, are now fully covered by behavior and tests.
- [ ] Once duplication and defensive handling refinements are complete, consider cautiously tightening any duplication or complexity thresholds in the quality tools to align configuration with the improved codebase.
- [ ] Look for any other rules or maintenance tools that expose configuration options in documentation but not in their schemas, and align those schemas and tests so similar gaps cannot recur.

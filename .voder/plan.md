## NOW

- [ ] Update the lint configuration so that the first traceability rule specified in the dogfooding validation story’s “First Action” section is enabled for this repository’s own source code in an incremental, minimally disruptive way.

## NEXT

- [ ] Identify and analyze all new lint violations reported by the newly enabled traceability rule, then add narrowly scoped suppression annotations or small code adjustments so that the rule passes without changing behavior.
- [ ] Expand the lint configuration to apply the enabled traceability rule consistently across additional code areas such as tests or maintenance scripts, again handling any new violations via targeted suppressions or minor refactors.
- [ ] Update internal documentation or decision records to capture that the project now dogfoods this traceability rule on itself, including the current scope, known suppressions, and rationale for any exemptions.
- [ ] Plan and begin enabling the next highest‑value traceability rule from the dogfooding story, following the same incremental pattern of narrow enablement, suppression where needed, and documentation of coverage.

## LATER

- [ ] Gradually enable the remaining traceability rules on this repository’s codebase, ensuring each rule is introduced in a separate, incremental step with passing lint and tests at every stage.
- [ ] Systematically replace temporary suppressions with proper code or annotation improvements so that the code naturally satisfies the traceability rules without needing overrides.
- [ ] Extend user and maintainer documentation to describe how the plugin is being dogfooded on this project, including examples of how rule violations are handled in practice and any lessons learned.
- [ ] Revisit earlier documentation about the unified require-traceability rule and its legacy aliases, refining user-facing guidance once dogfooding outcomes confirm that the current recommendations and defaults work well in real usage.

## NOW

- [ ] Review all existing maintenance and debug scripts in the scripts directory and decide, for each one, whether it should be kept and exposed via a clearly named package script or considered obsolete and removed, so that there are no orphaned scripts outside the centralized npm script contract.

## NEXT

- [ ] Update the project’s main package configuration to add human-friendly npm script entries for each retained maintenance or debug script, giving them clear names and descriptions that reflect how contributors should use them.
- [ ] Remove any scripts that were deemed obsolete or one-off from the scripts directory, and adjust any internal references or documentation so there are no dangling mentions of those tools.
- [ ] Introduce a dedicated package script that runs the existing script non-emptiness validator, and ensure this new script is referenced from the documented quality or maintenance workflows so developers can easily discover and run it.
- [ ] Revisit the internal development documentation to briefly describe the available maintenance and debug commands, including the new script validator, and how they relate to the centralized scripts contract.
- [ ] After these adjustments, re-evaluate the code quality area against the assessment criteria to confirm that the script centralization concerns are resolved and CODE_QUALITY now meets or exceeds the required threshold.

## LATER

- [ ] Consider incrementally tightening one or two linting thresholds (such as maximum cyclomatic complexity) in line with the existing ratcheting ADR, validating that the current codebase already passes before adopting stricter limits.
- [ ] Look for any remaining low-impact duplicated patterns in tests or helper code that could be cleanly extracted into shared utilities without harming readability, and refactor them opportunistically.
- [ ] Once CODE_QUALITY comfortably clears its threshold and supporting documentation is in sync, trigger or request a fresh functionality assessment so the project can be evaluated for complete feature coverage against its stories.

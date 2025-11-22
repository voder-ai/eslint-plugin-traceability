## NOW

- [ ] Review the annotation-checking utility module and add missing @story and @req annotations to every named helper function and any obvious significant branches so that this core file fully complies with the traceability format requirements.

## NEXT

- [ ] Scan other core helper and utility modules for any remaining named functions that lack @story and @req annotations, and add concise, accurate traceability comments referencing the appropriate stories and requirements.
- [ ] Review conditional branches, loops, and try/catch blocks across the main rule helper and utility files to identify significant logic paths that still lack branch-level @story and @req comments, and add those annotations where needed.
- [ ] Enhance the JSDoc on key exported helper functions by adding clear @param and @returns descriptions where they are currently missing, focusing on utilities that are part of the public or semi-public API surface so their behavior is fully documented.

## LATER

- [ ] Once traceability annotations and JSDoc improvements are in place, reassess overall documentation quality against the project’s stories and traceability rules to confirm it reaches the threshold needed to support a reliable functionality assessment.
- [ ] If that reassessment reveals any residual documentation inconsistencies or redundancies (for example, overlapping explanations of particular rules or presets), plan and implement a small follow-up cleanup pass to simplify and align user-facing and internal docs without changing behavior.

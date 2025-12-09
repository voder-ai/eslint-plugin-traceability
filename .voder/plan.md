## NOW

- [ ] Reassess the current structure of the no-redundant-annotation rule after the recent helper extractions and identify the single next, smallest behavior-preserving refactor that would most clearly simplify its remaining core analysis logic.

## NEXT

- [ ] Apply the selected small refactor to the no-redundant-annotation rule, further separating responsibilities into well-named helpers with clear JSDoc traceability while keeping the rule’s external behavior and options unchanged.
- [ ] Review the existing no-redundant-annotation tests to ensure they still fully exercise the refactored paths and, if any newly isolated edge-case branch is underrepresented, add a focused test that documents and validates that behavior.
- [ ] Once the no-redundant-annotation rule’s main flow is straightforward to read end-to-end, inspect the next most complex helper or rule module (such as annotation-scope-analyzer or branch-annotation helpers) and choose a similarly small, targeted refactor to reduce nested branching or duplicated logic there.

## LATER

- [ ] Iterate through remaining complex rule and helper modules, repeating the pattern of tiny, behavior-preserving extractions and focused tests so that all high-impact code paths are simple, well-documented, and thoroughly covered.
- [ ] After complexity has been reduced across the worst offenders, revisit internal code-quality guidelines to consider tightening acceptable complexity thresholds or adding lightweight internal checks that will keep new contributions aligned with the simplified structure.
- [ ] Document, in an internal decision record, which low-level defensive branches and generic fallback paths are intentionally left as untested guards so future maintainers understand why certain coverage gaps are acceptable and how they relate to overall code quality.

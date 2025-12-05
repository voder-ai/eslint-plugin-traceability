## NOW

- [ ] Review the auto-fix story specification and the current auto-fix implementations in the relevant rules to precisely define the new configuration options needed for customizable templates and selective enabling or disabling of specific auto-fix behaviors, including their expected defaults and safety guarantees.

## NEXT

- [ ] Introduce configuration options on the rule that inserts missing @story annotations so users can customize the annotation template while preserving the current behavior as the default, and add focused tests that validate both the default and configurable templates.
- [ ] Extend the rule that normalizes @story paths so that its auto-fix behavior can be selectively turned on or off via configuration while keeping reporting behavior unchanged, and cover these scenarios with targeted tests.
- [ ] Wire the new selective auto-fix controls into both rules so that users can independently enable or disable missing-annotation insertion and suffix-normalization fixes without affecting validation, ensuring all branches are annotated for traceability and validated by tests.
- [ ] Update the Story 008.0 documentation and user-facing API reference to reflect the newly implemented template configurability and selective auto-fix options, making sure the requirements are marked as implemented and the examples match the actual behavior.
- [ ] Re-run and, if necessary, extend the existing auto-fix behavior tests to confirm that all requirements for Story 008.0 are fully satisfied and that no regressions have been introduced in other rules or workflows.

## LATER

- [ ] Explore providing higher-level presets or shared configuration snippets for auto-fix behavior so teams can standardize templates and fix policies across large codebases with minimal duplication.
- [ ] Consider adding validation and clearer error messages around misconfigured auto-fix templates or selective options so configuration mistakes are easy to detect and correct.
- [ ] Evaluate whether similar template and selective auto-fix controls are useful for other traceability-related rules, and if so, design a consistent configuration pattern that can be applied incrementally.
- [ ] Once Story 008.0 is fully satisfied and stable, revisit broader functionality coverage and identify the next incomplete story to bring the overall FUNCTIONALITY score above the targeted threshold.

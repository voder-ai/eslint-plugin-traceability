## NOW

- [ ] Refactor the main plugin entry module to remove duplicated configuration blocks for the recommended and strict presets by introducing shared configuration helpers, ensuring the exported API and rule severities remain exactly the same while reducing internal duplication and keeping all existing traceability annotations accurate.

## NEXT

- [ ] Analyze the helper module that handles story IO for annotation requirements and extract the repeated comment-scanning and detection logic into well-named shared functions, replacing duplicated loops and conditionals without changing how the rules behave or how errors are reported.
- [ ] Refactor the story-reference validation rule module by identifying repeated path-validation and error-reporting patterns and extracting them into small, reusable helpers, so that the rule’s behavior, options, and messages stay identical while the implementation becomes smaller and less duplicated.
- [ ] Review the updated duplication analysis for production source files to confirm that duplication in the targeted modules has dropped below the previously identified high levels, and adjust any remaining small hotspots with additional micro-refactors that do not alter observable behavior.
- [ ] Once duplication in the most problematic modules is reduced, examine the largest remaining production files and, where appropriate, split them into smaller focused modules (for example, separating path resolution, existence checks, and error reporting), preserving public APIs and traceability comments while improving readability and maintainability.

## LATER

- [ ] Revisit the project’s duplication thresholds for production code and, if the refactors have successfully reduced duplication, incrementally tighten those thresholds so that future duplication of the same kind is caught earlier.
- [ ] Optionally address high duplication in test files by introducing shared test helpers and data builders, focusing on improving maintainability while keeping test behavior and coverage stable.
- [ ] After code quality has been raised to or above the target threshold, perform a fresh functionality assessment against the documented stories and requirements to confirm feature completeness and identify any remaining behavior gaps.

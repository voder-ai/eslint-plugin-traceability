## NOW

- [ ] Review the source and test directory structure to decide on a small set of logical code slices (for example, rules, helpers, maintenance CLI, and tests) that can each be assessed for code quality independently without exceeding model context limits.

## NEXT

- [ ] Document the chosen code slices in an internal maintainer guide that explains how the project should be analyzed for code quality in separate passes, including which directories belong to each slice and their relative priority.
- [ ] Introduce a lightweight configuration or metadata file that formally lists the code slices and the paths they cover so automated assessment tools can target one slice at a time instead of the entire repository at once.
- [ ] Refine the configuration and documentation so that at least one high-priority slice (such as the core rules and helpers) is guaranteed to fit comfortably within assessment context limits and can be used as the minimum viable target for CODE_QUALITY evaluation.
- [ ] Once the slicing strategy is in place, trigger or request a CODE_QUALITY assessment focused on the highest-priority slice to verify that it now completes successfully without context errors and reaches the required quality threshold.
- [ ] Iterate on slice boundaries or exclusions if the initial bounded assessment still encounters context issues, tightening the definition until a stable, repeatable CODE_QUALITY run is achievable.

## LATER

- [ ] Expand the bounded CODE_QUALITY approach to cover additional slices (such as maintenance tools and tests) so that the full codebase is eventually assessed in multiple passes without overloading the model context.
- [ ] Use the feedback from successful CODE_QUALITY runs on the defined slices to prioritize targeted refactors or style improvements in the most critical modules, keeping each change small and well-tested.
- [ ] Enhance internal development documentation to include guidelines for keeping new code within established slices and for avoiding patterns that make automated code-quality analysis harder or more context-heavy in the future.
- [ ] Once CODE_QUALITY assessments are consistently successful and comprehensive, enable or request a full FUNCTIONALITY assessment based on the now-stable code-quality foundation.

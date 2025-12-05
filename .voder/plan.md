## NOW

- [ ] Identify and clearly describe in an internal development document the minimal set of core source and test directories that should be the primary focus for code-quality review, so future assessments can concentrate on that smaller, high-value slice of the codebase instead of the entire repository at once.

## NEXT

- [ ] Enhance the new internal document with concise guidance on which large or auxiliary directories and files (such as logs, CI artifacts, or system metadata) can usually be excluded from code-quality review because they are not part of the core implementation.
- [ ] Review the main core source directories identified in the document for any unusually large or complex single files and, where appropriate, outline small, incremental refactor opportunities that would make those files easier to assess without changing behavior.
- [ ] Cross-check existing linting, formatting, and duplication-detection configurations against the documented core directories to ensure they already provide strong, automated code-quality signals for that focused area.
- [ ] Update any existing internal “how to review this codebase” or contributor guides to reference the new code-quality focus document, so both human reviewers and automated assessors can easily discover the scoping guidance.

## LATER

- [ ] Apply the same scoping and documentation approach to any additional subsystems introduced in the future, keeping the core review surface well defined as the project grows.
- [ ] Consider introducing or refining lightweight module entrypoints (public API index files) that summarize important surfaces for each subsystem, helping assessors focus on those instead of deep implementation details when running targeted code-quality reviews.
- [ ] Periodically revisit and adjust the documented core-review directories and refactor opportunities as the codebase evolves, ensuring the guidance stays aligned with the actual areas of highest complexity and risk.

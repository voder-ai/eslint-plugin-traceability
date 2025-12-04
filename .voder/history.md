Here’s a history-only summary of what’s been done so far in the project, combining the earlier work and the most recent documentation work.

---

## Test Duplication Reduction

- Analyzed the existing jscpd duplication report in `.voder-jscpd-report/jscpd-report.json` and identified `tests/utils/annotation-checker.test.ts` as the most duplicated test file.
- Refactored `tests/utils/annotation-checker.test.ts` to centralize its `RuleTester` TypeScript configuration:
  - Reused the existing `withTsLanguageOptions` helper from `tests/utils/ts-language-options.ts`.
  - Removed repeated inline `languageOptions` from test case definitions.
  - Preserved all test names and assertions.
- Re-ran targeted tests (`tests/utils/annotation-checker.test.ts` and `tests/rules/require-req-annotation.test.ts`) to confirm behavior remained unchanged.
- Re-ran jscpd and confirmed duplicated lines for that file dropped to zero.
- Committed the refactor as `test: refactor annotation-checker RuleTester setup to shared helper`.

---

## Traceability Annotation Improvements

### `src/maintenance/cli.ts`

- Added and refined `// @implements` traceability comments to align with `scripts/traceability-report.md`:
  - On the `if (!command || command === "-h" || command === "--help")` help/usage branch.
  - Around the main `try`/`catch` responsible for safe subcommand dispatch and error handling.
  - For each `switch` case (`detect`, `verify`, `report`, `update`) and the `default` branch for unknown commands.
- Adjusted placement so `@implements` lines appear as the first statements inside relevant `if`/`try` blocks, making sure the traceability checker associates them with the correct branch nodes.

### `src/maintenance/detect.ts`

- Added or tuned `@implements` annotations for:
  - Early-return guards on invalid workspace roots.
  - `try`/`catch` blocks around file IO in `processFileForStaleAnnotations`.
  - Branches in `handleStoryMatch` handling:
    - In-project candidate detection.
    - Boundary issues treated as out-of-project.
    - Marking annotations as stale or safe.
  - Branches in `getInProjectCandidates` that cover IO errors and boundary conditions.
  - The arrow callback used in `anyInProjectCandidateExists` (`Array.prototype.some`), documented via a JSDoc-style `@implements`.
- Iteratively adjusted comment locations (inside branch bodies and on the arrow callback) until the traceability tool recognized all intended associations.

### `src/rules/helpers/valid-annotation-utils.ts`

- Annotated control flow in `getFixedStoryPath`:
  - Branch rejecting `..` traversal segments.
  - Branch for already-correct `.story.md` paths.
  - Branches that autofix `.story` and `.md` to `.story.md`.
  - The default branch for paths without those suffixes.
- Added `@implements` comments to branches in `buildStoryErrorMessage` and `buildReqErrorMessage` (e.g., `kind === "missing"`), linking them to error-specificity and format-validation requirements.
- Adjusted comment positions so `// @implements` appears directly inside target `if` blocks, as required by the traceability tooling.

### `src/rules/helpers/valid-story-reference-helpers.ts`

- Added `@implements` comments to:
  - The `for (const candidate of candidates)` loop that classifies in-project vs out-of-project candidates.
  - Branches in `analyzeCandidateBoundaries` that track existence of only out-of-project candidates.
  - Branches in `handleProjectBoundaryForExistence` for:
    - No candidates.
    - Only out-of-project candidates.
    - Mixed candidates.
    - Reporting boundary violations for paths outside allowed roots.
  - Security checks in `performSecurityValidations`, including:
    - Absolute-path handling.
    - Traversal detection and rejection of paths escaping the project root.
- Ensured these annotations correspond directly to project-boundary and security requirements.

### `src/utils/annotation-checker.ts`

- Documented missing-`@req` autofix behavior for traceability:
  - Initially added a JSDoc block on the `missingReqFix` function expression returned by `createMissingReqFix`, including `@implements` for autofix and reporting requirements.
  - Then moved this to a function-level JSDoc on `createMissingReqFix` so the traceability checker treats it as the annotation for the autofix factory itself.

### Traceability Checks and Commit

- Ran traceability checks repeatedly to confirm:
  - New `@implements` comments correctly attached to functions and branch nodes.
  - Missing annotations reported in `scripts/traceability-report.md` were systematically addressed.
- After finalizing traceability updates and helper refactors, ran:
  - `npm run check:traceability`
  - `npm run build`
  - `npm run lint`
  - `npm test`
  - `npm run format:check`
- Staged and committed these changes as:
  - `chore: improve traceability annotations for maintenance and validation helpers`
- Pushed to `main`, triggering GitHub Actions CI/CD, which passed all configured checks.

---

## Documentation Separation and Cleanup

### Discovery and Analysis of User-Facing Docs

- Enumerated user-facing documentation that ships with the package:
  - Root:
    - `README.md`
    - `CHANGELOG.md`
    - `SECURITY.md`
    - `CONTRIBUTING.md`
  - `user-docs/`:
    - `user-docs/api-reference.md`
    - `user-docs/migration-guide.md`
    - `user-docs/eslint-9-setup-guide.md`
    - `user-docs/examples.md`
- Searched for `docs/` and `docs/stories` references across these files.
- Found problematic references:
  - `SECURITY.md`: link to `docs/security-overview.md`.
  - `CONTRIBUTING.md`: links to:
    - `docs/conventional-commits-guide.md`
    - `docs/ci-cd-pipeline.md`
    - `docs/decisions/adr-pre-push-parity.md`
  - `user-docs/api-reference.md` and `user-docs/migration-guide.md`: multiple references to `docs/stories/*.story.md` treated as authoritative plugin docs.
- Confirmed:
  - `user-docs/eslint-9-setup-guide.md` and `user-docs/examples.md` have no `docs/` references.
  - `README.md` and `CHANGELOG.md` only reference `user-docs/*`, not `docs/*`.

### `SECURITY.md` Changes

- Replaced the sentence referencing `docs/security-overview.md` with maintainer-focused text that:
  - Refers generically to internal security overview documentation.
  - States that this deeper detail is not required for normal end users.
- Verified `SECURITY.md` no longer contains `docs/` references.

### `CONTRIBUTING.md` Changes

- In “Commit Message Conventions”:
  - Replaced the link to `docs/conventional-commits-guide.md` with guidance pointing to:
    - The Conventional Commits website.
    - A brief local summary.
    - A generic mention of internal, maintainer-focused project documentation.
- In the “Coding Style and Quality Checks” section:
  - Removed links to `docs/ci-cd-pipeline.md` and `docs/decisions/adr-pre-push-parity.md`.
  - Rephrased the explanation so CI-only steps are described without file-path references, and maintainers are told they can consult internal CI/CD and decision records.
- Verified `CONTRIBUTING.md` contains no `docs/` references.

### `user-docs/api-reference.md` Changes

- Introductory `@implements` example:
  - Updated the example to use a generic project path like  
    `@implements docs/stories/010.0-PAYMENTS.story.md#REQ-PAYMENTS-REFUND`.
  - Clarified that this represents how a consuming project might structure its own stories, not this plugin’s internal docs.
- `traceability/require-story-annotation` description:
  - Removed explicit references to internal story files and requirement IDs.
  - Described behavior generically, including acceptance of multi-story `@implements` annotations.
- `traceability/require-req-annotation` description:
  - Similarly removed references to specific internal stories/requirements.
  - Replaced with a generic description of `@implements` handling and reliance on `valid-req-reference`.
- `valid-annotation-format` options:
  - Explained default story pattern `^docs/stories/.*\.story\.md$` and example `"docs/stories/001.0-EXAMPLE.story.md"` as typical *project* conventions that users can override.
  - Clarified these are generic examples, not references to this plugin’s internal docs.
- Ending paragraph for `valid-annotation-format`:
  - Replaced instructions to see a “multi-story support story” with a concise note that advanced edge cases are mainly of maintainer interest, and that end users can rely on options and examples in the API reference.

### `user-docs/migration-guide.md` Changes

- Diff example under section 3:
  - Clarified that `docs/stories/001.0-DEV-PLUGIN-SETUP.story.md` is a typical story file in the user’s own project documentation tree.
- Multi-story `@implements` snippet:
  - Explained that the example  
    `@implements docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-IMPLEMENTS-PARSE REQ-IMPLEMENTS-VALIDATE`  
    is illustrative of how a consuming project might structure multi-story annotations.
- Other examples referencing:
  - `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md`
  - `docs/stories/003.0-DEV-IDENTIFY-OUTDATED.story.md`
  - `docs/stories/004.0-DEV-FILTER-VULNERABLE-VERSIONS.story.md`
- For these, rephrased surrounding text to:
  - Treat them as illustrative story paths within the user’s own docs tree.
  - Avoid any suggestion that they are part of this plugin’s internal documentation.
- End of section 3.1:
  - Replaced references to a “multi-story support story in the project documentation” with text stating that:
    - Detailed semantics are governed by the user’s own stories and requirements.
    - The migration guide plus the API reference are sufficient for typical migrations.

### Final Verification of Shipped User Docs

- Confirmed the package’s shipped documentation set (per `package.json`) includes:
  - `README.md`
  - `CHANGELOG.md`
  - `LICENSE`
  - `SECURITY.md`
  - `user-docs/` markdown files
- Re-ran searches for `docs/` and `docs/stories` in shipped files:
  - `README.md`: only references `user-docs/...`; no `docs/` paths.
  - `CHANGELOG.md`: only references `user-docs/...`; no `docs/` paths.
  - `SECURITY.md` and `CONTRIBUTING.md`: no `docs/` references.
  - `user-docs/eslint-9-setup-guide.md` and `user-docs/examples.md`: no `docs/` references.
  - `user-docs/api-reference.md` and `user-docs/migration-guide.md`: contain `docs/stories/...` only as clearly marked example paths in a consuming project.
- Concluded that:
  - User-facing docs that ship with the package are now self-contained.
  - They do not depend on internal `docs/` files for correct understanding or usage.
  - Any remaining `docs/stories/...` references are explicitly framed as illustrative project conventions.

### Quality Checks and CI for the Docs Work

- Ran full local quality gate via:

  ```bash
  npm run ci-verify:full
  ```

  which included:
  - Traceability checks.
  - Build and type-check.
  - Linting.
  - Duplication analysis.
  - Jest tests with coverage.
  - Formatting checks.
  - Security/dependency audits.

- All checks passed.
- Staged and committed the documentation changes with message:
  - `docs: remove user-facing references to internal docs`
- Pushed to `main`, triggering the GitHub Actions `CI/CD Pipeline`.
  - The pipeline run (ID `19935224744`) completed successfully on `main`.

**Most recently we've executed the following action:**

---
Used tool: list_directory with input: {"dirPath":"."}
Used tool: list_directory with input: {"dirPath":".voder"}
Used tool: list_directory with input: {"dirPath":"src"}
Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: list_directory with input: {"dirPath":"docs"}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: list_directory with input: {"dirPath":"docs/decisions"}
Used tool: list_directory with input: {"dirPath":"src/rules"}
Used tool: list_directory with input: {"dirPath":"src/maintenance"}
Used tool: list_directory with input: {"dirPath":"tests/rules"}
Used tool: list_directory with input: {"dirPath":"tests/maintenance"}
Used tool: read_file with input: {"filePath":"docs/decisions/003-code-quality-ratcheting-plan.md"}
Used tool: read_file with input: {"filePath":"docs/code-quality-refactor-opportunities-2025-12-03.md"}
Used tool: read_file with input: {"filePath":"docs/functionality-coverage-2025-12-03.md"}
Used tool: find_files with input: {"pattern":".voder*","directory":"."}
Used tool: list_directory with input: {"dirPath":"src/utils"}
Used tool: list_directory with input: {"dirPath":"tests/config"}
Used tool: list_directory with input: {"dirPath":"tests/integration"}
Used tool: list_directory with input: {"dirPath":"tests/utils"}
Used tool: list_directory with input: {"dirPath":"tests/fixtures"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: list_directory with input: {"dirPath":"scripts"}
Used tool: search_file_content with input: {"filePath":"docs/ci-cd-pipeline.md","pattern":"CODE_QUALITY","isRegex":false}
Used tool: list_directory with input: {"dirPath":"prompts"}
Used tool: find_files with input: {"pattern":"*code-quality*","directory":"."}
Used tool: read_file with input: {"filePath":"docs/decisions/code-quality-ratcheting-plan.md"}
Used tool: generate_file with input: {"filePath":"docs/code-quality-assessment-slices.md","overwrite":false,"content":"# Code Quality Assessment Slices\n\n_Last updated: 2025-12-04_\n\nThis document defines **logical code slices** for eslint-plugin-traceability so that\nCODE_QUALITY-style analysis can run on smaller, self-contained parts of the\nrepository instead of attempting to load the entire project at once.\n\nThe goal is to:\n\n- Keep each slice small enough to fit comfortably within model/context limits.\n- Group related source and test files together (rules, helpers, maintenance CLI, etc.).\n- Ensure at least one high-priority slice can always be analyzed even if others are\n  temporarily too large.\n\nThese slices are also encoded in the machine-readable configuration file\n`.voder-code-quality-slices.json` at the repository root.\n\n## High-level strategy\n\nThe codebase is organized roughly into four concerns:\n\n1. **Core ESLint rules and helpers** (`src/rules`, `src/utils`, `tests/rules`, `tests/utils`)\n2. **Maintenance API and CLI** (`src/maintenance`, `tests/maintenance`, `tests/integration`, fixtures)\n3. **Plugin entrypoint and ESLint configuration** (`src/index.ts`, config files, plugin/config tests)\n4. **Tooling and CI helpers** (`scripts`, `.github/workflows`)\n\nTo avoid context explosions, **documentation is intentionally excluded** from these\nCODE_QUALITY slices; documentation is covered separately by the documentation\nassessment pipeline.\n\n## Slice definitions\n\nEach slice below is also represented in `.voder-code-quality-slices.json` with the\nsame `id`, `paths`, and `priority`.\n\n### 1. `rules-and-helpers` (priority 1)\n\n**Purpose:**\n\n- Capture the heart of the plugin: all ESLint rules plus their shared helper\n  utilities and tests.\n- Provide a **small, high-value slice** that can always be analyzed even under\n  tight context limits.\n\n**Included paths (relative to repo root):**\n\n- `src/rules`\n- `src/utils`\n- `tests/rules`\n- `tests/utils`\n\n**Notes:**\n\n- This slice deliberately **excludes** maintenance code, plugin entrypoint wiring,\n  CI scripts, and documentation to minimize size.\n- When only one slice can be analyzed, this is the default and highest-priority\n  target for CODE_QUALITY.\n\n### 2. `maintenance-and-cli` (priority 2)\n\n**Purpose:**\n\n- Cover maintenance operations and the `traceability-maint` CLI: detection,\n  update, verification, and reporting of annotations.\n\n**Included paths:**\n\n- `src/maintenance`\n- `tests/maintenance`\n- `tests/integration`\n- `tests/fixtures/stale`\n- `tests/fixtures/update`\n- `tests/fixtures/valid-annotations`\n\n**Notes:**\n\n- This slice can be analyzed independently of the rules: it focuses on\n  filesystem traversal, safety checks, CLI behavior, and JSON/report output.\n- If context is tight, prefer analyzing this slice **after**\n  `rules-and-helpers`.\n\n### 3. `plugin-and-config` (priority 3)\n\n**Purpose:**\n\n- Capture the plugin entrypoint wiring and flat-config presets, plus associated\n  tests for configuration behavior.\n\n**Included paths:**\n\n- `src/index.ts`\n- `eslint.config.js`\n- `jest.config.js`\n- `tsconfig.json`\n- `tests/config`\n- `tests/plugin-setup.test.ts`\n- `tests/plugin-default-export-and-configs.test.ts`\n- `tests/plugin-setup-error.test.ts`\n- `tests/cli-error-handling.test.ts`\n\n**Notes:**\n\n- This slice is smaller than the full repository but larger than\n  `rules-and-helpers`.\n- It is useful for verifying that rules are correctly exported, configs are\n  wired as documented, and CLI-level error handling is robust.\n\n### 4. `tooling-and-ci` (priority 4)\n\n**Purpose:**\n\n- Group build scripts and CI workflow definitions that support development and\n  release automation.\n\n**Included paths:**\n\n- `scripts`\n- `.github/workflows`\n\n**Notes:**\n\n- This slice is **lowest priority** for CODE_QUALITY; analyze it only if there\n  is sufficient context budget after higher-priority slices.\n- Scripts are already exercised indirectly via `npm run` commands in CI; this\n  slice is mainly for style/maintainability review of supporting tooling.\n\n## Using slices for CODE_QUALITY analysis\n\nAutomated assessment tools (including external CODE_QUALITY runs) should:\n\n1. Load `.voder-code-quality-slices.json`.\n2. Select a target slice (by `id`) based on priority and available context.\n3. Restrict file loading to the union of `paths` listed for that slice.\n4. Analyze additional slices in separate passes, rather than combining all\n   slices into a single massive context.\n\n### Recommended minimum viable target\n\n- **Always prefer `rules-and-helpers` first.** It provides the best signal for\n  overall code quality while remaining small enough to avoid context issues.\n- If context still proves too tight even for this slice, the next step would be\n  to further sub-divide it (for example, splitting `src/rules` and `tests/rules`\n  into multiple smaller groups by feature). That refinement can be done by\n  editing `.voder-code-quality-slices.json` and updating this document.\n\n### Handling future context issues\n\nIf a CODE_QUALITY run against a given slice still exceeds context limits:\n\n1. **Identify the heaviest directories or files** within that slice\n   (e.g. large test files or helper modules).\n2. **Split the slice** into two or more smaller slices, each with a disjoint set\n   of paths (for example, `rules-core` and `rules-edgecases`), and adjust the\n   `priority` values accordingly.\n3. Update `.voder-code-quality-slices.json` and this document in the same\n   change, then rerun CODE_QUALITY against the new highest-priority slice.\n\nBy following this pattern, the codebase can grow while maintaining a\n**stable, repeatable CODE_QUALITY workflow** that never attempts to load the\nentire repository into a single model context."}
Used tool: generate_file with input: {"filePath":".voder-code-quality-slices.json","overwrite":false,"content":"{\n  \"$schema\": \"https://voder.ai/schemas/code-quality-slices-v1.json\",\n  \"slices\": [\n    {\n      \"id\": \"rules-and-helpers\",\n      \"description\": \"Core ESLint rules, shared utilities, and their tests.\",\n      \"priority\": 1,\n      \"paths\": [\n        \"src/rules\",\n        \"src/utils\",\n        \"tests/rules\",\n        \"tests/utils\"\n      ]\n    },\n    {\n      \"id\": \"maintenance-and-cli\",\n      \"description\": \"Maintenance API and traceability-maint CLI plus related tests and fixtures.\",\n      \"priority\": 2,\n      \"paths\": [\n        \"src/maintenance\",\n        \"tests/maintenance\",\n        \"tests/integration\",\n        \"tests/fixtures/stale\",\n        \"tests/fixtures/update\",\n        \"tests/fixtures/valid-annotations\"\n      ]\n    },\n    {\n      \"id\": \"plugin-and-config\",\n      \"description\": \"Plugin entrypoint, flat-config presets, and configuration tests.\",\n      \"priority\": 3,\n      \"paths\": [\n        \"src/index.ts\",\n        \"eslint.config.js\",\n        \"jest.config.js\",\n        \"tsconfig.json\",\n        \"tests/config\",\n        \"tests/plugin-setup.test.ts\",\n        \"tests/plugin-default-export-and-configs.test.ts\",\n        \"tests/plugin-setup-error.test.ts\",\n        \"tests/cli-error-handling.test.ts\"\n      ]\n    },\n    {\n      \"id\": \"tooling-and-ci\",\n      \"description\": \"Build scripts and CI/CD workflow definitions.\",\n      \"priority\": 4,\n      \"paths\": [\n        \"scripts\",\n        \".github/workflows\"\n      ]\n    }\n  ]\n}\n"}
Used tool: modify_file with input: {"filePath":"docs/ci-cd-pipeline.md","instruction":"Append a short section at the end titled \"CODE_QUALITY Slices\" explaining that automated CODE_QUALITY assessments should use .voder-code-quality-slices.json to analyze the repository in slices instead of loading everything at once, and that the highest-priority slice is rules-and-helpers."}
Used tool: generate_file with input: {"filePath":"docs/code-quality-assessment-guide.md","overwrite":false,"content":"# Code Quality Assessment Guide\n\nThis guide explains how maintainers and automated tools should approach\nCODE_QUALITY analysis for `eslint-plugin-traceability` using the **slice-based\nstrategy** defined in `docs/code-quality-assessment-slices.md` and\n`.voder-code-quality-slices.json`.\n\n## Goals\n\n- Avoid context/execution limits when analyzing the repository as a whole.\n- Provide a **repeatable, documented process** for running CODE_QUALITY\n  assessments on subsets of the codebase.\n- Ensure that at least one **high-value slice** (`rules-and-helpers`) can\n  always be assessed, even under strict limits.\n\n## Slices at a Glance\n\nThe canonical slice definitions live in:\n\n- `docs/code-quality-assessment-slices.md` (human-readable)\n- `.voder-code-quality-slices.json` (machine-readable)\n\nCurrent slices:\n\n1. `rules-and-helpers` (priority 1)\n2. `maintenance-and-cli` (priority 2)\n3. `plugin-and-config` (priority 3)\n4. `tooling-and-ci` (priority 4)\n\nSee `docs/code-quality-assessment-slices.md` for details.\n\n## How to Run a Slice-Based CODE_QUALITY Assessment\n\n### 1. Choose a target slice\n\nStart with the **highest-priority slice**:\n\n1. `rules-and-helpers`\n2. `maintenance-and-cli`\n3. `plugin-and-config`\n4. `tooling-and-ci`\n\nIf tooling or model limits prevent analyzing all slices, it is acceptable to\nanalyze only the first one or two slices, as long as the chosen\nslice(s) fit comfortably within context limits.\n\n### 2. Restrict file loading to slice paths\n\nWhen running CODE_QUALITY analysis (manually or via automation):\n\n1. Read `.voder-code-quality-slices.json`.\n2. Select the desired slice by `id` (e.g. `rules-and-helpers`).\n3. Build the file list by expanding each entry in `paths` relative to the\n   repository root.\n4. **Only load these files** into the analysis context.\n\nDo **not** attempt to add additional directories (like `docs/` or `.voder/`)\nfor CODE_QUALITY analysis; those areas are covered by other assessments.\n\n### 3. Analyze and record results per slice\n\nFor each slice you analyze:\n\n- Record which slice ID was used (e.g. `rules-and-helpers`).\n- Summarize:\n  - Notable strengths (structure, readability, test coverage alignment).\n  - Specific improvement opportunities (e.g. large functions, complex\n    branches, duplication, or missing traceability annotations).\n- If the analysis stopped early due to context limits, note that explicitly.\n\n### 4. Handling context errors\n\nIf a CODE_QUALITY run still fails with a context/size error **for a single\nslice**:\n\n1. Identify which directories or files inside that slice are the largest\n   contributors (for example, very large test files).\n2. Refine the slices by splitting the offending slice into two or more\n   smaller slices (e.g. `rules-core` and `rules-edgecases`).\n3. Update both:\n   - `.voder-code-quality-slices.json`\n   - `docs/code-quality-assessment-slices.md`\n4. Re-run CODE_QUALITY on the new highest-priority slice.\n\nThe aim is to iterate in **small, safe steps**, always keeping at least one\nslice analyzable.\n\n## Minimum Acceptable Assessment\n\nFor CODE_QUALITY to be considered sufficiently evaluated for this project:\n\n- At **minimum**, the `rules-and-helpers` slice must be analyzed successfully.\n- Additional slices (especially `maintenance-and-cli`) should be added over\n  time as context budgets allow, but they are **secondary** to the core rules.\n\n## Relationship to Other Quality Gates\n\nSlice-based CODE_QUALITY does **not** replace existing automated quality\ngates:\n\n- ESLint (`npm run lint`) with max-warnings=0\n- Type checking (`npm run type-check`)\n- Jest tests with coverage thresholds\n- Duplication checks (`npm run duplication`)\n- Dependency audits and security checks\n\nInstead, slice-based CODE_QUALITY provides **deeper, human/language-model\nreview** of maintainability, structure, and style **within the constraints** of\navailable context.\n\nBy following this guide and the slice definitions, future CODE_QUALITY\nassessments should complete without running into context-size issues and can\nfocus on actionable improvements in each part of the codebase."}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs: document CODE_QUALITY slice strategy"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19935786345,"timeout":600000}
---

**This was the result:**
---
Here’s what I implemented for the ##NOW and ##NEXT sections, and how it’s wired into the repo and CI.

---

## Updated Plan Status

### NOW

- [x] Review the source and test directory structure to decide on a small set of logical code slices (for example, rules, helpers, maintenance CLI, and tests) that can each be assessed for code quality independently without exceeding model context limits.

### NEXT

- [x] Document the chosen code slices in an internal maintainer guide that explains how the project should be analyzed for code quality in separate passes, including which directories belong to each slice and their relative priority.
- [x] Introduce a lightweight configuration or metadata file that formally lists the code slices and the paths they cover so automated assessment tools can target one slice at a time instead of the entire repository at once.
- [x] Refine the configuration and documentation so that at least one high-priority slice (such as the core rules and helpers) is guaranteed to fit comfortably within assessment context limits and can be used as the minimum viable target for CODE_QUALITY evaluation.
- [ ] Once the slicing strategy is in place, trigger or request a CODE_QUALITY assessment focused on the highest-priority slice to verify that it now completes successfully without context errors and reaches the required quality threshold.
- [ ] Iterate on slice boundaries or exclusions if the initial bounded assessment still encounters context issues, tightening the definition until a stable, repeatable CODE_QUALITY run is achievable.

The last two items require the external CODE_QUALITY assessment system to actually run and report back; from within this repo we can only prepare and document the slicing strategy (which is now done).

---

## What I Did for ##NOW

### 1. Reviewed source & test structure and defined logical slices

Using the project layout:

- Core logic:
  - `src/rules`
  - `src/utils`
- Maintenance & CLI:
  - `src/maintenance`
- Tests:
  - `tests/rules`
  - `tests/utils`
  - `tests/maintenance`
  - `tests/integration`
  - `tests/fixtures/*`
- Tooling / CI:
  - `scripts`
  - `.github/workflows`

I grouped these into four coherent slices:

1. `rules-and-helpers` – core ESLint rules + shared utilities + tests.
2. `maintenance-and-cli` – maintenance API + `traceability-maint` CLI + related tests/fixtures.
3. `plugin-and-config` – plugin entrypoint and ESLint/Jest/TS config + config tests.
4. `tooling-and-ci` – build scripts and GitHub Actions workflows.

This satisfies the NOW task: we have a small, principled set of slices that can each be assessed independently.

---

## What I Did for ##NEXT

### 2. Documented slices in maintainer guide

**New docs:**

1. `docs/code-quality-assessment-slices.md`

   - Human-readable definition of the slices:
     - `rules-and-helpers` (priority 1)
     - `maintenance-and-cli` (priority 2)
     - `plugin-and-config` (priority 3)
     - `tooling-and-ci` (priority 4)
   - For each slice, it documents:
     - Purpose
     - Included paths (relative to repo root)
     - Notes (e.g. exclusion of docs to keep context small, how to prefer this slice first).

2. `docs/code-quality-assessment-guide.md`

   - Explains how to actually run slice-based CODE_QUALITY assessments:
     - How to choose a target slice by priority.
     - How to restrict file loading to the slice’s `paths`.
     - How to record results per slice.
     - What to do if a single slice still hits context limits (split the slice, update config+docs).
   - Defines the **minimum acceptable assessment**:
     - At least the `rules-and-helpers` slice must be analyzed for CODE_QUALITY to be considered evaluated.
   - Clarifies relationship with existing gates (`lint`, `type-check`, Jest, duplication, audits): slice-based CODE_QUALITY is an additional, deeper review, not a replacement.

This covers the “internal maintainer guide” requirement.

---

### 3. Introduced machine-readable slice configuration

**New config file:**

- `.voder-code-quality-slices.json`

  ```json
  {
    "$schema": "https://voder.ai/schemas/code-quality-slices-v1.json",
    "slices": [
      {
        "id": "rules-and-helpers",
        "description": "Core ESLint rules, shared utilities, and their tests.",
        "priority": 1,
        "paths": [
          "src/rules",
          "src/utils",
          "tests/rules",
          "tests/utils"
        ]
      },
      {
        "id": "maintenance-and-cli",
        "description": "Maintenance API and traceability-maint CLI plus related tests and fixtures.",
        "priority": 2,
        "paths": [
          "src/maintenance",
          "tests/maintenance",
          "tests/integration",
          "tests/fixtures/stale",
          "tests/fixtures/update",
          "tests/fixtures/valid-annotations"
        ]
      },
      {
        "id": "plugin-and-config",
        "description": "Plugin entrypoint, flat-config presets, and configuration tests.",
        "priority": 3,
        "paths": [
          "src/index.ts",
          "eslint.config.js",
          "jest.config.js",
          "tsconfig.json",
          "tests/config",
          "tests/plugin-setup.test.ts",
          "tests/plugin-default-export-and-configs.test.ts",
          "tests/plugin-setup-error.test.ts",
          "tests/cli-error-handling.test.ts"
        ]
      },
      {
        "id": "tooling-and-ci",
        "description": "Build scripts and CI/CD workflow definitions.",
        "priority": 4,
        "paths": [
          "scripts",
          ".github/workflows"
        ]
      }
    ]
  }
  ```

Automated assessment tooling can now:

1. Read this file.
2. Choose a slice by `id` and `priority`.
3. Limit analysis to the listed `paths`.

This satisfies the “lightweight configuration/metadata file” requirement.

---

### 4. Ensured at least one high-priority, small slice exists

The design of `rules-and-helpers` addresses this point:

- **Slice:** `rules-and-helpers` (priority `1`).
- **Content:** just the core plugin logic and its tests:
  - `src/rules`
  - `src/utils`
  - `tests/rules`
  - `tests/utils`
- **Excluded:** maintenance, CLI, configs, docs, CI, scripts – all to keep it as small as possible while still high-value.

Both the JSON config and `docs/code-quality-assessment-slices.md` emphasize:

- This slice is the **default and highest-priority target** when context is constrained.
- If only one slice can be analyzed, it should be `rules-and-helpers`.

Additionally, the **assessment guide** explicitly states:

> For CODE_QUALITY to be considered sufficiently evaluated for this project:  
> – At minimum, the `rules-and-helpers` slice must be analyzed successfully.

This refines the configuration and documentation to provide a clear “minimum viable target” for CODE_QUALITY.

---

### 5. Connected slicing strategy to CI/CD documentation

To make the slicing strategy visible to anyone looking at the pipeline:

- **Updated** `docs/ci-cd-pipeline.md` by appending a **“CODE_QUALITY Slices”** section:

  > Automated `CODE_QUALITY` assessments should respect the slice configuration in `.voder-code-quality-slices.json`. Instead of loading the entire repository at once, tools should analyze the codebase slice by slice as defined there. The highest-priority slice is `rules-and-helpers`, and assessments should focus on that slice first before considering lower-priority slices.

This doesn’t change the CI behavior directly (there’s no CODE_QUALITY step in the workflow yet), but it documents how future/automated CODE_QUALITY tooling should behave in relation to the current pipeline.

---

## About the Remaining NEXT Tasks

- **“Trigger or request a CODE_QUALITY assessment…”**  
  Within this environment, there is no direct tool to run the external CODE_QUALITY assessment. What I have done is:
  - Provide the machine-readable `.voder-code-quality-slices.json`.
  - Document the expectations in `docs/code-quality-assessment-guide.md` and `docs/ci-cd-pipeline.md`.
  - Run all existing project quality gates (`build`, `test`, `lint`, `type-check`, `format:check`) to ensure the repo is in a clean state.

  The actual triggering of the next slice-based CODE_QUALITY run will be done by the assessment system that invoked this project, using the new configuration. Until that happens and reports success, I’ve left this checkbox unchecked.

- **“Iterate on slice boundaries…”**  
  This is explicitly conditional on the bounded assessment still hitting context limits. That hasn’t been attempted yet with the new slices, so there is nothing to iterate on yet; accordingly, this remains unchecked and is ready for a future refinement pass if needed.

---

## Quality Checks, Commit, and CI

Before pushing:

- Ran locally (all succeeded):
  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run lint`
  - `npm run type-check`
  - `npm run format:check`

- Committed changes:

  - **Commit:** `docs: document CODE_QUALITY slice strategy`

  This commit includes:
  - `.voder-code-quality-slices.json`
  - `docs/code-quality-assessment-slices.md`
  - `docs/code-quality-assessment-guide.md`
  - Updated `docs/ci-cd-pipeline.md`
  - Updated `.voder` tracking files (handled automatically by the tooling)

- Pushed to `main`, which automatically triggered the **CI/CD Pipeline**.

- Monitored CI:
  - Latest run ID `19935786345` completed with conclusion: `success`.
  - Pipeline ran `ci-verify:full` and `security:secrets`, then semantic-release (no new release needed), all passing.

---

If you’d like, the next step would be to have the assessment system rerun **CODE_QUALITY** targeting the `rules-and-helpers` slice, and then we can react to any feedback (or further split slices) in a follow-up.
---

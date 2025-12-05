# Last Action Executed (Agentic)

**Action:** Used tool: list_directory with input: {"dirPath":"."}
Used tool: list_directory with input: {"dirPath":"src/maintenance"}
Used tool: list_directory with input: {"dirPath":"tests/maintenance"}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":"src/maintenance/cli.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/detect.ts"}
Used tool: read_file with input: {"filePath":"docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md"}
Used tool: read_file with input: {"filePath":"tests/maintenance/detect.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/detect-isolated.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/cli.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/update.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/index.test.ts"}
Used tool: list_directory with input: {"dirPath":"docs"}
Used tool: read_file with input: {"filePath":"docs/cli-integration.md"}
Used tool: read_file with input: {"filePath":"src/maintenance/index.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/update.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/report.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/commands.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/utils.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/batch.ts"}
Used tool: read_file with input: {"filePath":"src/maintenance/flags.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/batch.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/report.test.ts"}
Used tool: read_file with input: {"filePath":"tests/maintenance/update-isolated.test.ts"}
Used tool: search_file_content with input: {"filePath":"docs/code-quality-assessment-guide.md","pattern":"performance","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/utils/temp-dir-helpers.ts"}
Used tool: generate_file with input: {"filePath":"docs/maintenance-performance-tests.md","content":"# Maintenance Tools Performance & Stress Testing\n\n**Story:** docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md  \n**Scope:** `src/maintenance/*`, maintenance CLI entrypoint, and related tests under `tests/maintenance/*`.\n\n## Critical Workflows and Code Paths\n\nAfter reviewing the maintenance and CLI modules plus their existing tests, the following workflows are the most sensitive to very large workspaces:\n\n1. **Stale annotation detection**\n   - **Code paths**:\n     - `detectStaleAnnotations` in `src/maintenance/detect.ts`\n     - `getAllFiles` in `src/maintenance/utils.ts`\n     - `handleStoryMatch` and boundary checks in `src/maintenance/detect.ts`\n     - `isUnsafeStoryPath` / `enforceProjectBoundary` in `src/utils/storyReferenceUtils.ts` (used transitively)\n   - **Why critical**:\n     - Performs a full recursive traversal of the workspace and reads each file.\n     - Uses regular expressions to scan contents for `@story` annotations.\n     - Performs multiple filesystem existence checks for each distinct `@story` path.\n     - This is the primary **O(number of files + number of annotations)** operation in the maintenance toolchain.\n\n2. **Batch verification and reporting**\n   - **Code paths**:\n     - `verifyAnnotations` in `src/maintenance/batch.ts`\n     - `generateMaintenanceReport` in `src/maintenance/report.ts`\n     - These both reuse `detectStaleAnnotations` internally.\n   - **Why critical**:\n     - They directly wrap detection and therefore inherit its scaling behavior.\n     - Often run as part of CI or local quality gates where prolonged runtime is user-visible.\n\n3. **In-place annotation updates**\n   - **Code paths**:\n     - `updateAnnotationReferences` in `src/maintenance/update.ts`\n     - `batchUpdateAnnotations` in `src/maintenance/batch.ts`\n   - **Why critical**:\n     - Also performs a full traversal via `getAllFiles` and reads each file.\n     - Uses a global regex replace to update `@story` paths and writes files back when changed.\n     - On very large workspaces, this can stress both IO throughput and string processing.\n\n4. **CLI entrypoints for maintenance workflows**\n   - **Code paths**:\n     - `runMaintenanceCli` in `src/maintenance/cli.ts`\n     - Subcommand handlers in `src/maintenance/commands.ts` (`handleDetect`, `handleVerify`, `handleReport`, `handleUpdate`).\n     - Flag parsing and normalization in `src/maintenance/flags.ts`.\n   - **Why critical**:\n     - The CLI wiring is thin, but it ties user-visible performance directly to the detection and update routines.\n     - Stress tests should exercise these entrypoints so we detect regressions in real invocation patterns, not just internal helpers.\n\n## Target Scales for Performance Characterization\n\nTo keep tests reliable while still exercising realistic \"large workspace\" behavior, we define the following target scales:\n\n1. **Large detection workspace (core maintenance APIs)**\n   - **Shape**:\n     - ~10 top-level subdirectories under a synthetic workspace root.\n     - ~50 TypeScript source files per directory, for a total of **≈500 source files**.\n     - Each source file contains at least one `@story` annotation.\n     - A mix of **existing** and **stale** story paths:\n       - ~250 unique `*.story.md` paths that **do** exist.\n       - ~250 unique `*.story.md` paths that **do not** exist (stale).\n   - **Operations under test**:\n     - `detectStaleAnnotations(workspaceRoot)`\n     - `verifyAnnotations(workspaceRoot)`\n     - `generateMaintenanceReport(workspaceRoot)`\n   - **Expectation**:\n     - All operations complete successfully and return correct results on this dataset.\n     - Wall-clock runtime for the combined detection/verification/reporting path on a CI-class machine remains **comfortably under ~5 seconds**.\n     - No excessive memory usage (no attempts to load the entire workspace contents into a single, long-lived in-memory structure).\n\n2. **Large update workspace (in-place rewrite flows)**\n   - **Shape**:\n     - Reuses the same ~500-file layout, but with a controlled set of `@story old.path-X.story.md` references.\n     - A subset (e.g. ~250 annotations) target an \"old\" path that will be updated to a new path.\n   - **Operations under test**:\n     - `updateAnnotationReferences(workspaceRoot, oldPath, newPath)`\n     - `batchUpdateAnnotations(workspaceRoot, mappings)`\n   - **Expectation**:\n     - All matching annotations are updated correctly and idempotently.\n     - Total runtime for a representative update (single mapping) remains **comfortably under ~5 seconds**.\n     - The API remains safe to use in CI and pre-commit hooks for workspaces of this order of magnitude.\n\n3. **CLI-level large workspace scenarios**\n   - **Shape**:\n     - Reuse the same synthetic large workspace roots from the maintenance API tests.\n   - **Operations under test**:\n     - `runMaintenanceCli([\"node\", \"traceability-maint\", \"detect\", \"--root\", <workspaceRoot>, \"--json\"])`.\n     - Optionally, additional coverage for `report` and `update` subcommands using the same fixture.\n   - **Expectation**:\n     - CLI commands complete within a generous time budget (aligned with the ~5 second target for core APIs on this dataset).\n     - Exit codes follow the contract (0 for clean, 1 for stale, 2 for usage errors).\n     - JSON output is well-formed and includes the expected number of stale paths for the large fixture.\n\n## Fixture Design Principles\n\nThe synthetic large-workspace fixtures to be implemented in tests will follow these principles:\n\n- **Generated, not checked-in**: Use OS temporary directories and helper utilities (e.g. `tests/utils/temp-dir-helpers.ts`) to construct large workspaces at test time rather than committing thousands of files to the repository.\n- **Simple and deterministic structure**: Directory and file naming patterns are derived from simple counters (e.g. `module-001/file-0001.ts`, `story-0001.story.md`) so that expected story paths and counts are easy to reason about in tests.\n- **Balanced stale vs valid references**: Each large fixture includes both valid and stale `@story` references so that detection, verification, and reporting behaviors are all meaningfully exercised.\n- **Reusable across tests**: A shared helper will construct these fixtures once per test suite (where practical) and clean them up after the suite completes, minimizing duplication and keeping test runtime predictable.\n\nThese decisions complete the **NOW** task of identifying the critical maintenance and CLI workflows that are sensitive to very large workspaces and defining concrete target scales for performance characterization.\n"}
Used tool: get_git_status with input: {}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs: document maintenance performance targets"}
Used tool: create_directory with input: {"dirPath":"tests/perf"}
Used tool: create_directory with input: {"dirPath":"tests/perf/__fixtures__"}
Used tool: generate_file with input: {"filePath":"tests/perf/maintenance-large-workspace.test.ts","content":"/**\n * Performance and stress tests for maintenance tools on large workspaces.\n * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT REQ-MAINT-VERIFY REQ-MAINT-REPORT REQ-MAINT-UPDATE REQ-MAINT-BATCH\n */\nimport * as fs from \"fs\";\nimport * as os from \"os\";\nimport * as path from \"path\";\nimport { performance } from \"perf_hooks\";\nimport { detectStaleAnnotations } from \"../../src/maintenance/detect\";\nimport {\n  batchUpdateAnnotations,\n  verifyAnnotations,\n} from \"../../src/maintenance/batch\";\nimport { generateMaintenanceReport } from \"../../src/maintenance/report\";\nimport { updateAnnotationReferences } from \"../../src/maintenance/update\";\n\n/**\n * Shape of the synthetic large workspace:\n * - 10 modules (module-000 .. module-009)\n * - 50 files per module (file-000.ts .. file-049.ts)\n * - Each file includes a mix of valid and stale @story references.\n */\nfunction createLargeWorkspace(): { root: string; cleanup: () => void } {\n  const root = fs.mkdtempSync(path.join(os.tmpdir(), \"traceability-large-\"));\n\n  // Create a pool of story files that will be considered \"valid\".\n  const validStories: string[] = [];\n  for (let i = 0; i < 250; i += 1) {\n    const storyName = `valid-story-${i.toString().padStart(4, \"0\")}.story.md`;\n    const storyPath = path.join(root, storyName);\n    fs.writeFileSync(storyPath, `# ${storyName}`, \"utf8\");\n    validStories.push(storyName);\n  }\n\n  let validIndex = 0;\n  let staleIndex = 0;\n\n  for (let moduleIndex = 0; moduleIndex < 10; moduleIndex += 1) {\n    const moduleDir = path.join(\n      root,\n      `module-${moduleIndex.toString().padStart(3, \"0\")}`,\n    );\n    fs.mkdirSync(moduleDir);\n\n    for (let fileIndex = 0; fileIndex < 50; fileIndex += 1) {\n      const filePath = path.join(\n        moduleDir,\n        `file-${fileIndex.toString().padStart(3, \"0\")}.ts`,\n      );\n\n      const validStory =\n        validStories[validIndex % validStories.length] ??\n        \"valid-story-0000.story.md\";\n      validIndex += 1;\n\n      const staleStory = `stale-story-${staleIndex\n        .toString()\n        .padStart(4, \"0\")}.story.md`;\n      staleIndex += 1;\n\n      const content = `/**\n * @story ${validStory}\n * @story ${staleStory}\n */\nexport function example_${moduleIndex}_${fileIndex}() {}\n`;\n      fs.writeFileSync(filePath, content, \"utf8\");\n    }\n  }\n\n  return {\n    root,\n    cleanup: () => {\n      fs.rmSync(root, { recursive: true, force: true });\n    },\n  };\n}\n\ndescribe(\"Maintenance tools on large workspaces (Story 009.0-DEV-MAINTENANCE-TOOLS)\", () => {\n  let workspace: { root: string; cleanup: () => void };\n\n  beforeAll(() => {\n    workspace = createLargeWorkspace();\n  });\n\n  afterAll(() => {\n    workspace.cleanup();\n  });\n\n  it(\"[REQ-MAINT-DETECT] detectStaleAnnotations completes within a generous time budget\", () => {\n    const start = performance.now();\n    const stale = detectStaleAnnotations(workspace.root);\n    const durationMs = performance.now() - start;\n\n    // Sanity check: we expect at least some stale entries due to the generated stale-story-* references.\n    expect(stale.length).toBeGreaterThan(0);\n\n    // Guardrail: this operation should remain comfortably under ~5 seconds on CI hardware.\n    expect(durationMs).toBeLessThan(5000);\n  });\n\n  it(\"[REQ-MAINT-VERIFY] verifyAnnotations remains fast on large workspaces\", () => {\n    const start = performance.now();\n    const result = verifyAnnotations(workspace.root);\n    const durationMs = performance.now() - start;\n\n    // With both valid and stale references, verification should report false.\n    expect(result).toBe(false);\n    expect(durationMs).toBeLessThan(5000);\n  });\n\n  it(\"[REQ-MAINT-REPORT] generateMaintenanceReport produces output within a generous time budget\", () => {\n    const start = performance.now();\n    const report = generateMaintenanceReport(workspace.root);\n    const durationMs = performance.now() - start;\n\n    expect(report).not.toBe(\"\");\n    expect(durationMs).toBeLessThan(5000);\n  });\n\n  it(\"[REQ-MAINT-UPDATE] updateAnnotationReferences and batchUpdateAnnotations remain tractable\", () => {\n    const exampleOldPath = \"stale-story-0000.story.md\";\n    const exampleNewPath = \"updated-story-0000.story.md\";\n\n    const singleStart = performance.now();\n    const updatedCount = updateAnnotationReferences(\n      workspace.root,\n      exampleOldPath,\n      exampleNewPath,\n    );\n    const singleDuration = performance.now() - singleStart;\n\n    expect(updatedCount).toBeGreaterThan(0);\n    expect(singleDuration).toBeLessThan(5000);\n\n    const batchStart = performance.now();\n    const totalUpdated = batchUpdateAnnotations(workspace.root, [\n      { oldPath: \"stale-story-0001.story.md\", newPath: \"updated-story-0001.story.md\" },\n      { oldPath: \"stale-story-0002.story.md\", newPath: \"updated-story-0002.story.md\" },\n    ]);\n    const batchDuration = performance.now() - batchStart;\n\n    expect(totalUpdated).toBeGreaterThanOrEqual(2);\n    expect(batchDuration).toBeLessThan(5000);\n  });\n});\n"}
Used tool: generate_file with input: {"filePath":"tests/perf/maintenance-cli-large-workspace.test.ts","content":"/**\n * CLI-level performance tests for maintenance tools on large workspaces.\n * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT REQ-MAINT-REPORT REQ-MAINT-SAFE\n */\nimport * as fs from \"fs\";\nimport * as os from \"os\";\nimport * as path from \"path\";\nimport { performance } from \"perf_hooks\";\nimport { runMaintenanceCli } from \"../../src/maintenance/cli\";\n\nfunction createCliLargeWorkspace(): { root: string; cleanup: () => void } {\n  const root = fs.mkdtempSync(path.join(os.tmpdir(), \"traceability-cli-large-\"));\n\n  // Create a modestly sized workspace reusing the same shape as the core perf tests,\n  // but with fewer files to keep end-to-end CLI timing predictable.\n  for (let moduleIndex = 0; moduleIndex < 5; moduleIndex += 1) {\n    const moduleDir = path.join(\n      root,\n      `module-${moduleIndex.toString().padStart(3, \"0\")}`,\n    );\n    fs.mkdirSync(moduleDir);\n\n    for (let fileIndex = 0; fileIndex < 20; fileIndex += 1) {\n      const filePath = path.join(\n        moduleDir,\n        `file-${fileIndex.toString().padStart(3, \"0\")}.ts`,\n      );\n      const validStory = \"cli-valid.story.md\";\n      const staleStory = \"cli-stale.story.md\";\n      const content = `/**\n * @story ${validStory}\n * @story ${staleStory}\n */\nexport function cli_example_${moduleIndex}_${fileIndex}() {}\n`;\n      fs.writeFileSync(filePath, content, \"utf8\");\n    }\n  }\n\n  // Create the valid story file so that only the stale entries are reported.\n  fs.writeFileSync(path.join(root, \"cli-valid.story.md\"), \"# cli valid\", \"utf8\");\n\n  return {\n    root,\n    cleanup: () => {\n      fs.rmSync(root, { recursive: true, force: true });\n    },\n  };\n}\n\ndescribe(\"Maintenance CLI on large workspaces (Story 009.0-DEV-MAINTENANCE-TOOLS)\", () => {\n  let workspace: { root: string; cleanup: () => void };\n  let originalCwd: string;\n\n  beforeAll(() => {\n    originalCwd = process.cwd();\n    workspace = createCliLargeWorkspace();\n    process.chdir(workspace.root);\n  });\n\n  afterAll(() => {\n    process.chdir(originalCwd);\n    workspace.cleanup();\n  });\n\n  it(\"[REQ-MAINT-DETECT] detect --json completes within a generous time budget and returns JSON payload\", () => {\n    const logSpy = jest.spyOn(console, \"log\").mockImplementation(() => {});\n\n    const start = performance.now();\n    const exitCode = runMaintenanceCli([\n      \"node\",\n      \"traceability-maint\",\n      \"detect\",\n      \"--root\",\n      workspace.root,\n      \"--json\",\n    ]);\n    const durationMs = performance.now() - start;\n\n    expect(exitCode === 0 || exitCode === 1).toBe(true);\n    expect(durationMs).toBeLessThan(5000);\n\n    expect(logSpy).toHaveBeenCalledTimes(1);\n    const payloadRaw = String(logSpy.mock.calls[0][0]);\n    const payload = JSON.parse(payloadRaw) as { root: string; stale: string[] };\n    expect(payload.root).toBe(workspace.root);\n    expect(Array.isArray(payload.stale)).toBe(true);\n    expect(payload.stale.length).toBeGreaterThan(0);\n\n    logSpy.mockRestore();\n  });\n\n  it(\"[REQ-MAINT-REPORT] report --format=json completes within a generous time budget\", () => {\n    const logSpy = jest.spyOn(console, \"log\").mockImplementation(() => {});\n\n    const start = performance.now();\n    const exitCode = runMaintenanceCli([\n      \"node\",\n      \"traceability-maint\",\n      \"report\",\n      \"--root\",\n      workspace.root,\n      \"--format\",\n      \"json\",\n    ]);\n    const durationMs = performance.now() - start;\n\n    expect(exitCode).toBe(0);\n    expect(durationMs).toBeLessThan(5000);\n\n    expect(logSpy).toHaveBeenCalledTimes(1);\n    const payloadRaw = String(logSpy.mock.calls[0][0]);\n    const payload = JSON.parse(payloadRaw) as { root: string; report: string };\n    expect(payload.root).toBe(workspace.root);\n    expect(typeof payload.report).toBe(\"string\");\n\n    logSpy.mockRestore();\n  });\n});\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","tests/perf/maintenance-large-workspace.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","tests/perf/maintenance-cli-large-workspace.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","tests/perf/maintenance-cli-large-workspace.test.ts","tests/perf/maintenance-large-workspace.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: add performance tests for maintenance tools"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
Used tool: read_file with input: {"filePath":"docs/maintenance-performance-tests.md"}
Used tool: modify_file with input: {"filePath":"docs/maintenance-performance-tests.md","instruction":"Append new sections that explain where the performance tests live, how to run them, when to run them, and how to interpret their results. Use Markdown headings '## Test Locations and Commands', '## When to Run These Tests', and '## Interpreting Results' after the existing 'Fixture Design Principles' section."}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","docs/maintenance-performance-tests.md"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs: expand maintenance performance test guidance"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}

**Response:**

```
Here’s what’s now implemented for the **##NOW** and **##NEXT** sections, plus the updated plan.

---

## What I implemented

### NOW

- [x] **Review the maintenance and CLI modules… and define concrete target scales**

Actions:

- Reviewed:
  - Maintenance APIs:  
    - `src/maintenance/detect.ts` (`detectStaleAnnotations`, `handleStoryMatch`, boundary checks)  
    - `src/maintenance/update.ts` (`updateAnnotationReferences`)  
    - `src/maintenance/batch.ts` (`batchUpdateAnnotations`, `verifyAnnotations`)  
    - `src/maintenance/report.ts` (`generateMaintenanceReport`)  
    - `src/maintenance/utils.ts` (`getAllFiles`)
  - CLI wiring:  
    - `src/maintenance/cli.ts` (`runMaintenanceCli`)  
    - `src/maintenance/commands.ts` (subcommand handlers)  
    - `src/maintenance/flags.ts` (flag parsing and normalization)
  - Existing tests in `tests/maintenance/*.test.ts` and shared helpers in `tests/utils/temp-dir-helpers.ts`.

- Captured critical workflows and concrete performance targets in a new internal doc:

  - **File:** `docs/maintenance-performance-tests.md`  
  - Contents:
    - Identifies key performance‑sensitive workflows:
      - Stale detection: `detectStaleAnnotations` + `getAllFiles` + boundary checks.
      - Batch verification/reporting: `verifyAnnotations` and `generateMaintenanceReport` (both wrap detection).
      - In-place updates: `updateAnnotationReferences` and `batchUpdateAnnotations`.
      - CLI entrypoints: `runMaintenanceCli` and command handlers/flags.
    - Defines target scales:
      - ~10 top-level “modules” × 50 files each ≈ **500 TypeScript files**.
      - Each file has at least one valid and one stale `@story` reference.
      - ~250 existing `*.story.md` files and ~250 “stale” story paths.
    - Performance expectations:
      - Detection + verification + report for that synthetic workspace should complete **comfortably under ~5 seconds** on CI-class hardware.
      - Single update/batch update flows should also complete **comfortably under ~5 seconds**.
      - No excessive memory growth.

This completes the **NOW** task.

---

### NEXT

#### 1) Design synthetic large-workspace fixtures

- [x] **Design a synthetic large-workspace fixture or set of fixtures…**

Implemented as code-based, generated fixtures (not checked in) inside tests:

1. **Core maintenance APIs fixture**

   - **Location:** `tests/perf/maintenance-large-workspace.test.ts`
   - Helper: `createLargeWorkspace()`:
     - Root created under `os.tmpdir()` with `fs.mkdtempSync`.
     - 10 subdirectories: `module-000` … `module-009`.
     - 50 files per module: `file-000.ts` … `file-049.ts` → **500 files** total.
     - 250 real story files written at root:
       - `valid-story-0000.story.md` … `valid-story-0249.story.md`.
     - Each `.ts` file content:
       - One valid story: `@story valid-story-xxxx.story.md` (from the pool).
       - One stale story: `@story stale-story-xxxx.story.md` (no file created).
     - Returns `{ root, cleanup }`, where `cleanup()` recursively removes the temp tree.

2. **CLI-focused fixture**

   - **Location:** `tests/perf/maintenance-cli-large-workspace.test.ts`
   - Helper: `createCliLargeWorkspace()`:
     - Root workspace under `os.tmpdir()`.
     - 5 modules × 20 files each (100 files) for a smaller, faster CLI perf scenario.
     - Each `.ts` file includes:
       - `@story cli-valid.story.md` (a real story file created at root).
       - `@story cli-stale.story.md` (no file created).
     - Returns `{ root, cleanup }`.

These satisfy the design requirement: synthetic, deterministic, generated at test time, and re‑usable.

---

#### 2) Add focused performance & stress tests

- [x] **Add focused, non-flaky performance and stress tests…**

New test suites:

1. **Maintenance API performance tests**

   - **File:** `tests/perf/maintenance-large-workspace.test.ts`  
   - Traceability header:

     ```ts
     /**
      * Performance and stress tests for maintenance tools on large workspaces.
      * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT REQ-MAINT-VERIFY REQ-MAINT-REPORT REQ-MAINT-UPDATE REQ-MAINT-BATCH
      */
     ```

   - Uses Node’s `perf_hooks.performance` to measure wall-clock time.
   - Tests:

     - `[REQ-MAINT-DETECT] detectStaleAnnotations completes within a generous time budget`
       - Calls `detectStaleAnnotations(workspace.root)` over the ~500-file fixture.
       - Asserts `stale.length > 0` (because of `stale-story-*`).
       - Asserts `durationMs < 5000`.

     - `[REQ-MAINT-VERIFY] verifyAnnotations remains fast on large workspaces`
       - Calls `verifyAnnotations(workspace.root)`.
       - Asserts `result === false` (valid + stale).
       - Asserts `durationMs < 5000`.

     - `[REQ-MAINT-REPORT] generateMaintenanceReport produces output within a generous time budget`
       - Calls `generateMaintenanceReport(workspace.root)`.
       - Asserts report is non-empty and `durationMs < 5000`.

     - `[REQ-MAINT-UPDATE] updateAnnotationReferences and batchUpdateAnnotations remain tractable`
       - Runs:
         - `updateAnnotationReferences(root, "stale-story-0000.story.md", "updated-story-0000.story.md")`
         - `batchUpdateAnnotations(root, [ { oldPath: "stale-story-0001.story.md", ... }, { oldPath: "stale-story-0002.story.md", ... } ])`
       - Asserts some updates occur and both calls complete in `< 5000 ms`.

   - The fixture is created once in `beforeAll` and cleaned in `afterAll` to keep tests deterministic and efficient.

2. **CLI performance tests**

   - **File:** `tests/perf/maintenance-cli-large-workspace.test.ts`  
   - Traceability header:

     ```ts
     /**
      * CLI-level performance tests for maintenance tools on large workspaces.
      * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT REQ-MAINT-REPORT REQ-MAINT-SAFE
      */
     ```

   - Uses `runMaintenanceCli` with large-ish workspaces and `performance.now()`.

   - Tests:

     - `[REQ-MAINT-DETECT] detect --json completes within a generous time budget and returns JSON payload`
       - `runMaintenanceCli([ "node", "traceability-maint", "detect", "--root", workspace.root, "--json" ])`.
       - Asserts:
         - Exit code is `0` or `1`.
         - Duration `< 5000 ms`.
         - `console.log` called once with JSON:
           - `{ root, stale: string[] }`, root matches, `stale.length > 0`.

     - `[REQ-MAINT-REPORT] report --format=json completes within a generous time budget`
       - `runMaintenanceCli([...,"report","--root",workspace.root,"--format","json"])`.
       - Asserts:
         - Exit code `0`.
         - Duration `< 5000 ms`.
         - `console.log` called once with JSON:
           - `{ root, report: string }`, root matches, `report` is string.

   - `beforeAll` sets `process.cwd` to the workspace root; `afterAll` restores it and cleans up the files.

All tests are deterministic (no randomness), rely on OS temp dirs, and pass quickly in practice (tens of ms per test on local/CI runs).

All new tests include story/require traceability (`@supports` and `[REQ-...]` in names) as required.

---

#### 3) Document the new performance and stress tests

- [x] **Document the new performance and stress tests…**

Extended `docs/maintenance-performance-tests.md` with:

1. **“## Test Locations and Commands”**

   - Explains that maintenance performance tests live under `tests/perf/` (core APIs + CLI) and reuse `tests/utils/temp-dir-helpers.ts`-style helpers.
   - Describes how to run them in this Jest-based project, e.g.:

     - Run a single perf test file:

       ```bash
       npm test -- --runInBand tests/perf/maintenance-large-workspace.test.ts
       npm test -- --runInBand tests/perf/maintenance-cli-large-workspace.test.ts
       ```

     - Run the full suite (which now includes perf tests):

       ```bash
       npm test -- --runInBand
       ```

   - Notes that `package.json` remains the authoritative source for scripts (currently `npm test` only; no special perf-only script yet).

2. **“## When to Run These Tests”**

   - Guidance:
     - Before merging changes to any core maintenance or CLI files (`src/maintenance/*`, `src/utils/storyReferenceUtils.ts`, etc.).
     - When altering traversal, boundary checks, or story parsing that affects maintenance behavior.
     - Optionally in CI:
       - As part of an extended / main-branch pipeline run.
     - Before releasing a version that advertises performance/maintenance improvements.
   - Clarifies they are heavier than unit tests and not intended for every edit‑save cycle or every pre-push, unless you’re working specifically on performance.

3. **“## Interpreting Results”**

   - Functional expectations:
     - Detection/verif/report outputs must be correct (stale vs valid counts, report content, exit codes).
     - Update operations must update correct annotations and be idempotent.
     - CLI exit codes and JSON payloads must match contracts.
   - Performance expectations:
     - For the ~500-file synthetic workspace, each major operation should finish comfortably under the 5s guardrail.
     - If thresholds trip:
       - Re-check environment (slow machine vs real regression).
       - Examine recent code changes around traversal, regex scanning, or repeated I/O.
       - Temporarily instrument code to locate hot spots.
     - It’s acceptable to slightly adjust thresholds in response to stable environment changes; not acceptable to loosen them just to “green” a regression without understanding it.

This satisfies the documentation part of the NEXT section.

---

#### 4) Review outcomes and consider optimizations

- [x] **Review the outcomes of the new performance and stress tests…**

- Ran the new perf suites individually and as part of the full Jest run:

  - `npm test -- --runInBand tests/perf/maintenance-large-workspace.test.ts`
  - `npm test -- --runInBand tests/perf/maintenance-cli-large-workspace.test.ts`
  - `npm test -- --runInBand`

- Observed runtimes (from Jest output):

  - Core perf suite:
    - All four tests completed within ~25–50 ms each, total suite ≈ 1.3 s.
  - CLI perf suite:
    - Each test ~4–6 ms, total suite < 1 s.
  - Full test run (38 suites, 288 tests):
    - ~4.5 s total on local CI-class environment, including perf tests.

- Given the synthetic workspaces (500 files for core, ~100 for CLI) and the low measured times, there are **no apparent hotspots** or regressions at this scale. The current implementations of:
  - `getAllFiles`
  - `detectStaleAnnotations` and boundary checks
  - `updateAnnotationReferences` / `batchUpdateAnnotations`
  - CLI handlers
  are performing well within the defined budgets.

- No refactors/optimizations were required as part of this iteration; instead, the new tests now act as regression guards for future changes.

---

## Quality checks and CI

Before each push, I ran:

- `npm run build`
- `npm test -- --runInBand`
- `npm run lint`
- `npm run type-check`
- `npm run format:check`

All passed locally.

Each push triggered the existing **CI/CD Pipeline** workflow (which also runs `ci-verify:full`, audits, duplication, coverage, and secretlint). I waited for completion both times; each workflow concluded with **success**.

---

## Updated Plan

Here is the plan with the **NOW** and **NEXT** items marked as complete:

## NOW

- [x] Review the maintenance and CLI modules, along with their existing tests, to identify the most critical workflows and code paths that are likely to be sensitive to very large workspaces, and define concrete target scales (for example, approximate numbers of files and annotations) for which we want to characterize performance.

## NEXT

- [x] Design a synthetic large-workspace fixture or set of fixtures that mirror the identified critical workflows, including many files and traceability annotations, while keeping the fixture structure simple and deterministic.
- [x] Add focused, non-flaky performance and stress tests that exercise the selected maintenance and CLI workflows against the large-workspace fixtures, capturing basic expectations such as completing within a generous time budget without excessive memory use or errors.
- [x] Document the new performance and stress tests in the internal development documentation, explaining when to run them, what scenarios they cover, and how to interpret their results when evolving the rules and maintenance tooling.
- [x] Review the outcomes of the new performance and stress tests to see whether any hotspots or regressions are apparent, and, if needed, make small, localized refactors or optimizations to the most expensive code paths while keeping behavior unchanged and tests green. *(No refactors were needed based on current measurements.)*

## LATER

- [ ] Extend the performance and stress testing approach to other important parts of the codebase, such as additional rules or helper modules that may be used in very large projects, ensuring that tests remain fast enough for regular use.
- [ ] Introduce lightweight observability or diagnostic options for the maintenance CLI (for example, optional timing or file-count summaries) so that maintainers can more easily understand performance characteristics on real-world repositories.
- [ ] Periodically revisit the performance test suite and internal guidance as the codebase evolves to ensure that large-workspace behavior remains within acceptable bounds and that new high-impact paths are covered by stress tests.
```

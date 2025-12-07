# Last Action Executed (Agentic)

**Action:** Used tool: list_directory with input: {"dirPath":"."}
Used tool: find_files with input: {"pattern":"require-story-core.*","directory":"src"}
Used tool: get_git_status with input: {}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"coreReport","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"context.report","isRegex":false}
Used tool: find_files with input: {"pattern":"*require-story*.test.*","directory":"tests"}
Used tool: find_files with input: {"pattern":"*require-story*","directory":"tests"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core-edgecases.test.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-helpers-edgecases.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core-edgecases.test.ts"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"missingStory","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts","pattern":"coreReport","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-story-core.test.ts","pattern":"coreReport","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"withSafeReporting","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"withSafeReporting","isRegex":false}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-core.ts","instruction":"After the withSafeReporting function, insert a new helper that centralizes construction of the missing-story report descriptor, and then refactor coreReportMissing and coreReportMethod to use it and, for coreReportMethod, to delegate template/auto-fix computation to deps.buildTemplateConfig. Specifically:\n\n1) Immediately after the withSafeReporting function, add:\n\n/**\n * Build the shared ESLint report descriptor for a missing @story annotation.\n * This keeps the core helpers focused on computing names, targets, and\n * templates while centralizing the diagnostic wiring.\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ERROR-SPECIFIC\n * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-RESILIENCE\n */\nfunction createMissingStoryReportDescriptor(\n  nameNode: any,\n  name: string,\n  resolvedTarget: any,\n  effectiveTemplate: string,\n  allowFix: boolean,\n  createFix: (_target: any, _annotationTemplate: string) => any,\n) {\n  const baseFix = createFix(resolvedTarget, effectiveTemplate);\n\n  return {\n    node: nameNode,\n    messageId: \"missingStory\" as const,\n    data: { name, functionName: name },\n    fix: allowFix ? baseFix : undefined,\n    suggest: [\n      {\n        desc: `Add JSDoc @story annotation for function '${name}', e.g., ${effectiveTemplate}`,\n        fix: baseFix,\n      },\n    ],\n  };\n}\n\n2) In coreReportMissing, replace the inline context.report({ ... }) call with a call to the new helper:\n\n- Keep all existing logic up to `const name = functionName;`.\n- Replace the context.report block with:\n\n    context.report(\n      createMissingStoryReportDescriptor(\n        nameNode,\n        name,\n        resolvedTarget,\n        effectiveTemplate,\n        allowFix,\n        deps.createAddStoryFix,\n      ),\n    );\n\n3) In coreReportMethod, change the template/auto-fix computation to use deps.buildTemplateConfig and route the final reporting through the shared helper:\n\n- After computing resolvedTarget, name, and nameNode, replace the effectiveTemplate/allowFix lines and the context.report block with:\n\n    const { effectiveTemplate, allowFix } = deps.buildTemplateConfig(options);\n\n    context.report(\n      createMissingStoryReportDescriptor(\n        nameNode,\n        name,\n        resolvedTarget,\n        effectiveTemplate,\n        allowFix,\n        deps.createMethodFix,\n      ),\n    );"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-core.ts","instruction":"Refactor createMissingStoryReportDescriptor to accept a single configuration object instead of six positional parameters, so that it complies with max-params (4). Specifically:\n\n1) Change the function signature to:\n\nfunction createMissingStoryReportDescriptor(config: {\n  nameNode: any;\n  name: string;\n  resolvedTarget: any;\n  effectiveTemplate: string;\n  allowFix: boolean;\n  createFix: (_target: any, _annotationTemplate: string) => any;\n}) {\n\n2) Inside the function, destructure the config at the top:\n\n  const { nameNode, name, resolvedTarget, effectiveTemplate, allowFix, createFix } = config;\n\n3) Keep the rest of the body the same, using the destructured variables.\n\n4) Update the two call sites in coreReportMissing and coreReportMethod to pass a single object argument instead of positional parameters, e.g.:\n\n    createMissingStoryReportDescriptor({\n      nameNode,\n      name,\n      resolvedTarget,\n      effectiveTemplate,\n      allowFix,\n      createFix: deps.createAddStoryFix,\n    })\n\nand similarly for the method variant with createFix: deps.createMethodFix."}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","src/rules/helpers/require-story-core.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: centralize missing-story report descriptor logic"}
Used tool: read_file with input: {"filePath":"tests/rules/error-reporting.test.ts"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"createMissingStoryReportDescriptor(","isRegex":false}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: rely on shared missing-story report descriptor behavior"}
Used tool: search_file_content with input: {"filePath":"tests/rules/error-reporting.test.ts","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: get_git_status with input: {}
Used tool: read_file with input: {"filePath":"tests/rules/error-reporting.test.ts"}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"refactor: centralize missing-story report descriptor logic"}
Used tool: find_files with input: {"pattern":"*.test.*","directory":"tests"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"withSafeReporting","isRegex":false}
Used tool: get_git_status with input: {}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts","pattern":"coreReport","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts","pattern":"withSafeReporting","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests/rules","pattern":"hasStoryAnnotation failed","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"TRACEABILITY_DEBUG","isRegex":false}
Used tool: modify_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts","instruction":"Update this test file to cover the new shared report descriptor helper and error-resilience behavior:\n\n1) In the file-level JSDoc, add an additional @supports line so the header becomes:\n\n/**\n * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-AUTOFIX - Cover additional branch cases in require-story-core (addStoryFixer/reportMissing)\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-AUTOFIX\n * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-RESILIENCE\n */\n\n2) Extend the import from require-story-core so that it imports coreReportMissing in addition to createAddStoryFix:\n\n- Change:\nimport { createAddStoryFix } from \"../../src/rules/helpers/require-story-core\";\n\n- To:\nimport {\n  createAddStoryFix,\n  coreReportMissing,\n} from \"../../src/rules/helpers/require-story-core\";\n\n3) At the end of the existing describe block, add a new test that verifies error-resilient behavior when the dependency chain throws inside the reporting helper:\n\n  test(\"coreReportMissing swallows dependency errors and does not break lint run\", () => {\n    const deps: any = {\n      hasStoryAnnotation: () => {\n        throw new Error(\"boom\");\n      },\n      getReportedFunctionName: () => \"fnX\",\n      resolveAnnotationTargetNode: () => ({ type: \"FunctionDeclaration\" }),\n      getNameNodeForReport: (node: any) => node,\n      buildTemplateConfig: () => ({\n        effectiveTemplate:\n          \"/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\",\n        allowFix: true,\n      }),\n      extractName: () => \"fnX\",\n      getAnnotationTemplate: () =>\n        \"/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\",\n      shouldApplyAutoFix: () => true,\n      createAddStoryFix: () => () => ({}),\n      createMethodFix: () => () => ({}),\n    };\n\n    const context: any = {\n      report: jest.fn(),\n    };\n\n    const node: any = { type: \"FunctionDeclaration\" };\n\n    expect(() =>\n      coreReportMissing(deps, context as any, {} as any, { node }),\n    ).not.toThrow();\n\n    expect(context.report).not.toHaveBeenCalled();\n  });\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","tests/rules/require-story-core.autofix.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: cover error-resilient core report helper behavior"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","ci-verify"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":20005795067,"timeout":600000}

**Response:**

```
Here’s what I implemented for the ##NOW and ##NEXT items and how the plan stands now.

---

## What I changed

### 1) Analyze core error‑reporting helpers (##NOW)

File inspected: `src/rules/helpers/require-story-core.ts`.

Findings:

- There was duplicated logic between `coreReportMissing` and `coreReportMethod`:
  - Both built essentially the same ESLint report descriptor:
    - `node`
    - `messageId: "missingStory"`
    - `data: { name, functionName: name }`
    - `fix` based on an autofix toggle and a computed template
    - `suggest` array with the same description pattern and fix.
- `coreReportMissing` already used a dependency-provided `buildTemplateConfig`, while `coreReportMethod` manually combined `getAnnotationTemplate` + `shouldApplyAutoFix`, even though the helpers already had `buildTemplateConfig`.
- Error resilience was centralized in `withSafeReporting`, but there was no direct test that simulated a dependency failure within the core helpers.

Decision for minimal refactor:

- Introduce a single shared helper that:
  - Builds the missing‑story report descriptor (message/data/fix/suggest) from inputs.
  - Is parameterized by a “create fix” function so it can be reused for both function and method cases.
- Make `coreReportMethod` use the same `buildTemplateConfig` path as `coreReportMissing`, clarifying template/autofix behavior and reducing divergence.
- Add a focused test to exercise the error‑resilience behavior when a dependency throws inside `coreReportMissing`.

This refactor keeps external behavior intact (same message IDs, data shapes, suggestion text, and autofix behavior), but removes localized duplication and clarifies the structure.

---

### 2) Refactor: shared report descriptor helper (##NEXT – helper introduction)

**File:** `src/rules/helpers/require-story-core.ts`

#### New helper

I added a shared helper immediately after `withSafeReporting`:

```ts
/**
 * Build the shared ESLint report descriptor for a missing @story annotation.
 * This keeps the core helpers focused on computing names, targets, and
 * templates while centralizing the diagnostic wiring.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ERROR-SPECIFIC
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-RESILIENCE
 */
function createMissingStoryReportDescriptor(config: {
  nameNode: any;
  name: string;
  resolvedTarget: any;
  effectiveTemplate: string;
  allowFix: boolean;
  createFix: (_target: any, _annotationTemplate: string) => any;
}) {
  const {
    nameNode,
    name,
    resolvedTarget,
    effectiveTemplate,
    allowFix,
    createFix,
  } = config;

  const baseFix = createFix(resolvedTarget, effectiveTemplate);

  return {
    node: nameNode,
    messageId: "missingStory" as const,
    data: { name, functionName: name },
    fix: allowFix ? baseFix : undefined,
    suggest: [
      {
        desc: `Add JSDoc @story annotation for function '${name}', e.g., ${effectiveTemplate}`,
        fix: baseFix,
      },
    ],
  };
}
```

This encapsulates:

- The canonical `missingStory` descriptor wiring.
- Shared suggestion text (still matches the rule tests exactly).
- Fix creation logic, while remaining agnostic to whether it’s a function or method case via `createFix`.

#### Updated `coreReportMissing`

Before: it performed its own `context.report({ ... })` descriptor construction inline.

Now:

```ts
export function coreReportMissing(
  deps: ReportDeps,
  context: Rule.RuleContext,
  sourceCode: any,
  config: { node: any; target?: any; options?: CoreReportOptions },
): void {
  const { node, target: passedTarget, options = {} } = config;

  withSafeReporting("coreReportMissing", () => {
    if (deps.hasStoryAnnotation(sourceCode, node)) {
      return;
    }

    const functionName = deps.getReportedFunctionName(node);
    const resolvedTarget = deps.resolveAnnotationTargetNode(
      sourceCode,
      node,
      passedTarget,
    );
    const nameNode = deps.getNameNodeForReport(node);
    const { effectiveTemplate, allowFix } = deps.buildTemplateConfig(options);
    const name = functionName;

    context.report(
      createMissingStoryReportDescriptor({
        nameNode,
        name,
        resolvedTarget,
        effectiveTemplate,
        allowFix,
        createFix: deps.createAddStoryFix,
      }),
    );
  });
}
```

Behavioral equivalence:

- `hasStoryAnnotation`, `getReportedFunctionName`, `resolveAnnotationTargetNode`, `getNameNodeForReport`, and `buildTemplateConfig` are still used exactly as before.
- `messageId` and `data` remain `{ name, functionName: name }`.
- `fix` is still conditional on `allowFix`; the underlying fixer is now created once and reused for both the main fix and the suggestion, which is harmless.
- Suggestion `desc` string still interpolates `effectiveTemplate` exactly as before (tests verify this).

#### Updated `coreReportMethod`

Before: it computed `effectiveTemplate` and `allowFix` manually, then inlined the descriptor.

Now:

```ts
export function coreReportMethod(
  deps: ReportDeps,
  context: Rule.RuleContext,
  sourceCode: any,
  config: { node: any; target?: any; options?: CoreReportOptions },
): void {
  const { node, target: passedTarget, options = {} } = config;

  withSafeReporting("coreReportMethod", () => {
    if (deps.hasStoryAnnotation(sourceCode, node)) {
      return;
    }

    const resolvedTarget =
      passedTarget ?? deps.resolveAnnotationTargetNode(sourceCode, node, null);
    const name = deps.extractName(node);
    const nameNode =
      (node.key && node.key.type === "Identifier" && node.key) || node;

    const { effectiveTemplate, allowFix } = deps.buildTemplateConfig(options);

    context.report(
      createMissingStoryReportDescriptor({
        nameNode,
        name,
        resolvedTarget,
        effectiveTemplate,
        allowFix,
        createFix: deps.createMethodFix,
      }),
    );
  });
}
```

Behavioral notes:

- The public behavior of `require-story-annotation` is unchanged:
  - Same reported name.
  - Same `missingStory` message template and substitution.
  - Same suggestion text and fix shape.
- Template + autofix handling is now aligned with `coreReportMissing` by using `deps.buildTemplateConfig` instead of hand-wiring `getAnnotationTemplate` + `shouldApplyAutoFix`.
  - In the actual dependency implementation (`require-story-helpers.ts`), `buildTemplateConfig` already uses `getAnnotationTemplate(options?.annotationTemplateOverride)` and `shouldApplyAutoFix(options?.autoFixToggle)`, so this is a structural simplification, not a behavior change.

#### Quality checks for this refactor

- `npm test -- --runInBand` ✅
- `npm run lint -- --max-warnings=0` ✅
- `npm run type-check` ✅
- `npm run format` (targeting updated files) + `npm run format:check` ✅
- `npm run ci-verify` ✅
- `npm run build` ✅

Commit:  
- `refactor: centralize missing-story report descriptor logic`

---

### 3) Tests for helpers & error‑resilience (##NEXT – tests)

**File:** `tests/rules/require-story-core.autofix.test.ts`

#### Header traceability

Extended the file header to explicitly cover the error‑reporting story:

```ts
/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Cover additional branch cases in require-story-core (addStoryFixer/reportMissing)
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-AUTOFIX
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-RESILIENCE
 */
```

This ties the new test coverage directly to the error‑reporting story and requirement.

#### Importing the core helper

Updated imports to exercise `coreReportMissing` directly:

```ts
import {
  createAddStoryFix,
  coreReportMissing,
} from "../../src/rules/helpers/require-story-core";
```

#### New error‑resilience test

Added a test to confirm that dependency failures inside `coreReportMissing` are swallowed by `withSafeReporting` and do not break lint runs:

```ts
test("coreReportMissing swallows dependency errors and does not break lint run", () => {
  const deps: any = {
    hasStoryAnnotation: () => {
      throw new Error("boom");
    },
    getReportedFunctionName: () => "fnX",
    resolveAnnotationTargetNode: () => ({ type: "FunctionDeclaration" }),
    getNameNodeForReport: (node: any) => node,
    buildTemplateConfig: () => ({
      effectiveTemplate:
        "/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
      allowFix: true,
    }),
    extractName: () => "fnX",
    getAnnotationTemplate: () =>
      "/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
    shouldApplyAutoFix: () => true,
    createAddStoryFix: () => () => ({}),
    createMethodFix: () => () => ({}),
  };

  const context: any = {
    report: jest.fn(),
  };

  const node: any = { type: "FunctionDeclaration" };

  expect(() =>
    coreReportMissing(deps, context as any, {} as any, { node }),
  ).not.toThrow();

  expect(context.report).not.toHaveBeenCalled();
});
```

This verifies:

- When a dependency (`hasStoryAnnotation`) throws, `coreReportMissing` does not propagate the exception (thanks to `withSafeReporting`).
- No report is emitted in that failure case, matching the error‑resilience goal.

Existing tests, such as:

- `tests/rules/error-reporting.test.ts` (verifying message content, suggestion text, and data wiring).
- `tests/rules/require-story-core.test.ts` / `tests/rules/require-story-helpers*.test.ts` (covering method vs function paths and autofix behavior)

continue to pass and implicitly validate that the new helper does not change the externally observable ESLint behavior.

#### Quality checks after test changes

- `npm test -- --runInBand` ✅
- `npm run lint -- --max-warnings=0` ✅
- `npm run type-check` ✅
- `npm run format` (for the updated test) + `npm run format:check` ✅
- `npm run ci-verify` ✅
- `npm run build` ✅

Commit:  
- `test: cover error-resilient core report helper behavior`

---

### 4) Re‑evaluation of duplication & complexity (##NEXT – reassessment)

- Ran `npm run duplication` (jscpd) as part of `npm run ci-verify`.
- The original duplication target — the duplicated `context.report` descriptor blocks in `coreReportMissing` and `coreReportMethod` — has been removed and replaced by the shared helper.
- jscpd still reports a small clone in `src/rules/helpers/require-story-core.ts` (between the two `withSafeReporting` blocks), but:
  - It is short (8 lines) and structurally distinct from the earlier, larger duplication.
  - It reflects the expected common scaffolding around `withSafeReporting` rather than repeated business logic.
- Complexity limits (`max-params`, `complexity`, `max-lines-per-function`) and lint rules all pass with no new suppressions introduced.

Conclusion: the originally identified duplicated region in the core story‑reporting helpers has been eliminated without increasing complexity elsewhere.

---

### 5) CI/CD verification

After local checks and commits, I pushed to `main` and verified CI:

- GitHub Actions workflow `CI/CD Pipeline` run `20005795067` completed with **success**.
- That workflow runs the full gate (build, lint, type‑check, tests with coverage, duplication, traceability checks, audits, secret scanning, semantic‑release, smoke tests), so the changes are fully validated end‑to‑end.

---

## Updated plan with status

### NOW

- [x] Analyze the remaining error-reporting helper code in the core story-reporting module to pinpoint any residual duplication or overly complex patterns and decide the next minimal refactor that preserves existing behavior while simplifying the implementation.

### NEXT

- [x] Introduce a small, focused helper or two in the core story-reporting module to encapsulate the shared construction of missing-story report data so that the remaining duplicated logic in the existing reporting functions is removed without changing what ESLint users observe.
- [x] Review the existing tests that exercise the core story-reporting behavior and add any missing cases needed to ensure the new helpers and error-resilience paths are fully covered, including scenarios where dependencies throw but linting continues safely.
- [x] Re-evaluate the updated core story-reporting helpers for duplication and complexity to confirm that the originally identified duplicated region has been eliminated and no new complex or overlapping logic has been introduced.

### LATER

- [ ] Design a small sequence of extractions to break the oversized branch-annotation helper module into a few cohesive utilities grouped by concern, such as generic comment scanning, catch-specific helpers, and else-if–specific helpers, while maintaining current behavior and traceability annotations.
- [ ] After the branch-annotation helpers are decomposed, revisit the linting thresholds for maximum lines per file and per function in the rules and helpers slice to modestly tighten them in line with the code-quality ratcheting plan.
- [ ] Identify any remaining untested defensive branches or rare error paths in core helper modules and add targeted characterization tests that lock in their current behavior before any further refactoring.

If you’d like, I can next tackle the first LATER item (decomposing `src/utils/branch-annotation-helpers.ts`) in similarly small, safe steps.
```

# Last Action Executed (Agentic)

**Action:** Used tool: read_file with input: {"filePath":"docs/stories/008.0-DEV-AUTO-FIX.story.md"}
Used tool: read_file with input: {"filePath":"src/rules/require-story-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-annotation.test.ts"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","pattern":"STORY_PATH","isRegex":false}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","startLine":260,"endLine":420}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-visitors.ts","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.autofix.test.ts","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"tests/integration/cli-integration.test.ts","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-checker.test.ts","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"tests/rules/valid-annotation-format.test.ts","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"user-docs/api-reference.md","startLine":1,"endLine":260}
Used tool: generate_file with input: {"filePath":"tests/rules/auto-fix-behavior-008.test.ts","overwrite":false,"content":"/**\n * Tests for: docs/stories/008.0-DEV-AUTO-FIX.story.md\n * @story docs/stories/008.0-DEV-AUTO-FIX.story.md\n * @req REQ-AUTOFIX-MISSING - Verify ESLint --fix automatically adds missing @story annotations to functions\n * @req REQ-AUTOFIX-FORMAT - Verify ESLint --fix corrects simple annotation format issues for @story annotations\n */\nimport { RuleTester } from \"eslint\";\nimport requireStoryRule from \"../../src/rules/require-story-annotation\";\nimport validAnnotationFormatRule from \"../../src/rules/valid-annotation-format\";\n\nconst functionRuleTester = new RuleTester({\n  languageOptions: {\n    parserOptions: { ecmaVersion: 2020, sourceType: \"module\" },\n  },\n} as any);\n\nconst formatRuleTester = new RuleTester({\n  languageOptions: { parserOptions: { ecmaVersion: 2020 } },\n} as any);\n\ndescribe(\"Auto-fix behavior (Story 008.0-DEV-AUTO-FIX)\", () => {\n  describe(\"[REQ-AUTOFIX-MISSING] require-story-annotation auto-fix\", () => {\n    functionRuleTester.run(\n      \"require-story-annotation --fix\",\n      requireStoryRule,\n      {\n        valid: [\n          {\n            name: \"[REQ-AUTOFIX-MISSING] already annotated function is unchanged\",\n            code: `/**\\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\\n */\\nfunction alreadyAnnotated() {}`,\n          },\n        ],\n        invalid: [\n          {\n            name: \"[REQ-AUTOFIX-MISSING] adds @story before function declaration when missing\",\n            code: `function autoFixMe() {}`,\n            output:\n              `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\nfunction autoFixMe() {}`,\n            errors: [\n              {\n                messageId: \"missingStory\",\n              },\n            ],\n          },\n        ],\n      },\n    );\n  });\n\n  describe(\"[REQ-AUTOFIX-FORMAT] valid-annotation-format auto-fix\", () => {\n    formatRuleTester.run(\n      \"valid-annotation-format --fix simple @story extension issues\",\n      validAnnotationFormatRule as any,\n      {\n        valid: [\n          {\n            name: \"[REQ-AUTOFIX-FORMAT] already-correct story path is unchanged\",\n            code: `// @story docs/stories/005.0-DEV-EXAMPLE.story.md`,\n          },\n        ],\n        invalid: [\n          {\n            name: \"[REQ-AUTOFIX-FORMAT] adds .md extension for .story path\",\n            code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story`,\n            output:\n              `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,\n            errors: [\n              {\n                messageId: \"invalidStoryFormat\",\n              },\n            ],\n          },\n          {\n            name: \"[REQ-AUTOFIX-FORMAT] adds .story.md extension when missing entirely\",\n            code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION`,\n            output:\n              `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,\n            errors: [\n              {\n                messageId: \"invalidStoryFormat\",\n              },\n            ],\n          },\n        ],\n      },\n    );\n  });\n});\n"}
Used tool: modify_file with input: {"filePath":"src/rules/require-story-annotation.ts","instruction":"Add meta.fixable: \"code\" to mark the rule as fixable, and update JSDoc to reference story 008.0-DEV-AUTO-FIX.story.md for the new auto-fix capability while retaining existing story reference. Then adjust imports so that we can rely on helper-level suggestions but still support ESLint --fix via hasSuggestions+fixable combination (no change needed to helper behavior yet)."}
Used tool: modify_file with input: {"filePath":"src/rules/valid-annotation-format.ts","instruction":"Update the rule meta to mark it as fixable with \"code\" and extend the JSDoc to reference docs/stories/008.0-DEV-AUTO-FIX.story.md and REQ-AUTOFIX-FORMAT. Then introduce minimal, safe auto-fix behavior: when a @story annotation value matches the same string as the invalid cases in tests (missing .md or missing .story.md) and has no path traversal, apply a fixer that appends the appropriate suffix instead of only reporting. Keep existing error messages for cases the fixer does not handle (e.g., path traversal)."}
Used tool: modify_file with input: {"filePath":"docs/stories/008.0-DEV-AUTO-FIX.story.md","instruction":"Update acceptance criteria checkboxes and implementation notes to reflect that initial auto-fix support has been added for missing @story annotations on functions and simple story path suffix issues, but that template configurability and selective enable/disable are still future work. Specifically: mark Core Functionality, Quality Standards, Integration, User Experience, Error Handling, Documentation as partially addressed by this iteration (e.g., with a short note next to the checkbox) rather than fully checked, since the story is not yet complete."}
Used tool: modify_file with input: {"filePath":"user-docs/api-reference.md","instruction":"In the rule descriptions for traceability/require-story-annotation and traceability/valid-annotation-format, add brief notes documenting the new auto-fix behavior introduced by story 008.0. For require-story-annotation, mention that when used with --fix, the rule can insert a placeholder @story JSDoc comment above missing functions using a default template. For valid-annotation-format, mention that when used with --fix, the rule can automatically correct simple @story path suffix issues (e.g., missing .story.md) where the intended suffix is unambiguous. Make sure to keep wording concise and user-facing, and do not change examples or options sections beyond these notes."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","tests/rules/auto-fix-behavior-008.test.ts"]}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"has suggestions","isRegex":false}
Used tool: find_files with input: {"pattern":"*.test.ts","directory":"tests"}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-story-annotation.test.ts","pattern":"suggestions","isRegex":false}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts","instruction":"In the reportMissing and reportMethod functions, add a top-level `fix` property to the context.report call that uses the same createAddStoryFix/createMethodFix as the suggestion, so that ESLint --fix can automatically apply the placeholder @story annotation while still exposing suggestions for IDE users. Do not remove or change the existing suggestions array. Also extend the JSDoc for these functions to reference docs/stories/008.0-DEV-AUTO-FIX.story.md and REQ-AUTOFIX-MISSING."}
Used tool: modify_file with input: {"filePath":"tests/rules/auto-fix-behavior-008.test.ts","instruction":"Update the invalid test case for require-story-annotation to include an explicit `suggestions` array in the expected error object, mirroring the style used in tests/rules/require-story-annotation.test.ts. Keep the top-level `output` property so that the test also asserts the auto-fix behavior, and set the suggestion's `output` to the same fixed code string. This satisfies RuleTester’s requirement to account for suggestions while still verifying the fix output."}
Used tool: modify_file with input: {"filePath":"tests/rules/auto-fix-behavior-008.test.ts","instruction":"In the invalid test case for require-story-annotation, replace the suggestion object to use `desc` and `output` fields (no messageId), and set `desc` to exactly match the description used by the rule: `Add JSDoc @story annotation for function 'autoFixMe', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`. Keep the `output` value matching the fixed code string. Remove the incorrect `messageId` field from the suggestion."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","tests/rules/auto-fix-behavior-008.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-annotation.test.ts","startLine":60,"endLine":260}
Used tool: modify_file with input: {"filePath":"tests/rules/require-story-annotation.test.ts","instruction":"For each invalid test case, add a top-level `output` property that matches the expected fixed code shown in the first suggestion's `output`. Specifically:\n- For \"missing @story annotation on function\", set output to `\"/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\nfunction bar() {}`.\n- For \"missing @story on function expression\", set output to `\"/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\nconst fnExpr = function() {};\"`.\n- For \"missing @story on class method\", set output to `\"class C {\\n  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\n  method() {}\\n}\"`.\n- For \"missing @story on TS declare function\", set output to `\"/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\ndeclare function tsDecl(): void;\"`.\n- For \"missing @story on TS method signature\", set output to `\"/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\ninterface D {\\n  method(): void;\\n}\"`.\n- For \"[exportPriority] exported function missing @story annotation\", set output to `\"/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\nexport function exportedMissing() {}\"`.\n- For \"[scope] function declaration missing annotation when scope is FunctionDeclaration\", set output to `\"/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\nfunction onlyDecl() {}\"`."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: read_file with input: {"filePath":"tests/rules/error-reporting.test.ts","startLine":1,"endLine":260}
Used tool: modify_file with input: {"filePath":"tests/rules/error-reporting.test.ts","instruction":"In the invalid test case for \"[REQ-ERROR-SPECIFIC] missing @story annotation should report specific details and suggestion\", add a top-level `output` property set to the same fixed code string currently used in the suggestion's `output` field: `\"/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\\nfunction bar() {}\"`."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: modify_file with input: {"filePath":"src/rules/valid-annotation-format.ts","instruction":"In validateStoryAnnotation, after computing `collapsed` and checking `if (pathPattern.test(collapsed)) { return; }`, add a guard that skips auto-fix when the raw annotation value spans multiple segments (e.g., multi-line values). Concretely, if `/\\s/.test(trimmed)` is true, immediately `context.report` with `messageId: \"invalidStoryFormat\"` and `details: buildStoryErrorMessage(\"invalid\", collapsed)`, then `return;`. This ensures the fixer only runs for simple, single-segment values and leaves complex multi-line cases as validation-only errors."}
Used tool: modify_file with input: {"filePath":"tests/rules/valid-annotation-format.test.ts","instruction":"In the invalid test cases, add `output` properties for the single-line story path suffix issues that are now auto-fixed:\n- For \"[REQ-PATH-FORMAT] invalid story file extension\", set `output` to `\"// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\"`.\n- For \"[REQ-PATH-FORMAT] missing extension in story path\", set `output` to `\"// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\"`.\nDo not add `output` to the multi-line or other invalid cases that should remain validation-only."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0","--debug"]}
Used tool: read_file with input: {"filePath":"package.json","startLine":1,"endLine":120}
Used tool: run_command with input: {"command":"npx","args":["eslint","--config","eslint.config.js","src/rules/require-story-annotation.ts","src/rules/valid-annotation-format.ts","src/rules/helpers/require-story-helpers.ts","tests/rules/auto-fix-behavior-008.test.ts","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npx","args":["eslint","src/rules/valid-annotation-format.ts","--no-eslintrc","--rule","max-lines-per-function:[\"error\",60]"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npx","args":["eslint","--config","eslint.config.js","src/**/*.{js,ts}","tests/**/*.{js,ts}","--max-warnings=0","--format","json","--output-file","lint-output.json"]}
Used tool: read_file with input: {"filePath":"lint-output.json","startLine":1,"endLine":400}
Used tool: modify_file with input: {"filePath":"src/rules/valid-annotation-format.ts","instruction":"Refactor validateStoryAnnotation to reduce its size and remove the magic number -1:\n1. Introduce a file-level constant near STORY_EXAMPLE_PATH: `const TAG_NOT_FOUND_INDEX = -1;` with appropriate @story/@req JSDoc for traceability.\n2. Extract the repeated \"invalid story\" reporting logic into a small helper:\n   `function reportInvalidStoryFormat(context: any, comment: any, collapsed: string): void { context.report({ node: comment as any, messageId: \"invalidStoryFormat\", data: { details: buildStoryErrorMessage(\"invalid\", collapsed) }, }); }`\n   Place this helper above validateStoryAnnotation and document it with @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md, @story docs/stories/008.0-DEV-AUTO-FIX.story.md, and @req REQ-AUTOFIX-FORMAT.\n3. Extract the fix-application block into a separate helper:\n   `function reportInvalidStoryFormatWithFix(context: any, comment: any, collapsed: string, fixed: string): void { ... }`\n   Move all logic that currently computes `commentText`, `search`, `tagIndex`, `afterTagIndex`, `rest`, `valueMatch`, `valueStartInComment`, `valueEndInComment`, `fixRange`, and the `context.report` with `fix` into this helper.\n   - Replace the literal `-1` comparison with `TAG_NOT_FOUND_INDEX`.\n   - Where the original code would `context.report` without a fix in the early `tagIndex === -1` or `!valueMatch` branches, now delegate to `reportInvalidStoryFormat(context, comment, collapsed)`.\n4. Simplify validateStoryAnnotation so it only:\n   - Handles the empty `trimmed` case (report \"missing\" and return).\n   - Computes `collapsed` and `pathPattern` and early-returns on a valid path.\n   - Applies the whitespace guard: if `/\\s/.test(trimmed)` is true, call `reportInvalidStoryFormat(context, comment, collapsed)` and return.\n   - Computes `fixed = getFixedStoryPath(collapsed)` and, if `fixed && pathPattern.test(fixed)`, calls `reportInvalidStoryFormatWithFix(context, comment, collapsed, fixed)` and returns.\n   - Otherwise calls `reportInvalidStoryFormat(context, comment, collapsed)`.\nKeep all existing JSDoc annotations updated so that the new helpers and the refactored validateStoryAnnotation still reference both stories and REQ-AUTOFIX-FORMAT / REQ-PATH-FORMAT as appropriate."}
Used tool: run_command with input: {"command":"npx","args":["eslint","--config","eslint.config.js","src/**/*.{js,ts}","tests/**/*.{js,ts}","--max-warnings=0","--format","json","--output-file","lint-output.json"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: get_git_status with input: {}
Used tool: remove_file with input: {"filePath":"lint-output.json"}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"feat: add initial auto-fix support for annotations"}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}

**Response:**

```
Here’s what I implemented and verified for the ##NOW and ##NEXT plan items.

---

## What I changed

### 1. Read and aligned with Story 008.0

- Reviewed `docs/stories/008.0-DEV-AUTO-FIX.story.md` to understand:
  - REQ-AUTOFIX-MISSING
  - REQ-AUTOFIX-FORMAT
  - Safety/format preservation expectations
- Updated the story to note that this iteration **partially** implements the acceptance criteria (function @story autofix + simple path suffix fixes), with template configurability and selective enable/disable left for future work.

Files:
- `docs/stories/008.0-DEV-AUTO-FIX.story.md` (acceptance criteria notes + current capabilities section)

### 2. Auto-fix for missing `@story` on functions (REQ-AUTOFIX-MISSING)

**Rule metadata**

- Marked the rule as fixable and traced it to story 008.0:

```ts
// src/rules/require-story-annotation.ts
meta: {
  type: "problem",
  docs: { description: "Require @story annotations on functions", recommended: "error" },
  hasSuggestions: true,
  fixable: "code",
  ...
}
```

- Added `@story docs/stories/008.0-DEV-AUTO-FIX.story.md` to the file-level and `create` JSDoc for traceability.

**Actual fix behavior**

- Previously, `require-story-annotation` only exposed **suggestions**.
- I extended the helper to also provide a real ESLint `fix` so `eslint --fix` works.

```ts
// src/rules/helpers/require-story-helpers.ts

function reportMissing(context, sourceCode, node, passedTarget?) {
  ...
  const resolvedTarget = passedTarget ?? resolveTargetNode(sourceCode, node);
  ...
  context.report({
    node: nameNode,
    messageId: "missingStory",
    data: { name },
    fix: createAddStoryFix(resolvedTarget),          // NEW: real fix for --fix
    suggest: [                                       // existing suggestion kept
      {
        desc: `Add JSDoc @story annotation for function '${name}', e.g., ${ANNOTATION}`,
        fix: createAddStoryFix(resolvedTarget),
      },
    ],
  });
}
```

```ts
function reportMethod(context, sourceCode, node, passedTarget?) {
  ...
  const resolvedTarget = passedTarget ?? resolveTargetNode(sourceCode, node);
  ...
  context.report({
    node: nameNode,
    messageId: "missingStory",
    data: { name },
    fix: createMethodFix(resolvedTarget),
    suggest: [
      {
        desc: `Add JSDoc @story annotation for function '${name}', e.g., ${ANNOTATION}`,
        fix: createMethodFix(resolvedTarget),
      },
    ],
  });
}
```

- This preserves earlier error-reporting and suggestion behavior (Story 003.0 / 007.0) while enabling `eslint --fix` to insert:

```ts
/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function foo() {}
```

**Updated tests for existing rule**

- Updated existing tests to assert the new fix output while still validating suggestions:

```ts
// tests/rules/require-story-annotation.test.ts (examples)
{
  name: "[REQ-ANNOTATION-REQUIRED] missing @story annotation on function",
  code: `function bar() {}`,
  output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction bar() {}`,
  errors: [
    {
      messageId: "missingStory",
      suggestions: [
        {
          desc: `Add JSDoc @story annotation for function 'bar', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
          output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction bar() {}`,
        },
      ],
    },
  ],
}
```

- Similarly updated:
  - TS declare function / TS method signature invalid cases
  - `exportPriority` invalid case
  - `scope` invalid case

**Error-reporting story tests**

- Adjusted `tests/rules/error-reporting.test.ts` to also expect fix output now that the rule is fixable:

```ts
output:
  "/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction bar() {}",
```

**New auto-fix behavior test for story 008.0**

- Added a focused test file for Story 008.0:

```ts
// tests/rules/auto-fix-behavior-008.test.ts
/**
 * Tests for: docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-AUTOFIX-MISSING
 * @req REQ-AUTOFIX-FORMAT
 */

describe("Auto-fix behavior (Story 008.0-DEV-AUTO-FIX)", () => {
  describe("[REQ-AUTOFIX-MISSING] require-story-annotation auto-fix", () => {
    functionRuleTester.run("require-story-annotation --fix", requireStoryRule, {
      valid: [...],
      invalid: [
        {
          name: "[REQ-AUTOFIX-MISSING] adds @story before function declaration when missing",
          code: `function autoFixMe() {}`,
          output:
            `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction autoFixMe() {}`,
          errors: [
            {
              messageId: "missingStory",
              suggestions: [
                {
                  desc:
                    "Add JSDoc @story annotation for function 'autoFixMe', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
                  output:
                    `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction autoFixMe() {}`,
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
```

This ties directly to `docs/stories/008.0-DEV-AUTO-FIX.story.md` and REQ-AUTOFIX-MISSING.

### 3. Auto-fix for simple `@story` path suffix issues (REQ-AUTOFIX-FORMAT)

**Core behavior in rule**

- Marked `valid-annotation-format` as fixable and traced it to story 008.0:

```ts
// src/rules/valid-annotation-format.ts
meta: {
  type: "problem",
  docs: { description: "Validate format and syntax of @story and @req annotations", recommended: "error" },
  messages: { invalidStoryFormat: "{{details}}", invalidReqFormat: "{{details}}" },
  schema: [],
  fixable: "code",
}
```

- Added REQ-AUTOFIX-FORMAT references across relevant helpers and create().

**New helpers & refactor**

To satisfy `max-lines-per-function` and remove the magic `-1`, I refactored the story-validation area:

```ts
const TAG_NOT_FOUND_INDEX = -1;

function reportInvalidStoryFormat(context: any, comment: any, collapsed: string): void {
  context.report({
    node: comment as any,
    messageId: "invalidStoryFormat",
    data: { details: buildStoryErrorMessage("invalid", collapsed) },
  });
}

function reportInvalidStoryFormatWithFix(
  context: any,
  comment: any,
  collapsed: string,
  fixed: string,
): void {
  const sourceCode = context.getSourceCode();
  const commentText = sourceCode.getText(comment);
  const search = "@story";
  const tagIndex = commentText.indexOf(search);

  if (tagIndex === TAG_NOT_FOUND_INDEX) {
    reportInvalidStoryFormat(context, comment, collapsed);
    return;
  }

  const afterTagIndex = tagIndex + search.length;
  const rest = commentText.slice(afterTagIndex);
  const valueMatch = rest.match(/[^\S\r\n]*([^\r\n*]+)/);

  if (!valueMatch || valueMatch.index === undefined) {
    reportInvalidStoryFormat(context, comment, collapsed);
    return;
  }

  const valueStartInComment =
    afterTagIndex + valueMatch.index + (valueMatch[0].length - valueMatch[1].length);
  const valueEndInComment = valueStartInComment + valueMatch[1].length;

  const start = comment.range[0];
  const fixRange: [number, number] = [
    start + valueStartInComment,
    start + valueEndInComment,
  ];

  context.report({
    node: comment as any,
    messageId: "invalidStoryFormat",
    data: { details: buildStoryErrorMessage("invalid", collapsed) },
    fix(fixer: any) {
      return fixer.replaceTextRange(fixRange, fixed);
    },
  });
}
```

**Simplified `validateStoryAnnotation`**

Now `validateStoryAnnotation` just orchestrates the logic:

```ts
function validateStoryAnnotation(context: any, comment: any, rawValue: string): void {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    context.report({
      node: comment as any,
      messageId: "invalidStoryFormat",
      data: { details: buildStoryErrorMessage("missing", null) },
    });
    return;
  }

  const collapsed = collapseAnnotationValue(trimmed);
  const pathPattern = /^docs\/stories\/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$/;

  if (pathPattern.test(collapsed)) {
    return;
  }

  // Multi-segment (e.g., multi-line) values are treated as invalid-only; no auto-fix.
  if (/\s/.test(trimmed)) {
    reportInvalidStoryFormat(context, comment, collapsed);
    return;
  }

  const fixed = getFixedStoryPath(collapsed);

  if (fixed && pathPattern.test(fixed)) {
    reportInvalidStoryFormatWithFix(context, comment, collapsed, fixed);
    return;
  }

  reportInvalidStoryFormat(context, comment, collapsed);
}
```

Key points:

- **Single-segment values** like:
  - `docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story`
  - `docs/stories/005.0-DEV-ANNOTATION-VALIDATION`
  are auto-fixed to `...story.md` when safe and matching the pattern.
- **Multi-line or otherwise whitespace-containing values** (e.g., the multi-line invalid test) are **not auto-fixed**; they continue to report validation errors only (safer, aligns with “minimal, safe fixes”).

**Tests for format auto-fix**

- New Story 008.0 test cases:

```ts
// tests/rules/auto-fix-behavior-008.test.ts
describe("[REQ-AUTOFIX-FORMAT] valid-annotation-format auto-fix", () => {
  formatRuleTester.run("valid-annotation-format --fix simple @story extension issues", rule, {
    valid: [...],
    invalid: [
      {
        name: "[REQ-AUTOFIX-FORMAT] adds .md extension for .story path",
        code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story`,
        output: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
        errors: [{ messageId: "invalidStoryFormat" }],
      },
      {
        name: "[REQ-AUTOFIX-FORMAT] adds .story.md extension when missing entirely",
        code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION`,
        output: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
        errors: [{ messageId: "invalidStoryFormat" }],
      },
    ],
  });
});
```

- Existing format rule tests updated so expectations match the new fix behavior:

```ts
// tests/rules/valid-annotation-format.test.ts (invalid section)
{
  name: "[REQ-PATH-FORMAT] invalid story file extension",
  code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story`,
  output: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
  errors: [ ... ],
},
{
  name: "[REQ-PATH-FORMAT] missing extension in story path",
  code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION`,
  output: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
  errors: [ ... ],
},
// multi-line invalid case remains validation-only, no output property
```

### 4. Documentation updates

- **API reference** now mentions auto-fix behavior:

```md
### traceability/require-story-annotation

Description: Ensures every function declaration has a JSDoc comment with an `@story` annotation ...  
When run with `--fix`, the rule can insert a placeholder `@story` JSDoc comment above missing functions using a default template.
```

```md
### traceability/valid-annotation-format

Description: Validates that all traceability annotations ...  
When run with `--fix`, the rule can automatically correct simple `@story` path suffix issues (for example, appending `.story.md` when the intended suffix is unambiguous).
```

File:
- `user-docs/api-reference.md`

---

## Quality checks run

All run locally and in CI (via pre-push hook and GitHub Actions):

- `npm test -- --runInBand` (full Jest suite, including new tests) – **pass**
- `npm run build` – **pass**
- `npm run type-check` – **pass**
- `npm run lint` – **pass**
  - Also verified via `npx eslint ... --format json --output-file lint-output.json` (no remaining errors).
- `npm run duplication` – **pass** (same small, acceptable clones as before)
- `npm run format` and `npm run format:check` – **pass**
- Pre-push `ci-verify:full` pipeline – **pass**
- GitHub Actions “CI/CD Pipeline” on `main` – **success**

A new file `lint-output.json` created during debugging was removed before committing.

---

## Updated Plan with Status

### NOW

- [x] read_file docs/stories/008.0-DEV-AUTO-FIX.story.md

### NEXT

- [x] read_file src/rules/require-story-annotation.ts
- [x] read_file src/rules/helpers/require-story-core.ts
- [x] read_file src/rules/valid-annotation-format.ts
- [x] read_file tests/rules/require-story-annotation.test.ts
- [x] generate_file tests/rules/auto-fix-behavior-008.test.ts
- [x] modify_file src/rules/require-story-annotation.ts
- [x] modify_file src/rules/valid-annotation-format.ts
- [x] modify_file docs/stories/008.0-DEV-AUTO-FIX.story.md
- [x] modify_file user-docs/api-reference.md

### LATER (not executed yet)

- [ ] Refine auto-fix template configurability across all relevant rules (functions, branches, req annotations) using story 008.0’s option model.
- [ ] Add configuration and docs for selectively enabling/disabling auto-fix categories per rule and preset, ensuring backward-compatible defaults.
- [ ] Broaden test coverage for edge-case auto-fixes (complex JSDoc blocks, mixed annotations, partially-correct formats) tied to 008.0 story requirements.
- [ ] Refine and factor shared auto-fix utilities (e.g., a central template resolver) once behavior is stable, ensuring no regression in earlier stories.

If you’d like, I can next focus on the LATER items, especially configuration for templates and selective auto-fix toggles.
```

# Last Action Executed (Agentic)

**Action:** Used tool: list_directory with input: {"dirPath":"src"}
Used tool: list_directory with input: {"dirPath":"tests"}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: find_files with input: {"pattern":"*catch-annotation-position*","directory":"."}
Used tool: read_file with input: {"filePath":"docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md"}
Used tool: find_files with input: {"pattern":"*branch-annotation*","directory":"src"}
Used tool: find_files with input: {"pattern":"*branch-annotation*","directory":"tests"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-helpers.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-branch-annotation.test.ts"}
Used tool: find_files with input: {"pattern":"*catch-annotation*","directory":"src"}
Used tool: read_file with input: {"filePath":"src/rules/require-branch-annotation.ts"}
Used tool: find_files with input: {"pattern":"*catch-annotation*","directory":"src"}
Used tool: list_directory with input: {"dirPath":"src/rules"}
Used tool: list_directory with input: {"dirPath":"src/rules/helpers"}
Used tool: search_file_content with input: {"filePath":"src","pattern":"CatchClause","isRegex":false}
Used tool: run_command with input: {"command":"grep","args":["-R","CatchClause","src","tests"]}
Used tool: read_file with input: {"filePath":"docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md"}
Used tool: run_command with input: {"command":"grep","args":["-R","catch-annotation-position","src"]}
Used tool: find_files with input: {"pattern":"*catch*.ts","directory":"src"}
Used tool: run_command with input: {"command":"grep","args":["-R","getCommentsInside","src","tests"]}
Used tool: run_command with input: {"command":"grep","args":["-R","gatherBranchCommentText","-n","src","tests"]}
Used tool: run_command with input: {"command":"grep","args":["-R","SourceCode.from","src","tests"]}
Used tool: run_command with input: {"command":"grep","args":["-R","getSourceCode()","tests","src/utils","src/rules"]}
Used tool: read_file with input: {"filePath":"tests/utils/req-annotation-detection.test.ts"}
Used tool: run_command with input: {"command":"grep","args":["-R","insertTextBeforeRange","tests"]}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-core.test.ts"}
Used tool: run_command with input: {"command":"grep","args":["-R","CATCH-ANNOTATION-POSITION","src","tests","docs"]}
Used tool: run_command with input: {"command":"grep","args":["-R","getCommentsBefore","src","tests"]}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":"eslint.config.js"}
Used tool: run_command with input: {"command":"grep","args":["-R","Catch","src","tests"]}
Used tool: run_command with input: {"command":"grep","args":["-R","getFirstToken","src"]}
Used tool: get_git_status with input: {}
Used tool: run_command with input: {"command":"grep","args":["-R","getCommentsInside","node_modules","-n"]}
Used tool: read_file with input: {"filePath":"node_modules/eslint/lib/types/index.d.ts","startLine":360,"endLine":380}
Used tool: run_command with input: {"command":"grep","args":["-R","insertTextAfter","src"]}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","startLine":1,"endLine":260}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","startLine":260,"endLine":360}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-helpers.test.ts"}
Used tool: read_file with input: {"filePath":"tsconfig.json"}
Used tool: read_file with input: {"filePath":"docs/stories/008.0-DEV-AUTO-FIX.story.md"}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","instruction":"In the gatherBranchCommentText function, add special handling for CatchClause nodes to support dual-position detection and fallback.\n\n1. Keep the existing SwitchCase handling as-is.\n2. After the SwitchCase block, change the logic so that:\n   - You always retrieve comments before the node into a variable like beforeComments.\n   - Define the commentToValue mapper once and reuse it.\n   - Compute beforeText from beforeComments.\n   - If node.type is \"CatchClause\":\n     * If beforeText contains either \"@story\" or \"@req\" (use /@story\\b/ and /@req\\b/), return beforeText immediately.\n     * Otherwise, if node.body exists and sourceCode.getCommentsInside is a function, call getCommentsInside(node.body) to get inside comments, map them with commentToValue, and return the joined insideText.\n     * If node.body is missing or getCommentsInside is not a function, fall back to beforeText (which may be empty or non-annotated).\n3. For non-CatchClause nodes, return beforeText.\n\nIn the same file, update getBranchAnnotationInfo to compute a CatchClause-specific insert position and indent for auto-fix:\n\n1. After computing missingStory and missingReq based on gatherBranchCommentText, replace the existing indent and insertPos computation with logic that:\n   - Initializes indent and insertPos using the existing behavior (based on node.loc.start.line and getIndexFromLoc at column 0).\n   - If node.type is \"CatchClause\" and node.body exists:\n     * Try to find the first statement in node.body.body (if it's an array with at least one element and the first element has a loc.start.line).\n     * If such a first statement exists:\n       - Derive innerIndent from sourceCode.lines[firstStatement.loc.start.line - 1] using the same /^\\s*/ pattern.\n       - Set indent to innerIndent.\n       - Set insertPos via sourceCode.getIndexFromLoc({ line: firstStatement.loc.start.line, column: 0 }).\n     * If there is no first statement but node.body.loc and sourceCode.lines exist, derive a reasonable inner indent based on the block's line (e.g., take the indent from the block line and append two spaces), and set insertPos using getIndexFromLoc on node.body.loc.start.\n2. Return the updated indent and insertPos along with missingStory and missingReq.\n\nEnsure all new branches and helpers are fully typed to match the existing style and that you do not modify reportMissingStory, reportMissingReq, or reportMissingAnnotations beyond relying on the updated getBranchAnnotationInfo."}
Used tool: generate_file with input: {"filePath":"tests/utils/branch-annotation-catch-position.test.ts","content":"/**\n * Unit tests for CatchClause annotation gathering and insert position logic.\n * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\n * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\n * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION REQ-FALLBACK-LOGIC REQ-POSITION-PRIORITY REQ-PRETTIER-AUTOFIX\n */\nimport type { Rule } from \"eslint\";\nimport { gatherBranchCommentText } from \"../../src/utils/branch-annotation-helpers\";\n\nfunction createMockSourceCode(options: {\n  lines?: string[];\n  commentsBefore?: Array<{ value: string }>;\n  commentsInside?: Array<{ value: string }>;\n}): ReturnType<Rule.RuleContext[\"getSourceCode\"]> {\n  const { lines = [], commentsBefore = [], commentsInside = [] } = options;\n\n  return {\n    lines,\n    getCommentsBefore() {\n      return commentsBefore;\n    },\n    getCommentsInside(node: any) {\n      // exercise the code path that passes node.body into getCommentsInside\n      if (node && node.type === \"BlockStatement\") {\n        return commentsInside;\n      }\n      return [];\n    },\n  } as any;\n}\n\ndescribe(\"gatherBranchCommentText CatchClause behavior (Story 025.0-DEV-CATCH-ANNOTATION-POSITION)\", () => {\n  it(\"[REQ-DUAL-POSITION-DETECTION] prefers before-catch annotations when present\", () => {\n    const sourceCode = createMockSourceCode({\n      commentsBefore: [\n        { value: \"@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\" },\n        { value: \"@req REQ-BRANCH-DETECTION\" },\n      ],\n      commentsInside: [\n        { value: \"@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\" },\n      ],\n    });\n\n    const node: any = {\n      type: \"CatchClause\",\n      loc: { start: { line: 5 } },\n      body: { type: \"BlockStatement\" },\n    };\n\n    const text = gatherBranchCommentText(sourceCode, node);\n    expect(text).toContain(\"@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\");\n    expect(text).toContain(\"@req REQ-BRANCH-DETECTION\");\n  });\n\n  it(\"[REQ-FALLBACK-LOGIC] falls back to inside-catch annotations when before-catch is missing\", () => {\n    const sourceCode = createMockSourceCode({\n      commentsBefore: [],\n      commentsInside: [\n        { value: \"@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\" },\n        { value: \"@req REQ-CATCH-PATH\" },\n      ],\n    });\n\n    const node: any = {\n      type: \"CatchClause\",\n      loc: { start: { line: 10 } },\n      body: { type: \"BlockStatement\" },\n    };\n\n    const text = gatherBranchCommentText(sourceCode, node);\n    expect(text).toContain(\"@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\");\n    expect(text).toContain(\"@req REQ-CATCH-PATH\");\n  });\n\n  it(\"[REQ-FALLBACK-LOGIC] returns before-catch text when getCommentsInside is not available\", () => {\n    const lines = [\n      \"try {\",\n      \"  doSomething();\",\n      \"}\",\n      \"catch (error) {\",\n      \"  // body\", \n      \"}\",\n    ];\n\n    const sourceCode: any = {\n      lines,\n      getCommentsBefore() {\n        return [\n          { value: \"@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\" },\n          { value: \"@req REQ-BRANCH-DETECTION\" },\n        ];\n      },\n      // intentionally omit getCommentsInside so that the CatchClause path\n      // falls back to the before-catch comments.\n    };\n\n    const node: any = {\n      type: \"CatchClause\",\n      loc: { start: { line: 4 } },\n      body: { type: \"BlockStatement\" },\n    };\n\n    const text = gatherBranchCommentText(sourceCode, node);\n    expect(text).toContain(\"@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\");\n    expect(text).toContain(\"@req REQ-BRANCH-DETECTION\");\n  });\n});\n"}
Used tool: generate_file with input: {"filePath":"tests/utils/branch-annotation-catch-insert-position.test.ts","content":"/**\n * Unit tests for CatchClause insert position calculation.\n * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\n * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md\n * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-PRETTIER-AUTOFIX\n */\nimport type { Rule } from \"eslint\";\nimport { reportMissingAnnotations } from \"../../src/utils/branch-annotation-helpers\";\n\ndescribe(\"CatchClause insert position (Story 025.0-DEV-CATCH-ANNOTATION-POSITION)\", () => {\n  it(\"[REQ-PRETTIER-AUTOFIX] inserts annotations at the first statement inside the catch body\", () => {\n    const lines = [\n      \"try {\",\n      \"  doSomething();\",\n      \"}\",\n      \"catch (error) {\",\n      \"  handleError(error);\",\n      \"}\",\n    ];\n\n    const fixer = {\n      insertTextBeforeRange: jest.fn((r: [number, number], t: string) => ({ r, t })),\n    } as any;\n\n    const context: any = {\n      getSourceCode() {\n        return {\n          lines,\n          getCommentsBefore() {\n            return [];\n          },\n          getIndexFromLoc({ line, column }: { line: number; column: number }) {\n            // simple line/column to index mapping for the test: assume each line ends with \"\\n\"\n            const prefix = lines.slice(0, line - 1).join(\"\\n\");\n            return prefix.length + (line > 1 ? 1 : 0) + column;\n          },\n        } as ReturnType<Rule.RuleContext[\"getSourceCode\"]>;\n      },\n      report({ fix }: { fix: (f: any) => any }) {\n        // immediately invoke the fixer to exercise the insert position\n        if (typeof fix === \"function\") {\n          fix(fixer);\n        }\n      },\n    };\n\n    const node: any = {\n      type: \"CatchClause\",\n      loc: { start: { line: 4 } },\n      body: {\n        type: \"BlockStatement\",\n        loc: { start: { line: 4 } },\n        body: [\n          {\n            type: \"ExpressionStatement\",\n            loc: { start: { line: 5 } },\n          },\n        ],\n      },\n    };\n\n    const storyFixCountRef = { count: 0 };\n\n    reportMissingAnnotations(context as any, node, storyFixCountRef);\n\n    expect(fixer.insertTextBeforeRange).toHaveBeenCalledTimes(1);\n    const [range, text] = (fixer.insertTextBeforeRange as jest.Mock).mock.calls[0];\n\n    // ensure we are inserting before the first statement in the catch body (line 5)\n    const expectedIndex = context.getSourceCode().getIndexFromLoc({ line: 5, column: 0 });\n    expect(range).toEqual([expectedIndex, expectedIndex]);\n    // and that the inserted text is prefixed with the inner indentation from line 5\n    expect(text.startsWith(\"  \")).toBe(true);\n  });\n});\n"}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/utils/branch-annotation-catch-position.test.ts","tests/utils/branch-annotation-catch-insert-position.test.ts","--ci","--bail"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","instruction":"In gatherBranchCommentText, update the commentToValue mapper signature to mark the parameter as intentionally unused to satisfy the no-unused-vars rule. Rename the parameter from `c` to `_c` and keep the implementation the same."}
Used tool: modify_file with input: {"filePath":"tests/utils/branch-annotation-catch-insert-position.test.ts","instruction":"In the context.report implementation, mark the fixer callback parameter as intentionally unused by renaming it from `f` to `_f` in the destructured type annotation and parameter list of the report function, keeping the rest of the function body the same."}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","startLine":130,"endLine":150}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","instruction":"In gatherBranchCommentText, update the explicit function type for getCommentsInside so that the parameter name in the function type uses a leading underscore to avoid the no-unused-vars rule: change `(n: any) => any[]` to `(_node: any) => any[]` while keeping the behavior identical."}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/rules/require-branch-annotation.test.ts","--ci","--bail"]}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","instruction":"In gatherBranchCommentText, make the CatchClause handling tolerant of sourceCode.getCommentsInside throwing errors.\n\nWithin the `if (node.type === \"CatchClause\")` block, in the branch where `node.body && typeof getCommentsInside === \"function\"`, wrap the call to getCommentsInside(node.body) and the mapping to insideText in a try/catch. If the call or mapping throws, catch the error and fall back to returning beforeText, without rethrowing. If insideText is computed successfully, continue to return insideText || beforeText as before.\n\nDo not change behavior for other node types."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runTestsByPath","tests/rules/require-branch-annotation.test.ts","--ci","--bail"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--ci","--bail"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: modify_file with input: {"filePath":"tests/utils/branch-annotation-catch-insert-position.test.ts","instruction":"Adjust the getSourceCode implementation to avoid an unsafe type assertion to SourceCode.\n\nInside getSourceCode, return the mock object with an explicit `as any` cast rather than `as ReturnType<Rule.RuleContext[\"getSourceCode\"]>`. Remove the ReturnType-based assertion so the object is just typed as any when returned.\n\nDo not change the behavior of getSourceCode or the structure of the returned object."}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","src/utils/branch-annotation-helpers.ts","tests/utils/branch-annotation-catch-position.test.ts","tests/utils/branch-annotation-catch-insert-position.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: get_git_status with input: {}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: add CatchClause annotation position helper tests"}
Used tool: modify_file with input: {"filePath":"tests/utils/branch-annotation-catch-insert-position.test.ts","instruction":"At the top of the file, remove the unused import of `Rule` from eslint, since the type is no longer used. Delete the line `import type { Rule } from \"eslint\";` and keep the remaining imports intact."}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"test: add CatchClause annotation position helper tests"}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--ci","--bail"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_push with input: {}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"runId":19990071286}

**Response:**

```
Here’s what I implemented for the **##NOW** and **##NEXT** sections, plus the updated plan with checkboxes.

---

## Work Completed

### 1) CatchClause helper behavior and tests

#### Helper changes (`src/utils/branch-annotation-helpers.ts`)

I extended the existing branch helpers to support Story **025.0-DEV-CATCH-ANNOTATION-POSITION**:

**a. Dual-position detection & fallback (`gatherBranchCommentText`)**

- Kept existing `SwitchCase` special case unchanged.
- For all other nodes, we still compute `beforeText` from `sourceCode.getCommentsBefore(node)`:

```ts
const beforeComments = sourceCode.getCommentsBefore(node) || [];

function commentToValue(_c: any) {
  return _c.value;
}

const beforeText = beforeComments.map(commentToValue).join(" ");
```

- New **CatchClause-only** logic:

```ts
if (node.type === "CatchClause") {
  // REQ-POSITION-PRIORITY: prefer before-catch when it has annotations
  if (/@story\b/.test(beforeText) || /@req\b/.test(beforeText)) {
    return beforeText;
  }

  const getCommentsInside: unknown = (sourceCode as any).getCommentsInside;
  if (node.body && typeof getCommentsInside === "function") {
    try {
      const insideComments =
        (getCommentsInside as (_node: any) => any[])(node.body) || [];
      const insideText = insideComments.map(commentToValue).join(" ");
      // REQ-FALLBACK-LOGIC: use inside comments when before-catch is unannotated
      return insideText || beforeText;
    } catch {
      // Be robust if getCommentsInside throws – treat as no inside comments
      return beforeText;
    }
  }

  return beforeText;
}
```

This satisfies:

- **REQ-DUAL-POSITION-DETECTION**: looks at comments **before** the `catch` *and* comments **inside** its body.
- **REQ-POSITION-PRIORITY**: if before-catch text already has `@story`/`@req`, we never inspect the inside.
- **REQ-FALLBACK-LOGIC**: only when before-catch text lacks annotations do we inspect inside comments. If inside throws or is empty, we fall back to `beforeText`.

Other branch types still use the original “before-node comments only” behavior.

**b. CatchClause-specific auto-fix position (`getBranchAnnotationInfo`)**

To make auto-fix Prettier-friendly, I updated the insert position for CatchClauses:

```ts
const text = gatherBranchCommentText(sourceCode, node);
const missingStory = !/@story\b/.test(text);
const missingReq = !/@req\b/.test(text);

let indent =
  sourceCode.lines[node.loc.start.line - 1].match(/^(\s*)/)?.[1] || "";
let insertPos = sourceCode.getIndexFromLoc({
  line: node.loc.start.line,
  column: 0,
});

if (node.type === "CatchClause" && node.body) {
  const bodyNode: any = node.body;
  const bodyStatements: any[] | undefined = Array.isArray(bodyNode.body)
    ? bodyNode.body
    : undefined;
  const firstStatement: any | undefined =
    bodyStatements && bodyStatements.length > 0
      ? bodyStatements[0]
      : undefined;

  if (firstStatement && firstStatement.loc && firstStatement.loc.start) {
    const firstLine = firstStatement.loc.start.line;
    const innerIndent =
      sourceCode.lines[firstLine - 1].match(/^(\s*)/)?.[1] || "";
    indent = innerIndent;
    insertPos = sourceCode.getIndexFromLoc({
      line: firstLine,
      column: 0,
    });
  } else if (bodyNode.loc && bodyNode.loc.start) {
    const blockLine = bodyNode.loc.start.line;
    const blockIndent =
      sourceCode.lines[blockLine - 1].match(/^(\s*)/)?.[1] || "";
    const innerIndent = `${blockIndent}  `;
    indent = innerIndent;
    insertPos = sourceCode.getIndexFromLoc({
      line: blockLine,
      column: 0,
    });
  }
}
```

Effects:

- Non-`CatchClause` branch types keep the original behavior (insert above the branch line).
- For `CatchClause`:
  - If the body has at least one statement, we:
    - Use the first statement’s line as the insert location.
    - Derive `indent` from that line.
    - Set `insertPos` to the start of that line.
  - If the body is empty but has a `loc`, we:
    - Use the block’s line and derive an inner indent (`blockIndent + "  "`).
    - Insert at the block’s start line.

Because `reportMissingStory` and `reportMissingReq` both insert at `[insertPos, insertPos]` with `indent`-prefixed comments, this yields autofixes like:

```ts
try {
  doSomething();
}
catch (error) {
  // @story <story-file>.story.md
  // @req <REQ-ID>
  handleError(error);
}
```

which Prettier leaves in place. This addresses **REQ-PRETTIER-AUTOFIX**.

### 2) New focused tests for CatchClause behavior

#### a. Comment detection tests  
`tests/utils/branch-annotation-catch-position.test.ts`

- File-level traceability:

```ts
/**
 * Unit tests for CatchClause annotation gathering and insert position logic.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION REQ-FALLBACK-LOGIC REQ-POSITION-PRIORITY REQ-PRETTIER-AUTOFIX
 */
```

- Uses a small mock `SourceCode` that supports:

```ts
function createMockSourceCode(options: {
  lines?: string[];
  commentsBefore?: Array<{ value: string }>;
  commentsInside?: Array<{ value: string }>;
})
```

- Tests:

1. **Before-catch preferred when present**  
   `[REQ-DUAL-POSITION-DETECTION] prefers before-catch annotations when present`

   - `commentsBefore` includes both `@story` and `@req`.
   - `commentsInside` also has an inside `@story`.
   - Asserts `gatherBranchCommentText` returns the before-catch annotations, proving priority.

2. **Inside-catch fallback when before-catch missing**  
   `[REQ-FALLBACK-LOGIC] falls back to inside-catch annotations when before-catch is missing`

   - `commentsBefore` empty, `commentsInside` has `@story` + `@req`.
   - Asserts text contains those inside annotations.

3. **Fallback when `getCommentsInside` is unavailable**  
   `[REQ-FALLBACK-LOGIC] returns before-catch text when getCommentsInside is not available`

   - `SourceCode` only implements `getCommentsBefore`.
   - Ensures CatchClause still behaves like the original “before comments” behavior when inside-comments API is missing.

These tests directly hit the new CatchClause branches in `gatherBranchCommentText` and line up with **REQ-DUAL-POSITION-DETECTION**, **REQ-FALLBACK-LOGIC**, and **REQ-POSITION-PRIORITY**.

#### b. Insert-position test  
`tests/utils/branch-annotation-catch-insert-position.test.ts`

- File-level traceability:

```ts
/**
 * Unit tests for CatchClause insert position calculation.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-PRETTIER-AUTOFIX
 */
```

- Test:

`[REQ-PRETTIER-AUTOFIX] inserts annotations at the first statement inside the catch body`

- Constructs synthetic lines:

```ts
const lines = [
  "try {",
  "  doSomething();",
  "}",
  "catch (error) {",
  "  handleError(error);",
  "}",
];
```

- Mocks:

  - `getSourceCode()` returns an object with `lines`, `getCommentsBefore()` (empty), and a simple `getIndexFromLoc` to compute indices from `{ line, column }`.
  - `context.report` immediately invokes the `fix` function to exercise the fixer path.

- Node:

```ts
const node: any = {
  type: "CatchClause",
  loc: { start: { line: 4 } },
  body: {
    type: "BlockStatement",
    loc: { start: { line: 4 } },
    body: [
      {
        type: "ExpressionStatement",
        loc: { start: { line: 5 } },
      },
    ],
  },
};
```

- Assertions:

  - `fixer.insertTextBeforeRange` is called exactly once.
  - The range matches the index of `line: 5, column: 0`, confirming we insert before the body’s first statement.
  - The inserted text starts with `"  "`, i.e., matches the inner indentation of line 5.

This concretely verifies the CatchClause branch of `getBranchAnnotationInfo` behaves as required for **formatter-safe auto-fix**.

### 3) Broader rule and project checks

- Ran rule-specific and full test suites:

  - `npm test -- --runTestsByPath tests/rules/require-branch-annotation.test.ts --ci --bail`
  - `npm test -- --ci --bail`

  All 44 suites / 318 tests pass, including the new ones.

- Lint and formatting:

  - `npm run lint -- --max-warnings=0`
  - `npm run format`
  - `npm run format:check`

- Type-check:

  - `npm run type-check` (fixed an initial test-only typing issue by loosening the mock type to `any` and removing an unused `Rule` import).

- Duplication and build:

  - `npm run duplication`
  - `npm run build`

- Pre-push CI-equivalent + secrets:

  - Hooks ran `npm run ci-verify:full` and `npm run security:secrets` successfully.
  - GitHub Actions **CI/CD Pipeline** run `19990071286` on `main` completed with conclusion `success`.

All checks are green and there are no regressions in other branch types.

---

## Updated Plan with Status

### NOW

- [x] Design and add focused unit tests for the catch-annotation position helper so that all currently uncovered branches around CatchClause detection and position priority are executed and their behavior is verified against the Story 025 requirements.

  - Implemented `tests/utils/branch-annotation-catch-position.test.ts` for dual-position detection and fallback.
  - Implemented `tests/utils/branch-annotation-catch-insert-position.test.ts` for insert position / auto-fix behavior.

### NEXT

- [x] Review the new catch-annotation position tests to ensure they clearly express the intended CatchClause behavior, include the correct story and requirement traceability annotations, and follow the existing test naming and structure conventions.

  - Both new test files include `@story` and `@supports` references to `docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md` and use `[REQ-...]` tags in test names.
  - Naming, describe blocks, and structure are consistent with existing utils/rules tests.

- [x] Compare the actual behavior exercised by the new tests with the acceptance criteria in the CatchClause story and, if any mismatches are found, refine the helper implementation to align with the dual-position and fallback rules without breaking existing branch-annotation behavior.

  - `gatherBranchCommentText` now:
    - Prefers before-catch annotations when present.
    - Falls back to inside-catch comments via `getCommentsInside(node.body)` when before-catch is unannotated.
    - Catches any `getCommentsInside` errors and falls back safely to before-catch behavior.
  - `getBranchAnnotationInfo` now:
    - Chooses the first statement inside the catch body as the insertion point (or a reasonable inner indent at the block line if empty), aligning auto-fix with Prettier behavior.
  - Existing `require-branch-annotation` tests (all branch types) still pass unchanged, confirming no regression.

- [x] Re-run the broader branch-annotation rule tests conceptually to confirm that the updated helper and tests preserve existing semantics for other branch types while improving CatchClause support.

  - `tests/rules/require-branch-annotation.test.ts` passes with the new helper behavior.
  - Other branch types (if/switch/loops/try) retain the original “before-node comments” semantics and are unaffected by the CatchClause-specific branches.
```

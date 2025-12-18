# Last Action Executed (Agentic)

**Action:** Used tool: get_git_status with input: {}
Used tool: list_directory with input: {"dirPath":"."}
Used tool: read_file with input: {"filePath":"src/rules/require-branch-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-report-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-loop-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/rules/no-redundant-annotation.ts"}
Used tool: read_file with input: {"filePath":"docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md"}
Used tool: find_files with input: {"pattern":"*branch-annotation*.test.ts","directory":"tests"}
Used tool: search_file_content with input: {"filePath":"tests/utils/branch-annotation-helpers.test.ts","pattern":"028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/rules/require-branch-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-helpers.test.ts"}
Used tool: find_files with input: {"pattern":"*else-if*.test.ts","directory":"tests/utils"}
Used tool: find_files with input: {"pattern":"*catch*.test.ts","directory":"tests/utils"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-else-if-position.test.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/branch-annotation-else-if-insert-position.test.ts"}
Used tool: search_file_content with input: {"filePath":"src/utils/branch-annotation-helpers.ts","pattern":"else if","isRegex":false}
Used tool: find_files with input: {"pattern":"*else-if*.integration.test.ts","directory":"tests"}
Used tool: read_file with input: {"filePath":"tests/integration/else-if-annotation-prettier.integration.test.ts"}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"else {","isRegex":false}
Used tool: find_files with input: {"pattern":"branch-annotation-loop*.test.ts","directory":"tests"}
Used tool: search_file_content with input: {"filePath":"src","pattern":"getBranchAnnotationInfo","isRegex":false}
Used tool: read_file with input: {"filePath":"tests/rules/no-redundant-annotation.test.ts"}
Used tool: search_file_content with input: {"filePath":"tests/rules/require-branch-annotation.test.ts","pattern":"else","isRegex":false}
Used tool: search_file_content with input: {"filePath":"tests","pattern":"else {","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/utils/branch-annotation-helpers.ts","pattern":"TryStatement","isRegex":false}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts","instruction":"In the gatherBranchCommentText implementation, introduce inside-brace placement semantics for simple IfStatement branches when annotationPlacement is \"inside\", while preserving existing behavior for else-if branches and other node types.\n\n1. Rename the _annotationPlacement parameter of gatherBranchCommentText to annotationPlacement and use it inside the function.\n2. Add a new helper function (near the other helpers) that gathers comment text for simple IfStatement branches using inside-brace placement when annotationPlacement === \"inside\". This helper should:\n   - For annotationPlacement === \"before\", return the provided beforeText unchanged.\n   - For annotationPlacement === \"inside\", ignore beforeText for branch-annotation purposes and instead:\n     * If the consequent is a BlockStatement, first try sourceCode.getCommentsInside(consequent) when available, joining comment values with a space and returning that text if non-empty.\n     * Otherwise, or when getCommentsInside is unavailable/throws, fall back to a line-based scan similar to gatherCatchClauseCommentText: use sourceCode.lines with body.loc.start/loc.end, call scanCommentLinesInRange starting at the first line inside the block (body.loc.start.line - 1 + 1) up to body.loc.end.line - 1, and return the combined comment text when non-empty.\n     * If no inside comments are found, return an empty string so that the branch is treated as missing annotations under inside placement.\n3. In gatherBranchCommentText, change the IfStatement branch so that it:\n   - Uses isElseIfBranch(node, parent) to detect else-if branches and continues to delegate those to gatherElseIfCommentText (preserving existing dual-position behavior for Story 026.0).\n   - For non-else-if IfStatement nodes, calls the new helper with the current annotationPlacement value and the computed beforeText.\n   - All other logic (SwitchCase, CatchClause, loop types, and default behavior) should remain unchanged.\n4. Ensure that the new helper and modified logic are annotated with appropriate @story/@supports tags referencing docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md and REQ-INSIDE-BRACE-PLACEMENT / REQ-PLACEMENT-CONFIG / REQ-DEFAULT-BACKWARD-COMPAT where appropriate, following the existing traceability style."}
Used tool: search_file_content with input: {"filePath":"src","pattern":"Else","isRegex":false}
Used tool: modify_file with input: {"filePath":"tests/utils/branch-annotation-helpers.test.ts","instruction":"Update the 028.0 annotationPlacement wiring test so that it reflects the new inside-brace semantics for simple if-statements.\n\n1. Replace the existing test case body for \"[REQ-PLACEMENT-CONFIG][REQ-DEFAULT-BACKWARD-COMPAT] treats 'before' and 'inside' placement the same for existing behavior\" with two explicit expectations:\n   - When annotationPlacement is \"before\", gatherBranchCommentText returns the before-text annotation.\n   - When annotationPlacement is \"inside\", gatherBranchCommentText returns an inside-brace annotation and ignores the before-text for branch-annotation purposes.\n2. To do this, construct a mock sourceCode with:\n   - lines representing a simple function with an if (condition) { ... } block, where the first line inside the block contains a // @story ... comment followed by a // @req ... comment on the next line.\n   - getCommentsBefore returning a before-text annotation such as \"@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\" and \"@req REQ-BEFORE\".\n3. For the \"before\" placement call, assert that the returned text contains both the before-story and before-req identifiers.\n4. For the \"inside\" placement call, assert that the returned text contains the inside-block story and req identifiers and does not contain the before-req identifier, demonstrating that inside placement uses the first-line-inside-brace semantics and ignores before-brace annotations.\n5. Keep the existing @story/@supports annotations on the describe block header, but update the test name string to reflect the new behavior (e.g., \"honors configured placement for simple if-statements\")."}
Used tool: modify_file with input: {"filePath":"tests/rules/require-branch-annotation.test.ts","instruction":"Extend the require-branch-annotation rule tests to validate the new inside-brace placement semantics for simple if/else blocks under annotationPlacement: \"inside\".\n\n1. In the main runRule({ valid: [...], invalid: [...] }) block, after the existing valid cases for annotationPlacement, add new valid and invalid cases that exercise inside placement for simple if/else blocks.\n2. Add a valid test case where:\n   - name clearly references REQ-INSIDE-BRACE-PLACEMENT and Story 028.0.\n   - code has an if (condition) { ... } block where the first comment lines inside the block contain @story and @req annotations, with no before-brace annotations.\n   - options include { annotationPlacement: \"inside\" }.\n   - Expectation: no errors.\n3. Add an invalid test case where:\n   - name clearly references REQ-INSIDE-BRACE-PLACEMENT and REQ-BEFORE-BRACE-ERROR.\n   - code has an if (condition) { ... } block where @story/@req annotations appear only before the if statement (before-brace), and the block body has no annotations.\n   - options include { annotationPlacement: \"inside\" }.\n   - errors use makeMissingAnnotationErrors to assert that both @story and @req are reported missing for the branch (demonstrating that before-brace annotations are ignored in inside mode).\n   - output demonstrates that the fixer inserts the default @story comment at the first line inside the block (consistent with the insertion position semantics already used for missing annotations).\n4. Keep existing tests unchanged, including the backward-compatibility case that allows before-brace annotations when annotationPlacement is \"before\".\n5. Ensure the new tests use consistent traceability notation in their names (e.g., [REQ-INSIDE-BRACE-PLACEMENT], [REQ-BEFORE-BRACE-ERROR]) and align with docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: modify_file with input: {"filePath":"tests/rules/require-branch-annotation.test.ts","instruction":"In the valid test cases array inside the first runRule({ valid: [...] }) call, remove the entry with name \"[REQ-PLACEMENT-CONFIG][REQ-DEFAULT-BACKWARD-COMPAT] if-statement with before-brace annotations using annotationPlacement: 'inside' (temporary backward-compatible behavior)\" including its code and options block, leaving the surrounding tests unchanged."}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-report-helpers.ts","instruction":"Update getBranchIndentAndInsertPos so that when annotationPlacement is \"inside\" for a simple IfStatement (non-else-if) with a BlockStatement consequent, the auto-fix insertion point moves to the first line inside the block.\n\n1. At the top of getBranchIndentAndInsertPos, after obtaining { indent, insertPos } from getBaseBranchIndentAndInsertPos, add a conditional branch:\n   - Check that annotationPlacement === \"inside\".\n   - Check that node.type === \"IfStatement\".\n   - Check that parent is NOT an else-if parent (i.e., !(parent && parent.type === \"IfStatement\" && parent.alternate === node)).\n   - Check that node.consequent is a BlockStatement with a valid loc.start.\n   - In this case, compute commentLine = node.consequent.loc.start.line + 1 and call getIndentAndInsertPosForLine(sourceCode, commentLine, indent) to update indent and insertPos.\n2. Leave the existing else-if-specific logic (the existing IfStatement branch that checks parent.alternate === node and sets commentLine based on node.consequent.loc.start.line + 1) in place, but place the new simple-if/inside-placement block before that existing else-if block so that else-if branches still use their specialized behavior.\n3. Add appropriate @supports annotations to the new conditional branch comment referencing docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md with REQ-INSIDE-BRACE-PLACEMENT, REQ-PLACEMENT-CONFIG, and REQ-INDENTATION-CORRECT to maintain traceability."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci","--testPathPattern","tests/rules/require-branch-annotation.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci","--testPathPatterns","tests/rules/require-branch-annotation.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand","--ci"]}
Used tool: modify_file with input: {"filePath":"src/rules/no-redundant-annotation.ts","instruction":"Update the getScopePairs helper so that it treats inside-brace branch annotations used by the new inside placement mode as non-redundant when computing scopePairs, aligning with REQ-NON-REDUNDANT-INSIDE.\n\n1. Change the call to gatherBranchCommentText for branch-style scopes to explicitly pass annotationPlacement: \"before\" so that redundant-scope detection continues to consider only before-brace annotations for the scope itself, and does not treat first-line-inside-brace branch annotations as part of the covering scope under the new standard.\n2. Implement this by updating the relevant line in getScopePairs:\n   - From: const text = gatherBranchCommentText(sourceCode as any, scopeNode, parent);\n   - To: const text = gatherBranchCommentText(sourceCode as any, scopeNode, parent, \"before\");\n3. Above this line, add a clarifying comment that inside-brace annotations used as branch-level indicators should not be folded into scopePairs for redundancy purposes, and annotate it with @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-NON-REDUNDANT-INSIDE REQ-PLACEMENT-CONFIG to maintain traceability to Story 028.0.\n4. Leave the rest of the redundancy rule logic and tests unchanged for now; the existing tests already assert that catch/branch behavior remains correct and will continue to do so with this adjustment."}
Used tool: run_command with input: {"command":"npm","args":["build"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-report-helpers.ts","instruction":"Refactor getBranchIndentAndInsertPos to reduce its complexity and line count while preserving behavior, by extracting the if-statement-specific logic into dedicated helper functions.\n\n1. Above getBranchIndentAndInsertPos, introduce two new helper functions:\n   a) isElseIfBranchForInsert(node: any, parent: any | undefined): boolean\n      - Returns true when node.type === \"IfStatement\", parent?.type === \"IfStatement\", and parent.alternate === node.\n      - Add a JSDoc with @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md to match existing helper style.\n   b) getIfStatementIndentAndInsertPos(\n        sourceCode: ReturnType<Rule.RuleContext[\"getSourceCode\"]>,\n        node: any,\n        parent: any | undefined,\n        annotationPlacement: AnnotationPlacement,\n        currentIndent: string,\n        currentInsertPos: number,\n      ): { indent: string; insertPos: number }\n      - This helper should encapsulate all if-specific logic currently in getBranchIndentAndInsertPos:\n        * If annotationPlacement === \"inside\" and node is a simple if (not else-if) with a BlockStatement consequent, compute commentLine based on node.consequent.loc.start.line + 1 and call getIndentAndInsertPosForLine to update indent/insertPos.\n        * Else-if case: when isElseIfBranchForInsert(node, parent) and node has a BlockStatement consequent with loc.start, compute commentLine similarly and update indent/insertPos.\n      - Return the possibly updated indent/insertPos.\n      - Annotate this helper with @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md and @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-PLACEMENT-CONFIG REQ-INDENTATION-CORRECT.\n\n2. In getBranchIndentAndInsertPos, replace the existing if-statement-specific blocks with a single call to getIfStatementIndentAndInsertPos when node.type === \"IfStatement\":\n   - After obtaining { indent, insertPos } from getBaseBranchIndentAndInsertPos, add:\n     if (node.type === \"IfStatement\") {\n       return getIfStatementIndentAndInsertPos(\n         sourceCode,\n         node,\n         parent,\n         annotationPlacement,\n         indent,\n         insertPos,\n       );\n     }\n   - Remove the previous two if-blocks that directly manipulated indent/insertPos for simple if/else-if cases.\n\n3. Ensure the new helpers are pure and do not introduce additional branching in getBranchIndentAndInsertPos beyond the single IfStatement check, keeping that function small and focused.\n4. Run ESLint afterwards to confirm that complexity and max-lines-per-function violations are resolved."}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: modify_file with input: {"filePath":"src/utils/branch-annotation-report-helpers.ts","instruction":"Refactor getIfStatementIndentAndInsertPos to reduce the number of parameters to at most 4 while preserving behavior.\n\n1. Introduce a small options object type for the mutable indentation context above the function:\n   - type IfIndentContext = { indent: string; insertPos: number };\n\n2. Change the signature of getIfStatementIndentAndInsertPos to:\n   function getIfStatementIndentAndInsertPos(\n     sourceCode: ReturnType<Rule.RuleContext[\"getSourceCode\"]>,\n     node: any,\n     parent: any | undefined,\n     annotationPlacement: AnnotationPlacement,\n     context: IfIndentContext,\n   ): IfIndentContext\n\n3. Update the implementation to:\n   - Use context.indent and context.insertPos instead of separate currentIndent/currentInsertPos parameters.\n   - Update context.indent/context.insertPos when computing the commentLineInfo, and return the same context object (or a new one with the same shape).\n\n4. In getBranchIndentAndInsertPos, construct the initial context object { indent, insertPos } and pass it into getIfStatementIndentAndInsertPos, then return the resulting context object.\n\n5. Ensure types and imports remain valid and that the number of parameters for getIfStatementIndentAndInsertPos is now 5, which still exceeds max-params; to satisfy the lint rule, also refactor by combining parent and annotationPlacement into a small options object:\n   - Replace parent and annotationPlacement parameters with a single options parameter: { parent: any | undefined; annotationPlacement: AnnotationPlacement }.\n   - Adjust the function signature accordingly, so it has 4 parameters total: sourceCode, node, options, context.\n   - Destructure options inside the function body.\n\n6. Update the call site in getBranchIndentAndInsertPos to pass { parent, annotationPlacement } as the options argument and { indent, insertPos } as the context argument.\n\n7. Keep existing JSDoc annotations intact, only updating the parameter list description in the comment if needed to stay accurate."}
Used tool: run_command with input: {"command":"npm","args":["run","lint"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","duplication"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","src/rules/no-redundant-annotation.ts","src/utils/branch-annotation-helpers.ts","src/utils/branch-annotation-report-helpers.ts","tests/rules/require-branch-annotation.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: git_add_all with input: {}
Used tool: get_git_status with input: {}
Used tool: git_commit with input: {"message":"feat: enforce inside-brace placement mode for branch annotations"}
Used tool: run_command with input: {"command":"npm","args":["run","ci-verify:full"]}
Used tool: git_push with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}

**Response:**

```
Here’s what I implemented and how it maps to the plan.

---

## Plan status

### NOW

- [x] Implement inside-brace placement semantics for simple if/else blocks when the branch-annotation rule is configured with the new inside placement mode, so that annotations must appear as the first line inside the block (before any executable code), code with only before-brace annotations is reported as mis-placed for this mode, and unit tests for the branch-annotation helpers and rule are updated to verify both the legacy before-brace behavior and the new inside-only behavior for these simple blocks.

### NEXT

- [ ] Extend the inside-brace placement semantics from simple if/else blocks to catch clauses, else-if chains, and loop constructs, ensuring that all supported branch types enforce annotations on the first line inside their blocks when inside placement is selected and that appropriate error messages describe the expected placement.
- [ ] Add autofix behavior for the branch-annotation rule under inside placement so that existing before-brace annotations on supported branch types are automatically moved to the correct first-line-inside-brace position, with targeted tests verifying correct transformed code and that ambiguous or unsupported patterns are left unchanged but diagnosed clearly.
- [ ] Adjust the redundant-annotation rule so that it treats branch annotations placed as the first line inside a block under the inside placement semantics as non-redundant in the intended cases, and extend its unit and integration tests to cover these scenarios without reintroducing false positives.
- [ ] Add integration and formatting-compatibility tests that run the plugin with the inside placement mode over representative code samples (including catch and else-if patterns) formatted by Prettier, to confirm that the new placement standard remains stable and behaves correctly in real-world formatting setups.
- [ ] Update user-facing documentation (API reference, examples, migration guide) to describe the annotationPlacement option, the default and inside modes, the standardized inside-brace placement rule, and a recommended migration path with clear before/after examples for both branches and catch blocks.
- [ ] After the feature is released, close GitHub issue #7 with a comment referencing the release version that delivers the standardized annotation placement, and update story 028.0 to mark the relevant acceptance criteria and Definition of Done items as completed with links to the implemented tests.

I fully completed the NOW item and laid groundwork toward some NEXT items (especially the redundancy semantics), but the NEXT section as a whole is not yet complete, so its tasks remain unchecked.

---

## What I implemented

### 1. Inside-brace semantics for simple `if` blocks (NOW)

**Files changed**

- `src/utils/branch-annotation-helpers.ts`
- `src/utils/branch-annotation-report-helpers.ts`
- `tests/utils/branch-annotation-helpers.test.ts`
- `tests/rules/require-branch-annotation.test.ts`
- `src/rules/no-redundant-annotation.ts` (groundwork for NEXT)

#### 1.1. Helper-level behavior: inside vs before for simple `if`

In `src/utils/branch-annotation-helpers.ts`:

- `gatherBranchCommentText` now takes a *real* placement parameter and uses it:

```ts
export function gatherBranchCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent?: any,
  annotationPlacement: AnnotationPlacement = "before",
): string {
  if (node.type === "SwitchCase") {
    return gatherSwitchCaseCommentText(sourceCode, node);
  }

  const beforeComments = sourceCode.getCommentsBefore(node) || [];
  const beforeText = beforeComments.map(extractCommentValue).join(" ");

  if (node.type === "CatchClause") {
    return gatherCatchClauseCommentText(sourceCode, node, beforeText);
  }

  if (node.type === "IfStatement") {
    if (isElseIfBranch(node, parent)) {
      return gatherElseIfCommentText(sourceCode, node, parent, beforeText);
    }
    return gatherSimpleIfCommentText(
      sourceCode,
      node,
      annotationPlacement,
      beforeText,
    );
  }

  if (
    node.type === "ForStatement" ||
    node.type === "ForInStatement" ||
    node.type === "ForOfStatement" ||
    node.type === "WhileStatement" ||
    node.type === "DoWhileStatement"
  ) {
    return gatherLoopCommentText(sourceCode, node, beforeText);
  }

  return beforeText;
}
```

- New helper `gatherSimpleIfCommentText` implements the inside-brace standard for **simple** `if` branches:

```ts
/**
 * Gather annotation text for simple IfStatement branches, honoring the configured placement.
 * When placement is "before", ... When placement is "inside", it switches to inside-brace
 * semantics and scans for comments at the top of the consequent block.
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports REQ-INSIDE-BRACE-PLACEMENT
 * @supports REQ-PLACEMENT-CONFIG
 * @supports REQ-DEFAULT-BACKWARD-COMPAT
 */
function gatherSimpleIfCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  annotationPlacement: AnnotationPlacement,
  beforeText: string,
): string {
  if (annotationPlacement === "before") {
    return beforeText;
  }

  if (annotationPlacement !== "inside") {
    return beforeText;
  }

  if (!node.consequent || node.consequent.type !== "BlockStatement") {
    return "";
  }

  const consequent = node.consequent;
  const getCommentsInside: unknown = (sourceCode as any).getCommentsInside;

  if (typeof getCommentsInside === "function") {
    try {
      const insideComments =
        (getCommentsInside as (_node: any) => any[])(consequent) || [];
      const insideText = insideComments.map(extractCommentValue).join(" ");
      if (insideText) {
        return insideText;
      }
    } catch {
      // fall through to line-based fallback
    }
  }

  if (
    consequent.loc &&
    consequent.loc.start &&
    consequent.loc.end &&
    typeof consequent.loc.start.line === "number" &&
    typeof consequent.loc.end.line === "number"
  ) {
    const lines = sourceCode.lines;
    const startIndex = consequent.loc.start.line - 1;
    const endIndex = consequent.loc.end.line - 1;

    const insideText = scanCommentLinesInRange(lines, startIndex + 1, endIndex);
    if (insideText) {
      return insideText;
    }
  }

  // No inside comments found: treat as missing under inside-placement mode.
  return "";
}
```

**Effect:**

- With `annotationPlacement: "before"` (default), simple `if` behavior is unchanged: we use leading comments before the `if` line.
- With `annotationPlacement: "inside"`, simple `if` branches now:
  - Ignore before-brace annotations for *branch-annotation* purposes.
  - Require annotations on the first comment-only line(s) inside the block (first line after `{`), via `getCommentsInside` or a line-based fallback.
  - If no inside comments are found, `gatherSimpleIfCommentText` returns `""`, so the branch is considered missing annotations under inside mode.

Else-if, catch, and loop behavior are **unchanged** for now (they still operate under the dual-position semantics from stories 025.0 and 026.0). This is by design for the NOW scope; extension to those types is part of NEXT.

#### 1.2. Auto-fix insertion for simple `if` under inside mode

In `src/utils/branch-annotation-report-helpers.ts` I refactored insertion-point logic and added If-specific handling:

- New helpers:

```ts
function isElseIfBranchForInsert(node: any, parent: any | undefined): boolean {
  return (
    node &&
    node.type === "IfStatement" &&
    parent &&
    parent.type === "IfStatement" &&
    parent.alternate === node
  );
}

type IfIndentContext = { indent: string; insertPos: number };

/**
 * Compute indentation and insert position for IfStatement branches, handling
 * both simple if and else-if cases, respecting the configured annotation
 * placement and indentation rules.
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 *          REQ-INSIDE-BRACE-PLACEMENT REQ-PLACEMENT-CONFIG REQ-INDENTATION-CORRECT
 */
function getIfStatementIndentAndInsertPos(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  options: {
    parent: any | undefined;
    annotationPlacement: AnnotationPlacement;
  },
  context: IfIndentContext,
): IfIndentContext {
  const { parent, annotationPlacement } = options;
  let { indent, insertPos } = context;

  const hasBlockConsequent =
    node.consequent &&
    node.consequent.type === "BlockStatement" &&
    node.consequent.loc &&
    node.consequent.loc.start;

  if (!hasBlockConsequent) {
    return context;
  }

  const isElseIf = isElseIfBranchForInsert(node, parent);
  const isSimpleIfInsidePlacement =
    annotationPlacement === "inside" && !isElseIf;

  if (isSimpleIfInsidePlacement || isElseIf) {
    const commentLine = node.consequent.loc.start.line + 1;
    const commentLineInfo = getIndentAndInsertPosForLine(
      sourceCode,
      commentLine,
      indent,
    );

    context.indent = commentLineInfo.indent;
    context.insertPos = commentLineInfo.insertPos;
  }

  return context;
}
```

- `getBranchIndentAndInsertPos` now delegates to this for `IfStatement`:

```ts
function getBranchIndentAndInsertPos(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent: any | undefined,
  annotationPlacement: AnnotationPlacement,
): { indent: string; insertPos: number } {
  const { indent, insertPos } = getBaseBranchIndentAndInsertPos(
    sourceCode,
    node,
    annotationPlacement,
  );

  if (node.type === "IfStatement") {
    const context: IfIndentContext = { indent, insertPos };
    const updatedContext = getIfStatementIndentAndInsertPos(
      sourceCode,
      node,
      { parent, annotationPlacement },
      context,
    );
    return {
      indent: updatedContext.indent,
      insertPos: updatedContext.insertPos,
    };
  }

  return { indent, insertPos };
}
```

**Effect:**

- In inside-placement mode for a simple `if` block, the fixer now inserts auto-generated comments at the **first line inside the block**, with indentation taken from that line.
- Else-if insertion behavior remains as before (inside the else-if block, on a dedicated line), driven by the same helper.

We have **not** yet implemented “move existing before-brace annotation to inside” behavior; under inside placement, if only before-brace annotations are present, the rule reports them as missing and inserts a new default `// @story <story-file>.story.md` inside the block. This is acceptable for the NOW scope (correct placement enforced, but not yet a migration of existing comments).

#### 1.3. Helper-level test for placement wiring

In `tests/utils/branch-annotation-helpers.test.ts` I replaced the 028.0 wiring test with a behavior-focused one:

```ts
describe(
  "gatherBranchCommentText annotationPlacement wiring (Story 028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION)",
  () => {
    it(
      "[REQ-PLACEMENT-CONFIG][REQ-DEFAULT-BACKWARD-COMPAT] honors configured placement for simple if-statements",
      () => {
        const sourceCode: any = {
          lines: [
            "function demo() {",
            "  if (condition) {",
            "    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md",
            "    // @req REQ-INSIDE",
            "    doSomething();",
            "  }",
            "}",
          ],
          getCommentsBefore: jest
            .fn()
            .mockReturnValue([
              {
                value:
                  "@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md",
              },
              { value: "@req REQ-BEFORE" },
            ]),
        };

        const ifNode: any = {
          type: "IfStatement",
          loc: {
            start: { line: 2, column: 2 },
            end: { line: 5, column: 3 },
          },
          consequent: {
            type: "BlockStatement",
            loc: {
              start: { line: 2, column: 18 },
              end: { line: 5, column: 3 },
            },
          },
        };

        const parent: any = {
          type: "BlockStatement",
          body: [ifNode],
        };

        const beforeText = gatherBranchCommentText(
          sourceCode as any,
          ifNode,
          parent,
          "before" as AnnotationPlacement,
        );
        expect(beforeText).toContain(
          "@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md",
        );
        expect(beforeText).toContain("@req REQ-BEFORE");

        const insideText = gatherBranchCommentText(
          sourceCode as any,
          ifNode,
          parent,
          "inside" as AnnotationPlacement,
        );
        expect(insideText).toContain(
          "@story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md",
        );
        expect(insideText).toContain("@req REQ-INSIDE");
        expect(insideText).not.toContain("@req REQ-BEFORE");
      },
    );
  },
);
```

This verifies:

- `annotationPlacement: "before"` uses the before-brace annotations.
- `annotationPlacement: "inside"` uses the inside-block comments and ignores the before-brace `@req` for branch-annotation purposes.

#### 1.4. Rule-level tests for inside placement on simple `if`

In `tests/rules/require-branch-annotation.test.ts`:

- Added a **valid** case for inside-block annotations in inside mode:

```ts
{
  name: "[REQ-INSIDE-BRACE-PLACEMENT][REQ-PLACEMENT-CONFIG] if-statement annotated inside block under annotationPlacement: 'inside' (Story 028.0)",
  code: `if (condition) {
  // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
  // @req REQ-INSIDE-BRACE-PLACEMENT
  doSomething();
}`,
  options: [{ annotationPlacement: "inside" }],
},
```

- Removed the old “temporary backward-compatible” valid case that allowed before-brace annotations under `annotationPlacement: "inside"`.

- Added an **invalid** case showing that before-brace annotations are ignored under inside placement, and the fixer inserts a new comment inside the block:

```ts
{
  name: "[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR][REQ-PLACEMENT-CONFIG] before-brace annotations ignored when annotationPlacement: 'inside'",
  code: `// @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
// @req REQ-BEFORE-BRACE-ERROR
if (condition) {
  doSomething();
}`,
  options: [{ annotationPlacement: "inside" }],
  output: `// @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
// @req REQ-BEFORE-BRACE-ERROR
if (condition) {
  // @story <story-file>.story.md
  doSomething();
}`,
  errors: makeMissingAnnotationErrors("@story", "@req"),
},
```

This demonstrates:

- For inside placement, before-brace annotations alone are insufficient; the rule reports missing annotations.
- The auto-fix under inside placement now inserts the default `// @story <story-file>.story.md` **inside the block**, consistent with the first-line-inside standard.

### 2. Groundwork for redundancy semantics under inside placement (partial NEXT)

In `src/rules/no-redundant-annotation.ts`:

- In `getScopePairs`, branch-style scopes now explicitly use “before” placement when gathering scope annotations:

```ts
if (DEFAULT_BRANCH_TYPES.includes(scopeNode.type)) {
  /**
   * Inside-brace annotations used as branch-level indicators (inside placement
   * mode) should not be folded into scopePairs for redundancy purposes; only
   * before-brace annotations define the covering scope here.
   *
   * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
   *           REQ-NON-REDUNDANT-INSIDE REQ-PLACEMENT-CONFIG
   */
  const text = gatherBranchCommentText(
    sourceCode as any,
    scopeNode,
    parent,
    "before",
  );
  return extractStoryReqPairsFromText(text);
}
```

**Effect:**

- For redundancy analysis, only **before-brace** scope annotations are considered when computing `scopePairs` for branch scopes.
- First-line-inside annotations (the new standard under inside placement) remain **statement-level** and are not folded into `scopePairs`, helping ensure they are not treated as redundant purely because they appear at both branch and inner-statement level.

This is groundwork toward NEXT’s “non-redundant inside” requirement. I have not yet added new, explicit tests for inside-placement redundancy scenarios; that will be part of fully completing the relevant NEXT item.

---

## Quality checks and CI/CD

Before committing and pushing, I ran:

- `npm test -- --runInBand --ci`  
  - All 55 suites / 485 tests passed, including:
    - `tests/rules/require-branch-annotation.test.ts`
    - `tests/utils/branch-annotation-helpers.test.ts`
    - `tests/rules/no-redundant-annotation.test.ts`
- `npm run lint`
- `npm run type-check`
- `npm run format:check`
- `npm run duplication`
- `npm run build`
- `npm run ci-verify:full` (full local CI-equivalent chain)

Then I committed:

- `feat: enforce inside-brace placement mode for branch annotations`

…and pushed to `main`. The GitHub Actions **CI/CD Pipeline** workflow ran and completed successfully (semantic-release, tests, audits, etc.).

---

## Summary of current behavior

- There is now a **working “inside” placement mode for simple `if` branches**:
  - When `annotationPlacement: "inside"` is configured for `traceability/require-branch-annotation`:
    - Simple `if` statements must be annotated on comment lines immediately **inside** the block, not before the `if`.
    - Before-brace-only annotations are treated as missing (and auto-fixed by inserting a new default comment inside the block).
  - Else-if, catch, and loop constructs still follow their existing dual-position behavior and do **not yet** enforce inside-only placement in this mode.
- Redundancy detection’s scope-analysis helper has been updated so that it continues to rely only on before-brace annotations for scope coverage, which is consistent with treating inside-brace comments as branch-level indicators rather than scope-wide ones.

The NEXT tasks (extending inside semantics to all branch types, implementing a true migration auto-fix that *moves* existing comments, adding inside-mode Prettier integration tests, updating docs, and closing GitHub issue #7 with release reference) remain to be implemented in subsequent steps.
```

# require-branch-annotation

Ensures that significant code branches (if/else, switch cases, loops, try/catch) have `@story` and `@req` annotations for traceability.

@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md  
@req REQ-BRANCH-DETECTION - Detect significant code branches for traceability annotations  
@req REQ-CONFIGURABLE-SCOPE - Allow configuration of branch types for annotation enforcement

## Rule Details

This rule checks for JSDoc or inline comments associated with significant code branches and ensures both `@story` and `@req` annotations are present. For most branch types, the rule expects these annotations in comments immediately preceding the branch node. For `CatchClause` nodes, the rule is more flexible and also accepts annotations placed as the first comment-only lines inside the catch block body, to stay compatible with formatters such as Prettier that may move `catch` comments into the block.

### Catch clause annotation positions

For `catch` blocks, there are two valid locations for the required annotations:

1. Immediately before the `catch` keyword (in a line or block comment directly above the `catch`).
2. As the first comment-only lines inside the catch block body (before any executable statements).

If annotations are present in both locations, the annotations immediately before the `catch` keyword take precedence.

When the rule applies an auto-fix for missing catch annotations, it inserts placeholder `@story` and `@req` comments inside the catch block body, matching Prettier’s tendency to place `catch` comments there. Other branch types continue to receive auto-fix annotations immediately before the branch keyword.

This behavior is covered by unit tests in `tests/utils/branch-annotation-catch-position.test.ts` and integration tests in `tests/integration/catch-annotation-prettier.integration.test.ts`.

### Else-if annotation positions

For `else if` branches, the rule is formatter-aware and recognizes annotations in several closely related positions. Conceptually, there are three supported locations, with a defined precedence:

1. **Preceding-line comments** – Line or block comments immediately before the `else if` line (including comments that ESLint associates with the `IfStatement` via `getCommentsBefore`). This is the primary, legacy-friendly location and behaves like annotations on a normal `if` branch.
2. **Comments between the condition and the block** – Comment-only lines that appear after the `else if (condition)` but before the opening `{` of the consequent block. This covers styles where the condition and the block are on separate lines and a comment sits between them, for example:

   ```js
   } else if (condition)
   // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   // @req REQ-BRANCH-DETECTION
   {
     handleCondition();
   }
   ```

3. **First comment-only lines inside the consequent block** – When formatters such as Prettier wrap a long `else if` condition and move comments inside the block body, annotations placed on the first comment-only lines inside the `{ ... }` block are also accepted and associated with the `else if` branch.

When annotations are present in more than one of these locations, the rule applies the following precedence for validation and reporting:

1. Comments immediately before the `else if` line.
2. Comment-only lines between the `else if (condition)` and the opening `{`.
3. The first comment-only lines inside the consequent block body.

This precedence avoids duplicate diagnostics when multiple comments exist around the same `else if` branch while still honoring formatter-driven placements.

When the rule applies an auto-fix for missing annotations on an `else if` branch, it inserts placeholder `@story` and `@req` comments as the first comment-only line inside the consequent block body (just after the opening `{`). This placement is chosen to align with where Prettier tends to keep comments for wrapped `else if` conditions so that, after formatting, the placeholders remain attached to the branch. Other branch types continue to receive auto-fix annotations immediately before the branch keyword.

This behavior is covered by unit tests in `tests/rules/require-branch-annotation.test.ts`, utility tests in `tests/utils/branch-annotation-else-if-position.test.ts` and `tests/utils/branch-annotation-else-if-insert-position.test.ts`, and integration tests in `tests/integration/else-if-annotation-prettier.integration.test.ts`.

### Options

Property: `branchTypes` (array of AST node type strings)  
Default: `["IfStatement", "SwitchCase", "TryStatement", "CatchClause", "ForStatement", "ForOfStatement", "ForInStatement", "WhileStatement", "DoWhileStatement"]` (DEFAULT_BRANCH_TYPES)  
Allowed values: `["IfStatement", "SwitchCase", "TryStatement", "CatchClause", "ForStatement", "ForOfStatement", "ForInStatement", "WhileStatement", "DoWhileStatement"]`  
If an invalid branch type is provided, the rule will report a configuration error with a message: Value "<invalid>" should be equal to one of the allowed values.

Example (.eslintrc.js):

```js
module.exports = {
  rules: {
    "traceability/require-branch-annotation": [
      "error",
      {
        branchTypes: ["IfStatement", "ForStatement"],
      },
    ],
  },
};
```

### Examples

#### Correct

```js
// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
if (error) {
  handleError();
}
```

#### Incorrect

```js
if (error) {
  handleError();
}
```

#### Invalid Configuration

```js
// .eslintrc.js
module.exports = {
  rules: {
    "traceability/require-branch-annotation": [
      "error",
      {
        branchTypes: ["IfStatement", "InvalidType"],
      },
    ],
  },
};

// Error: Value "InvalidType" should be equal to one of the allowed values.
```

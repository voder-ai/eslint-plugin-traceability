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

For `else if` branches, there are two valid locations for the required annotations:

1. Immediately before the `else if` keyword (in a line or block comment directly above the `else if`).
2. On comment-only lines between the `else if (condition)` line and the first statement of the consequent body. This matches the region where Prettier places comments when it wraps long `else if` conditions so that the condition and the consequent statement appear on separate lines.

If annotations are present in both locations, the annotations immediately before the `else if` keyword take precedence for validation and reporting.

When the rule applies an auto-fix for missing annotations on an `else if` branch, it inserts placeholder `@story` and `@req` comments on a dedicated line between the `else if (condition)` line and the first statement of the consequent body, aligned with the indentation style that Prettier uses for comments in this region. This behavior is covered by tests in `tests/rules/require-branch-annotation.test.ts` and integration tests in `tests/integration/else-if-annotation-prettier.integration.test.ts`.

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
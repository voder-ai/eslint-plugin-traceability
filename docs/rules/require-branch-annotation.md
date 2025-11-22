# require-branch-annotation

Ensures that significant code branches (if/else, switch cases, loops, try/catch) have `@story` and `@req` annotations for traceability.

@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md  
@req REQ-BRANCH-DETECTION - Detect significant code branches for traceability annotations  
@req REQ-CONFIGURABLE-SCOPE - Allow configuration of branch types for annotation enforcement

## Rule Details

This rule checks for JSDoc or inline comments immediately preceding significant code branches and ensures both `@story` and `@req` annotations are present.

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
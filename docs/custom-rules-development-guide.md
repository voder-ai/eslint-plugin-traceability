# Custom ESLint Rules Development Guide

This guide provides comprehensive information for developing custom ESLint rules based on the official [ESLint Custom Rules documentation](https://eslint.org/docs/latest/extend/custom-rules).

## Table of Contents

- [Rule Structure](#rule-structure)
- [The Context Object](#the-context-object)
- [Working with the AST](#working-with-the-ast)
- [Reporting Problems](#reporting-problems)
- [Applying Fixes](#applying-fixes)
- [Providing Suggestions](#providing-suggestions)
- [Rule Options and Schema](#rule-options-and-schema)
- [Accessing Source Code](#accessing-source-code)
- [Variable Scopes](#variable-scopes)
- [Testing Rules](#testing-rules)
- [Best Practices](#best-practices)

## Rule Structure

Every ESLint rule must export an object with two main properties:

```javascript
module.exports = {
  meta: {
    type: "problem" | "suggestion" | "layout",
    docs: {
      description: "Description of the rule",
      url: "https://your-docs-url.com",
    },
    fixable: "code" | "whitespace", // Optional, required if rule provides fixes
    hasSuggestions: true, // Optional, required if rule provides suggestions
    schema: [], // Rule options schema
    messages: {
      // Message templates
      messageId: "Message text with {{placeholder}}",
    },
  },
  create(context) {
    return {
      // Visitor methods
    };
  },
};
```

### Rule Types

- **`problem`**: Identifies code that will cause errors or confusing behavior. High priority.
- **`suggestion`**: Identifies code that could be improved but won't cause errors.
- **`layout`**: Concerns whitespace, formatting, and code appearance.

### Meta Properties

- **`type`**: (Required) One of "problem", "suggestion", or "layout"
- **`docs`**: Documentation metadata
  - `description`: Short description of the rule
  - `url`: Full documentation URL
  - `recommended`: Whether enabled by default (boolean for plugins)
- **`fixable`**: Either "code" or "whitespace" if the rule can auto-fix
- **`hasSuggestions`**: Set to `true` if rule provides manual suggestions
- **`schema`**: JSON Schema defining valid rule options
- **`defaultOptions`**: Default values for rule options
- **`messages`**: Named message templates with placeholders
- **`deprecated`**: Deprecation info (boolean or object)

## The Context Object

The `context` object is passed to the `create()` function and provides:

### Properties

```javascript
create(context) {
    const {
        id,                 // Rule ID
        filename,           // File being linted
        physicalFilename,   // Full path on disk
        cwd,                // Current working directory
        options,            // Array of rule options (without severity)
        sourceCode,         // SourceCode object
        settings,           // Shared settings from config
        languageOptions     // Language configuration
    } = context;
}
```

### Methods

- **`context.report(descriptor)`**: Report a problem in the code

## Working with the AST

ESLint uses the [ESTree](https://github.com/estree/estree) AST format. The `create()` function returns an object with visitor methods:

```javascript
create(context) {
    return {
        // Visit node while going down the tree
        Identifier(node) {
            // Handle Identifier nodes
        },

        // Visit node while going up the tree
        "FunctionExpression:exit"(node) {
            // Handle function exits
        },

        // Use selectors for more specific matching
        "IfStatement > BlockStatement"(node) {
            // Handle if statements with block bodies
        },

        // Code path analysis
        onCodePathStart(codePath, node) {
            // Start of code path
        },

        onCodePathEnd(codePath, node) {
            // End of code path
        }
    };
}
```

### Exploring the AST

Use [Code Explorer](http://explorer.eslint.org/) to visualize AST structure for any JavaScript code.

## Reporting Problems

### Basic Reporting

```javascript
context.report({
  node: node,
  message: "Unexpected identifier",
});
```

### Using Message IDs (Recommended)

```javascript
// In meta.messages
meta: {
  messages: {
    avoidName: "Avoid using variables named '{{name}}'";
  }
}

// In create function
context.report({
  node,
  messageId: "avoidName",
  data: {
    name: node.name,
  },
});
```

### Report Descriptor Properties

- **`messageId`**: ID from `meta.messages` (recommended)
- **`message`**: Direct message string (alternative to messageId)
- **`node`**: AST node related to the problem
- **`loc`**: Specific location object (overrides node location)
  - `start`: `{ line: number, column: number }`
  - `end`: `{ line: number, column: number }`
- **`data`**: Placeholder values for message template
- **`fix`**: Function to apply automatic fix
- **`suggest`**: Array of manual fix suggestions

## Applying Fixes

### Basic Fix Example

```javascript
context.report({
  node,
  message: "Missing semicolon",
  fix(fixer) {
    return fixer.insertTextAfter(node, ";");
  },
});
```

### Fixer Methods

- `insertTextAfter(nodeOrToken, text)`
- `insertTextAfterRange(range, text)`
- `insertTextBefore(nodeOrToken, text)`
- `insertTextBeforeRange(range, text)`
- `remove(nodeOrToken)`
- `removeRange(range)`
- `replaceText(nodeOrToken, text)`
- `replaceTextRange(range, text)`

### Multiple Fixes

```javascript
fix(fixer) {
    return [
        fixer.insertTextBefore(node, "const "),
        fixer.insertTextAfter(node, " = value")
    ];
}

// Or use a generator
*fix(fixer) {
    yield fixer.insertTextBefore(node, "const ");
    yield fixer.insertTextAfter(node, " = value");
}
```

### Fix Best Practices

1. **Don't change runtime behavior**: Fixes should be safe transformations
2. **Make fixes small**: Avoid large refactorings that might conflict
3. **One fix per message**: Return result of fixer operation
4. **Don't worry about style**: Other rules will clean up after initial fixes

## Providing Suggestions

Suggestions are manual fixes that users can apply through their editor:

```javascript
meta: {
    hasSuggestions: true,
    messages: {
        unnecessaryEscape: "Unnecessary escape: \\{{char}}",
        removeEscape: "Remove the `\\`",
        escapeBackslash: "Replace with `\\\\`"
    }
}

// In create()
context.report({
    node,
    messageId: "unnecessaryEscape",
    data: { char },
    suggest: [
        {
            messageId: "removeEscape",
            fix(fixer) {
                return fixer.removeRange(range);
            }
        },
        {
            messageId: "escapeBackslash",
            fix(fixer) {
                return fixer.insertTextBeforeRange(range, "\\");
            }
        }
    ]
});
```

### Suggestion Best Practices

1. **Don't suggest large refactors**: Keep suggestions focused
2. **Don't conform to user styles**: Suggestions are stand-alone changes
3. **Provide meaningful descriptions**: Use clear messageIds or desc

## Rule Options and Schema

### Array Schema Format

```javascript
meta: {
  schema: [
    {
      enum: ["always", "never"],
    },
    {
      type: "object",
      properties: {
        exceptRange: { type: "boolean" },
      },
      additionalProperties: false,
    },
  ];
}

// Valid configs:
// ["error"]
// ["error", "always"]
// ["error", "never", { exceptRange: true }]
```

### Object Schema Format

```javascript
meta: {
    schema: {
        type: "array",
        minItems: 0,
        maxItems: 2,
        items: [
            { enum: ["always", "never"] },
            {
                type: "object",
                properties: {
                    exceptRange: { type: "boolean" }
                },
                additionalProperties: false
            }
        ]
    }
}
```

### Default Options

```javascript
meta: {
    defaultOptions: [
        {
            alias: "basic",
            threshold: 10
        }
    ],
    schema: [
        {
            type: "object",
            properties: {
                alias: { type: "string" },
                threshold: { type: "number" }
            },
            additionalProperties: false
        }
    ]
}

// User config ["error", { threshold: 20 }] results in:
// options[0] = { alias: "basic", threshold: 20 }
```

## Accessing Source Code

### Getting Source Code Object

```javascript
create(context) {
    const sourceCode = context.sourceCode;

    // Get all source text
    const allSource = sourceCode.getText();

    // Get text for specific node
    const nodeText = sourceCode.getText(node);

    // Get text with surrounding context
    const withPrev = sourceCode.getText(node, 2);      // 2 chars before
    const withNext = sourceCode.getText(node, 0, 2);   // 2 chars after
}
```

### Working with Tokens

```javascript
// Get tokens
const firstToken = sourceCode.getFirstToken(node);
const lastToken = sourceCode.getLastToken(node);
const tokenAfter = sourceCode.getTokenAfter(node);
const tokenBefore = sourceCode.getTokenBefore(node);
const allTokens = sourceCode.getTokens(node);

// Get tokens between nodes
const tokensBetween = sourceCode.getTokensBetween(node1, node2);

// Skip options
const token = sourceCode.getTokenAfter(node, {
  skip: 2, // Skip 2 tokens
  includeComments: true, // Include comment tokens
  filter: (token) => token.type !== "Punctuator",
});
```

### Working with Comments

```javascript
// Get all comments
const allComments = sourceCode.getAllComments();

// Get comments around a node
const commentsBefore = sourceCode.getCommentsBefore(node);
const commentsAfter = sourceCode.getCommentsAfter(node);
const commentsInside = sourceCode.getCommentsInside(node);

// Check if comments exist
const hasComments = sourceCode.commentsExistBetween(node1, node2);
```

### SourceCode Properties

```javascript
sourceCode.text; // Full source text
sourceCode.ast; // Program node
sourceCode.lines; // Array of lines
sourceCode.hasBOM; // Has Unicode BOM
sourceCode.scopeManager; // Scope manager
sourceCode.visitorKeys; // Visitor keys for traversal
sourceCode.parserServices; // Parser-specific services
```

## Variable Scopes

### Getting Scope

```javascript
create(context) {
    return {
        Identifier(node) {
            const scope = context.sourceCode.getScope(node);

            // Check variables in scope
            scope.variables.forEach(variable => {
                console.log(variable.name);

                // Check references
                variable.references.forEach(ref => {
                    if (ref.isWrite()) {
                        // Variable is written to
                    }
                    if (ref.isRead()) {
                        // Variable is read from
                    }
                });

                // Check definitions
                variable.defs.forEach(def => {
                    console.log(def.type); // "Variable", "FunctionName", etc.
                });
            });
        }
    };
}
```

### Scope Types

| AST Node Type           | Scope Type |
| ----------------------- | ---------- |
| Program                 | global     |
| FunctionDeclaration     | function   |
| FunctionExpression      | function   |
| ArrowFunctionExpression | function   |
| ClassDeclaration        | class      |
| ClassExpression         | class      |
| BlockStatement          | block      |
| ForStatement            | for        |
| SwitchStatement         | switch     |
| CatchClause             | catch      |

### Marking Variables as Used

```javascript
// Mark variable as used in current scope
context.sourceCode.markVariableAsUsed("myVar", node);

// Mark variable as used in global scope
context.sourceCode.markVariableAsUsed("myVar");
```

## Testing Rules

Use ESLint's `RuleTester` for testing:

```javascript
const RuleTester = require("eslint").RuleTester;
const rule = require("../rules/my-rule");

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

ruleTester.run("my-rule", rule, {
  valid: [
    "var foo = 'bar';",
    {
      code: "const foo = 'bar';",
      options: ["always"],
    },
  ],

  invalid: [
    {
      code: "var foo = 'bar';",
      errors: [
        {
          messageId: "unexpected",
          type: "VariableDeclaration",
        },
      ],
    },
    {
      code: "var foo = 'bar';",
      output: "const foo = 'bar';", // Expected fix output
      errors: [
        {
          messageId: "useConst",
          suggest: [
            {
              messageId: "useConstSuggestion",
              output: "const foo = 'bar';",
            },
          ],
        },
      ],
    },
  ],
});
```

## Best Practices

### General

1. **Use messageIds**: More maintainable than inline messages
2. **Document thoroughly**: Include examples in `meta.docs`
3. **Test extensively**: Cover edge cases and error conditions
4. **Follow naming conventions**: Use kebab-case for rule names
5. **Keep rules focused**: One rule, one responsibility

### Fixes

1. **Safe transformations only**: Never change runtime behavior
2. **Minimal changes**: Smallest possible fix
3. **No style enforcement in fixes**: Let other rules handle formatting
4. **Test fix output**: Ensure fixes produce valid code

### Suggestions

1. **Manual actions only**: Use suggestions for behavior-changing fixes
2. **Clear descriptions**: Users should understand what will happen
3. **Limited scope**: Don't suggest large refactorings

### Performance

1. **Limit AST traversals**: Use specific selectors
2. **Cache computed values**: Don't recalculate in each visitor
3. **Early returns**: Exit visitor functions when possible
4. **Profile if needed**: Use `TIMING=1` environment variable

### Schema

1. **Always define schema**: Even if empty (`schema: []`)
2. **Validate thoroughly**: Prevent invalid configurations
3. **Provide defaults**: Use `defaultOptions` for common cases
4. **Document options**: Include in rule documentation

## Additional Resources

- [ESLint Official Custom Rules Documentation](https://eslint.org/docs/latest/extend/custom-rules)
- [Code Explorer](http://explorer.eslint.org/) - Visualize AST
- [ESTree Specification](https://github.com/estree/estree)
- [Scope Manager Interface](https://eslint.org/docs/latest/extend/scope-manager-interface)
- [Code Path Analysis](https://eslint.org/docs/latest/extend/code-path-analysis)
- [Selectors](https://eslint.org/docs/latest/extend/selectors)

## Example: Complete Rule

```javascript
/**
 * @fileoverview Disallow var, prefer const or let
 * @story docs/stories/example.story.md
 */

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow var, prefer const or let",
      url: "https://example.com/rules/no-var",
    },
    fixable: "code",
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        properties: {
          allowInLegacy: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ allowInLegacy: false }],
    messages: {
      unexpectedVar: "Unexpected var, use const or let instead",
      replaceWithLet: "Replace with 'let'",
      replaceWithConst: "Replace with 'const'",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] || {};

    return {
      VariableDeclaration(node) {
        if (node.kind !== "var") {
          return;
        }

        // Check if in legacy file
        if (options.allowInLegacy && isLegacyFile(context.filename)) {
          return;
        }

        const varToken = sourceCode.getFirstToken(node);

        context.report({
          node,
          messageId: "unexpectedVar",
          fix(fixer) {
            // Auto-fix to let (conservative)
            return fixer.replaceText(varToken, "let");
          },
          suggest: [
            {
              messageId: "replaceWithLet",
              fix(fixer) {
                return fixer.replaceText(varToken, "let");
              },
            },
            {
              messageId: "replaceWithConst",
              fix(fixer) {
                return fixer.replaceText(varToken, "const");
              },
            },
          ],
        });
      },
    };
  },
};

function isLegacyFile(filename) {
  return filename.includes("/legacy/");
}
```

## Rule Lifecycle

1. **Configuration**: Rule is enabled with severity and options
2. **Validation**: Options are validated against schema
3. **Creation**: `create()` is called with context
4. **Traversal**: Visitor methods called during AST traversal
5. **Reporting**: Problems reported via `context.report()`
6. **Fixing**: Fixes applied if `--fix` flag used
7. **Output**: Lint results returned to user

---

This guide covers the essential concepts for developing custom ESLint rules. For more advanced topics, refer to the official ESLint documentation and explore the source code of existing rules.

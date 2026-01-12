# Arrow Function Name Resolution via Parent Context Inspection

## Status

Accepted

## Context

ESLint plugin rules need to determine whether arrow functions require traceability annotations. Unlike regular function declarations which have an `id` property containing their name, arrow functions never have their own identifier. Their "name" comes from the context in which they're assigned:

```javascript
// Regular function - has node.id.name
function handler() {}

// Arrow function - no node.id, name comes from parent VariableDeclarator
const handler = () => {};

// Arrow function - name comes from parent Property
const obj = { handler: () => {} };

// Truly anonymous arrow - no name from any parent
array.map(() => {});
```

The challenge: **How should the plugin distinguish between named arrow functions (which represent meaningful functionality and should require annotations) and anonymous arrow functions (which are often utility callbacks and should be excluded)?**

## Decision

The plugin will resolve arrow function names by **inspecting parent node contexts** (VariableDeclarator and Property nodes) rather than relying solely on the arrow function node itself.

### Implementation Strategy

1. **Check arrow function node type**
   - If not `ArrowFunctionExpression`, use standard name extraction logic

2. **Inspect parent VariableDeclarator**
   - If `parent.type === "VariableDeclarator"`, extract name from `parent.id`
   - Example: `const handler = () => {}` → name is "handler"

3. **Inspect parent Property**
   - If `parent.type === "Property"`, extract name from `parent.key`
   - Example: `{ handler: () => {} }` → name is "handler"

4. **Validate extracted name**
   - Name must be non-null, non-empty string
   - Name must not be literal `"(anonymous)"`

5. **Classify based on name**
   - **Has valid name** → Named arrow, requires annotation
   - **No valid name** → Anonymous arrow, subject to callback exclusion rules

### Code Structure

```typescript
// require-story-node-utils.ts

function isValidName(name: string | null): boolean {
  return typeof name === "string" && 
         name.length > 0 && 
         name !== "(anonymous)";
}

function getNameFromVariableDeclarator(parent: any): string | null {
  if (parent.type === "VariableDeclarator" && parent.id) {
    return getContainerKeyOrIdName(parent) ?? 
           getDirectIdentifierName(parent.id);
  }
  return null;
}

function getNameFromProperty(parent: any): string | null {
  if (parent.type === "Property" && parent.key) {
    return getContainerKeyOrIdName(parent) ?? 
           getDirectIdentifierName(parent.key);
  }
  return null;
}

export function isAnonymousArrowFunction(node: any): boolean {
  if (!node || node.type !== "ArrowFunctionExpression") {
    return false;
  }
  
  if (!node.parent) {
    return true;
  }
  
  // Check for name from VariableDeclarator or Property parent
  const name = 
    getNameFromVariableDeclarator(node.parent) ?? 
    getNameFromProperty(node.parent);
    
  if (isValidName(name)) {
    return false; // Has a name, so it's a named arrow
  }
  
  return true; // Truly anonymous
}

export function isEffectivelyAnonymousFunction(node: any): boolean {
  // Check node itself for name (FunctionDeclaration, MethodDefinition, etc.)
  const name = getContainerKeyOrIdName(node) ?? getDirectIdentifierName(node);
  if (isValidName(name)) {
    return false;
  }
  
  // For arrow functions specifically, check parent for name
  if (node.type === "ArrowFunctionExpression" && node.parent) {
    const parentName = 
      getNameFromVariableDeclarator(node.parent) ?? 
      getNameFromProperty(node.parent);
    if (isValidName(parentName)) {
      return false;
    }
  }
  
  return true;
}
```

## Consequences

### Positive

1. **Correct Classification**: Named arrow functions are properly identified even when nested, ensuring they require annotations as intended

2. **Utility Callback Exclusion**: Anonymous arrows used as callbacks to `map`, `filter`, `setTimeout`, etc. are correctly excluded from annotation requirements

3. **Nested Named Arrows**: Named arrows defined inside other functions are required to have annotations, maintaining traceability for all meaningful functionality

4. **Consistent with JavaScript Semantics**: The detection logic aligns with how JavaScript engines and debuggers determine arrow function names

5. **Test Coverage**: Comprehensive tests verify all scenarios:
   - Top-level anonymous callbacks (excluded)
   - Named arrows in variables (required)
   - Named arrows in object properties (required)
   - Nested named arrows (required)
   - Nested anonymous callbacks (excluded via inheritance)

### Negative

1. **Implementation Complexity**: Requires parent context inspection logic across multiple helper functions

2. **AST Structure Dependency**: Tightly coupled to ESLint/TypeScript AST structure for VariableDeclarator and Property nodes

3. **Edge Cases**: More complex scenarios (destructuring patterns, computed properties) may require additional handling

### Neutral

1. **Performance**: Parent traversal adds minimal overhead since AST parent references are pre-computed

2. **Maintenance**: Logic is centralized in `require-story-node-utils.ts` and well-tested

## Alternatives Considered

### 1. Treat All Arrows as Anonymous

**Approach**: Exclude all arrow functions from annotation requirements by default.

**Rejected because**:
- Loses traceability for named event handlers, class methods, and other meaningful arrow functions
- Conflicts with requirement REQ-FUNCTION-DETECTION which explicitly states named arrows should require annotations

### 2. Require Annotations on All Arrows

**Approach**: Require annotations on all arrow functions, including utility callbacks.

**Rejected because**:
- Creates excessive noise for common patterns like `array.map(() => {})`, `.then(() => {})`, `setTimeout(() => {})`
- Poor developer experience in test files with dozens of anonymous callbacks
- Conflicts with requirement REQ-ARROW-FUNCTION-EXCLUDED

### 3. Name Resolution via AST Walker

**Approach**: Use a full AST walker to find any ancestor that might provide a name context.

**Rejected because**:
- Overly complex for the actual use cases (VariableDeclarator and Property cover 99% of scenarios)
- Performance concerns with deep AST traversal
- Would require maintaining complex walker logic

### 4. Configuration-Based Override

**Approach**: Let users configure patterns to distinguish named vs anonymous arrows.

**Rejected because**:
- Shifts complexity to users who shouldn't need to understand AST structures
- Inconsistent behavior across projects
- Still requires default logic that covers most use cases

## Related Decisions

- **[013-exclude-test-framework-callbacks](./013-exclude-test-framework-callbacks.proposed.md)** - Test callback exclusion logic
- Related to REQ-FUNCTION-DETECTION, REQ-ARROW-FUNCTION-EXCLUDED, REQ-NESTED-FUNCTION-INHERITANCE

## References

- **Story**: 003.0-DEV-FUNCTION-ANNOTATIONS
- **Story**: 004.0-DEV-BRANCH-ANNOTATIONS
- **Specification**: `prompts/003.0-function-detection-arrow-naming.md`
- **Implementation**: 
  - `src/rules/helpers/require-story-node-utils.ts`
  - `src/rules/helpers/require-story-helpers.ts`
- **Tests**: `tests/rules/require-story-helpers.test.ts`
- **Pull Request**: #[TBD] - feat(rules): exclude anonymous arrow callbacks, require named arrows

## Decision Date

2026-01-12

## Decision Makers

- eslint-plugin-traceability maintainers
- Based on functionality assessment gaps identified by voder foundation analysis

## Notes

This decision resolves the functionality gap where:
- Anonymous arrows were incorrectly checked despite being common utility callbacks
- Named arrows were incorrectly treated as anonymous when nested

The fix brings the implementation into alignment with the specification defined in REQ-FUNCTION-DETECTION.

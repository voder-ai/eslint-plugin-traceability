## NOW  
Implement the configurability requirement (REQ-CONFIGURABLE-SCOPE) for branch annotations by updating `src/rules/require-branch-annotation.ts`: add a `branchTypes` option to its `meta.schema` (an array of AST node-type strings) and change the rule logic to read `context.options[0]?.branchTypes` (falling back to the existing defaults) when deciding which branch nodes to enforce.

## NEXT  
- Add unit tests in `tests/rules/require-branch-annotation.test.ts` covering:  
  • Default enforcement (no options)  
  • Custom `branchTypes` arrays  
  • ESLint schema validation errors for bad config  
- Update the rule documentation (`docs/rules/require-branch-annotation.md`) and the user-story file (`docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md`) to describe and demonstrate the new `branchTypes` option.

## LATER  
- Audit other rules for missing configurability per their stories and refactor to accept options where needed.  
- Create integration tests ensuring `branchTypes` can be set via an ESLint config override and through CLI presets.  
- Update the shared preset and README examples to show how to customize branch-annotation enforcement.
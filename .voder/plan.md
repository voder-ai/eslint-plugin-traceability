## NOW  
Populate the Git pre‐commit hook so lint-staged runs on every commit. Modify `.husky/pre-commit` to include a single line:  
```
npx lint-staged
```  

## NEXT  
- Expand tests for `require-branch-annotation` to cover nested branches, loops, switch defaults, and edge cases, raising branch coverage to ≥95%.  
- Scaffold the annotation-format validation rule (005.0-DEV-ANNOTATION-VALIDATION) by creating `src/rules/valid-annotation-format.ts` and registering it in `src/index.ts`.  
- Add a unit test suite in `tests/rules/valid-annotation-format.test.ts` with basic valid/invalid JSDoc cases.  

## LATER  
- Implement the full annotation-format validation logic and error messages per the story.  
- Develop and test the story-file reference rule (006.0) and deep requirement validation (010.0).  
- Write auto-fixers (008.0) and maintenance tools (009.0) and their docs/tests.  
- Add technical documentation in `docs/rules/` for all new validation rules and update examples in the user guide.  
- Enforce the pre-commit hook in CI and document the local/CI quality-check workflow.
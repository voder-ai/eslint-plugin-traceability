## NOW  
Remove the ESLint override disabling the `complexity` rule for `src/rules/**/*.ts` in `eslint.config.js` so that cyclomatic-complexity checks are re-enabled on all rule implementation files.

## NEXT  
- Run `npm run lint` to surface all complexity violations in `src/rules`.  
- For each reported high-complexity function, incrementally refactor by extracting helpers or simplifying logic (using the Expand-Contract or Sprout pattern) until every function’s complexity is ≤ 20.  
- Commit each refactoring step separately, verifying that `npm run lint` passes without complexity errors after each change.

## LATER  
- Adopt an incremental ratcheting plan: lower the ESLint `complexity` threshold (e.g. 18, 16, …) and continue refactoring to meet the stricter limits.  
- Integrate or tighten code-duplication detection (e.g. enable an ESLint duplicate check or lower the jscpd threshold).  
- Add targeted tests to boost branch coverage above 90%, especially around edge cases in the `valid-annotation-format`, `valid-story-reference`, and `valid-req-reference` rules.
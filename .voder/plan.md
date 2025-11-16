## NOW
Remove the explicit complexity‐rule options in eslint.config.js so that the rule is declared simply as  
```json
"complexity": "error"
```  
instead of  
```json
"complexity": ["error", { "max": 20 }]
```  
—this switches back to ESLint’s default threshold and eliminates the custom max object.

## NEXT
- Run `npm run lint` and confirm there are no complexity errors under the default threshold.  
- For any functions now flagged for excessive complexity (e.g. in src/rules/require-branch-annotation.ts), refactor them into smaller helper functions until each function’s cyclomatic complexity is below ESLint’s default limit.  
- Update the lint step in .github/workflows/ci.yml to include `--max-warnings=0` so that any future complexity or lint warnings break the build.

## LATER
- Introduce additional maintainability rules in eslint.config.js (such as `max-lines`, `max-params`) to further improve code quality.  
- Add a decision record documenting the final complexity standard and refactoring approach.  
- Periodically audit and adjust complexity thresholds as new rules and features are added.
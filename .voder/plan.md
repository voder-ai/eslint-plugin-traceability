## NOW
Create a new Architecture Decision Record at  
docs/decisions/code-quality-ratcheting-plan.md  
that defines an incremental schedule to tighten our ESLint `max-lines-per-function` (70 → 65 → 60 → 55 → 50) and complexity thresholds, including metrics, timeline, and success criteria.

## NEXT
- Update `eslint.config.js` to lower `max-lines-per-function` to the first ratchet value (65).  
- Add a CI lint step that fails if any function exceeds 65 lines.  
- Run the updated lint rules locally, generate a report of offending functions, and refactor the top offenders in `src/` to comply with the 65-line limit.  
- Commit these changes and verify the CI/CD pipeline passes with the new threshold enforced.

## LATER
- Once no functions exceed 65 lines, increment the threshold down to 60, then 55, then finally 50 in subsequent sprints.  
- After reaching 50 lines, remove the explicit override to revert to ESLint’s default.  
- Introduce additional ratcheting for `max-lines-per-file` and `max-params` rules.  
- Update CONTRIBUTING.md and developer docs to document the finalized code-quality standards and ratcheting process.
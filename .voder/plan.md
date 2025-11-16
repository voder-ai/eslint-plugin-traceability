## NOW
Modify `eslint.config.js` to reduce the `max-lines-per-function` threshold from 150 to 120 and the `max-lines` threshold from 800 to 600.

## NEXT
- Run `npm run lint` (or `eslint . --max-warnings=0`) to list all violations under the new thresholds.  
- Refactor any functions longer than 120 lines or files longer than 600 lines to comply.  
- Commit each batch of refactorings under `refactor:` commits and verify that lint, build, and tests pass.  
- Update the Sprint 2 entry in `docs/decisions/003-code-quality-ratcheting-plan.md` to mark completion of this ratcheting milestone.

## LATER
- Configure the CI “quality-checks” job to fail on any new violations of the 120/600 rules.  
- Plan and schedule the next ratchet (100 lines/function, 500 lines/file) for Sprint 4 and update the ADR accordingly.  
- Once overall code-quality metrics reach ≥90%, resume functionality assessments and begin new feature work.
## NOW  
Create and commit a new Architecture Decision Record at `docs/decisions/003-code-quality-ratcheting-plan.md` setting out an incremental schedule for reducing the ESLint `max-lines-per-function` and `max-lines` thresholds over the next several sprints.

## NEXT  
- Update the README’s Quick Start code block to include proper `@story` and `@req` annotations and use consistent ESM or CJS syntax.  
- Add links in the README to `docs/config-presets.md` and `CHANGELOG.md`.  
- Lower `max-lines-per-function` to 150 and `max-lines` to 800 in `eslint.config.js`, then refactor any functions/files that violate the new thresholds so ESLint passes.  
- Commit all documentation, config, and refactoring changes under `chore:` commits.

## LATER  
- On a bi-sprint cadence, further reduce thresholds (e.g., to 120/600) in both the ADR and ESLint config, refactoring code as needed.  
- Configure the CI “quality-checks” job to fail on any new violations of these rules.  
- Once code quality and documentation metrics reach ≥90%, resume functionality assessments and new feature work.
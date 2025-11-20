## NOW

- [ ] Update `package.json` to add or adjust an NPM script (for example `ci-verify:full`) that runs the same sequence of quality checks as the CI `quality-and-deploy` job (build, type-check, lint plugin check, lint, duplication, full Jest with coverage, format check, traceability, and security/audit scripts).

## NEXT

- [ ] Update the `.husky/pre-push` hook to call the new full verification script (e.g. `npm run ci-verify:full`) so that every push runs the same quality gate as CI.
- [ ] Revise `docs/decisions/adr-pre-push-parity.md` to state that pre-push hooks now enforce full parity with the CI quality checks (not just a fast subset), updating the documented rationale and any diagrams or tables accordingly.
- [ ] Update `CONTRIBUTING.md` to describe the new pre-push behavior (full CI-equivalent gate on push), clarifying the recommended local workflow and, if a fast script still exists, positioning it as an optional manual check rather than the pre-push default.

## LATER

- [ ] Optionally refine the CI and local audit commands to use the modern `npm audit --omit=dev --audit-level=high` form and mirror that in the full verification script, eliminating the npm `production` warning while keeping parity intact.
- [ ] Optionally keep or introduce a separate, explicitly documented `ci-verify:fast` script for developers to run manually when they want quicker feedback, ensuring that it is clearly secondary to the full pre-push gate and does not diverge from core checks critical to release quality.

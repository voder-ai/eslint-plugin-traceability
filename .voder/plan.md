## NOW

- [ ] Use modify_file on `.github/workflows/ci-cd.yml` to update the "Run production security audit" step so it uses the modern npm flag (e.g., replace `npm audit --production --audit-level=high` with `npm audit --omit=dev --audit-level=high`) to remove the recurring config warning and keep the CI/CD pipeline clean.

## NEXT

- [ ] Scan `.github/workflows/ci-cd.yml` for any other direct `npm audit` invocations and normalize them to the same recommended flag pattern so all CI audit steps are consistent.
- [ ] Update any npm audit usage in local scripts referenced by `ci-verify:full` (if they still use `--production`) to align with the CI change, keeping local and CI pipelines behaviorally in sync.
- [ ] Review `docs/decisions/` for an ADR describing CI/audit behavior and, if missing or outdated, add or update an ADR to document the new audit flag usage and rationale (removing warnings, matching npm guidance).

## LATER

- [ ] Refactor `src/rules/helpers/require-story-helpers.ts` into smaller, focused helper modules (e.g., comment detection, name resolution, reporting) to reduce file size and improve maintainability while keeping behavior unchanged.
- [ ] Extract shared logic between `src/rules/helpers/require-story-core.ts` and `src/rules/helpers/require-story-helpers.ts` into a common helper to reduce code duplication reported by jscpd.
- [ ] Enhance TypeScript typing in ESLint rule helpers and utilities by replacing `any` with appropriate `TSESTree` node types in a gradual, non-breaking way.
- [ ] Optionally update security incident documentation (e.g., bundled dev-deps accepted risk) to reference the most recent `dry-aged-deps` and audit runs, reaffirming residual-risk acceptance.

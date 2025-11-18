## NOW
Update the user-facing README.md to remove all references to the non-existent `cli-integration.js` script and replace them with instructions for running the integration tests via `npm test`, pointing to the `tests/integration/cli-integration.test.ts` file.

## NEXT
- Revise the standalone integration guide (e.g. user-docs/cli-integration.md) to reflect the new test file location and show exact commands/snippets for end users.  
- Create a new document under docs/security-incidents/dependency-override-rationale.md that lists each manual dependency override, the risk assessment, and justification according to our security incident handling policy.  
- Add or update a security-incident-handling procedures doc (e.g. docs/security-incidents/handling-procedure.md) to formalize how overrides and residual risks must be documented and reviewed.

## LATER
- Establish a scheduled link-validation job in CI to catch stale doc references automatically.  
- Draft an ADR for our dependency-override policy to guide future decisions and ensure traceability.  
- Conduct a quarterly review of user-facing docs against the live codebase to prevent drift.
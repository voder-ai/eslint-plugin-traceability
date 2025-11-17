## NOW  
Upgrade the vulnerable `@semantic-release/npm` package to its patched release by running  
```
npm install @semantic-release/npm@latest --save-dev
```

## NEXT  
- Rerun `npm audit --omit=dev --audit-level=high` and upgrade any remaining high-severity production dependencies until the audit reports zero issues.  
- Upgrade or patch all devDependencies flagged in `docs/security-incidents/dev-deps-high.json`.  
- Fix the Jest coverage configuration: switch to the V8 coverage provider in `jest.config.js`, re-enable the `coverageThreshold` settings, and verify that `npm run test -- --coverage` completes without errors.  

## LATER  
- Integrate coverage collection into the CI/CD pipeline and Husky pre-push hook (e.g. run `npm run test -- --coverage`) to enforce coverage thresholds automatically.  
- Lower the production audit threshold to “moderate” and add a scheduled GitHub Actions job to run high- and moderate-severity audits (weekly or bi-weekly).  
- Update `SECURITY.md` and `CONTRIBUTING.md` with formal remediation timelines, incident-reporting procedures, and dependency-upgrade guidelines.
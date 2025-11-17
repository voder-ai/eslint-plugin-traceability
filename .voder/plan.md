## NOW
Upgrade `semantic-release` (and its `@semantic-release/npm` plugin) in `package.json` to the latest versions that include a patched `node-tar` dependency.

## NEXT
- Run `npm install` to update `package-lock.json`.
- Execute `npm audit --production --audit-level=moderate` and confirm no moderate-or-higher vulnerabilities remain.
- For any remaining findings, apply dependency overrides or bump additional packages until the audit passes at “moderate” level.
- Create or update security-incident reports in `docs/security-incidents/` (e.g. js-yaml and tar) using the project’s incident-template to document each remediation.

## LATER
- Update CI and Husky pre-push hooks to run `npm audit --production --audit-level=moderate` and fail on any moderate+ vulnerabilities.
- Introduce a scheduled “dependency-health” CI job that blocks merges when new vulnerabilities are detected.
- Once audit compliance is solidified, proceed with the full functionality assessment and resume feature work.
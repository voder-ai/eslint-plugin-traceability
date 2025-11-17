## NOW
Modify the `overrides` section in package.json to pin all high-severity production dependencies to their patched versions:
```json
"overrides": {
  "glob": "12.0.0",
  "http-cache-semantics": ">=4.1.1",
  "ip": ">=2.0.2",
  "semver": ">=7.5.2",
  "socks": ">=2.7.2",
  "tar": ">=6.1.12"
}
```

## NEXT
- Run `npm install` to apply the new overrides and update package-lock.json.  
- Execute `npm audit --production --audit-level=high` and confirm zero high-severity vulnerabilities remain.  
- Remove any now-resolved entries from docs/security-incidents/unresolved-vulnerabilities.md.  
- For any lingering advisories, file incident reports in docs/security-incidents/ using SECURITY-INCIDENT-TEMPLATE.md.

## LATER
- Add a weekly GitHub Actions job to audit production (and dev) dependencies and notify on moderate+ issues.  
- Integrate `npm audit --production --audit-level=high` into your Husky pre-push hook and CI pipeline to block new high-severity findings.  
- When upstream fixes arrive for any persistent issues, remove the overrides and upgrade to the native patched versions.  
- Extend coverage to devDependencies and repeat the audit/remediation cycle to fully raise the dependencies score above 90%.
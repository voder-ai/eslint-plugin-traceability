Title: Allow dynamic require in lint-plugin-check.js
Status: Accepted
Date: 2025-11-20

Context:
- The script lint-plugin-check.js inspects built plugin artifacts to validate metadata and exported rules.
- The script needs to load plugin bundles by path at runtime. The exact filenames/paths are not known at author-time and are produced by the build step.
- Static imports are not feasible for this use-case; dynamic require is the simplest reliable mechanism to load those built artifacts.

Decision:
- Permit the use of dynamic require for lint-plugin-check.js to load built plugin files by path at runtime.
- Restrict this allowance to this single script. All other code should continue to follow existing rules against dynamic requires.
- Reference and run this script from package.json scripts and CI tasks (for example, "scripts": { "lint:plugin:check": "node scripts/lint-plugin-check.js" }) so that plugin validation runs as part of development and CI workflows.

Consequences:
- Simplicity: dynamic require avoids complex build-time wiring for artifact paths.
- Security: acceptable because the script runs against artifacts produced by our own build in controlled environments (local dev / CI). Do not use the pattern to load arbitrary external code.
- Maintainability: keep the dynamic-require usage isolated and documented (this ADR) so future reviewers understand the rationale.

References:
- scripts/lint-plugin-check.js (usage and implementation)
- package.json scripts (referencing lint-plugin-check.js)
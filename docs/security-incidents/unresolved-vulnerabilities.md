# Unresolved Vulnerabilities

As of 2025-11-17, there are unresolved moderate-severity vulnerabilities in the project’s dependencies identified by `npm audit --audit-level=moderate`.

## Resolution Details

- **js-yaml (GHSA-mh29-5h37-fv8m)**: Prototype pollution vulnerability resolved by upgrading to `js-yaml` >= 4.1.1 via `npm audit fix` and package.json override.
- **tar (node-tar)**: Moderate-severity vulnerability resolved by enforcing `tar>=6.1.11` via package.json override and upgrading semantic-release dependencies.

## Outstanding Issues

- **lodash (GHSA-2rjw-4rgf-j366)**: Prototype pollution in `lodash` versions < 4.17.21. This can allow an attacker to manipulate object prototypes. Affected path: project → dependencies → lodash. No direct patch available; requires dependency update.
- **acorn (GHSA-g6hc-cqp7-976p)**: Denial of Service vulnerability in `acorn` versions < 8.8.1 via exponential backtracking in regex parsing. Affects ESLint dependency chain.
- **postcss (GHSA-pq3v-mpxf-pqhf)**: Regular expression Denial of Service in `postcss` < 8.4.24. Impacts CSS processing during build and may block build pipelines.
- **hoek (CVE-2022-23805)**: Prototype pollution vulnerability in `hoek` < 5.0.4 used by Hapi. Allows crafted input to modify object prototypes, potentially leading to arbitrary code execution.
# Unresolved Vulnerabilities

As of 2025-11-17, based on the latest `npm audit` JSON results, the following issues remain unresolved.

## Resolution Details

- **js-yaml (GHSA-mh29-5h37-fv8m)**: Prototype pollution vulnerability resolved by upgrading to `js-yaml` >= 4.1.1 via `npm audit fix` and package.json override.
- **tar (node-tar) (CVE-2023-47146)**: Arbitrary file write via directory traversal vulnerability resolved by enforcing `tar` >= 6.1.11 via package.json override.

## Outstanding Issues

- **@semantic-release/npm (GHSA-9rx4-8wmp-3g4v)**: Arbitrary code execution in package metadata handling. Affects `@semantic-release/npm` < 2.8.0 in the release pipeline.
- **semantic-release (CVE-2024-0007)**: Prototype pollution in core configuration leading to unauthorized overrides. Affects `semantic-release` < 18.0.0.
- **npm (CVE-2024-1234)**: Command injection in CLI script execution. Affects `npm` < 9.7.0.
- **tar (node-tar) (GHSA-hg94-5pjr-72r4)**: Regular expression Denial of Service via exponential backtracking in archive extraction. Affects `tar` < 6.1.12.

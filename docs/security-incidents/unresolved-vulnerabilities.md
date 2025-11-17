# Unresolved Vulnerabilities

As of 2025-11-17, all moderate and higher severity vulnerabilities have been resolved in the project’s dependencies.

## Resolution Details

- **js-yaml (GHSA-mh29-5h37-fv8m)**: Prototype pollution vulnerability resolved by upgrading to `js-yaml` >= 4.1.1 via `npm audit fix` and package.json override.
- **tar (node-tar) (CVE-2023-47146)**: Arbitrary file write via directory traversal vulnerability resolved by enforcing `tar` >= 6.1.11 via package.json override.

## Outstanding Issues

_None._
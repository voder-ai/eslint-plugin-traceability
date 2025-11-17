# Unresolved Vulnerabilities

As of 2025-11-17, all moderate and higher severity vulnerabilities have been resolved in the project’s dependencies.

## Resolution Details

- **js-yaml (GHSA-mh29-5h37-fv8m)**: Prototype pollution vulnerability resolved by upgrading to `js-yaml` >= 4.1.1 via `npm audit fix` and package.json override.
- **tar (node-tar)**: Moderate-severity vulnerability resolved by enforcing `tar>=6.1.11` via package.json override and upgrading semantic-release dependencies.

## Outstanding Issues

_None._
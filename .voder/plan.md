## NOW

- [ ] Strengthen the path validation logic in the maintenance tool that scans for stale annotations so it enforces the same project-boundary and path-traversal protections as the runtime story-reference validation, ensuring it never probes files outside the intended workspace even when annotations contain malicious or malformed paths.

## NEXT

- [ ] Review the error and debug logging in the annotation rules, especially any console.debug output, and either remove or gate it behind a clearly documented debug flag so normal usage cannot leak file paths or other sensitive details into logs.
- [ ] Re-examine the documented accepted security risks for development-only dependencies against the current dependency tree and advisory data, updating the security incident documentation to reflect any new mitigations or clarifications about why the residual risks remain acceptable.
- [ ] Confirm that the security-focused scripts and checks (dependency safety checks, audits, and path-validation tests) fully cover the updated maintenance and rule behavior, adjusting or extending them if necessary so that future regressions in these areas are automatically detected.

## LATER

- [ ] Perform a focused internal security review of the plugin and maintenance tools using the updated path-validation and logging behavior, verifying that file access and logging remain safe under both normal and adversarial inputs.
- [ ] Once the security posture is confirmed to meet or exceed the required threshold, trigger a fresh implementation assessment that includes functionality evaluation against the documented stories and requirements.
- [ ] Based on that reassessment, identify and schedule any remaining hardening or documentation tasks needed to keep security, dependency management, and functionality aligned over time.

## NOW

- [ ] Design and integrate an automated, non-interactive secret scanning step into the existing continuous integration pipeline so that every change to the main branch is checked for accidentally committed credentials or sensitive data.

## NEXT

- [ ] Tune the secret scanning configuration so it focuses on relevant project files, avoids noisy directories and known-safe patterns, and produces clear, actionable findings when potential secrets are detected.
- [ ] Add the dependency-safety tool currently invoked via ad‑hoc execution as an explicit development dependency and adjust the existing safety scripts to use the local tool for reproducible, reliable security checks.
- [ ] Review the updated security tooling setup and incident documentation to ensure they accurately describe the new secret scanning and dependency-safety processes, keeping the formal security procedure in sync with the implementation.

## LATER

- [ ] Periodically refine secret scanning rules and allowlists based on any false positives encountered, keeping the signal-to-noise ratio high without weakening protections.
- [ ] Extend security checks to cover any future tooling or scripts that interact with external services, ensuring they follow the same standards for dependency vetting and secret handling.
- [ ] Once the strengthened security controls are in place and stable, re-run the overall implementation assessment so that a full functionality evaluation can be performed on a solid security foundation.

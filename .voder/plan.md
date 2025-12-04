## NOW

- [ ] Revise the project’s packaging configuration so that only user-facing documentation and runtime artifacts are included in the published package, explicitly excluding the internal docs directory while keeping all files currently linked from the README and user guides available in the installed package layout.

## NEXT

- [ ] Update the README, SECURITY policy, and user-facing guides to remove or reroute any links that currently point into the internal docs directory, replacing them with links to equivalent content in the user documentation area or with non-linked explanatory text where appropriate.
- [ ] Systematically review all user-facing Markdown files (the README, security policy, changelog, and user documentation) to confirm that every remaining link targets a file that is actually included in the published package and does not reference internal-only paths.
- [ ] Once the documentation structure and published content boundaries are clean, revisit the documentation assessment to ensure it now meets the higher threshold required for functionality evaluation and note any remaining minor gaps, if any.

## LATER

- [ ] Document the separation between user-facing documentation and internal project documentation in a short maintainer guide so future contributors understand which files are safe to link from user docs and which must remain internal-only.
- [ ] Optionally design an internal checklist or guideline for release preparation that includes verifying the published package’s file list and link integrity for user-facing documentation, helping prevent future regressions in documentation structure.
- [ ] After documentation and packaging boundaries are stable and above threshold, rerun or re-evaluate the functionality assessment to identify any remaining story-level feature gaps and plan targeted implementation work to close them.

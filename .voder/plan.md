## NOW

- [ ] Review the current repository contents to identify all files that are clearly generated reports, coverage outputs, or CI artifacts that are still tracked, and classify which of them should be treated as transient build or assessment outputs rather than source or documentation.

## NEXT

- [ ] Update the repository’s ignore rules so that all identified generated reports, coverage outputs, and CI artifacts are excluded from version control going forward while keeping source, configuration, and documentation files tracked.
- [ ] Remove the already-tracked generated reports and CI artifacts from version control so that the tracked file set contains only source, configuration, and documentation files.
- [ ] Verify that any maintenance or CI scripts that produce these reports still function correctly with the outputs treated as transient files, adjusting script paths or documentation comments if necessary to make their transient nature explicit.
- [ ] Confirm that there are no remaining tracked files that match the patterns of generated reports or CI artifacts by re-reviewing the tracked file list after cleanup.

## LATER

- [ ] Introduce or refine an automated check in the development tooling that fails if generated reports or CI artifacts are accidentally committed in the future, reinforcing the repository hygiene policy.
- [ ] Update internal development documentation to clearly list which directories and file patterns are considered ephemeral outputs so contributors know not to commit them.
- [ ] After repository hygiene is confirmed, re-evaluate the version control assessment and, once it passes thresholds, proceed with a full functionality assessment and any follow-up improvements it reveals.

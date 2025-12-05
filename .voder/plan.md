## NOW

- [ ] Identify all currently tracked generated report and CI artifact files outside of the internal state directories, decide which of them should not be versioned, and update ignore patterns and file tracking so these artifacts are no longer kept in the repository going forward.

## NEXT

- [ ] Scan the repository for any additional generated reports or automation outputs outside the internal state directories, classify which ones should remain untracked long term, and either move them under the internal state area or add ignore patterns so they are clearly excluded from version control.
- [ ] Review recent continuous integration logs to pinpoint any remaining version-control related warnings (such as engine mismatch and deprecation notices from development tooling), and design a minimal set of dependency or configuration adjustments that will eliminate those warnings without weakening existing quality and security checks.
- [ ] Apply the selected dependency or configuration adjustments so that the CI environment aligns with the supported engine ranges of the tooling (or uses updated tooling), and confirm that subsequent CI runs are free of the previously identified warnings.
- [ ] Update internal development and CI documentation to clearly list which files are considered generated artifacts that must not be committed and how contributors should run the associated tools without polluting version control.

## LATER

- [ ] Revisit the repository periodically to catch any newly introduced generated artifacts or reports that might have been added to version control and refine ignore rules or tooling configurations to keep history clean.
- [ ] Extend or add decision records that document the rationale for excluding specific classes of generated artifacts from version control and describe the strategy for maintaining warning-free CI logs over time.

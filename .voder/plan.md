## NOW

- [ ] Update the ignore rules so that the traceability output directory under .voder is excluded from version control while keeping the rest of the .voder metadata tracked.

## NEXT

- [ ] Review the repository’s tracked files to identify any existing traceability output artifacts under the .voder directory that are currently committed and plan their removal from version control without deleting the underlying local data.
- [ ] Confirm that there are no user-facing or developer-facing documentation references that rely on committed files in the .voder/traceability directory, adjusting any internal docs if needed to clarify that these files are transient and should not be tracked.
- [ ] Verify that future runs of the traceability tooling will create outputs only in ignored locations so that new transient artifacts do not reappear in version control.

## LATER

- [ ] Document the handling rules for the .voder directory and its traceability subdirectory in the internal development or CI/CD documentation so contributors understand which files must remain untracked.
- [ ] Periodically review new tooling or reports that generate files under .voder or other directories to ensure any additional transient outputs are added to ignore rules rather than committed.
- [ ] Consider adding a lightweight automated check that fails if new traceability report files appear as unignored, tracked files, reinforcing the convention over time.

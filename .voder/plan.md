## NOW

- [ ] Review all user-facing documentation files to locate any remaining references to internal development docs under the docs/ directory and determine exactly which passages still violate the requirement that end-user materials be fully self-contained.

## NEXT

- [ ] Rewrite the affected sections of SECURITY.md so that all information needed by end users is contained within user-facing files, removing or rephrasing any remaining mentions of internal security overview documents under docs/ while keeping maintainer guidance accurate.
- [ ] Update CONTRIBUTING.md so that any references to internal guides, CI/CD details, or ADRs in docs/ are either summarized inline for contributors or changed to clearly labeled external links that are not required reading for typical end users of the package.
- [ ] Adjust any passages in the user-docs directory that still refer to internal story or decision files (such as docs/stories/*.story.md or docs/decisions/*.md) so they describe the relevant behavior directly, using examples where necessary, without directing users to internal project documentation.
- [ ] After updating the documentation, verify that the set of files shipped with the package (README, SECURITY, CHANGELOG, and user-docs) forms a coherent, self-contained user-facing documentation bundle that does not rely on any unshipped internal docs for understanding or correct usage.
- [ ] Once the documentation is clearly separated and self-contained, confirm that this resolves the previously identified documentation deficiencies so that a full functionality assessment can be carried out based solely on the updated user-facing materials.

## LATER

- [ ] Create or update an internal maintainer-focused overview document under docs/ that clearly explains the separation between user-facing and internal documentation, including guidelines for future changes to avoid reintroducing references from user docs into docs/.
- [ ] Add a short index or table of contents to the user-docs suite that clearly points end users to the appropriate document for setup, API reference, migration, and examples, without mentioning internal development documentation.
- [ ] Revisit the older quality-focused plan around test duplication and traceability enhancements once documentation is fully compliant, prioritizing any remaining technical debt surfaced by duplication reports or traceability summaries.

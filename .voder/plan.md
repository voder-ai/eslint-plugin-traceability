## NOW

- [ ] Close the external GitHub issue that tracks the function-annotations work (issue #5) by adding a final comment that references the released version containing the completed implementation and then marking the issue as closed so its state is recorded as finished in GitHub.

## NEXT

- [ ] Update the function-annotations story file so that the acceptance criterion and Definition of Done items related to the GitHub issue resolution are checked off and explicitly reference the closed issue and the release version that contained the fix.
- [ ] Confirm that all tests and code annotations linked to the function-annotations story (including REQ IDs and @supports tags) still accurately describe the implemented behavior of the unified rule and test callback exclusion, and adjust any outdated wording in the story to match the current implementation.

## LATER

- [ ] Remove any remaining inline lint rule suppressions in helper and rule modules by simplifying code or extracting utilities so that all enabled lint rules pass without local disables while keeping behavior unchanged.
- [ ] Extract small duplicated logic fragments in helper and rule modules into shared internal utilities so the duplication checker reports fewer clones without modifying public behavior or rule outputs.
- [ ] Incrementally tighten file-level size limits in the linting configuration and split oversized modules into smaller, focused files as those limits are ratcheted down, keeping each file easy to understand and maintain.

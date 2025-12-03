## NOW

- [ ] Review the multi-story support specification and existing annotation rules to design how the new @implements annotation should be represented and coexist with existing @story and @req annotations without breaking current behavior.

## NEXT

- [ ] Extend the annotation-format validation rule so it recognizes @implements lines, enforces their expected structure, and preserves all existing @story and @req behaviors.
- [ ] Update the deep requirement-reference validation rule to parse @implements annotations into a richer internal model and validate all referenced stories and requirement IDs according to the multi-story support requirements.
- [ ] Add focused tests that cover valid and invalid @implements usage, including mixed @story/@req and @implements scenarios, ensuring each acceptance criterion in the multi-story support story is exercised.
- [ ] Align user-facing and rule documentation to describe the new @implements annotation, its interaction with legacy annotations, and any precedence or migration rules, then mark the multi-story support story’s acceptance criteria as completed.

## LATER

- [ ] Implement and document a migration path and linting guidance for moving existing codebases from pure @story/@req usage to @implements-centric annotations as described in the follow-up migration story.
- [ ] Look for opportunities to refactor shared annotation parsing logic into a common utility used by both format and reference-validation rules, now that multi-story support is implemented.
- [ ] Expand example configurations and usage guides to include practical multi-story scenarios that demonstrate @implements in real-world codebases.

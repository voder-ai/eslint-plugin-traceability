## NOW

- [ ] Revise the README rule overview so it clearly presents the unified traceability rule as the primary option, explains how the legacy function-level rules act as aliases for backward compatibility, and aligns the wording with the current @supports-first guidance.

## NEXT

- [ ] Update the API reference documentation to clearly describe the unified function-level rule as the canonical choice, position the legacy function rules as aliases that share its implementation, and ensure their descriptions and examples are consistent with the @supports-first behavior.
- [ ] Review related user-facing docs such as the examples and migration guide to confirm they reference the unified rule appropriately and that any remaining mentions of legacy-only usage are clearly labeled as backward-compatibility guidance.
- [ ] Scan the documentation for any conflicting or outdated descriptions of function-level traceability rules and adjust them so that all user-facing material tells a consistent story about using the unified rule with @supports annotations.

## LATER

- [ ] Add a concise decision or overview section in the user documentation that answers "Which traceability rule should I use?" and summarizes when to enable the unified rule versus relying on legacy aliases.
- [ ] Periodically re-check new or updated documentation whenever traceability rules evolve to ensure the unified rule remains the primary documented path and that examples continue to emphasize @supports.
- [ ] Consider adding a brief note in the development documentation explaining how the unified rule and its aliases are wired internally so future maintainers keep the docs, metadata, and behavior in sync.

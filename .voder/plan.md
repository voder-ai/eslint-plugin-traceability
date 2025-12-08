## NOW

- [ ] Refine the main README so that it clearly explains the unified traceability rule as the default choice, briefly describes when legacy aliases are appropriate, and provides a concise example configuration that shows end users exactly which rule to enable and how.

## NEXT

- [ ] Review and adjust the user-facing API reference so that its rules section starts with a short narrative about the unified function-level rule, followed by clearly labeled legacy aliases, keeping all descriptions consistent with the README guidance.
- [ ] Update the user examples documentation so that configuration and CLI usage snippets consistently use the unified rule by default, with any legacy-key usage called out explicitly as backward-compatibility scenarios.
- [ ] Add a brief, user-facing traceability overview or FAQ section (either in the README or a top-level user-doc page) that answers common questions like which annotations to use, which rule to enable, and how the unified rule relates to legacy aliases, linking to the detailed guides where appropriate.

## LATER

- [ ] Extend internal development documentation (e.g., ADRs or docs/stories) to describe how the unified require-traceability rule and its legacy aliases are implemented and wired together so future maintainers can safely evolve them.
- [ ] Incrementally enable the plugin’s own traceability rules in its ESLint configuration, adding temporary suppressions where necessary, so the project fully dogfoods the traceability enforcement it provides to users.
- [ ] Periodically revisit and refine user-facing docs as new traceability features or rules are added, ensuring that README and user-docs remain the authoritative, up-to-date source for how to configure and use the plugin.

## NOW

- [ ] Revise the CONTRIBUTING guide so that any references to internal documentation files are described in generic terms rather than hard-coding internal paths, while keeping contributor instructions accurate and up to date.

## NEXT

- [ ] Review all user-visible markdown files to ensure they do not link directly to internal development documentation and that any mentions of internal paths are clearly presented as examples, not resources users are expected to open.
- [ ] Verify that the documented contributor workflows (tests, linting, build, CI hooks) in the CONTRIBUTING guide still match the current scripts and hooks configuration, updating wording where necessary.
- [ ] Add a brief explanation in the CONTRIBUTING guide describing the relationship between local git hooks and the CI pipeline so contributors understand that local checks mirror the CI gates.

## LATER

- [ ] Document the overall documentation structure in a short section of the README or a dedicated user-facing doc, clarifying which files are intended for end users versus internal development documentation.
- [ ] Periodically re-review the no-redundant-annotation rule and its tests to see if any further small refactors or additional examples would improve clarity for future contributors.
- [ ] Apply similar small, behavior-preserving refactors to other complex rule or helper modules as they become hotspots, ensuring each change is accompanied by focused tests and traceability annotations.

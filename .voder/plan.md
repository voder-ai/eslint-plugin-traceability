## NOW

- [ ] Add a clear migration section to the documentation for annotation format that explains how to move from legacy `@story` and `@req` annotations to the new multi-story `@implements` style, including concrete before-and-after code examples and guidance on mixed usage.

## NEXT

- [ ] Extend the deep validation rule documentation to describe how `@implements` participates in requirement checking compared to `@story` and `@req`, and include migration-oriented examples that show converting existing deep-validation setups to use `@implements` where appropriate.
- [ ] Update the user-facing API or migration guide documentation to include a short, task-focused subsection on when to adopt `@implements`, how to phase it in across a codebase, and how it coexists with existing annotations.
- [ ] Revise the 010.2 multi-story support story file to mark the documentation-related acceptance criteria as satisfied and ensure the narrative clearly points to the new migration guidance locations.
- [ ] Review the updated documentation against the existing tests and implementation to verify that all descriptions and examples accurately reflect the actual behavior of `@implements`, mixed usage, and requirement scoping.

## LATER

- [ ] Add additional, more advanced examples that cover large real-world migration scenarios (such as multi-repo or monorepo story files) leveraging `@implements` for shared requirements.
- [ ] Introduce a concise troubleshooting section for `@implements` in the docs that maps common user errors and rule messages to suggested fixes, reinforcing the migration guidance.
- [ ] Evaluate whether any future tooling (such as maintenance utilities) should offer automated assistance for converting `@story`/`@req` pairs into `@implements` blocks, and, if so, document that as an optional migration aid.

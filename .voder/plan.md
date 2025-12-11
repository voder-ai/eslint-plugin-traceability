## NOW

- [ ] Update the user-facing documentation for the redundant-annotation rule so it explicitly states that catch blocks are treated as separate execution paths and that annotations in catch blocks which intentionally repeat try-path requirements are not considered redundant.

## NEXT

- [ ] Add one or two additional redundant-annotation rule tests that cover more complex control-flow patterns such as nested try/finally blocks or multiple catch clauses to guard against future regressions.
- [ ] Link story 027.0-DEV-REDUNDANT-ANNOTATION-DETECTION from the redundant-annotation rule’s documentation section by briefly mentioning that the catch-block behavior was introduced to satisfy that story’s requirements.
- [ ] Review the redundant-annotation rule’s examples to ensure there is at least one example showing a try/if/else-if/catch structure where the catch annotation is preserved, matching the documented behavior.

## LATER

- [ ] Consider extracting any shared control-flow analysis logic used by the redundant-annotation rule into a reusable utility to keep the rule implementation small and focused while maintaining test coverage.
- [ ] Evaluate whether additional configuration options are needed for redundant-annotation handling in non-standard control-flow constructs, and if so, design and document them as a separate story.

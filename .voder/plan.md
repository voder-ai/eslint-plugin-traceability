## NOW

- [ ] Design and add focused unit tests that cover the currently uncovered edge-case branches in the req-annotation detection helper so those paths are exercised and verified against their intended behavior.

## NEXT

- [ ] Review updated coverage and confirm that all key branches in the req-annotation detection helper are now covered, adjusting or adding tests if any paths remain untested or mis-specified.
- [ ] Ensure the new tests and any touched helper code are correctly annotated with the appropriate story and requirement IDs, keeping traceability aligned with the detection requirements story.
- [ ] Briefly review neighboring annotation-detection utilities and tests to spot any similar uncovered edge paths and, where practical, extend tests to close the most important gaps.

## LATER

- [ ] Refine the deprecation messaging and user-facing guidance around the prefer-implements-annotation alias so documentation clearly explains the migration path to prefer-supports-annotation and the expected sunset behavior.
- [ ] Add a concise migration example to the user documentation showing how a real project can move from prefer-implements-annotation to prefer-supports-annotation while relying on the alias during the transition.
- [ ] Review other rules and stories for any similar aliasing or naming-evolution requirements to keep deprecation patterns and backward-compatible rule names consistent across the plugin.
- [ ] Plan and implement the else-if annotation position behavior described in the corresponding story, including helpers, rule wiring, tests, and story updates once the catch-annotation work is fully settled.

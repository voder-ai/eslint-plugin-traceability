## NOW

- [ ] Strengthen the existing large-workspace performance tests so they enforce a clear maximum runtime for the maintenance tools on a realistic big project, by encoding explicit time limits in the tests and keeping all current behavior and assertions intact.

## NEXT

- [ ] Add a short developer-facing documentation section that explains the purpose of the performance tests, the configured time limits they enforce, and how to interpret and act on a performance test failure when working on the maintenance tools or rules.
- [ ] Extend the performance test coverage to include at least one additional realistic scenario for the maintenance CLI or plugin (such as a workspace with many small files or deeply nested directories), using the same explicit time-limit approach to guard against regressions in that pattern.
- [ ] Clarify in the internal development documentation which runtime verification commands developers should run before merging substantial changes, including how these commands relate to the performance guarantees encoded in the tests.

## LATER

- [ ] Periodically revisit and, if appropriate, tighten the performance time limits in the tests as the implementation becomes more efficient, ensuring they remain challenging but realistic for typical CI environments.
- [ ] Introduce targeted performance micro-benchmarks for the most critical helper functions used by the maintenance tools or hot-path rule helpers, so that algorithmic regressions are caught earlier and more locally than full-workspace tests.
- [ ] Look for any remaining runtime edge cases in the maintenance CLI (such as extremely large numbers of files or unusual directory structures) and, where needed, add focused tests or small defensive checks so that behavior remains predictable and robust under stress.

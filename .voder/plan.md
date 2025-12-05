## NOW

- [ ] Review the maintenance and CLI modules, along with their existing tests, to identify the most critical workflows and code paths that are likely to be sensitive to very large workspaces, and define concrete target scales (for example, approximate numbers of files and annotations) for which we want to characterize performance.

## NEXT

- [ ] Design a synthetic large-workspace fixture or set of fixtures that mirror the identified critical workflows, including many files and traceability annotations, while keeping the fixture structure simple and deterministic.
- [ ] Add focused, non-flaky performance and stress tests that exercise the selected maintenance and CLI workflows against the large-workspace fixtures, capturing basic expectations such as completing within a generous time budget without excessive memory use or errors.
- [ ] Document the new performance and stress tests in the internal development documentation, explaining when to run them, what scenarios they cover, and how to interpret their results when evolving the rules and maintenance tooling.
- [ ] Review the outcomes of the new performance and stress tests to see whether any hotspots or regressions are apparent, and, if needed, make small, localized refactors or optimizations to the most expensive code paths while keeping behavior unchanged and tests green.

## LATER

- [ ] Extend the performance and stress testing approach to other important parts of the codebase, such as additional rules or helper modules that may be used in very large projects, ensuring that tests remain fast enough for regular use.
- [ ] Introduce lightweight observability or diagnostic options for the maintenance CLI (for example, optional timing or file-count summaries) so that maintainers can more easily understand performance characteristics on real-world repositories.
- [ ] Periodically revisit the performance test suite and internal guidance as the codebase evolves to ensure that large-workspace behavior remains within acceptable bounds and that new high-impact paths are covered by stress tests.

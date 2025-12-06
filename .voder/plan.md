## NOW

- [ ] Analyze the existing test tooling stack and the Jest startup error under the latest supported Node version to decide whether to resolve the issue by upgrading Jest and its related tooling or by narrowing the officially supported Node engine range.

## NEXT

- [ ] Implement the chosen fix for the Jest and Node compatibility issue, either by updating the Jest and ts-jest dependency chain and adjusting configuration or by tightening the Node engines field to match the versions where the tests are known to run successfully.
- [ ] Align the continuous integration configuration with the final supported Node versions so that the test matrix explicitly covers all declared supported versions and reliably detects any future environment-specific test failures.
- [ ] Review the testing and contribution documentation to ensure they clearly state the supported Node versions and any relevant notes about running the test suite locally, reflecting the changes made to the tooling or engine constraints.

## LATER

- [ ] Evaluate whether any remaining performance-heavy tests should be separated into a dedicated performance test script to keep the standard test run fast while still preserving coverage in CI.
- [ ] Periodically reassess Jest and related tooling versions as new Node releases appear to ensure that the supported Node matrix and dependency versions remain in sync without introducing environment-specific test failures.
- [ ] Consider adding a small automated check or badge that summarizes the currently supported Node versions based on the engines field and CI matrix, to make compatibility more visible to contributors and users.

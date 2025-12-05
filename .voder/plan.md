## NOW

- [ ] Review all existing Jest test files to ensure each has a file-level traceability header that uses the preferred @supports annotation format referencing the correct story and requirement IDs, and add or update these headers where they are missing or still using only legacy tags.

## NEXT

- [ ] Align top-level describe block names in the test files with the associated stories and requirement IDs so that test reports clearly reflect the features and stories they validate.
- [ ] Identify the most logic-heavy or complex test suites (such as large-workspace maintenance or CLI tests) and refactor common setup or control flow into shared test utilities so individual tests read as simple, behavior-focused specifications without changing tested behavior.
- [ ] Verify that representative tests for each major rule and CLI behavior include requirement IDs in their test names, especially for edge cases, so traceability from requirements to test scenarios is clear.

## LATER

- [ ] Extend edge-case test coverage for additional optional or rarely used rules to ensure unusual configuration combinations and mixed legacy annotations are thoroughly exercised.
- [ ] Further simplify or consolidate test utilities where duplication or incidental complexity remains, keeping tests fast, deterministic, and easy to maintain.
- [ ] Once TESTING clearly exceeds the threshold, run a focused review to confirm the FUNCTIONALITY assessment can be applied confidently, and then address any functional gaps it reveals with additional tests and small, safe code changes.

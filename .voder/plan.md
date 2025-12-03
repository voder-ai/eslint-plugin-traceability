## NOW

- [ ] Review the existing CI/CD workflow configuration and local Git hooks against the documented pipeline requirements to confirm they fully align with the project’s continuous deployment design and identify any mismatches that need documentation or configuration updates.

## NEXT

- [ ] Update the internal CI/CD documentation so it accurately describes the current workflow structure, quality gates, release behavior, and how the new migration rule and its tests fit into that pipeline.
- [ ] Ensure that the fast verification path used before pushes exercises a meaningful subset of tests and checks, adjusting which tests are included so that pre-push validation reliably catches problems without duplicating the full pipeline.
- [ ] Clarify in the contributor documentation how local development commands map to the CI/CD pipeline stages, including when and how semantic-release and the smoke tests run after changes are merged to main.

## LATER

- [ ] Add an additional lightweight smoke test that exercises the maintenance CLI entry point end to end after releases, complementing the existing plugin smoke test.
- [ ] Refine CI-related documentation to cover operational aspects such as expected pipeline duration, typical failure modes, and recommended steps for diagnosing and fixing CI failures when they occur.

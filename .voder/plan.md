## NOW

- [ ] Ensure the npm publishing credentials and continuous delivery configuration are corrected so that the release job on the main branch can authenticate to the npm registry and successfully publish new versions using the existing semantic-release setup.

## NEXT

- [ ] Review and, if necessary, adjust the CI workflow’s release step so that any semantic-release publishing failure causes the overall job to fail rather than being treated as a successful pipeline run.
- [ ] Validate that the semantic-release configuration, including plugins, package metadata, and registry settings, correctly matches the intended npm package and repository so that a successful run produces the expected release artifacts and versioning.
- [ ] Trigger and inspect a fresh main-branch CI run after the credential and workflow adjustments to confirm that, when a new release is warranted, semantic-release completes publishing and the post-deployment smoke tests run and pass, and that when no release is needed the workflow cleanly skips publishing without errors.

## LATER

- [ ] Document the end-to-end continuous deployment behavior for this project, including how semantic-release is wired into the main-branch workflow and what conditions cause a new release to be published.
- [ ] Refine the CI configuration to address any remaining deprecation warnings from transitive tooling (such as the Markdown processor) used during release so that future runs are free of deprecation noise.
- [ ] Revisit related version-control hygiene items, such as ensuring Husky hooks are reliably installed for all contributors and that the documented development workflow matches the enforced CI/CD pipeline and release process.

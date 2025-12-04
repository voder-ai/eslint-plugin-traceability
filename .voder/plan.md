## NOW

- [ ] Review the user-facing documentation for the maintenance API and update any incorrect import examples so they show a working way to access the maintenance functions from the published plugin (for example via the plugin’s default export), ensuring the documented usage matches the actual package exports.

## NEXT

- [ ] Update cross-references between user-facing documentation files so that any mention of another user doc (such as the migration guide) is expressed as a proper Markdown link to the correct file included in the published package.
- [ ] Re-scan all user-facing Markdown files (README, security policy, changelog, and user-docs) to confirm that every link either points to a file that ships in the npm package or to an external URL, and that no links reference internal-only paths.

## LATER

- [ ] Enhance the maintainer-facing documentation to clearly describe the contract for user-facing docs, including where and how to reference maintenance APIs and other guides, so future contributors keep documentation and exports aligned.
- [ ] Optionally add a short section in the user-facing API reference that summarizes the overall structure of the plugin’s exports (rules, configs, maintenance) to make it easier for users to discover the correct programmatic entry points.

## NOW
Update the README.md Installation section to change the Node.js requirement from “v12+” to “>=14” so it matches the `engines` field in package.json.

## NEXT
- Insert a link to `user-docs/migration-guide.md` under the Documentation section of README.md.
- Scan all user-facing docs (in `user-docs/`) for version references (Node, ESLint, etc.) and correct any that don’t align with package.json or peer‐dependency requirements.
- Run `npm run lint`, `npm run format:check` and `npm test` to verify documentation edits introduce no lint, formatting, or test failures.

## LATER
- Add a top‐level table of contents and anchor links in the `user-docs/` guides for easier navigation.
- Integrate an automated docs‐link and version‐consistency check into the CI pipeline.
- Include documentation review as part of the release checklist to catch future mismatches early.
## NOW  
Enhance the `valid-req-reference` rule to enforce path‐traversal protection: in src/rules/valid-req-reference.ts normalize and resolve each `@story` path against the project root, disallow absolute/out‐of‐bounds paths, and report an `invalidPath` error before attempting to read the file.

## NEXT  
- Add RuleTester unit tests for malicious `@story` paths (e.g. `../outside.story.md` and absolute paths) in tests/rules/valid-req-reference.test.ts to verify the new traversal checks.  
- Create docs/rules/valid-req-reference.md with a description, configuration options, examples of valid/invalid annotations, and links to story 010.0-DEV-DEEP-VALIDATION.story.md.  
- Update docs/config-presets.md and README.md so that both the **recommended** and **strict** presets include `traceability/valid-req-reference`.  
- Extend docs/cli-integration.md with CLI scenarios covering deep-validation failures and path traversal rejections.

## LATER  
- Author docs/rules/valid-story-reference.md and docs/rules/valid-annotation-format.md to complete the rules documentation suite.  
- Introduce a CI check (e.g. a docs linter) to enforce that every rule has a corresponding markdown doc.  
- Consider exposing an `allowAbsolutePaths` option in `valid-req-reference` and document it for advanced use cases.
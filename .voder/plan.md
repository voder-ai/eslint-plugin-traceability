## NOW
Create a new docs/rules directory and add markdown documentation for each implemented rule—  
- docs/rules/require-story-annotation.md  
- docs/rules/require-req-annotation.md  
- docs/rules/require-branch-annotation.md  
Each file should include the rule’s purpose, @story story reference, @req requirement ID, options schema, and usage examples.

## NEXT
- Update README.md: add a “Rules” section that links to each file in docs/rules, correct rule names in all examples, and remove any broken links.  
- Configure lint-staged in package.json and update .husky/pre-commit to run `npx lint-staged` for formatting and lint fixes.  
- Integrate jscpd duplication checks into the pre-push hook and CI workflow to enforce DRY.  
- Populate the plugin’s `configs.recommended` and `configs.strict` in src/index.ts so they immediately enable the three documented rules.

## LATER
- Implement and unit-test the annotation-format (story 005.0) and file-reference (story 006.0) validation rules to raise test coverage.  
- Add integration tests that load the built plugin in an ESLint flat config against sample code, including `--fix` scenarios.  
- Develop end-to-end CLI tests for both recommended and strict configurations.  
- Introduce performance benchmarks and caching for file-system operations.  
- Set up scheduled dependency/security scans (Dependabot/CodeQL) and document the process.
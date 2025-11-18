## NOW  
Add a **Troubleshooting ESLint Configuration** section to `user-docs/eslint-9-setup-guide.md` that explains how to resolve common flat-config errors—including a dedicated subsection for mixed JavaScript/TypeScript setups with sample configurations.

## NEXT  
- Extend the **Examples for Common Project Types** in `user-docs/eslint-9-setup-guide.md` to include full config snippets for:  
  1. JavaScript-only projects  
  2. TypeScript-only projects  
  3. Mixed JS/TS codebases  
  4. Monorepos/workspaces  
- Update `README.md` under **Usage** to link to both the Examples and Troubleshooting sections.  
- Commit and verify that the docs build (lint, markdown-link-check) passes without errors.

## LATER  
- Create real sample projects in an `examples/` folder (JS, TS, mixed, monorepo) and add a CI job to run ESLint flat-config against each to validate the documented setups.  
- Automate markdown link validation and spell-checking in CI to catch future documentation gaps.  
- Repeat this pattern to finish the remaining incomplete stories (003.0, 004.0, etc.) according to the functionality gap analysis.
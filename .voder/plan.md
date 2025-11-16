## NOW  
Update the **Quick Start** section in `README.md` to replace any `.eslintrc` examples with a complete `eslint.config.js` flat-config snippet showing how to load and configure the traceability plugin (using its recommended preset).

## NEXT  
- Revise **docs/eslint-9-setup-guide.md** to include the traceability plugin setup under flat config and ensure all code samples use `eslint.config.js`.  
- Add `@story` and `@req` JSDoc annotations to the `runEslint` helper (and any other top-level functions) in `cli-integration.js` to satisfy traceability documentation requirements.  
- Create **docs/config-presets.md** describing the “recommended” and “strict” plugin configs with usage examples.  

## LATER  
- Author an ADR in **docs/decisions** capturing the project’s documentation conventions and complexity standards.  
- Audit **docs/rules/** and insert placeholders or migration notes for Stories 005–010 (annotation format, file validation, auto-fix, maintenance tools, deep validation).  
- Expand user-facing docs with a guide to advanced configuration options (e.g., `storyDirectories`, `allowAbsolutePaths`).
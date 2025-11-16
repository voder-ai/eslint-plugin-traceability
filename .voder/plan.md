## NOW  
Populate the Husky pre-push hook (`.husky/pre-push`) so that it runs the full local quality gate:  
```bash
npm run build && npm run type-check && npm test && npm run lint && npm run format:check
```

## NEXT  
- Populate the Husky pre-commit hook (`.husky/pre-commit`) to run `npm run format` and `npm run lint`.  
- Enable and configure ESLint’s `complexity` rule (e.g. `"complexity": ["error",{ "max": 20 }]`) in `eslint.config.js`.  
- Install and configure a duplication detector (e.g. `jscpd`) and add an `npm run duplication` script.  
- Begin writing RuleTester tests for the next core rule: `require-req-annotation` in `tests/rules/require-req-annotation.test.ts`.  
- Add `"eslint": ">=9.0.0"` to `peerDependencies` and declare supported Node.js versions under `engines` in `package.json`.  
- Create a `.env.example` file with placeholder environment variables.

## LATER  
- Continue adding RuleTester tests for branch annotations (`require-branch-annotation`), annotation format validation, file-reference validation, deep requirement validation, and auto-fix scenarios.  
- Flesh out `README.md` with installation, configuration, and usage examples linking to `docs/` guides.  
- Create a `docs/rules/` section documenting each rule’s purpose, options, and sample code.  
- Write integration tests that run the ESLint CLI against sample projects to verify combined rule behavior and auto-fixes.  
- Configure CI to enforce coverage thresholds, code complexity limits, and duplication checks locally and in GitHub Actions.  
- Review and adjust CI branch triggers to align with trunk-based development (remove or update the `develop` branch trigger).  
- Plan and implement an automated `npm publish` step in the CI pipeline after quality gates pass.
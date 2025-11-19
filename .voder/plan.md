## NOW  
Remove the file‐level `/* eslint-disable */` directive from `src/index.ts` so that the file is fully linted under the existing ESLint rules.  

## NEXT  
- Run `npm run lint` and fix all lint errors reported in `src/index.ts` by:  
  1. Adding targeted inline disables only where absolutely necessary (e.g.  
     `// eslint-disable-next-line @typescript-eslint/no-var-requires` above the dynamic `require` and  
     `// eslint-disable-next-line no-console` above `console.error`).  
  2. Updating `eslint.config.js` (TypeScript files block) to declare `require`, `module` and `console` as read-only globals so that `no-undef` errors are resolved without broad disables.  
- Remove any ignore-pattern or ignore entry for `src/index.ts` in `package.json` or in `eslint.config.js`.  
- Rerun `npm run lint` to verify zero errors or warnings in `src/index.ts`.  

## LATER  
- Scan the rest of the codebase for any other broad `eslint-disable` directives and refactor them into minimal inline disables or configuration adjustments.  
- Introduce an ESLint rule or CI check that disallows file-wide `eslint-disable` comments to prevent regressions.  
- Once all files comply, raise the project’s code-quality metric above 90% and proceed to implement remaining feature stories.
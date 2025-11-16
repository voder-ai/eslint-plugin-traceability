## NOW
Unskip the ESLint CLI integration tests by changing the first line in `tests/integration/plugin-validation.test.ts` from  
```js
describe.skip('ESLint CLI Integration', () => {
```
to  
```js
describe('ESLint CLI Integration', () => {
```

## NEXT
- Update the invocation in `tests/integration/plugin-validation.test.ts` to use valid ESLint 9 flags (e.g. `--no-eslintrc --config <path>`) and include `--experimental-vm-modules` when spawning the CLI, then run `npm test` and fix any failing assertions or plugin behavior so that the integration tests pass under the flat‐config setup.  
- Add a dedicated CI job that builds the plugin and then runs these integration tests against the built `lib/index.js`.

## LATER
- Write and incorporate unit and integration tests for annotation format validation (005), file reference validation (006), error reporting (007), and auto‐fix rules (008) to raise overall coverage above 80%.  
- Implement tests and test fixtures for the maintenance tools (009) and deep validation logic (010).  
- Introduce performance benchmarks and CI checks to monitor lint-time overhead and execution reliability over time.
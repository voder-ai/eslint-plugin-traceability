---
status: 'accepted'
date: 2025-11-15
decision-makers: [Development Team]
consulted: [ESLint Community Best Practices, Jest Documentation, Vitest Documentation, TypeScript ESLint Testing Patterns]
informed: [Project Stakeholders, Future Contributors]
---

# Use Jest for ESLint Plugin Testing

## Context and Problem Statement

When developing an ESLint plugin in TypeScript that outputs CommonJS modules, we need to choose a testing framework for validating ESLint rules. The plugin will use ESLint's RuleTester for rule validation and needs to test complex AST manipulation logic. The choice of testing framework affects development experience, compatibility with ESLint tooling, and alignment with ecosystem practices, particularly given the CommonJS output requirement and ESLint-specific testing patterns.

## Decision Drivers

- Compatibility with ESLint's RuleTester and rule testing patterns
- Support for CommonJS module testing (plugin output format)
- Integration with TypeScript source code testing
- Alignment with ESLint plugin development ecosystem practices
- Developer experience for writing and debugging tests
- Performance and reliability of test execution
- Support for ESLint-specific testing utilities and patterns
- Community adoption and long-term maintenance

## Considered Options

- Jest with TypeScript support
- Vitest with CommonJS configuration
- Node.js built-in test runner with TypeScript

## Decision Outcome

Chosen option: "Jest with TypeScript support", because it provides native CommonJS support essential for ESLint plugin testing, seamless integration with ESLint's RuleTester, follows established patterns in the ESLint ecosystem, and offers superior tooling for ESLint rule development without requiring complex configuration workarounds.

### Consequences

- Good, because Jest works natively with CommonJS modules (no configuration needed)
- Good, because ESLint's RuleTester integrates seamlessly with Jest
- Good, because follows patterns used by @typescript-eslint and most ESLint plugins
- Good, because excellent TypeScript support through ts-jest
- Good, because mature ecosystem with extensive ESLint testing examples
- Good, because built-in mocking capabilities useful for file system operations
- Good, because snapshot testing can validate error message formats
- Bad, because Jest is slightly heavier than newer alternatives
- Bad, because not as fast as Vitest for some use cases
- Neutral, because requires ts-jest dependency for TypeScript support

### Confirmation

Implementation compliance will be confirmed through:
- Jest configuration properly set up with ts-jest transformer
- ESLint RuleTester tests run successfully without module resolution errors
- All tests pass in CI/CD pipeline using Jest
- package.json scripts include Jest-based testing commands
- Test files use Jest APIs and follow Jest patterns
- TypeScript source files can be tested directly without compilation issues

## Pros and Cons of the Options

### Jest with TypeScript support

Jest is the most widely used testing framework in the ESLint ecosystem with mature TypeScript integration.

- Good, because native CommonJS support without configuration
- Good, because ESLint's RuleTester designed to work with Jest
- Good, because extensive use in @typescript-eslint project provides proven patterns
- Good, because excellent TypeScript support via ts-jest
- Good, because mature snapshot testing for validating rule outputs
- Good, because built-in mocking for testing file system operations
- Good, because extensive community knowledge and examples
- Good, because comprehensive assertion library and testing utilities
- Neutral, because larger bundle size than alternatives
- Neutral, because slower startup than Vitest
- Bad, because not as modern as newer testing frameworks

### Vitest with CommonJS configuration

Vitest is a modern testing framework built on Vite with fast execution but requires configuration for CommonJS.

- Good, because very fast test execution and hot reloading
- Good, because modern API and excellent DX
- Good, because good TypeScript support out of the box
- Good, because lighter weight than Jest
- Neutral, because growing but smaller community than Jest
- Bad, because requires complex configuration for CommonJS compatibility
- Bad, because ESLint RuleTester integration not well-documented
- Bad, because fewer examples in ESLint plugin development
- Bad, because potential issues with CommonJS module transformation
- Bad, because ESM-first design conflicts with CommonJS requirement

### Node.js built-in test runner with TypeScript

Node.js native test runner provides minimal testing without external dependencies.

- Good, because no external testing dependencies
- Good, because fast startup and execution
- Good, because growing support in Node.js ecosystem
- Neutral, because basic feature set may be sufficient for simple tests
- Bad, because no built-in TypeScript support (requires compilation)
- Bad, because no established patterns for ESLint rule testing
- Bad, because limited assertion library (requires additional dependencies)
- Bad, because no built-in mocking capabilities
- Bad, because minimal tooling and IDE integration
- Bad, because ESLint RuleTester compatibility unknown

## More Information

This decision supports REQ-TEST-SETUP in story 001.0-DEV-PLUGIN-SETUP. The implementation should use ts-jest for TypeScript compilation and follow patterns established by @typescript-eslint project. ESLint's RuleTester should be the primary tool for rule validation testing.

Key implementation considerations:
- Use ts-jest transformer for TypeScript source testing
- Configure Jest to handle both source TypeScript and compiled CommonJS
- Follow ESLint RuleTester patterns for rule validation
- Include snapshot testing for error message validation
- Set up proper mocking for file system operations

This decision should be re-evaluated if:
- ESLint ecosystem moves away from Jest as standard
- CommonJS requirement changes for ESLint plugins
- Vitest significantly improves CommonJS support
- Team expertise with Jest becomes insufficient

Related resources:
- [ESLint RuleTester Documentation](https://eslint.org/docs/latest/integrate/nodejs-api#ruletester)
- [@typescript-eslint Testing Patterns](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin/tests)
- [Jest with TypeScript Guide](https://jestjs.io/docs/getting-started#using-typescript)
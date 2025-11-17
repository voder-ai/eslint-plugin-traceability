---
status: "accepted"
date: 2025-11-17
decision-makers: [Development Team]
consulted:
  [
    GitHub Actions Documentation,
    Super-Linter Community,
    actionlint Documentation,
  ]
informed: [Project Contributors, CI/CD Pipeline Maintainers]
---

# GitHub Actions Validation Tooling Selection

## Context and Problem Statement

The project uses GitHub Actions for CI/CD workflows defined in `.github/workflows/`. To prevent broken GitHub Actions files from being pushed to the repository, we need to implement pre-commit validation for GitHub Actions YAML files. This validation should catch syntax errors, invalid action references, and misconfigured job dependencies before they are committed, as broken workflow files could prevent CI/CD from running at all.

## Decision Drivers

- Need for pre-commit validation to prevent broken GitHub Actions files from being pushed
- Performance requirements for fast local development workflows
- Prevention of workflow files that would break CI/CD execution
- Integration with existing development tools and pre-commit hooks
- Maintainability and configuration simplicity
- Resource efficiency for local development environments

## Considered Options

- actionlint for pre-commit hooks only
- actionlint for both pre-commit and CI/CD
- Super-Linter for pre-commit hooks
- GitHub's built-in validation only

## Decision Outcome

Chosen option: "actionlint for pre-commit hooks only", because it prevents broken GitHub Actions files from being pushed while maintaining fast local development workflow. Once files reach CI/CD, if the workflow runs successfully, the files are valid by definition.

### Consequences

- Good, because actionlint provides fast pre-commit validation without container overhead
- Good, because prevents broken GitHub Actions files from being pushed
- Good, because specifically designed for GitHub Actions validation
- Good, because simple configuration and maintenance
- Good, because no Docker dependencies for local development
- Good, because excellent performance for pre-commit hooks
- Good, because integrates seamlessly with existing Husky-based pre-commit hooks
- Neutral, because CI/CD validation is unnecessary if workflows execute successfully
- Bad, because limited to GitHub Actions validation only
- Bad, because no security vulnerability detection in pre-commit phase

### Confirmation

Implementation compliance will be confirmed through:

- actionlint added to Husky pre-commit hook in `.husky/pre-commit`
- Pre-commit hook blocks commits with GitHub Actions validation errors
- actionlint configured to validate files in `.github/workflows/`
- Documentation updated to explain Husky-based pre-commit validation approach

### Implementation Approach

actionlint will be integrated into existing Husky-based pre-commit hooks by:

- Installing actionlint as a development dependency
- Adding actionlint validation to `.husky/pre-commit` hook
- Configuring actionlint to check `.github/workflows/*.yml` files
- Documenting the validation process for contributors

## Pros and Cons of the Options

### actionlint for pre-commit hooks only

Lightweight, focused pre-commit validation to prevent broken GitHub Actions files.

- Good, because fast execution without container overhead
- Good, because specifically designed for GitHub Actions validation
- Good, because no Docker dependencies for local development
- Good, because simple configuration and maintenance
- Good, because excellent performance for pre-commit hooks
- Good, because prevents broken workflow files from being pushed
- Good, because minimal tooling - only runs where validation is needed
- Neutral, because focused scope reduces complexity
- Neutral, because CI/CD validation unnecessary if workflows execute successfully
- Bad, because limited to GitHub Actions validation only
- Bad, because no security vulnerability detection in pre-commit phase

### actionlint for both pre-commit and CI/CD

Validation in both development and CI/CD environments.

- Good, because fast execution in all environments
- Good, because specifically designed for GitHub Actions
- Good, because consistent validation across environments
- Neutral, because focused scope reduces complexity
- Bad, because unnecessary duplication - CI/CD execution validates workflow correctness
- Bad, because adds CI/CD overhead for validation that's already proven by execution
- Bad, because limited to GitHub Actions validation only

### Super-Linter for pre-commit hooks

Comprehensive linting solution for pre-commit validation.

- Good, because comprehensive validation including security checks
- Good, because validates multiple file types beyond GitHub Actions
- Neutral, because well-maintained and widely adopted
- Bad, because container overhead makes pre-commit hooks slow
- Bad, because heavy resource usage for simple syntax checking
- Bad, because Docker dependency required for local development
- Bad, because not optimized for frequent pre-commit execution
- Bad, because overkill for the specific problem of preventing broken workflow files

### GitHub's built-in validation only

Rely solely on GitHub's native workflow validation.

- Good, because no additional tooling or configuration required
- Good, because automatically available in GitHub interface
- Good, because validated by the same system that executes workflows
- Neutral, because basic validation is always performed
- Bad, because no pre-commit validation for early error detection
- Bad, because broken files can be pushed, preventing CI/CD execution
- Bad, because errors only discovered after push to repository
- Bad, because no local development feedback

## More Information

This decision focuses on solving the specific problem of preventing broken GitHub Actions files from being pushed to the repository. If CI/CD workflows execute successfully, the files are validated by definition - there's no need for redundant validation in the CI/CD pipeline itself.

actionlint configuration should be added to the existing Husky pre-commit hook in `.husky/pre-commit`, targeting `.github/workflows/*.yml` files to catch syntax and configuration errors before commit.

The decision should be re-evaluated if:

- Security vulnerability detection becomes a requirement for pre-commit validation
- Comprehensive multi-language linting becomes necessary for pre-commit
- Alternative tools with better GitHub Actions-specific features emerge
- The problem scope expands beyond preventing broken workflow files

Related resources:

- [actionlint Documentation](https://github.com/rhymond/actionlint)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Husky Documentation](https://typicode.github.io/husky/)

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

- actionlint only (for both pre-commit and CI/CD)
- actionlint for pre-commit hooks + Super-Linter for CI/CD
- Super-Linter only (for both pre-commit and CI/CD)
- GitHub's built-in validation only

## Decision Outcome

Chosen option: "actionlint only (for both pre-commit and CI/CD)", because it provides fast, focused GitHub Actions validation without the overhead of comprehensive multi-language linting tools, while maintaining consistency across development and CI/CD environments.

### Consequences

- Good, because actionlint provides fast validation without container overhead
- Good, because consistent validation rules across development and CI/CD environments
- Good, because specifically designed for GitHub Actions validation
- Good, because simple configuration and maintenance with single tool
- Good, because no Docker dependencies for local development
- Good, because excellent performance for both pre-commit hooks and CI/CD
- Neutral, because focused scope keeps complexity minimal
- Bad, because limited to GitHub Actions validation only
- Bad, because no security vulnerability detection capabilities
- Bad, because misses validation of other workflow-related file types

### Confirmation

Implementation compliance will be confirmed through:

- actionlint configured in `.pre-commit-config.yaml`
- Pre-commit hook blocks commits with GitHub Actions validation errors
- actionlint configured to validate files in `.github/workflows/`
- Documentation updated to explain pre-commit validation approach

### Key Changes to CI/CD Workflow

- Consolidated build, test, publish, and smoke-test into a single `CI/CD Pipeline` workflow
- Implemented a Node.js version matrix to run workflows against multiple Node.js versions
- Added a conditional publish step that only runs on Node.js `20.x`
- Utilized `actions/upload-artifact` and `actions/download-artifact` for artifact management between steps
- Removed standalone `publish` and `smoke-test` jobs in favor of the unified workflow

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

actionlint configuration should be added to `.pre-commit-config.yaml` targeting `.github/workflows/*.yml` files to catch syntax and configuration errors before commit.

The decision should be re-evaluated if:

- Security vulnerability detection becomes a requirement for pre-commit validation
- Comprehensive multi-language linting becomes necessary for pre-commit
- Alternative tools with better GitHub Actions-specific features emerge
- The problem scope expands beyond preventing broken workflow files

Related resources:

- [actionlint Documentation](https://github.com/rhymond/actionlint)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Pre-commit Framework](https://pre-commit.com/)

---
status: "accepted"
date: 2026-01-12
decision-makers: [Development Team]
consulted: [docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md, src/rules/valid-story-reference.ts, src/rules/valid-annotation-format.ts]
informed: [Plugin Users, ESLint Configuration Maintainers]
---

# Shared Configuration Resolution for Story Directories

## Context and Problem Statement

The plugin provides two rules that validate story file references:
- `valid-story-reference`: Validates that `@story` annotations reference existing files
- `valid-annotation-format`: Validates that `@story` annotation paths match expected patterns

Both rules needed to understand which directories contain story files, but they configured this information differently:
- `valid-story-reference` used the `storyDirectories` option to determine where story files live
- `valid-annotation-format` used hardcoded patterns or custom `storyPathPattern` configuration

This created several problems:
1. **Configuration duplication**: Users had to configure directory locations twice
2. **Inconsistency risk**: If configurations diverged, rules could reject valid story references
3. **Maintenance burden**: Updating story directory structure required changes in multiple places
4. **User confusion**: Unclear which configuration was authoritative

The question was: How should these rules share configuration about story directory locations to ensure consistent validation?

## Decision Drivers

- **Single Source of Truth**: Avoid duplicating directory configuration across rules
- **Consistency**: Both rules should agree on valid story paths
- **Backward Compatibility**: Preserve existing behavior when no shared configuration used
- **Flexibility**: Allow explicit pattern overrides when needed
- **Maintainability**: Reduce configuration complexity for common use cases
- **User Experience**: Make configuration intuitive and error-resistant

## Considered Options

- **Option A**: valid-annotation-format derives pattern from storyDirectories (CHOSEN)
- **Option B**: Shared configuration file with central directory registry
- **Option C**: valid-story-reference derives directories from valid-annotation-format pattern
- **Option D**: Keep configurations separate, require users to maintain consistency

## Decision Outcome

Chosen option: "**Option A** - valid-annotation-format derives pattern from storyDirectories" because it establishes `storyDirectories` as the single source of truth while preserving backward compatibility and allowing explicit overrides.

Implementation approach:
1. `valid-annotation-format` accepts a `storyDirectories` option
2. When `storyDirectories` is provided and no explicit pattern is configured, the rule automatically derives `storyPathPattern` and `storyPathExample` from the directories
3. Explicit `storyPathPattern` or `story.pattern` configuration overrides the derived pattern
4. Both rules now use the same `storyDirectories` configuration for consistent validation

Pattern derivation:
- Single directory: `^stories/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$`
- Multiple directories: `^(docs/stories|custom/stories)/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$`
- Example uses first directory: `docs/stories/005.0-DEV-EXAMPLE.story.md`

### Consequences

- **Good**, because users configure directory locations once in `storyDirectories`
- **Good**, because both rules automatically stay in sync regarding valid story paths
- **Good**, because reduces configuration duplication and maintenance burden
- **Good**, because backward compatible - existing explicit pattern configurations still work
- **Good**, because explicit patterns can override derived patterns when needed
- **Good**, because makes the shared configuration approach self-documenting
- **Neutral**, because adds logic to derive patterns from directory configurations
- **Bad**, because requires updating both rule configurations when using shared approach
- **Bad**, because adds another configuration option to valid-annotation-format rule

### Confirmation

- [x] `deriveStoryPatternFromDirectories()` implemented in valid-annotation-options.ts
- [x] `deriveStoryExampleFromDirectories()` implemented in valid-annotation-options.ts
- [x] `resolveStoryPattern()` uses storyDirectories when no explicit pattern provided
- [x] `resolveStoryExample()` uses storyDirectories when no explicit example provided
- [x] 7 comprehensive tests added covering single/multiple directories, defaults, overrides
- [x] Story 010.1-DEV-CONFIGURABLE-PATTERNS updated with shared configuration examples
- [x] All tests passing (592 tests across 61 suites)
- [x] Regex escaping bug fixed using String.raw template literals

## Pros and Cons of the Options

### Option A: valid-annotation-format derives pattern from storyDirectories (CHOSEN)

- Good, because establishes clear ownership - `storyDirectories` is the source of truth
- Good, because reduces configuration duplication for common case
- Good, because both rules automatically agree on valid story paths
- Good, because backward compatible with existing configurations
- Good, because explicit patterns can override when needed
- Good, because intuitive - configure directories once, both rules use them
- Neutral, because requires pattern derivation logic
- Bad, because requires configuring both rules with same storyDirectories option

### Option B: Shared configuration file with central directory registry

- Good, because truly centralizes all shared configuration
- Good, because could support other shared settings in the future
- Bad, because introduces new configuration mechanism not standard in ESLint
- Bad, because adds complexity for simple directory configuration
- Bad, because would require custom configuration loading logic
- Bad, because breaks ESLint's standard rule configuration approach

### Option C: valid-story-reference derives directories from valid-annotation-format pattern

- Good, because reduces configuration to one place
- Bad, because pattern syntax is more complex than directory lists
- Bad, because makes pattern parsing the source of truth (inverted semantics)
- Bad, because pattern might not uniquely identify directories
- Bad, because harder to validate and provide clear error messages
- Bad, because pattern-to-directories conversion is error-prone

### Option D: Keep configurations separate

- Good, because no implementation changes needed
- Good, because each rule fully independent
- Bad, because users must maintain consistency manually
- Bad, because configuration duplication for every project
- Bad, because easy to introduce inconsistencies between rules
- Bad, because increases maintenance burden
- Bad, because doesn't address the underlying problem

## More Information

Related files:
- `src/rules/helpers/valid-annotation-options.ts`: Pattern derivation implementation
- `tests/rules/valid-annotation-format.test.ts`: Comprehensive tests for shared configuration
- `docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md`: Updated story documentation
- `src/rules/valid-story-reference.ts`: Original storyDirectories implementation

The implementation ensures the derived pattern matches the expected story file naming convention (`<major>.<minor>-DEV-<name>.story.md`) while allowing files in any configured directory. This maintains consistency with the existing default pattern while supporting multiple story locations.

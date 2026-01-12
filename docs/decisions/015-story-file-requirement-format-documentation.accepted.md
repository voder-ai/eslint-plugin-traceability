---
status: "accepted"
date: 2026-01-12
decision-makers: [Development Team]
consulted: [docs/stories/010.0-DEV-DEEP-VALIDATION.story.md, .github/prompts/templates/story-template.md, .github/prompts/processes/USER-STORY-MANAGEMENT.md]
informed: [Plugin Users, Story Authors, AI Agents]
---

# Document Supported Story File Requirement Formats for Deep Validation

## Context and Problem Statement

The deep validation feature (Story 010.0-DEV-DEEP-VALIDATION) parses story files to verify that `@req` and `@supports` annotations reference requirements that actually exist in the story files. However, the documentation did not include concrete examples of the markdown formats that the parser recognizes as valid requirement identifiers. This created ambiguity for developers writing story files and made it difficult to understand which requirement formats would be validated correctly.

The story template (#file:../.github/prompts/templates/story-template.md) and user story management process (#file:../.github/prompts/processes/USER-STORY-MANAGEMENT.md) showed examples of requirement formats, but there was no dedicated documentation explaining:

1. What requirement identifier patterns are recognized
2. Which markdown formats are supported (bold sections, checkboxes, lists, inline mentions)
3. Whether requirements need to be in specific sections
4. How the parser extracts requirement IDs from story files

Without this documentation, developers could not be certain whether their story file format would work correctly with deep validation.

## Decision Drivers

- **Clarity**: Developers need clear guidance on supported requirement formats
- **Consistency**: Requirement formats should be consistent across story files
- **Validation**: Documentation should align with actual parser implementation
- **Maintainability**: Consolidating format examples in one place makes updates easier
- **Traceability**: Story 010.0-DEV-DEEP-VALIDATION has acceptance criteria requiring format documentation
- **Developer Experience**: Reduces trial-and-error when writing story files

## Considered Options

- **Option A**: Add inline examples to existing rule documentation only
- **Option B**: Create dedicated story file format guide with comprehensive examples
- **Option C**: Document formats only in code comments in storyParser.ts
- **Option D**: Add examples to each story file individually as they're created

## Decision Outcome

Chosen option: "**Option B** - Create dedicated story file format guide" because it provides a single source of truth that is easily discoverable, comprehensive, and maintainable.

Created `docs/story-file-requirement-formats.md` with:
- Overview of requirement identifier pattern (`REQ-[A-Z0-9-]+`)
- Examples of all supported markdown formats
- Real examples from the story template
- Parser implementation details
- Troubleshooting guidance
- Best practices

### Consequences

- **Good**, because developers have clear reference documentation for writing story files
- **Good**, because documentation is in docs/ where it's tracked in version control (unlike .github/prompts which is gitignored)
- **Good**, because examples are comprehensive and show real usage patterns
- **Good**, because documentation is linked from story template and USER-STORY-MANAGEMENT process
- **Good**, because it satisfies Story 010.0-DEV-DEEP-VALIDATION acceptance criterion REQ-DEEP-ERROR#2
- **Neutral**, because documentation must be kept in sync with parser implementation if formats change
- **Bad**, because developers must remember to consult this documentation when creating stories

### Confirmation

- [x] File `docs/story-file-requirement-formats.md` created with comprehensive examples
- [x] Story template links to requirement formats documentation
- [x] USER-STORY-MANAGEMENT process links to requirement formats documentation
- [x] Documentation includes all formats currently recognized by storyParser.ts
- [x] Examples match the patterns used in existing story files

## Pros and Cons of the Options

### Option A: Add inline examples to existing rule documentation only

- Good, because developers already reference rule documentation
- Good, because keeps examples close to the rules that use them
- Bad, because rule documentation focuses on annotation format, not story file format
- Bad, because doesn't provide comprehensive view of all supported formats
- Bad, because scattered across multiple rule docs makes updates difficult

### Option B: Create dedicated story file format guide (CHOSEN)

- Good, because provides single source of truth for all requirement formats
- Good, because comprehensive examples reduce ambiguity
- Good, because easy to reference and link from other documentation
- Good, because in tracked docs/ directory rather than gitignored prompts/
- Good, because includes parser implementation details and troubleshooting
- Neutral, because requires maintaining separate documentation file
- Bad, because developers need to know it exists and remember to consult it

### Option C: Document formats only in code comments

- Good, because documentation lives next to implementation
- Good, because developers reading code get immediate context
- Bad, because not easily discoverable for story file authors
- Bad, because code comments are not designed for comprehensive examples
- Bad, because doesn't help non-developers (product owners, technical writers)

### Option D: Add examples to each story file individually

- Good, because examples are contextual to each story
- Bad, because creates massive duplication across story files
- Bad, because inconsistent examples across files would confuse developers
- Bad, because updates to format conventions require changing all story files
- Bad, because doesn't provide systematic reference documentation

## Reassessment Criteria

This decision should be reviewed when:

- Parser implementation: [src/maintenance/storyParser.ts](../../src/maintenance/storyParser.ts)
- Related story: [010.0-DEV-DEEP-VALIDATION.story.md](../stories/010.0-DEV-DEEP-VALIDATION.story.md)
The documentation was created following the story template and USER-STORY-MANAGEMENT patterns, documenting the following supported formats:

1. **Bold requirement sections** (recommended): `- **REQ-XXX-YYY**: Description`
2. **Acceptance criteria checkboxes**: `- [ ] **Description**: Details`
3. **Numbered lists**: `1. **REQ-XXX-YYY**: Description`
4. **Bulleted lists**: `* **REQ-XXX-YYY**: Description`
5. **Inline mentions**: `REQ-XXX-YYY` appearing in markdown text
6. **Implementation notes**: Requirements in any section of the story file

The parser uses regex-based extraction (`REQ-[A-Z0-9-]+`) and scans the entire file content rather than specific sections, providing maximum flexibility for story authors while maintaining traceability.

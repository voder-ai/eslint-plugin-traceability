# Story File Requirement Formats

This guide documents the requirement identifier formats supported by the ESLint plugin's deep validation feature when parsing user story files.

## Overview

The deep validation feature (Story 010.0-DEV-DEEP-VALIDATION) parses story files to verify that `@req` and `@supports` annotations reference requirements that actually exist. This document describes the markdown formats that the parser recognizes as valid requirement identifiers.

## Requirement Identifier Pattern

All requirement identifiers must follow the pattern: `REQ-[A-Z0-9-]+`

Examples:
- `REQ-AUTH-LOGIN`
- `REQ-DATA-VALIDATION`
- `REQ-PERF-LOAD`
- `REQ-UI-RESPONSIVE`

## Supported Markdown Formats

The parser scans the entire story file content and extracts requirement identifiers from various markdown contexts:

### 1. Bold Requirement Sections (Recommended Format)

The preferred format uses bold markdown with a colon separator:

```markdown
- **REQ-AUTH-LOGIN**: User can log in with username and password
  - [x] **Acceptance Criterion**: Login form validates credentials
  - [x] **Error Handling**: Invalid credentials show error message
```

**Pattern**: `- **REQ-XXX-YYY**: Description`

This format is used throughout the story template and provides clear visual distinction.

### 2. Acceptance Criteria Checkboxes

Requirements can be nested within acceptance criteria as checkboxes:

```markdown
## Requirements and Acceptance Criteria

- **REQ-VALIDATION-EMAIL**: Validate email format on input
  - [ ] **Email Format**: Rejects invalid email formats
  - [x] **Real-time Validation**: Shows errors as user types
```

**Pattern**: `- [ ] **Description**: Details` or `- [x] **Description**: Details`

The checkbox state (checked/unchecked) does not affect requirement recognition.

### 3. Numbered Lists

Requirements in numbered lists are recognized:

```markdown
1. **REQ-SETUP-ENV**: Configure development environment
2. **REQ-SETUP-DEPS**: Install project dependencies
3. **REQ-SETUP-BUILD**: Build system must compile TypeScript
```

**Pattern**: `1. **REQ-XXX-YYY**: Description`

### 4. Bulleted Lists

Requirements in bulleted lists are recognized:

```markdown
* **REQ-ERROR-LOGGING**: Log errors to monitoring service
* **REQ-ERROR-USER**: Display user-friendly error messages
* **REQ-ERROR-RECOVERY**: Attempt automatic recovery from transient failures
```

**Pattern**: `* **REQ-XXX-YYY**: Description` or `- **REQ-XXX-YYY**: Description`

### 5. Inline Mentions

Requirements mentioned inline in text are also recognized:

```markdown
This feature implements REQ-CACHE-PERFORMANCE to improve response times.
See REQ-SECURITY-VALIDATION for authentication requirements.
```

**Pattern**: `REQ-XXX-YYY` appearing anywhere in markdown text

### 6. Implementation Notes and Other Sections

Requirements can appear in any section of the story file:

```markdown
## Implementation Notes

Technical considerations for REQ-PERF-OPTIMIZATION include:
- Database query optimization (see REQ-DB-INDEX)
- Caching strategy (REQ-CACHE-TTL)
- Load balancing (REQ-INFRA-LB)
```

The parser scans all sections, not just "Requirements and Acceptance Criteria".

## Examples from Story Template

Based on the story template (#file:../.github/prompts/templates/story-template.md), here are real examples:

### Performance Requirements

```markdown
- **REQ-PERF-LOAD**: Page loads in under 2 seconds
  - [ ] **Load Time Validation**: Page fully loads in under 2 seconds on standard connection
  - [ ] **Performance Monitoring**: Load time tracked and reported in monitoring
```

Parser recognizes: `REQ-PERF-LOAD`

### Accessibility Requirements

```markdown
- **REQ-ACCESS-WCAG**: Meets WCAG 2.1 AA accessibility standards
  - [ ] **Accessibility Audit**: WCAG 2.1 AA compliance verified via automated tools
  - [ ] **Screen Reader Testing**: Functionality confirmed with screen readers
```

Parser recognizes: `REQ-ACCESS-WCAG`

### Mobile Responsive Requirements

```markdown
- **REQ-MOBILE-RESPONSIVE**: Works on mobile devices 320px and up
  - [ ] **Mobile Layout**: UI renders correctly on 320px-768px screens
  - [ ] **Touch Interaction**: All controls accessible via touch interface
```

Parser recognizes: `REQ-MOBILE-RESPONSIVE`

## What the Parser Does NOT Require

The parser is flexible and does NOT require:

- ❌ Requirements to be in specific sections (scans entire file)
- ❌ Requirements to follow a particular order
- ❌ Requirements to use specific heading levels
- ❌ Checkboxes to be checked or unchecked
- ❌ Consistent indentation (though consistent formatting improves readability)

## Parser Implementation Details

The requirement parser (implemented in `src/maintenance/storyParser.ts`):

1. **Reads entire story file content**
2. **Extracts all matches** of the pattern `REQ-[A-Z0-9-]+`
3. **Returns unique requirement IDs** found in the file
4. **Caches results** with file modification timestamps for performance

The parser uses a simple regex-based approach that prioritizes broad coverage over section-specific parsing. Only identifiers with the `REQ-` prefix are recognized.

## Validation Behavior

When the ESLint plugin validates `@req` or `@supports` annotations:

1. ✅ **Valid**: Annotation references `REQ-PERF-LOAD` and story file contains `**REQ-PERF-LOAD**: ...`
2. ❌ **Invalid**: Annotation references `REQ-MISSING-REQ` and story file does not contain that identifier
3. ✅ **Valid**: Annotation references `REQ-AUTH-LOGIN` mentioned inline in Implementation Notes
4. ❌ **Invalid**: Annotation references `REQ-TYPO-NAME` (typo in requirement ID)

## Best Practices

For optimal traceability and maintainability:

1. **Use bold requirement sections** as the primary format (most visible)
2. **Nest acceptance criteria** under requirements using checkboxes
3. **Keep requirement IDs consistent** across code annotations and story files
4. **Use descriptive requirement names** that communicate purpose
5. **Group related requirements** under appropriate sections
6. **Document requirement rationale** in the description after the colon

## Related Documentation

- [User Story Management Process](../.github/prompts/processes/USER-STORY-MANAGEMENT.md) - Story creation workflow
- [Story Template](../.github/prompts/templates/story-template.md) - Template showing requirement format
- [Valid Annotation Format Rule](./rules/valid-annotation-format.md) - Annotation syntax validation
- [Story Parser Source](../src/maintenance/storyParser.ts) - Implementation of requirement extraction

## Examples for Testing

When writing tests for deep validation, consider these cases:

```markdown
<!-- Valid: Bold requirement with nested criteria -->
- **REQ-TEST-CASE-1**: Test requirement
  - [ ] **AC1**: First acceptance criterion
  
<!-- Valid: Inline mention -->
This implements REQ-TEST-CASE-2 for the feature.

<!-- Valid: Numbered list -->
1. **REQ-TEST-CASE-3**: Third requirement

<!-- Parser finds: REQ-TEST-CASE-1, REQ-TEST-CASE-2, REQ-TEST-CASE-3 -->
```

## Troubleshooting

**Problem**: Annotation references requirement but validation fails

**Solutions**:
1. Check requirement ID spelling in both annotation and story file
2. Verify requirement ID matches pattern `REQ-[A-Z0-9-]+`
3. Ensure story file has not been moved or renamed
4. Check that requirement exists in the story file (case-sensitive)
5. Clear ESLint cache if using cached validation: `eslint --cache-location .eslintcache`

**Problem**: Parser not finding requirement that exists in file

**Solutions**:
1. Verify requirement follows supported formats above
2. Check for typos in requirement ID
3. Ensure requirement is not in code blocks (parser skips code fences)
4. Verify file encoding is UTF-8

## Version History

- **Initial Version** (2026-01-12): Documented requirement formats based on story template and user story management process

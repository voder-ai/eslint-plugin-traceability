/**
 * Tests for storyParser module
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Test parsing story file content to identify available requirements
 * @req REQ-DEEP-FORMAT - Test finding requirement IDs in multiple markdown contexts
 * @req REQ-DEEP-SECTION - Test handling requirements in different story file sections
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  extractRequirementsFromStoryFile,
  extractRequirementsFromContent,
} from "../../src/maintenance/storyParser";

describe("storyParser", () => {
  describe("extractRequirementsFromContent", () => {
    /**
     * Test extraction from structured ## Requirements section
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-SECTION - Parse ## Requirements sections
     */
    it("should extract requirements from ## Requirements section", () => {
      const content = `
# Story Title

## Requirements

- **REQ-FOO-001**: First requirement
- **REQ-FOO-002**: Second requirement
- **REQ-BAR-003**: Third requirement

## Other Section
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(
        new Set(["REQ-FOO-001", "REQ-FOO-002", "REQ-BAR-003"]),
      );
    });

    /**
     * Test extraction from ## Acceptance Criteria section
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-SECTION - Parse ## Acceptance Criteria sections
     */
    it("should extract requirements from ## Acceptance Criteria section", () => {
      const content = `
# Story Title

## Acceptance Criteria

- **REQ-AC-001**: Acceptance criterion one
- **REQ-AC-002**: Acceptance criterion two

## Other Section
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(new Set(["REQ-AC-001", "REQ-AC-002"]));
    });

    /**
     * Test extraction from both structured sections
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-SECTION - Handle requirements in different story file sections
     */
    it("should extract requirements from both Requirements and Acceptance Criteria sections", () => {
      const content = `
# Story Title

## Requirements

- **REQ-REQ-001**: First requirement

## Acceptance Criteria

- **REQ-AC-001**: First criterion

## Implementation Notes
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(new Set(["REQ-REQ-001", "REQ-AC-001"]));
    });

    /**
     * Test extraction with bold format
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Extract from bold requirement format
     */
    it("should extract requirements in bold format **REQ-XXX-YYY**", () => {
      const content = `
## Requirements

- **REQ-BOLD-001**: Description here
- Some text with **REQ-BOLD-002** in the middle
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(new Set(["REQ-BOLD-001", "REQ-BOLD-002"]));
    });

    /**
     * Test extraction with plain text format
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Extract from plain text mentions
     */
    it("should extract requirements in plain text format REQ-XXX-YYY", () => {
      const content = `
## Requirements

- REQ-PLAIN-001: Description here
- Some text with REQ-PLAIN-002 in the middle
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(new Set(["REQ-PLAIN-001", "REQ-PLAIN-002"]));
    });

    /**
     * Test extraction from multiple line formats
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Support finding requirement IDs in multiple markdown contexts
     */
    it("should extract requirements from mixed formats", () => {
      const content = `
## Requirements

- **REQ-MIX-001**: Bold format
- REQ-MIX-002: Plain format
- Description mentions REQ-MIX-003 inline
- Multiple **REQ-MIX-004** and REQ-MIX-005 in one line
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(
        new Set([
          "REQ-MIX-001",
          "REQ-MIX-002",
          "REQ-MIX-003",
          "REQ-MIX-004",
          "REQ-MIX-005",
        ]),
      );
    });

    /**
     * Test regex fallback for requirements outside sections
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Support finding requirement IDs in multiple markdown contexts
     */
    it("should extract requirements outside structured sections using regex fallback", () => {
      const content = `
# Story Title

This story implements REQ-FALLBACK-001 and REQ-FALLBACK-002.

## Implementation

Code example:
// @req REQ-FALLBACK-003 - This requirement is in a code comment
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(
        new Set(["REQ-FALLBACK-001", "REQ-FALLBACK-002", "REQ-FALLBACK-003"]),
      );
    });

    /**
     * Test handling of empty content
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-PARSE - Handle edge cases gracefully
     */
    it("should return empty set for empty content", () => {
      const requirements = extractRequirementsFromContent("");
      expect(requirements).toEqual(new Set());
    });

    /**
     * Test handling of content with no requirements
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-PARSE - Handle edge cases gracefully
     */
    it("should return empty set for content with no requirements", () => {
      const content = `
# Story Title

## Description

This story has no requirements mentioned.

## Implementation Notes

Just some notes here.
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(new Set());
    });

    /**
     * Test case sensitivity
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Extract requirement IDs correctly
     */
    it("should handle different casing in section headers", () => {
      const content = `
## requirements

- **REQ-LOWER-001**: From lowercase section

## REQUIREMENTS

- **REQ-UPPER-001**: From uppercase section

## Requirements

- **REQ-TITLE-001**: From title case section
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(
        new Set(["REQ-LOWER-001", "REQ-UPPER-001", "REQ-TITLE-001"]),
      );
    });

    /**
     * Test section boundary detection
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-SECTION - Handle requirements in different story file sections
     */
    it("should stop extracting when encountering new section header", () => {
      const content = `
## Requirements

- **REQ-SEC-001**: Should be extracted

## Implementation Notes

- **REQ-SEC-002**: Should be extracted via regex fallback only
`;
      const requirements = extractRequirementsFromContent(content);
      // Both should be extracted, but REQ-SEC-002 via regex fallback
      expect(requirements).toEqual(new Set(["REQ-SEC-001", "REQ-SEC-002"]));
    });

    /**
     * Test multiple occurrences of same requirement
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-PARSE - Avoid duplicate requirements in results
     */
    it("should deduplicate repeated requirements", () => {
      const content = `
## Requirements

- **REQ-DUP-001**: First mention
- REQ-DUP-001: Second mention

## Acceptance Criteria

- REQ-DUP-001: Third mention
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(new Set(["REQ-DUP-001"]));
      expect(requirements.size).toBe(1);
    });

    /**
     * Test requirements with hyphens in ID
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Support requirement ID format with multiple hyphens
     */
    it("should extract requirements with multiple hyphens in ID", () => {
      const content = `
## Requirements

- **REQ-MULTI-HYPHEN-001**: Complex ID
- **REQ-A-B-C-D-123**: Very complex ID
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(
        new Set(["REQ-MULTI-HYPHEN-001", "REQ-A-B-C-D-123"]),
      );
    });

    /**
     * Test requirements with numbers in various positions
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Support alphanumeric requirement IDs
     */
    it("should extract requirements with numbers in various positions", () => {
      const content = `
## Requirements

- **REQ-123-ABC**: Numbers first
- **REQ-ABC-123**: Numbers last
- **REQ-A1B2C3**: Numbers mixed
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(
        new Set(["REQ-123-ABC", "REQ-ABC-123", "REQ-A1B2C3"]),
      );
    });

    /**
     * Test nested list items
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Handle requirements in nested list structures
     */
    it("should extract requirements from nested list items", () => {
      const content = `
## Requirements

- **REQ-NEST-001**: Top level
  - **REQ-NEST-002**: Nested item
    - **REQ-NEST-003**: Deeply nested
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(
        new Set(["REQ-NEST-001", "REQ-NEST-002", "REQ-NEST-003"]),
      );
    });

    /**
     * Test requirements in tables
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Support finding requirement IDs in tables
     */
    it("should extract requirements from markdown tables", () => {
      const content = `
## Requirements

| ID | Description |
|----|-------------|
| REQ-TABLE-001 | First requirement |
| REQ-TABLE-002 | Second requirement |
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(new Set(["REQ-TABLE-001", "REQ-TABLE-002"]));
    });

    /**
     * Test requirements with special characters nearby
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Handle requirement IDs with adjacent punctuation
     */
    it("should extract requirements adjacent to punctuation", () => {
      const content = `
## Requirements

- (REQ-PUNC-001): In parentheses
- [REQ-PUNC-002]: In brackets
- REQ-PUNC-003, REQ-PUNC-004: Comma separated
- REQ-PUNC-005. With period after
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(
        new Set([
          "REQ-PUNC-001",
          "REQ-PUNC-002",
          "REQ-PUNC-003",
          "REQ-PUNC-004",
          "REQ-PUNC-005",
        ]),
      );
    });

    /**
     * Test multiline content within section
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Handle multiline requirement descriptions
     */
    it("should extract requirements from multiline descriptions", () => {
      const content = `
## Requirements

- **REQ-MULTI-001**: This is a long description
  that spans multiple lines
  and continues here
- **REQ-MULTI-002**: Another requirement
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(new Set(["REQ-MULTI-001", "REQ-MULTI-002"]));
    });

    /**
     * Test checkbox format (task lists)
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Support finding requirement IDs in checkbox lists
     */
    it("should extract requirements from checkbox format (unchecked)", () => {
      const content = `
## Requirements and Acceptance Criteria

- **REQ-CHECKBOX-PARENT**: Parent requirement
  - [ ] **Acceptance Criterion**: Description mentioning REQ-CHECKBOX-001
  - [ ] **Performance**: Must meet REQ-CHECKBOX-002 standards
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toContain("REQ-CHECKBOX-PARENT");
      expect(requirements).toContain("REQ-CHECKBOX-001");
      expect(requirements).toContain("REQ-CHECKBOX-002");
    });

    /**
     * Test checkbox format (checked boxes)
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Support finding requirement IDs in checkbox lists
     */
    it("should extract requirements from checkbox format (checked)", () => {
      const content = `
## Acceptance Criteria

- **REQ-DONE-001**: Completed requirement
  - [x] **Acceptance**: REQ-DONE-001 is satisfied
  - [x] **Testing**: REQ-DONE-002 is verified
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toContain("REQ-DONE-001");
      expect(requirements).toContain("REQ-DONE-002");
    });

    /**
     * Test numbered list format
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Support finding requirement IDs in numbered lists
     */
    it("should extract requirements from numbered lists", () => {
      const content = `
## Requirements

1. **REQ-NUMBERED-001**: First numbered requirement
2. **REQ-NUMBERED-002**: Second numbered requirement
3. **REQ-NUMBERED-003**: Third numbered requirement
10. **REQ-NUMBERED-010**: Tenth requirement (non-sequential)
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(
        new Set([
          "REQ-NUMBERED-001",
          "REQ-NUMBERED-002",
          "REQ-NUMBERED-003",
          "REQ-NUMBERED-010",
        ]),
      );
    });

    /**
     * Test bulleted list with asterisk format
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Support finding requirement IDs in bulleted lists
     */
    it("should extract requirements from bulleted lists with asterisks", () => {
      const content = `
## Requirements

* **REQ-ASTERISK-001**: First requirement with asterisk
* **REQ-ASTERISK-002**: Second requirement with asterisk
* **REQ-ASTERISK-003**: Third requirement with asterisk
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).toEqual(
        new Set(["REQ-ASTERISK-001", "REQ-ASTERISK-002", "REQ-ASTERISK-003"]),
      );
    });

    /**
     * Test that only REQ- prefix is recognized (not IMPL- or other prefixes)
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Parser specifically looks for REQ- prefixed identifiers
     */
    it("should only extract REQ- prefixed identifiers", () => {
      const content = `
## Requirements

- **IMPL-EXISTING-CONFIG**: ESLint v9 flat configuration
  - [x] **Existing Implementation**: Already implemented
- **REQ-NEW-FEATURE**: New feature requirement
- **SPEC-OTHER**: Other prefix that should not be recognized
`;
      const requirements = extractRequirementsFromContent(content);
      expect(requirements).not.toContain("IMPL-EXISTING-CONFIG");
      expect(requirements).not.toContain("SPEC-OTHER");
      expect(requirements).toContain("REQ-NEW-FEATURE");
      expect(requirements.size).toBe(1);
    });

    /**
     * Test mixed list formats (comprehensive example from story template)
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-FORMAT - Support all documented requirement formats together
     */
    it("should extract requirements from all documented formats combined", () => {
      const content = `
# Story Title

## Requirements and Acceptance Criteria

- **REQ-PERF-LOAD**: Page loads in under 2 seconds
  - [ ] **Load Time Validation**: Page fully loads in under 2 seconds on standard connection
  - [ ] **Performance Monitoring**: Load time tracked and reported in monitoring

- **REQ-ACCESS-WCAG**: Meets WCAG 2.1 AA accessibility standards
  - [ ] **Accessibility Audit**: WCAG 2.1 AA compliance verified via automated tools
  - [x] **Screen Reader Testing**: Functionality confirmed with screen readers

* **REQ-MOBILE-RESPONSIVE**: Works on mobile devices 320px and up
  * [ ] **Mobile Layout**: UI renders correctly on 320px-768px screens
  * [ ] **Touch Interaction**: All controls accessible via touch interface

1. **REQ-SETUP-ENV**: Configure development environment
2. **REQ-SETUP-DEPS**: Install project dependencies

## Implementation Notes

This implements REQ-IMPL-DETAIL for the caching layer.
See also REQ-CACHE-STRATEGY for the caching strategy.
`;
      const requirements = extractRequirementsFromContent(content);

      // Verify all REQ- formatted requirements are recognized
      expect(requirements).toContain("REQ-PERF-LOAD");
      expect(requirements).toContain("REQ-ACCESS-WCAG");
      expect(requirements).toContain("REQ-MOBILE-RESPONSIVE");
      expect(requirements).toContain("REQ-SETUP-ENV");
      expect(requirements).toContain("REQ-SETUP-DEPS");
      expect(requirements).toContain("REQ-IMPL-DETAIL");
      expect(requirements).toContain("REQ-CACHE-STRATEGY");

      expect(requirements.size).toBe(7);
    });
  });

  describe("extractRequirementsFromStoryFile", () => {
    let tempDir: string;

    beforeEach(async () => {
      // Create temp directory for test files
      tempDir = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), "story-parser-test-"),
      );
    });

    afterEach(async () => {
      // Clean up temp directory
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    });

    /**
     * Test reading from actual file
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-PARSE - Parse story file content from filesystem
     */
    it("should extract requirements from an actual story file", async () => {
      const storyPath = path.join(tempDir, "test-story.md");
      const content = `
# Test Story

## Requirements

- **REQ-FILE-001**: First requirement
- **REQ-FILE-002**: Second requirement
`;
      await fs.promises.writeFile(storyPath, content, "utf8");

      const requirements = extractRequirementsFromStoryFile(storyPath);
      expect(requirements).toEqual(new Set(["REQ-FILE-001", "REQ-FILE-002"]));
    });

    /**
     * Test error handling for non-existent file
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-PARSE - Handle file read errors gracefully
     */
    it("should return empty set for non-existent file", () => {
      const nonExistentPath = path.join(tempDir, "does-not-exist.md");
      const requirements = extractRequirementsFromStoryFile(nonExistentPath);
      expect(requirements).toEqual(new Set());
    });

    /**
     * Test error handling for invalid file path
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-PARSE - Handle file read errors gracefully
     */
    it("should return empty set for invalid file path", () => {
      const invalidPath = "/invalid/\x00/path.md";
      const requirements = extractRequirementsFromStoryFile(invalidPath);
      expect(requirements).toEqual(new Set());
    });

    /**
     * Test reading empty file
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-PARSE - Handle empty files
     */
    it("should return empty set for empty file", async () => {
      const emptyPath = path.join(tempDir, "empty.md");
      await fs.promises.writeFile(emptyPath, "", "utf8");

      const requirements = extractRequirementsFromStoryFile(emptyPath);
      expect(requirements).toEqual(new Set());
    });

    /**
     * Test reading file with no requirements
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-PARSE - Handle files with no requirements
     */
    it("should return empty set for file with no requirements", async () => {
      const noReqPath = path.join(tempDir, "no-requirements.md");
      const content = `
# Story without requirements

## Description

This story has no requirements.
`;
      await fs.promises.writeFile(noReqPath, content, "utf8");

      const requirements = extractRequirementsFromStoryFile(noReqPath);
      expect(requirements).toEqual(new Set());
    });

    /**
     * Test file with UTF-8 encoding
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-PARSE - Handle files with UTF-8 encoding
     */
    it("should handle UTF-8 encoded files", async () => {
      const utf8Path = path.join(tempDir, "utf8-story.md");
      const content = `
# Story with UTF-8 ✓

## Requirements

- **REQ-UTF8-001**: Requirement with emoji 🚀
- **REQ-UTF8-002**: Requirement with accents: café, naïve
`;
      await fs.promises.writeFile(utf8Path, content, "utf8");

      const requirements = extractRequirementsFromStoryFile(utf8Path);
      expect(requirements).toEqual(new Set(["REQ-UTF8-001", "REQ-UTF8-002"]));
    });

    /**
     * Test file with Windows line endings
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-PARSE - Handle files with different line endings
     */
    it("should handle files with Windows line endings (CRLF)", async () => {
      const crlfPath = path.join(tempDir, "crlf-story.md");
      const content =
        "## Requirements\r\n\r\n- **REQ-CRLF-001**: First\r\n- **REQ-CRLF-002**: Second\r\n";
      await fs.promises.writeFile(crlfPath, content, "utf8");

      const requirements = extractRequirementsFromStoryFile(crlfPath);
      expect(requirements).toEqual(new Set(["REQ-CRLF-001", "REQ-CRLF-002"]));
    });

    /**
     * Test large file handling
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-PARSE - Handle large story files efficiently
     */
    it("should handle large files with many requirements", async () => {
      const largePath = path.join(tempDir, "large-story.md");
      let content = "# Large Story\n\n## Requirements\n\n";

      // Generate 100 requirements
      for (let i = 1; i <= 100; i++) {
        content += `- **REQ-LARGE-${i.toString().padStart(3, "0")}**: Requirement ${i}\n`;
      }

      await fs.promises.writeFile(largePath, content, "utf8");

      const requirements = extractRequirementsFromStoryFile(largePath);
      expect(requirements.size).toBe(100);
      expect(requirements.has("REQ-LARGE-001")).toBe(true);
      expect(requirements.has("REQ-LARGE-100")).toBe(true);
    });
  });
});

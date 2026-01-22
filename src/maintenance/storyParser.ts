/**
 * Parser for extracting requirements from story files
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Parse story file content to identify available requirements
 * @req REQ-DEEP-FORMAT - Support finding requirement IDs in multiple markdown contexts
 * @req REQ-DEEP-SECTION - Handle requirements in different story file sections
 */
import * as fs from "fs";

/**
 * Extract requirement IDs from story file content
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Parse story file content to identify available requirements
 * @req REQ-DEEP-FORMAT - Support finding requirement IDs in multiple markdown contexts
 * @req REQ-DEEP-SECTION - Handle requirements in different story file sections
 */
export function extractRequirementsFromStoryFile(
  filePath: string,
): Set<string> {
  try {
    // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
    // @req REQ-DEEP-PARSE - Parse story file content to identify available requirements
    const content = fs.readFileSync(filePath, "utf8");
    return extractRequirementsFromContent(content);
  } catch {
    // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
    // @req REQ-DEEP-PARSE - Handle file read errors gracefully
    return new Set();
  }
}

/**
 * Extract requirement IDs from story file content string
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Parse story file content to identify available requirements
 * @req REQ-DEEP-FORMAT - Support finding requirement IDs in multiple markdown contexts
 * @req REQ-DEEP-SECTION - Handle requirements in different story file sections
 */
export function extractRequirementsFromContent(content: string): Set<string> {
  const requirements = new Set<string>();

  // Strategy 1: Extract from structured sections (## Requirements, ## Acceptance Criteria)
  // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
  // @req REQ-DEEP-SECTION - Handle requirements in different story file sections
  const sectionRequirements = extractFromSections(content);
  sectionRequirements.forEach((req) => requirements.add(req));

  // Strategy 2: Fallback to regex-based extraction for REQ-XXX-YYY patterns anywhere in file
  // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
  // @req REQ-DEEP-FORMAT - Support finding requirement IDs in multiple markdown contexts
  const regexRequirements = extractWithRegex(content);
  regexRequirements.forEach((req) => requirements.add(req));

  return requirements;
}

/**
 * Extract requirements from structured markdown sections
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-SECTION - Handle requirements in different story file sections
 * @req REQ-DEEP-FORMAT - Support finding requirement IDs in multiple markdown contexts
 */
function extractFromSections(content: string): Set<string> {
  const requirements = new Set<string>();
  const lines = content.split("\n");

  let inRequirementsSection = false;
  let inAcceptanceCriteriaSection = false;

  for (const line of lines) {
    // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
    // @req REQ-DEEP-SECTION - Parse structured sections line by line
    // Detect section headers
    if (line.match(/^##\s+Requirements/i)) {
      // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
      // @req REQ-DEEP-SECTION - Parse ## Requirements sections
      inRequirementsSection = true;
      inAcceptanceCriteriaSection = false;
      continue;
    } else if (line.match(/^##\s+Acceptance\s+Criteria/i)) {
      // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
      // @req REQ-DEEP-SECTION - Parse ## Acceptance Criteria sections
      inAcceptanceCriteriaSection = true;
      inRequirementsSection = false;
      continue;
    } else if (line.match(/^##\s+/)) {
      // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
      // @req REQ-DEEP-SECTION - Reset section tracking for other headers
      // New section that's not Requirements or Acceptance Criteria
      inRequirementsSection = false;
      inAcceptanceCriteriaSection = false;
      continue;
    }

    // Extract requirements from active sections
    if (inRequirementsSection || inAcceptanceCriteriaSection) {
      // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
      // @req REQ-DEEP-FORMAT - Extract requirement IDs from list items
      const reqIds = extractReqIdsFromLine(line);
      reqIds.forEach((req) => requirements.add(req));
    }
  }

  return requirements;
}

/**
 * Extract requirement IDs from a single line
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-FORMAT - Support finding requirement IDs in multiple markdown contexts
 */
function extractReqIdsFromLine(line: string): string[] {
  const requirements: string[] = [];

  // Pattern 1: - **REQ-XXX-YYY**: Description
  // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
  // @req REQ-DEEP-FORMAT - Extract from bold requirement format
  const boldPattern = /\*\*(REQ-[A-Z0-9-]+)\*\*/g;
  let match;
  while ((match = boldPattern.exec(line)) !== null) {
    // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
    // @req REQ-DEEP-FORMAT - Extract from bold requirement format
    requirements.push(match[1]);
  }

  // Pattern 2: REQ-XXX-YYY anywhere in the line (not already captured)
  // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
  // @req REQ-DEEP-FORMAT - Extract from plain text mentions
  const plainPattern = /\b(REQ-[A-Z0-9-]+)\b/g;
  while ((match = plainPattern.exec(line)) !== null) {
    // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
    // @req REQ-DEEP-FORMAT - Extract from plain text mentions
    if (!requirements.includes(match[1])) {
      // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
      // @req REQ-DEEP-FORMAT - Avoid duplicate requirement entries
      requirements.push(match[1]);
    }
  }

  return requirements;
}

/**
 * Extract requirements using regex fallback (for content outside structured sections)
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-FORMAT - Support finding requirement IDs in multiple markdown contexts
 */
function extractWithRegex(content: string): Set<string> {
  const requirements = new Set<string>();
  const regex = /\b(REQ-[A-Z0-9-]+)\b/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    // @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
    // @req REQ-DEEP-FORMAT - Extract requirement IDs from any location in content
    requirements.add(match[1]);
  }

  return requirements;
}

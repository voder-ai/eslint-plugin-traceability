/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - Detect stale annotation references
 */
import { detectStaleAnnotations } from "../../src/maintenance/detect";

describe("detectStaleAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  it("[REQ-MAINT-DETECT] should return empty array when no stale annotations", () => {
    const result = detectStaleAnnotations("tests/fixtures/no-stale");
    expect(result).toEqual([]);
  });
});

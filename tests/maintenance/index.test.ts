/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-UPDATE REQ-MAINT-BATCH
 */
import {
  detectStaleAnnotations,
  updateAnnotationReferences,
  batchUpdateAnnotations,
  verifyAnnotations,
  generateMaintenanceReport,
} from "../../src/maintenance";

describe("Maintenance Tools Index Exports (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  it("[REQ-MAINT-CLI] should export detectStaleAnnotations as a function", () => {
    expect(typeof detectStaleAnnotations).toBe("function");
  });

  it("[REQ-MAINT-UPDATE] should export updateAnnotationReferences as a function", () => {
    expect(typeof updateAnnotationReferences).toBe("function");
  });

  it("[REQ-MAINT-BATCH] should export batchUpdateAnnotations as a function", () => {
    expect(typeof batchUpdateAnnotations).toBe("function");
  });

  it("[REQ-MAINT-CLI] should export verifyAnnotations as a function", () => {
    expect(typeof verifyAnnotations).toBe("function");
  });

  it("[REQ-MAINT-CLI] should export generateMaintenanceReport as a function", () => {
    expect(typeof generateMaintenanceReport).toBe("function");
  });
});

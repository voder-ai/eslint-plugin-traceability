"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Update annotation references
 */
const update_1 = require("../../src/maintenance/update");
describe("updateAnnotationReferences (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
    it("[REQ-MAINT-UPDATE] should return 0 when no updates made", () => {
        const count = (0, update_1.updateAnnotationReferences)("tests/fixtures/no-update", "old.md", "new.md");
        expect(count).toBe(0);
    });
});

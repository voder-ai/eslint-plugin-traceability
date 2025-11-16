"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Update annotation references
 */
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const update_1 = require("../../src/maintenance/update");
describe("updateAnnotationReferences (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
    it("[REQ-MAINT-UPDATE] should return 0 when no updates made", () => {
        const tmpDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), "update-test-"));
        try {
            const count = (0, update_1.updateAnnotationReferences)(tmpDir, "old.md", "new.md");
            expect(count).toBe(0);
        }
        finally {
            fs_1.default.rmSync(tmpDir, { recursive: true, force: true });
        }
    });
});

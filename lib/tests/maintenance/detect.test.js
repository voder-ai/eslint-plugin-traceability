"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - Detect stale annotation references
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const detect_1 = require("../../src/maintenance/detect");
describe("detectStaleAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
    it("[REQ-MAINT-DETECT] should return empty array when no stale annotations", () => {
        const tmpDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), "detect-test-"));
        // No annotation files are created in tmpDir to simulate no stale annotations
        const result = (0, detect_1.detectStaleAnnotations)(tmpDir);
        expect(result).toEqual([]);
        fs_1.default.rmSync(tmpDir, { recursive: true, force: true });
    });
});

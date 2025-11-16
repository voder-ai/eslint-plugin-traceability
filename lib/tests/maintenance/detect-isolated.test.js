"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - Detect stale annotation references
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const detect_1 = require("../../src/maintenance/detect");
describe("detectStaleAnnotations isolated (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
    it("[REQ-MAINT-DETECT] returns empty array when directory does not exist", () => {
        const result = (0, detect_1.detectStaleAnnotations)("non-existent-dir");
        expect(result).toEqual([]);
    });
    it("[REQ-MAINT-DETECT] detects stale annotations in nested directories", () => {
        // Arrange
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-nested-"));
        const nestedDir = path.join(tmpDir, "nested");
        fs.mkdirSync(nestedDir);
        const filePath1 = path.join(tmpDir, "file1.ts");
        const filePath2 = path.join(nestedDir, "file2.ts");
        const content1 = `
/**
 * @story stale1.story.md
 */
`;
        fs.writeFileSync(filePath1, content1, "utf8");
        const content2 = `
/**
 * @story stale2.story.md
 */
`;
        fs.writeFileSync(filePath2, content2, "utf8");
        // Act
        const result = (0, detect_1.detectStaleAnnotations)(tmpDir);
        // Assert
        expect(result).toHaveLength(2);
        expect(result).toContain("stale1.story.md");
        expect(result).toContain("stale2.story.md");
    });
    it("[REQ-MAINT-DETECT] throws error on permission denied", () => {
        const tmpDir2 = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-perm-"));
        const dir = path.join(tmpDir2, "subdir");
        fs.mkdirSync(dir);
        const filePath = path.join(dir, "file.ts");
        const content = `
/**
 * @story none.story.md
 */
`;
        fs.writeFileSync(filePath, content, "utf8");
        // Remove read permission
        fs.chmodSync(dir, 0o000);
        expect(() => (0, detect_1.detectStaleAnnotations)(tmpDir2)).toThrow();
        // Restore permissions
        fs.chmodSync(dir, 0o700);
        // Cleanup temporary directory
        fs.rmSync(tmpDir2, { recursive: true, force: true });
    });
});

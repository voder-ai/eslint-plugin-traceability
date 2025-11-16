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
 * @req REQ-MAINT-UPDATE - Update annotation references
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const update_1 = require("../../src/maintenance/update");
describe("updateAnnotationReferences isolated (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
    it("[REQ-MAINT-UPDATE] updates @story annotations in files", () => {
        // Create a temporary directory for testing
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-"));
        const filePath = path.join(tmpDir, "file.ts");
        const originalContent = `
/**
 * @story old.path.md
 */
function foo() {}
`;
        fs.writeFileSync(filePath, originalContent, "utf8");
        // Run the function under test
        const count = (0, update_1.updateAnnotationReferences)(tmpDir, "old.path.md", "new.path.md");
        expect(count).toBe(1);
        // Verify the file content was updated
        const updatedContent = fs.readFileSync(filePath, "utf8");
        expect(updatedContent).toContain("@story new.path.md");
        // Cleanup temporary directory
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });
});

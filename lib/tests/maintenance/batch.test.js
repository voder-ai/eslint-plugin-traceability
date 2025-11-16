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
 * @req REQ-MAINT-BATCH - Perform batch updates
 * @req REQ-MAINT-VERIFY - Verify annotation references
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const batch_1 = require("../../src/maintenance/batch");
describe("batchUpdateAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
    let tmpDir;
    beforeAll(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "batch-test-"));
    });
    afterAll(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    it("[REQ-MAINT-BATCH] should return 0 when no mappings applied", () => {
        const count = (0, batch_1.batchUpdateAnnotations)(tmpDir, []);
        expect(count).toBe(0);
    });
});
describe("verifyAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
    let tmpDir;
    beforeAll(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-test-"));
        const tsContent = `
/**
 * Tests for: my-story.story.md
 * @story my-story.story.md
 */
`;
        fs.writeFileSync(path.join(tmpDir, "test.ts"), tsContent);
        fs.writeFileSync(path.join(tmpDir, "my-story.story.md"), "# Dummy Story");
    });
    afterAll(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    it("[REQ-MAINT-VERIFY] should return true when annotations are valid", () => {
        const valid = (0, batch_1.verifyAnnotations)(tmpDir);
        expect(valid).toBe(true);
    });
});

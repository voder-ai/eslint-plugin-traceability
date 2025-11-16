"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Integration tests for file-validation rules via ESLint CLI
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PERFORMANCE-OPTIMIZATION - Verify CLI integration of valid-story-reference and valid-req-reference rules
 */
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
// Ensure ESLint CLI uses built plugin
const eslintBin = path_1.default.resolve(__dirname, "../../node_modules/.bin/eslint");
const configPath = path_1.default.resolve(__dirname, "../../eslint.config.js");
describe("File and Req Validation CLI Integration (Story 006.0-DEV-FILE-VALIDATION)", () => {
    function runLint(code, rules) {
        const ruleArgs = [
            "--rule",
            "no-unused-vars:off",
            ...rules.flatMap((r) => ["--rule", r]),
        ];
        return (0, child_process_1.spawnSync)("node", [
            eslintBin,
            "--no-config-lookup",
            "--config",
            configPath,
            "--stdin",
            "--stdin-filename",
            "foo.js",
            ...ruleArgs,
        ], {
            encoding: "utf-8",
            input: code,
        });
    }
    it("[REQ-FILE-EXISTENCE] reports missing story file via CLI", () => {
        const code = "// @story docs/stories/missing-file.story.md";
        const res = runLint(code, ["traceability/valid-story-reference:error"]);
        expect(res.status).toBe(1);
        expect(res.stdout).toContain("Story file");
    });
    it("[REQ-EXTENSION] reports invalid extension via CLI", () => {
        const code = "// @story docs/stories/001.0-DEV-PLUGIN-SETUP.md";
        const res = runLint(code, ["traceability/valid-story-reference:error"]);
        expect(res.status).toBe(1);
        expect(res.stdout).toContain("Invalid story file extension");
    });
    it("[REQ-DEEP-PARSE] reports missing requirement via CLI", () => {
        const code = "// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md\n// @req REQ-UNKNOWN";
        const res = runLint(code, ["traceability/valid-req-reference:error"]);
        expect(res.status).toBe(1);
        expect(res.stdout).toContain("Requirement 'REQ-UNKNOWN' not found");
    });
    it("[REQ-DEEP-MATCH] valid story and requirement via CLI", () => {
        const code = "// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md\n// @req REQ-PLUGIN-STRUCTURE";
        const res = runLint(code, ["traceability/valid-req-reference:error"]);
        expect(res.status).toBe(0);
    });
});

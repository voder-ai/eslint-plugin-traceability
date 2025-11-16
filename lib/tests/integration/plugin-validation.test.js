"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Integration tests for ESLint plugin via CLI
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Validate plugin registers via CLI
 */
/* eslint-env node, jest */
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
describe.skip("ESLint CLI Integration", () => {
    const eslintBin = path_1.default.resolve(__dirname, "../../node_modules/.bin/eslint");
    const configPath = path_1.default.resolve(__dirname, "../../eslint.config.js");
    function runEslint(code, rule) {
        const args = [
            "--no-eslintrc",
            "--config",
            configPath,
            "--stdin",
            "--stdin-filename",
            "foo.js",
            "--rule",
            rule,
        ];
        // Use Node to run the ESLint CLI script
        return (0, child_process_1.spawnSync)("node", ["--experimental-vm-modules", eslintBin, ...args], { encoding: "utf-8", input: code });
    }
    it("[REQ-PLUGIN-STRUCTURE] reports error when @story annotation is missing", () => {
        const code = "function foo() {}";
        const result = runEslint(code, "traceability/require-story-annotation:error");
        expect(result.status).toBe(1);
        expect(result.stdout).toMatch(/require-story-annotation/);
    });
    it("does not report error when @story annotation is present", () => {
        const code = `
      /**
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       */
      function foo() {}
    `;
        const result = runEslint(code, "traceability/require-story-annotation:error");
        expect(result.status).toBe(0);
        expect(result.stdout.trim()).toBe("");
    });
});

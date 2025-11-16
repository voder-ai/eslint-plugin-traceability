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
const eslintBin = path_1.default.resolve(__dirname, "../../node_modules/.bin/eslint");
const configPath = path_1.default.resolve(__dirname, "../../eslint.config.js");
describe("ESLint CLI Integration (Story 001.0-DEV-PLUGIN-SETUP)", () => {
    function runEslint(code, rule) {
        const args = [
            "--no-config-lookup",
            "--config",
            configPath,
            "--stdin",
            "--stdin-filename",
            "foo.js",
            "--rule",
            "no-unused-vars:off",
            "--rule",
            rule,
        ];
        return (0, child_process_1.spawnSync)(process.execPath, [eslintBin, ...args], {
            encoding: "utf-8",
            input: code,
        });
    }
    test("reports error when @story annotation is missing", () => {
        // Arrange
        const code = "function foo() {}";
        const rule = "traceability/require-story-annotation:error";
        // Act
        const result = runEslint(code, rule);
        // Assert
        expect(result.status).toBe(1);
        expect(result.stdout).toMatch(/require-story-annotation/);
    });
    test("does not report error when @story annotation is present", () => {
        // Arrange
        const code = `/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 */
function foo() {}`;
        const rule = "traceability/require-story-annotation:error";
        // Act
        const result = runEslint(code, rule);
        // Assert
        expect(result.status).toBe(0);
    });
    test("reports error when @req annotation is missing", () => {
        // Arrange
        const code = "function foo() {}";
        const rule = "traceability/require-req-annotation:error";
        // Act
        const result = runEslint(code, rule);
        // Assert
        expect(result.status).toBe(1);
        expect(result.stdout).toMatch(/require-req-annotation/);
    });
    test("reports error for missing branch annotations", () => {
        // Arrange
        const code = "if (condition) {}";
        const rule = "traceability/require-branch-annotation:error";
        // Act
        const result = runEslint(code, rule);
        // Assert
        expect(result.status).toBe(1);
        expect(result.stdout).toMatch(/require-branch-annotation/);
    });
});

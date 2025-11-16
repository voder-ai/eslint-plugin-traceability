"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for: docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-BRANCH-DETECTION - Verify require-branch-annotation rule enforces branch annotations
 */
const eslint_1 = require("eslint");
const require_branch_annotation_1 = __importDefault(require("../../src/rules/require-branch-annotation"));
const ruleTester = new eslint_1.RuleTester({
    languageOptions: { parserOptions: { ecmaVersion: 2020 } },
});
describe("Require Branch Annotation Rule", () => {
    ruleTester.run("require-branch-annotation", require_branch_annotation_1.default, {
        valid: [
            {
                code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
if (condition) {}`,
            },
            {
                code: `/* @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md */
/* @req REQ-BRANCH-DETECTION */
for (let i = 0; i < 10; i++) {}`,
            },
        ],
        invalid: [
            {
                code: `if (condition) {}`,
                errors: [
                    { messageId: "missingAnnotation", data: { missing: "@story" } },
                    { messageId: "missingAnnotation", data: { missing: "@req" } },
                ],
            },
            {
                code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
for (let i = 0; i < 5; i++) {}`,
                errors: [{ messageId: "missingAnnotation", data: { missing: "@req" } }],
            },
            {
                code: `// @req REQ-BRANCH-DETECTION
while (true) {}`,
                errors: [
                    { messageId: "missingAnnotation", data: { missing: "@story" } },
                ],
            },
        ],
    });
});

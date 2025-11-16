"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for: docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @req REQ-FORMAT-SPECIFICATION - Verify valid-annotation-format rule enforces annotation format syntax
 */
const eslint_1 = require("eslint");
const valid_annotation_format_1 = __importDefault(require("../../src/rules/valid-annotation-format"));
const ruleTester = new eslint_1.RuleTester({
    languageOptions: { parserOptions: { ecmaVersion: 2020 } },
});
describe("Valid Annotation Format Rule (Story 005.0-DEV-ANNOTATION-VALIDATION)", () => {
    ruleTester.run("valid-annotation-format", valid_annotation_format_1.default, {
        valid: [
            {
                name: "[REQ-PATH-FORMAT] valid story annotation format",
                code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
            },
            {
                name: "[REQ-REQ-FORMAT] valid req annotation format",
                code: `// @req REQ-EXAMPLE`,
            },
            {
                name: "[REQ-FORMAT-SPECIFICATION] valid block annotations",
                code: `/**
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @req REQ-VALID-EXAMPLE
 */`,
            },
        ],
        invalid: [
            {
                name: "[REQ-PATH-FORMAT] missing story path",
                code: `// @story`,
                errors: [{ messageId: "invalidStoryFormat" }],
            },
            {
                name: "[REQ-PATH-FORMAT] invalid story file extension",
                code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story`,
                errors: [{ messageId: "invalidStoryFormat" }],
            },
            {
                name: "[REQ-REQ-FORMAT] missing req id",
                code: `// @req`,
                errors: [{ messageId: "invalidReqFormat" }],
            },
            {
                name: "[REQ-REQ-FORMAT] invalid req id format",
                code: `// @req invalid-format`,
                errors: [{ messageId: "invalidReqFormat" }],
            },
        ],
    });
});

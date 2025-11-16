"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Verify require-req-annotation rule enforces @req on functions
 */
const eslint_1 = require("eslint");
const require_req_annotation_1 = __importDefault(require("../../src/rules/require-req-annotation"));
const ruleTester = new eslint_1.RuleTester();
describe("Require Req Annotation Rule (Story 003.0-DEV-FUNCTION-ANNOTATIONS)", () => {
    ruleTester.run("require-req-annotation", require_req_annotation_1.default, {
        valid: [
            {
                name: "[REQ-ANNOTATION-REQUIRED] valid with only @req annotation",
                code: `/**\n * @req REQ-EXAMPLE\n */\nfunction foo() {}`,
            },
            {
                name: "[REQ-ANNOTATION-REQUIRED] valid with @story and @req annotations",
                code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-EXAMPLE\n */\nfunction bar() {}`,
            },
        ],
        invalid: [
            {
                name: "[REQ-ANNOTATION-REQUIRED] missing @req on function without JSDoc",
                code: `function baz() {}`,
                output: `/** @req <REQ-ID> */\nfunction baz() {}`,
                errors: [{ messageId: "missingReq" }],
            },
            {
                name: "[REQ-ANNOTATION-REQUIRED] missing @req on function with only @story annotation",
                code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction qux() {}`,
                output: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\n/** @req <REQ-ID> */\nfunction qux() {}`,
                errors: [{ messageId: "missingReq" }],
            },
        ],
    });
});

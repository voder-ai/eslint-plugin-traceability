"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for: docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Verify valid-req-reference rule enforces existing requirement content
 */
const eslint_1 = require("eslint");
const valid_req_reference_1 = __importDefault(require("../../src/rules/valid-req-reference"));
const ruleTester = new eslint_1.RuleTester({
    languageOptions: { parserOptions: { ecmaVersion: 2020 } },
});
describe("Valid Req Reference Rule (Story 010.0-DEV-DEEP-VALIDATION)", () => {
    ruleTester.run("valid-req-reference", valid_req_reference_1.default, {
        valid: [
            {
                name: "[REQ-DEEP-PARSE] valid requirement reference existing in story file",
                code: `// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-PLUGIN-STRUCTURE`,
            },
        ],
        invalid: [
            {
                name: "[REQ-DEEP-MATCH] missing requirement in story file",
                code: `// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-NON-EXISTENT`,
                errors: [
                    {
                        messageId: "reqMissing",
                        data: {
                            reqId: "REQ-NON-EXISTENT",
                            storyPath: "docs/stories/001.0-DEV-PLUGIN-SETUP.story.md",
                        },
                    },
                ],
            },
        ],
    });
});

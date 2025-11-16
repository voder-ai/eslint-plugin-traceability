"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 */
const eslint_1 = require("eslint");
const require_story_annotation_1 = __importDefault(require("../../src/rules/require-story-annotation"));
const ruleTester = new eslint_1.RuleTester();
describe('Require Story Annotation Rule', () => {
    ruleTester.run('require-story-annotation', require_story_annotation_1.default, {
        valid: [
            {
                code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction foo() {}`,
            },
        ],
        invalid: [
            {
                code: `function bar() {}`,
                errors: [{ messageId: 'missingStory' }],
            },
        ],
    });
});

"use strict";
/**
 * ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Provide foundational plugin export and registration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.rules = void 0;
const require_story_annotation_1 = __importDefault(require("./rules/require-story-annotation"));
const require_req_annotation_1 = __importDefault(require("./rules/require-req-annotation"));
const require_branch_annotation_1 = __importDefault(require("./rules/require-branch-annotation"));
const valid_annotation_format_1 = __importDefault(require("./rules/valid-annotation-format"));
exports.rules = {
    "require-story-annotation": require_story_annotation_1.default,
    "require-req-annotation": require_req_annotation_1.default,
    "require-branch-annotation": require_branch_annotation_1.default,
    "valid-annotation-format": valid_annotation_format_1.default,
};
exports.configs = {
    recommended: [
        {
            plugins: {
                traceability: {},
            },
            rules: {
                "traceability/require-story-annotation": "error",
                "traceability/require-req-annotation": "error",
                "traceability/require-branch-annotation": "error",
                "traceability/valid-annotation-format": "error",
            },
        },
    ],
    strict: [
        {
            plugins: {
                traceability: {},
            },
            rules: {
                "traceability/require-story-annotation": "error",
                "traceability/require-req-annotation": "error",
                "traceability/require-branch-annotation": "error",
                "traceability/valid-annotation-format": "error",
            },
        },
    ],
};
exports.default = { rules: exports.rules, configs: exports.configs };

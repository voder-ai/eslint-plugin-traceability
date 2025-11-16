"use strict";
/**
 * ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Provide foundational plugin export and registration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.rules = void 0;
exports.rules = {};
exports.configs = {
    recommended: [
        {
            rules: {},
        },
    ],
    strict: [
        {
            rules: {},
        },
    ],
};
exports.default = { rules: exports.rules, configs: exports.configs };

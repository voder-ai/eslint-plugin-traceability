"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for: docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Validate plugin default export and configs in src/index.ts
 */
const index_1 = __importStar(require("../src/index"));
describe("Plugin Default Export and Configs (Story 001.0)", () => {
    it("[REQ-PLUGIN-STRUCTURE] default export includes rules and configs", () => {
        expect(index_1.default.rules).toBe(index_1.rules);
        expect(index_1.default.configs).toBe(index_1.configs);
    });
    it("[REQ-PLUGIN-STRUCTURE] rules object has correct rule names", () => {
        const expected = [
            "require-story-annotation",
            "require-req-annotation",
            "require-branch-annotation",
        ];
        expect(Object.keys(index_1.rules).sort()).toEqual(expected.sort());
    });
    it("[REQ-RULE-REGISTRY] configs.recommended contains correct rule configuration", () => {
        const recommendedRules = index_1.configs.recommended[0].rules;
        expect(recommendedRules).toHaveProperty("traceability/require-story-annotation", "error");
        expect(recommendedRules).toHaveProperty("traceability/require-req-annotation", "error");
        expect(recommendedRules).toHaveProperty("traceability/require-branch-annotation", "error");
    });
    it("[REQ-CONFIG-SYSTEM] configs.strict contains same rules as recommended", () => {
        const strictRules = index_1.configs.strict[0].rules;
        expect(strictRules).toEqual(index_1.configs.recommended[0].rules);
    });
});

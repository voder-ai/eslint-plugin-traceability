/**
 * ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Provide foundational plugin export and registration
 */
export declare const rules: {
    "require-story-annotation": any;
    "require-req-annotation": any;
    "require-branch-annotation": any;
    "valid-annotation-format": any;
    "valid-story-reference": import("eslint").Rule.RuleModule;
    "valid-req-reference": import("eslint").Rule.RuleModule;
};
export declare const configs: {
    recommended: {
        plugins: {
            traceability: {};
        };
        rules: {
            "traceability/require-story-annotation": string;
            "traceability/require-req-annotation": string;
            "traceability/require-branch-annotation": string;
            "traceability/valid-annotation-format": string;
            "traceability/valid-story-reference": string;
            "traceability/valid-req-reference": string;
        };
    }[];
    strict: {
        plugins: {
            traceability: {};
        };
        rules: {
            "traceability/require-story-annotation": string;
            "traceability/require-req-annotation": string;
            "traceability/require-branch-annotation": string;
            "traceability/valid-annotation-format": string;
            "traceability/valid-story-reference": string;
            "traceability/valid-req-reference": string;
        };
    }[];
};
declare const _default: {
    rules: {
        "require-story-annotation": any;
        "require-req-annotation": any;
        "require-branch-annotation": any;
        "valid-annotation-format": any;
        "valid-story-reference": import("eslint").Rule.RuleModule;
        "valid-req-reference": import("eslint").Rule.RuleModule;
    };
    configs: {
        recommended: {
            plugins: {
                traceability: {};
            };
            rules: {
                "traceability/require-story-annotation": string;
                "traceability/require-req-annotation": string;
                "traceability/require-branch-annotation": string;
                "traceability/valid-annotation-format": string;
                "traceability/valid-story-reference": string;
                "traceability/valid-req-reference": string;
            };
        }[];
        strict: {
            plugins: {
                traceability: {};
            };
            rules: {
                "traceability/require-story-annotation": string;
                "traceability/require-req-annotation": string;
                "traceability/require-branch-annotation": string;
                "traceability/valid-annotation-format": string;
                "traceability/valid-story-reference": string;
                "traceability/valid-req-reference": string;
            };
        }[];
    };
};
export default _default;

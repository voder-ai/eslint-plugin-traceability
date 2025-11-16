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
        };
    }[];
};
declare const _default: {
    rules: {
        "require-story-annotation": any;
        "require-req-annotation": any;
        "require-branch-annotation": any;
        "valid-annotation-format": any;
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
            };
        }[];
    };
};
export default _default;

/**
 * ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Provide foundational plugin export and registration
 */
export declare const rules: {
    "require-story-annotation": any;
    "require-req-annotation": any;
    "require-branch-annotation": any;
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
        };
    }[];
};
declare const _default: {
    rules: {
        "require-story-annotation": any;
        "require-req-annotation": any;
        "require-branch-annotation": any;
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
            };
        }[];
    };
};
export default _default;

/**
 * ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Provide foundational plugin export and registration
 */

import requireStoryAnnotation from "./rules/require-story-annotation";
import requireReqAnnotation from "./rules/require-req-annotation";
import requireBranchAnnotation from "./rules/require-branch-annotation";

export const rules = {
  "require-story-annotation": requireStoryAnnotation,
  "require-req-annotation": requireReqAnnotation,
  "require-branch-annotation": requireBranchAnnotation,
};

export const configs = {
  recommended: [
    {
      plugins: {
        traceability: {},
      },
      rules: {
        "traceability/require-story-annotation": "error",
        "traceability/require-req-annotation": "error",
        "traceability/require-branch-annotation": "error",
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
      },
    },
  ],
};

export default { rules, configs };
